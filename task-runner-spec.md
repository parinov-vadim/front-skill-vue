# Task Runner — Spec-Driven Development

> Изолированный сервис на Node.js для запуска и верификации пользовательского кода на платформе FrontSkill.
> Этот документ — полная спецификация для реализации через AI-агенты.

---

## 1. Контекст и границы

### Что это

Task Runner — отдельный Node.js-процесс (sidecar), который:
1. Читает задачи из Redis Stream
2. Запускает пользовательский код в изолированной sandbox-среде
3. Верифицирует результат через набор специализированных runner-ов
4. Отправляет результат обратно в Go API через HTTP callback

### Почему Node.js

Инструменты верификации — JS-экосистема: Playwright, jsdom, `@vue/compiler-sfc`, `@testing-library/react`, `isolated-vm`, `axe-core`.

### Архитектура (где находится Runner)

```
┌─────────────┐  HTTP   ┌──────────────────────┐       ┌──────────────┐
│   Nuxt SSR  │────────▶│   Go API (chi)       │──────▶│  PostgreSQL  │
│  (frontend) │         │   :8080              │       │              │
└─────────────┘         └──────────┬───────────┘       └──────────────┘
                                   │
                                   │ Redis Stream (XADD)
                                   ▼
                        ┌──────────────────────┐       ┌──────────────┐
                        │  Task Runner Worker  │◀─────▶│    Redis     │
                        │  (Node.js)           │       └──────────────┘
                        │                      │
                        │  ┌────────────────┐  │  HTTP callback
                        │  │  Playwright    │  │──────────────────▶ Go API
                        │  │  jsdom         │  │  POST /internal/
                        │  │  isolated-vm   │  │  submissions/{id}/result
                        │  │  axe-core      │  │
                        │  └────────────────┘  │
                        └──────────────────────┘
                           Docker / Firecracker
```

### Границы сервиса

| В скоупе | Вне скоупа |
|----------|-----------|
| Redis Stream consumer | Go API |
| Sandbox-изоляция (Docker контейнеры) | PostgreSQL (прямой доступ) |
| Все runner-ы (css, html, js, vue, react, a11y) | Авторизация пользователей |
| Компиляция Vue SFC / React JSX | Фронтенд |
| HTTP callback с результатом | Rate limiting |
| Browser pool (Playwright) | Очередь задач (producer-сторона) |

---

## 2. Структура проекта

```
runner/
├── src/
│   ├── index.ts                    # точка входа, Redis consumer
│   ├── worker.ts                   # диспетчер: payload → нужный runner
│   ├── runners/
│   │   ├── base-runner.ts          # абстрактный базовый класс
│   │   ├── css-computed.ts
│   │   ├── css-visual.ts
│   │   ├── html-validate.ts
│   │   ├── html-semantic.ts
│   │   ├── js-unit.ts
│   │   ├── js-output.ts
│   │   ├── component-render.ts
│   │   ├── component-behavior.ts
│   │   ├── a11y-axe.ts
│   │   └── a11y-manual.ts
│   ├── sandbox/
│   │   ├── docker.ts               # запуск Docker-контейнеров
│   │   └── isolate.ts              # isolated-vm обёртка
│   └── utils/
│       ├── browser-pool.ts         # пул Playwright-браузеров
│       └── compiler.ts             # Vue SFC / React JSX компиляция
├── runner-sandbox/                 # код, копируемый внутрь sandbox-контейнера
│   └── run.js                      # entrypoint внутри sandbox
├── Dockerfile                      # образ самого worker-а
├── Dockerfile.sandbox              # образ sandbox-контейнера
├── package.json
└── tsconfig.json
```

---

## 3. Переменные окружения

```env
# Обязательные
REDIS_URL=redis://redis:6379        # Redis для чтения задач из Stream
CALLBACK_URL=http://api:8080/internal  # Base URL для callback в Go API
INTERNAL_SECRET=runner-shared-secret   # Shared secret для аутентификации callback

# Опциональные
CONCURRENCY=2                       # Кол-во параллельных задач (default: 2)
STREAM_NAME=submissions:queue       # Имя Redis Stream (default: submissions:queue)
CONSUMER_GROUP=runner-workers       # Consumer group (default: runner-workers)
CONSUMER_NAME=worker-1              # Имя этого consumer-а (default: hostname)
SANDBOX_MEMORY=256m                 # Лимит памяти sandbox-контейнера (default: 256m)
SANDBOX_CPUS=1                      # Лимит CPU sandbox-контейнера (default: 1)
SANDBOX_PIDS=64                     # PID limit (default: 64)
BROWSER_POOL_SIZE=3                 # Кол-во Playwright-браузеров в пуле (default: 3)
```

---

## 4. Входной контракт — Redis Stream Message

Go API ставит задачу в Redis Stream через `XADD`.

### Stream name: `submissions:queue`

### Payload (JSON в поле `data`):

```typescript
interface RunTestsPayload {
  submission_id: string;   // UUID
  task_id: number;
  code: string;            // пользовательский код (до 50 KB)
  language: string;        // css | html | javascript | typescript
  mode: string;            // "run" | "submit"
  time_limit_ms: number;   // лимит на всё выполнение (default: 10000)
  test_suites: TestSuite[];
}

interface TestSuite {
  id: number;
  name: string;             // "Flexbox центрирование"
  is_public: boolean;       // видим пользователю?
  sort_order: number;
  runner_type: RunnerType;
  config: Record<string, any>;  // формат зависит от runner_type
}

type RunnerType =
  | "css_computed"
  | "css_visual"
  | "dom_structure"
  | "js_unit"
  | "js_output"
  | "component_render"
  | "component_behavior"
  | "a11y_axe"
  | "a11y_manual"
  | "html_validate"
  | "html_semantic";
```

### Фильтрация тестов по mode

| mode | Какие test_suites приходят |
|------|---------------------------|
| `run` | Только `is_public: true` |
| `submit` | Все (публичные + скрытые) |

> Go API фильтрует test_suites перед постановкой в очередь. Runner выполняет **все** полученные тесты.

---

## 5. Выходной контракт — HTTP Callback

После выполнения всех тестов Runner отправляет результат:

```
POST {CALLBACK_URL}/submissions/{submission_id}/result
Headers:
  Content-Type: application/json
  X-Internal-Secret: {INTERNAL_SECRET}
```

### Response body — `RunnerResult`:

```typescript
interface RunnerResult {
  status: "passed" | "failed" | "error" | "timeout";
  total_tests: number;
  passed_tests: number;
  exec_time_ms: number;        // общее время выполнения
  tests: TestResult[];
  error: string | null;        // системная ошибка (crash, timeout)
}

interface TestResult {
  name: string;                // имя теста из test_suite.name
  passed: boolean;
  is_public: boolean;
  message: string | null;      // человекочитаемое описание результата
}
```

### Правила формирования status

```
if (системная ошибка || crash)     → "error"
if (время выполнения > time_limit) → "timeout"
if (все тесты passed)              → "passed"
if (хотя бы один failed)          → "failed"
```

### Пример успешного результата

```json
{
  "status": "passed",
  "total_tests": 5,
  "passed_tests": 5,
  "exec_time_ms": 1340,
  "tests": [
    {
      "name": "Flexbox центрирование",
      "passed": true,
      "is_public": true,
      "message": "display: flex, justify-content: center — верно"
    },
    {
      "name": "Скрытый тест: transform",
      "passed": true,
      "is_public": false,
      "message": null
    }
  ],
  "error": null
}
```

### Пример ошибки

```json
{
  "status": "error",
  "total_tests": 0,
  "passed_tests": 0,
  "exec_time_ms": 0,
  "tests": [],
  "error": "Sandbox container exited with code 137 (OOM killed)"
}
```

---

## 6. Redis Consumer — `src/index.ts`

### Поведение

1. При старте: подключиться к Redis, создать consumer group (если не существует)
2. В цикле: `XREADGROUP GROUP {group} {consumer} COUNT {concurrency} BLOCK 5000 STREAMS {stream} >`
3. Для каждого сообщения: вызвать `worker.process(payload)`
4. После обработки: `XACK {stream} {group} {message_id}`
5. При ошибке обработки: отправить callback с `status: "error"`, затем ACK
6. Graceful shutdown: завершить текущие задачи, закрыть соединения

### Обработка ошибок

- Если Redis недоступен — retry с exponential backoff (1s, 2s, 4s, ..., max 30s)
- Если callback URL недоступен — retry 3 раза с интервалом 1s, затем логировать ошибку
- Если sandbox crash — вернуть `status: "error"` с описанием

---

## 7. Worker (диспетчер) — `src/worker.ts`

### Поведение

```typescript
async function process(payload: RunTestsPayload): Promise<RunnerResult> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  // Сортировка тестов по sort_order
  const suites = payload.test_suites.sort((a, b) => a.sort_order - b.sort_order);

  for (const suite of suites) {
    // Проверка общего таймаута
    if (Date.now() - startTime > payload.time_limit_ms) {
      return { status: "timeout", ... };
    }

    const runner = getRunner(suite.runner_type);
    const result = await runner.run(payload.code, payload.language, suite);
    results.push(result);
  }

  return buildResult(results, startTime);
}
```

### Маппинг runner_type → Runner

```typescript
const RUNNERS: Record<RunnerType, () => BaseRunner> = {
  css_computed:        () => new CSSComputedRunner(),
  css_visual:          () => new CSSVisualRunner(),
  dom_structure:       () => new DOMStructureRunner(),
  js_unit:             () => new JSUnitRunner(),
  js_output:           () => new JSOutputRunner(),
  component_render:    () => new ComponentRenderRunner(),
  component_behavior:  () => new ComponentBehaviorRunner(),
  a11y_axe:            () => new A11yAxeRunner(),
  a11y_manual:         () => new A11yManualRunner(),
  html_validate:       () => new HTMLValidateRunner(),
  html_semantic:       () => new HTMLSemanticRunner(),
};
```

---

## 8. Runners — спецификация каждого типа

### 8.0. Base Runner (абстрактный)

```typescript
abstract class BaseRunner {
  abstract run(
    userCode: string,
    language: string,
    suite: TestSuite
  ): Promise<TestResult>;
}
```

---

### 8.1. `css_computed` — CSS Computed Styles

**Задача**: Проверить, что CSS пользователя приводит к нужным computed-стилям.

**Инструменты**: Playwright

**Алгоритм**:
1. Собрать HTML: `suite.config.html` + `<style>{userCode}</style>`
2. Открыть страницу в Playwright
3. Для каждого assertion: `page.$eval(selector, el => getComputedStyle(el)[property])`
4. Сравнить с expected (с учётом tolerance и массива допустимых значений)

**Config schema**:
```typescript
interface CSSComputedConfig {
  html: string;                     // базовый HTML
  selector: string;                 // дефолтный селектор
  assertions: CSSAssertion[];
}

interface CSSAssertion {
  selector?: string;                // переопределяет дефолтный
  property: string;                 // CSS property (camelCase или kebab-case)
  expected: string | string[];      // допустимые значения
  tolerance?: number;               // допуск в px для числовых значений
}
```

**Пример config**:
```json
{
  "html": "<div class=\"container\"><div class=\"box\">Center me</div></div>",
  "selector": ".box",
  "assertions": [
    { "property": "display", "expected": "flex" },
    { "property": "width", "expected": "200px", "tolerance": 2 },
    { "property": "justify-content", "expected": ["center", "safe center"] },
    { "selector": ".container", "property": "display", "expected": "flex" }
  ]
}
```

---

### 8.2. `css_visual` — Visual Screenshot Comparison

**Задача**: Пиксельное сравнение рендера с эталонным скриншотом.

**Инструменты**: Playwright, `pixelmatch`, `pngjs`

**Алгоритм**:
1. Собрать HTML + CSS пользователя
2. Открыть в Playwright с заданным viewport
3. Сделать скриншот (PNG)
4. Загрузить эталонный скриншот из S3 (по пути `config.reference_screenshot`)
5. Сравнить через `pixelmatch`
6. Если diff% > threshold — failed
7. Если задан `viewports[]` — повторить для каждого viewport

**Config schema**:
```typescript
interface CSSVisualConfig {
  html: string;
  viewport: { width: number; height: number };
  reference_screenshot: string;       // путь в S3
  threshold: number;                  // допустимый % расхождения (0.0–1.0)
  ignore_regions?: { x: number; y: number; width: number; height: number }[];
  viewports?: {
    width: number;
    height: number;
    reference: string;                // путь в S3
  }[];
}
```

---

### 8.3. `html_validate` — HTML Validation

**Задача**: Проверить валидность HTML.

**Инструменты**: `html-validate`

**Алгоритм**:
1. Прогнать HTML пользователя через `html-validate` с правилами из config
2. Проверить наличие обязательных элементов (`must_contain_elements`)
3. Проверить отсутствие запрещённых (`forbidden_elements`)
4. Если кол-во ошибок > `max_errors` — failed

**Config schema**:
```typescript
interface HTMLValidateConfig {
  rules: Record<string, "error" | "warn" | "off">;
  must_contain_elements?: string[];   // HTML-теги
  forbidden_elements?: string[];
  max_errors: number;                 // default: 0
}
```

**Пример config**:
```json
{
  "rules": {
    "no-deprecated-attr": "error",
    "element-required-attributes": "error",
    "no-inline-style": "warn",
    "valid-id": "error"
  },
  "must_contain_elements": ["header", "main", "footer"],
  "forbidden_elements": ["div"],
  "max_errors": 0
}
```

---

### 8.4. `html_semantic` — HTML Semantic Structure

**Задача**: Проверить семантическую структуру HTML.

**Инструменты**: `jsdom` или `linkedom`

**Алгоритм**:
1. Парсить HTML в DOM
2. Для каждого assertion выполнить проверку по типу

**Config schema**:
```typescript
interface HTMLSemanticConfig {
  assertions: SemanticAssertion[];
}

type SemanticAssertion =
  | { type: "exists"; selector: string }
  | { type: "not_exists"; selector: string }
  | { type: "count"; selector: string; expected: number }
  | { type: "text"; selector: string; contains: string }
  | { type: "attr"; selector: string; attr: string; not_empty?: boolean; expected?: string }
  | { type: "order"; selectors: string[] }                // элементы идут в этом порядке в DOM
  | { type: "nested"; parent: string; child: string };    // child внутри parent
```

**Пример config**:
```json
{
  "assertions": [
    { "type": "exists", "selector": "nav > ul > li > a" },
    { "type": "count", "selector": "section", "expected": 3 },
    { "type": "text", "selector": "h1", "contains": "Заголовок" },
    { "type": "attr", "selector": "img", "attr": "alt", "not_empty": true },
    { "type": "order", "selectors": ["header", "main", "footer"] },
    { "type": "nested", "parent": "nav", "child": "ul" },
    { "type": "not_exists", "selector": "div.wrapper" }
  ]
}
```

---

### 8.5. `js_unit` — JavaScript Unit Tests

**Задача**: Вызвать экспортированную функцию пользователя и проверить возвращаемые значения.

**Инструменты**: `isolated-vm` (V8 isolate)

**Алгоритм**:
1. Если `language === "typescript"` — транспилировать через `esbuild`
2. Загрузить код в `isolated-vm` V8 изолят
3. Для каждого test case: вызвать `entry_function(...args)`
4. Сравнить результат с `expected` по стратегии `comparison`
5. Таймаут на каждый кейс: `timeout_per_case_ms`

**Безопасность `isolated-vm`**:
- Нет доступа к `require`, `import`, `process`, `fs`, `net`
- Ограничение по памяти: 64 MB на изолят
- Ограничение по CPU: таймаут

**Config schema**:
```typescript
interface JSUnitConfig {
  entry_function: string;             // имя экспортируемой функции
  test_cases: {
    args: any[];                      // аргументы вызова
    expected: any;                    // ожидаемый результат
    description: string;             // описание кейса
  }[];
  comparison: "deep_equal" | "unordered_equal" | "approximate";
  timeout_per_case_ms?: number;      // default: 2000
}
```

**Пример config**:
```json
{
  "entry_function": "twoSum",
  "test_cases": [
    {
      "args": [[2, 7, 11, 15], 9],
      "expected": [0, 1],
      "description": "Базовый случай"
    },
    {
      "args": [[3, 2, 4], 6],
      "expected": [1, 2],
      "description": "Элементы не на первых позициях"
    }
  ],
  "comparison": "deep_equal",
  "timeout_per_case_ms": 2000
}
```

---

### 8.6. `js_output` — JavaScript Output / DOM

**Задача**: Проверить вывод в console.log и/или DOM-манипуляции.

**Инструменты**: `jsdom`

**Алгоритм**:
1. Создать jsdom-окружение с `config.html`
2. Перехватить `console.log`
3. Выполнить код пользователя
4. Проверить assertions (console output и/или DOM-состояние)

**Config schema**:
```typescript
interface JSOutputConfig {
  html?: string;                       // начальный HTML
  assertions: JSOutputAssertion[];
}

type JSOutputAssertion =
  | { type: "console"; expected: string[] }              // ожидаемые console.log строки
  | { type: "dom"; selector: string; count: number }     // кол-во элементов
  | { type: "dom"; selector: string; text: string };     // текст элемента
```

**Пример config**:
```json
{
  "html": "<ul id=\"list\"></ul>",
  "assertions": [
    { "type": "console", "expected": ["Hello", "World"] },
    { "type": "dom", "selector": "#list li", "count": 3 },
    { "type": "dom", "selector": "#list li:first-child", "text": "Item 1" }
  ]
}
```

---

### 8.7. `component_render` — Vue/React Component Render

**Задача**: Проверить, что компонент рендерит правильную разметку.

**Инструменты**: `@vue/compiler-sfc` + `@vue/test-utils` (Vue), `esbuild` + `@testing-library/react` (React), `jsdom`

**Pipeline компиляции Vue SFC**:
```
User .vue SFC
    → @vue/compiler-sfc (template → render function, script → JS, style → CSS)
    → esbuild (бандлинг, если есть импорты)
    → @vue/test-utils mount() в jsdom
    → Assertions
```

**Pipeline компиляции React**:
```
User JSX/TSX
    → esbuild (jsx transform, bundling)
    → @testing-library/react render() в jsdom
    → Assertions
```

**Config schema**:
```typescript
interface ComponentRenderConfig {
  framework?: "vue" | "react";         // default: определяется по language
  mount_options?: {                    // Vue-специфичные
    props?: Record<string, any>;
    global?: {
      stubs?: Record<string, boolean>;
    };
  };
  props?: Record<string, any>;         // React-специфичные
  assertions: ComponentAssertion[];
}

type ComponentAssertion =
  | { type: "html_contains"; value: string }
  | { type: "find"; selector: string; count: number }
  | { type: "text"; selector: string; expected: string }
  | { type: "classes"; selector: string; expected: string[] }
  | { type: "attributes"; selector: string; attr: string; expected: string }
  | { type: "emitted"; event: string; count: number };    // только Vue
```

**Пример config (Vue)**:
```json
{
  "mount_options": {
    "props": { "title": "Hello", "items": ["a", "b", "c"] },
    "global": { "stubs": { "RouterLink": true } }
  },
  "assertions": [
    { "type": "html_contains", "value": "<h1>Hello</h1>" },
    { "type": "find", "selector": "li", "count": 3 },
    { "type": "text", "selector": ".title", "expected": "Hello" },
    { "type": "classes", "selector": ".badge", "expected": ["active"] },
    { "type": "attributes", "selector": "input", "attr": "placeholder", "expected": "Search..." },
    { "type": "emitted", "event": "update", "count": 0 }
  ]
}
```

---

### 8.8. `component_behavior` — Vue/React Interactive Behavior

**Задача**: Проверить интерактивное поведение компонента (клики, ввод, реактивность).

**Инструменты**: те же что для `component_render` + user interactions

**Алгоритм**:
1. Смонтировать компонент
2. Выполнить сценарий шаг за шагом: action → assertions
3. Между шагами — `await nextTick()` (Vue) или `waitFor()` (React)

**Config schema**:
```typescript
interface ComponentBehaviorConfig {
  framework: "vue" | "react";
  mount_options?: Record<string, any>;  // Vue
  props?: Record<string, any>;          // React
  scenario: ScenarioStep[];
}

interface ScenarioStep {
  action: UserAction;
  assertions: ComponentAssertion[];     // те же типы что в component_render
}

type UserAction =
  | { type: "click"; selector: string }
  | { type: "setValue"; selector: string; value: string }   // Vue
  | { type: "type"; selector: string; value: string }       // React
  | { type: "trigger"; selector: string; event: string };   // произвольный DOM event
```

**Пример config (Vue)**:
```json
{
  "framework": "vue",
  "mount_options": { "props": { "initialCount": 0 } },
  "scenario": [
    {
      "action": { "type": "click", "selector": "button.increment" },
      "assertions": [
        { "type": "text", "selector": ".count", "expected": "1" }
      ]
    },
    {
      "action": { "type": "setValue", "selector": "input.name", "value": "Alice" },
      "assertions": [
        { "type": "text", "selector": ".greeting", "expected": "Hello, Alice!" }
      ]
    }
  ]
}
```

**Пример config (React)**:
```json
{
  "framework": "react",
  "props": { "initialCount": 0 },
  "scenario": [
    {
      "action": { "type": "click", "selector": "button" },
      "assertions": [
        { "type": "text_content", "selector": "[data-testid='count']", "expected": "1" }
      ]
    },
    {
      "action": { "type": "type", "selector": "input", "value": "Alice" },
      "assertions": [
        { "type": "text_content", "selector": ".greeting", "expected": "Hello, Alice!" }
      ]
    }
  ]
}
```

---

### 8.9. `a11y_axe` — Automated Accessibility (axe-core)

**Задача**: Автоматическая проверка доступности.

**Инструменты**: Playwright + `@axe-core/playwright`

**Алгоритм**:
1. Рендерить HTML (+ CSS если `inject_user_code_as` включает css) в Playwright
2. Запустить axe-core с `axe_options`
3. Проверить: violations ≤ `max_violations`, обязательные правила из `required_passes` прошли

**Config schema**:
```typescript
interface A11yAxeConfig {
  inject_user_code_as: "html" | "css" | "both";
  html?: string;                       // базовый HTML (если inject_user_code_as === "css")
  axe_options: {
    runOnly: {
      type: "rule";
      values: string[];                // axe rule IDs
    };
  };
  max_violations: number;             // default: 0
  required_passes?: string[];          // axe rule IDs которые ДОЛЖНЫ пройти
}
```

**Пример config**:
```json
{
  "inject_user_code_as": "html",
  "axe_options": {
    "runOnly": {
      "type": "rule",
      "values": ["color-contrast", "image-alt", "label", "button-name"]
    }
  },
  "max_violations": 0,
  "required_passes": ["image-alt", "button-name"]
}
```

---

### 8.10. `a11y_manual` — Manual Accessibility Checks

**Задача**: Проверить accessibility-паттерны, которые axe-core не ловит (клавиатурная навигация, focus management, ARIA states).

**Инструменты**: Playwright

**Алгоритм**:
1. Рендерить HTML в Playwright
2. Для каждого assertion выполнить проверку по типу (tab_order, focus_trap, keyboard, aria_attr)

**Config schema**:
```typescript
interface A11yManualConfig {
  html: string;
  assertions: A11yManualAssertion[];
}

type A11yManualAssertion =
  | { type: "tab_order"; expected_selectors: string[] }
  | { type: "focus_trap"; container: string; trigger: { key: string; count: number } }
  | { type: "keyboard"; actions: { key: string }[]; assertions: { selector: string; visible: boolean }[] }
  | { type: "aria_attr"; selector: string; attr: string; expected: string };
```

**Пример config**:
```json
{
  "html": "<div class=\"modal\">...</div>",
  "assertions": [
    {
      "type": "tab_order",
      "expected_selectors": ["input.email", "input.password", "button.submit"]
    },
    {
      "type": "focus_trap",
      "container": ".modal",
      "trigger": { "key": "Tab", "count": 10 }
    },
    {
      "type": "keyboard",
      "actions": [{ "key": "Escape" }],
      "assertions": [{ "selector": ".modal", "visible": false }]
    },
    {
      "type": "aria_attr",
      "selector": ".error-message",
      "attr": "aria-live",
      "expected": "assertive"
    }
  ]
}
```

---

## 9. Sandbox-изоляция

### Docker-контейнер (ephemeral)

Каждый запуск создаёт одноразовый Docker-контейнер:

```typescript
interface SandboxOptions {
  image: string;           // "frontskill-sandbox:latest"
  code: string;            // пользовательский код → /tmp/solution
  tests: string;           // сериализованные тесты → /tmp/tests
  timeout_ms: number;
  memory: string;          // "256m"
  cpus: string;            // "1"
  pids_limit: number;      // 64
}
```

**Docker flags**:
```bash
docker run --rm \
  --network=none \
  --read-only \
  --memory=256m \
  --cpus=1 \
  --pids-limit=64 \
  --security-opt=no-new-privileges \
  --tmpfs /tmp:rw,size=64m \
  -v /path/to/solution:/tmp/solution:ro \
  -v /path/to/tests:/tmp/tests:ro \
  frontskill-sandbox:latest
```

### Уровни изоляции

| Уровень | Мера | Назначение |
|---------|------|------------|
| L1 | `--network=none` | Нет сетевого доступа |
| L2 | `--read-only` filesystem | Нельзя записывать за пределами /tmp |
| L3 | `--memory=256m --cpus=1 --pids-limit=64` | Ограничение ресурсов |
| L4 | `seccomp` / `AppArmor` профиль | Блокировка опасных syscall-ов |
| L5 | `isolated-vm` для JS | JS не имеет доступа к Node.js API |
| L6 | Kill после `time_limit_ms` | Защита от бесконечных циклов |

### Docker-образ sandbox-контейнера

```dockerfile
FROM node:22-slim

RUN npx playwright install --with-deps chromium

RUN npm install -g \
  @vue/compiler-sfc \
  @vue/test-utils \
  @testing-library/react \
  @testing-library/user-event \
  react react-dom \
  esbuild \
  jsdom \
  linkedom \
  isolated-vm \
  pixelmatch \
  pngjs \
  @axe-core/playwright \
  html-validate

COPY runner-sandbox/ /app/
WORKDIR /app

ENTRYPOINT ["node", "run.js"]
```

### Защита от обхода тестов

- Код пользователя НЕ имеет доступа к тестам (тесты инжектируются runner-ом)
- Скрытые тесты не показывают ожидаемые значения при ошибке
- Код пользователя НЕ может переопределить `console`, `setTimeout`, глобалы тестового фреймворка

---

## 10. Browser Pool — `src/utils/browser-pool.ts`

### Назначение

Пул пре-запущенных Playwright-браузеров для runner-ов, которым нужен браузер (`css_computed`, `css_visual`, `a11y_axe`, `a11y_manual`).

### Поведение

```typescript
class BrowserPool {
  constructor(size: number);           // default: 3

  /** Получить браузер из пула (ждёт если все заняты) */
  acquire(): Promise<Browser>;

  /** Вернуть браузер в пул */
  release(browser: Browser): void;

  /** Закрыть все браузеры (graceful shutdown) */
  closeAll(): Promise<void>;
}
```

### Детали

- Браузер: Chromium (через Playwright)
- Каждый `acquire()` создаёт новый `BrowserContext` (изоляция между задачами)
- При возврате — контекст уничтожается, браузер остаётся в пуле
- Если браузер crashed — пересоздать

---

## 11. Compiler — `src/utils/compiler.ts`

### Vue SFC компиляция

```typescript
async function compileVueSFC(sfcCode: string): Promise<{
  js: string;
  css: string;
}>;
```

**Pipeline**:
1. `@vue/compiler-sfc` → parse SFC
2. compileTemplate → render function
3. compileScript → JS module
4. compileStyle → CSS
5. `esbuild` bundle (если есть импорты)

### React JSX/TSX компиляция

```typescript
async function compileReactJSX(code: string, isTypeScript: boolean): Promise<{
  js: string;
}>;
```

**Pipeline**:
1. `esbuild` transform с `jsx: "automatic"` (React 17+ JSX transform)
2. Если TypeScript — `esbuild` транспилирует

### Кэширование

- Компиляция кэшируется по SHA-256 хэшу входного кода
- LRU-кэш, максимум 100 записей

---

## 12. Производительность

### Оптимизации

| Оптимизация | Описание |
|-------------|----------|
| Пре-прогретые контейнеры | Пул из N готовых Docker-контейнеров |
| Browser pool | Playwright-браузеры запускаются 1 раз при старте worker-а |
| Кэш компиляции | Vue SFC / React JSX кэшируется по хэшу кода |
| Параллельные тесты | Независимые тесты одного задания могут запускаться параллельно |
| Redis Streams consumer groups | Worker-ы масштабируются горизонтально |

### Масштабирование

```
                       ┌─── Node.js Worker 1 ───┐
                       │   (Docker host)        │
Redis Stream ─────────├─── Node.js Worker 2 ───┤
                       │   (Docker host)        │
                       └─── Node.js Worker N ───┘
```

- Redis Streams consumer groups — автоматическое распределение задач
- Для MVP: 1-2 worker-а
- Каждый worker: `CONCURRENCY` параллельных задач

---

## 13. Зависимости (package.json)

### Runtime

```json
{
  "ioredis": "^5",
  "playwright": "^1.40",
  "isolated-vm": "^4",
  "jsdom": "^24",
  "linkedom": "^0.16",
  "pixelmatch": "^5",
  "pngjs": "^7",
  "@vue/compiler-sfc": "^3.4",
  "@vue/test-utils": "^2.4",
  "@testing-library/react": "^14",
  "@testing-library/user-event": "^14",
  "react": "^18",
  "react-dom": "^18",
  "esbuild": "^0.20",
  "@axe-core/playwright": "^4",
  "html-validate": "^8",
  "dockerode": "^4"
}
```

### Dev

```json
{
  "typescript": "^5.4",
  "@types/node": "^22",
  "tsx": "^4"
}
```

---

## 14. Docker Compose (runner-часть)

```yaml
runner:
  build:
    context: ./runner
    dockerfile: Dockerfile
  environment:
    REDIS_URL: redis://redis:6379
    CALLBACK_URL: http://api:8080/internal
    INTERNAL_SECRET: runner-shared-secret
    CONCURRENCY: 2
    BROWSER_POOL_SIZE: 3
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock  # для запуска sandbox-контейнеров
  depends_on:
    - redis
```

---

## 15. Полный цикл (пример: CSS-задание)

```
1. Пользователь пишет CSS, нажимает "Run"

2. [Go API]
   POST /api/tasks/css-center-element/run
   → Валидирует JWT, находит задание
   → Создаёт submission (status: pending)
   → XADD submissions:queue { payload с публичными test_suites }
   → 202 { "submissionId": "abc-123" }

3. [Task Runner]
   → XREADGROUP → получает задачу
   → Для каждого test_suite:
     - runner_type: "css_computed"
     - Создаёт HTML: <style>{user_css}</style> + config.html
     - Playwright: page.$eval('.container', el => getComputedStyle(el).display)
     - Сравнивает с expected: "flex" → ✓

4. [Task Runner → Go API]
   POST http://api:8080/internal/submissions/abc-123/result
   Headers: X-Internal-Secret: runner-shared-secret
   Body: { status: "passed", tests: [...], exec_time_ms: 1340 }

5. [Go API]
   → Обновляет submissions (status: passed, result: {...})
   → Если mode=submit && passed → обновляет user_task_progress, начисляет XP

6. [Фронтенд]
   → Polling GET /api/submissions/abc-123
   → Получает результат, рендерит
```

---

## 16. Имплементация — пошаговый план

### Phase 1: Скелет и инфраструктура

**Задачи**:
1. Инициализировать Node.js-проект (TypeScript, tsconfig)
2. Настроить `package.json` с зависимостями из секции 13
3. Реализовать Redis Stream consumer (`src/index.ts`):
   - Подключение к Redis
   - Создание consumer group
   - XREADGROUP loop
   - XACK после обработки
   - Graceful shutdown (SIGTERM/SIGINT)
4. Реализовать HTTP callback клиент:
   - POST результата в Go API
   - Retry logic (3 попытки)
   - X-Internal-Secret header

**Acceptance criteria**:
- Worker стартует, подключается к Redis
- Читает сообщения из stream
- Отправляет mock-результат в callback
- Корректно завершается по SIGTERM

---

### Phase 2: Worker + базовые runner-ы

**Задачи**:
1. Реализовать `BaseRunner` абстрактный класс
2. Реализовать `Worker` (диспетчер) — маппинг runner_type → Runner
3. Реализовать `css_computed` runner:
   - Browser pool
   - HTML assembly
   - getComputedStyle assertions
4. Реализовать `js_unit` runner:
   - isolated-vm sandbox
   - Function invocation
   - Deep equality comparison
5. Реализовать `html_semantic` runner:
   - jsdom DOM parsing
   - Все типы assertions (exists, count, text, attr, order, nested, not_exists)

**Acceptance criteria**:
- CSS задание: проверка computed styles через Playwright работает
- JS задание: isolated-vm запускает функцию, сравнивает результат
- HTML задание: парсит DOM, проверяет структуру
- Результаты корректно отправляются в callback

---

### Phase 3: Docker sandbox

**Задачи**:
1. Создать `Dockerfile.sandbox`
2. Реализовать `sandbox/docker.ts`:
   - Создание ephemeral-контейнера через dockerode
   - Проброс кода и тестов через volumes
   - Ограничения (memory, cpu, pids, network=none, read-only)
   - Таймаут и принудительное завершение
3. Реализовать `runner-sandbox/run.js` — entrypoint внутри sandbox
4. Интегрировать sandbox в runner-ы

**Acceptance criteria**:
- Пользовательский код запускается в изолированном контейнере
- Контейнер убивается по таймауту
- Нет сетевого доступа из sandbox
- OOM → корректная ошибка

---

### Phase 4: Расширенные runner-ы

**Задачи**:
1. `css_visual` — скриншоты + pixelmatch
2. `html_validate` — html-validate
3. `js_output` — jsdom + console interception
4. `component_render` — Vue SFC compilation + mount
5. `component_behavior` — сценарии взаимодействия
6. `a11y_axe` — axe-core через Playwright
7. `a11y_manual` — tab order, focus trap, keyboard, ARIA
8. `compiler.ts` — Vue SFC и React JSX компиляция с кэшированием

**Acceptance criteria**:
- Каждый runner корректно обрабатывает happy path и edge cases
- Vue SFC компилируется и монтируется
- React JSX/TSX компилируется и рендерится
- axe-core находит нарушения доступности
- Скриншот-сравнение работает с заданным threshold

---

### Phase 5: Оптимизация и продакшен

**Задачи**:
1. Пре-прогретый пул sandbox-контейнеров
2. Кэш компиляции (LRU по хэшу кода)
3. Параллельный запуск независимых тестов
4. Dockerfile для production worker-а
5. Health check endpoint
6. Метрики: время выполнения, кол-во задач, ошибки

**Acceptance criteria**:
- Среднее время выполнения CSS-задания < 3 сек
- Среднее время выполнения JS-задания < 2 сек
- Worker корректно масштабируется (2+ инстанса с consumer group)
- Health check отвечает 200
