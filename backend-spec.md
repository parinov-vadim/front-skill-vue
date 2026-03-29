# Backend Specification — FrontSkill

> Спецификация серверной части платформы FrontSkill.
> Фокус: система заданий, запуск пользовательского кода, верификация решений.

---

## 1. Общая архитектура

Backend — отдельный сервис на Go, фронтенд общается с ним по HTTP.

```
┌─────────────┐  HTTP   ┌──────────────────────┐       ┌──────────────┐
│   Nuxt SSR  │────────▶│   Go API (chi)       │──────▶│  PostgreSQL  │
│  (frontend) │         │   :8080              │       │  (pgx/sqlc)  │
└─────────────┘         └──────────┬───────────┘       └──────────────┘
                                   │
                                   │ Redis (asynq)
                                   ▼
                        ┌──────────────────────┐       ┌──────────────┐
                        │  Task Runner Worker  │       │    Redis     │
                        │  (Node.js sidecar)   │       │              │
                        │                      │       └──────────────┘
                        │  ┌────────────────┐  │
                        │  │  Playwright    │  │
                        │  │  jsdom         │  │
                        │  │  isolated-vm   │  │
                        │  │  axe-core      │  │
                        │  └────────────────┘  │
                        └──────────────────────┘
                           Docker / Firecracker
```

### Два сервиса

| Сервис | Язык | Назначение |
|--------|------|------------|
| **API** | Go (chi) | REST API, авторизация, бизнес-логика, постановка задач в очередь |
| **Task Runner** | Node.js | Изолированный запуск и проверка пользовательского кода |

Task Runner — отдельный процесс на Node.js, потому что инструменты верификации (Playwright, jsdom, Vue/React компиляторы, axe-core) — это JS-экосистема. Go API общается с ним через Redis-очередь (asynq).

### Компоненты

| Компонент | Технология | Назначение |
|-----------|-----------|------------|
| API-сервер | Go 1.23+, chi v5 | REST API, middleware, роутинг |
| БД | PostgreSQL 16 + pgx/v5 + sqlc | Задания, пользователи, решения |
| Миграции | goose | Версионирование схемы БД |
| Кэш/очередь | Redis 7 + asynq | Очередь запуска, rate limiting, сессии |
| Task Runner | Node.js 22 (отдельный процесс) | Запуск кода в песочнице, Playwright, jsdom |
| Файловое хранилище | S3-совместимое (MinIO) | Эталонные скриншоты, ассеты заданий |
| Конфигурация | envconfig / .env | Переменные окружения |

---

## 2. Структура Go-проекта

```
backend/
├── cmd/
│   └── api/
│       └── main.go                 # точка входа
├── internal/
│   ├── config/
│   │   └── config.go               # загрузка конфигурации из env
│   ├── handler/                     # HTTP-хендлеры (по домену)
│   │   ├── auth.go
│   │   ├── task.go
│   │   ├── submission.go
│   │   ├── user.go
│   │   └── leaderboard.go
│   ├── middleware/
│   │   ├── auth.go                  # JWT middleware
│   │   ├── ratelimit.go             # rate limiting
│   │   └── cors.go
│   ├── model/                       # доменные структуры
│   │   ├── user.go
│   │   ├── task.go
│   │   ├── submission.go
│   │   └── progress.go
│   ├── repository/                  # слой работы с БД
│   │   ├── queries/                 # .sql файлы для sqlc
│   │   │   ├── users.sql
│   │   │   ├── tasks.sql
│   │   │   ├── submissions.sql
│   │   │   └── progress.sql
│   │   └── db/                      # сгенерированный sqlc-код
│   │       ├── db.go
│   │       ├── models.go
│   │       └── queries.sql.go
│   ├── service/                     # бизнес-логика
│   │   ├── auth.go
│   │   ├── task.go
│   │   └── submission.go
│   ├── queue/                       # работа с asynq
│   │   ├── client.go                # постановка задач в очередь
│   │   └── tasks.go                 # типы задач для очереди
│   └── router/
│       └── router.go                # chi роутер, маунт хендлеров
├── migrations/                      # goose SQL-миграции
│   ├── 001_create_users.sql
│   ├── 002_create_tasks.sql
│   ├── 003_create_submissions.sql
│   └── ...
├── sqlc.yaml                        # конфигурация sqlc
├── go.mod
├── go.sum
├── Dockerfile
└── docker-compose.yml               # API + PostgreSQL + Redis + Runner
```

### Ключевые зависимости (go.mod)

```
github.com/go-chi/chi/v5          # роутер
github.com/go-chi/cors             # CORS middleware
github.com/jackc/pgx/v5           # PostgreSQL драйвер
github.com/hibiken/asynq           # очередь задач (Redis)
github.com/golang-jwt/jwt/v5       # JWT
golang.org/x/crypto                # bcrypt
github.com/google/uuid              # UUID
github.com/pressly/goose/v3        # миграции
github.com/sethvargo/go-envconfig  # конфигурация из env
```

---

## 3. Схема базы данных

### users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(40) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  role          VARCHAR(20) DEFAULT 'user',       -- user | admin | moderator
  xp            INT DEFAULT 0,
  streak_days   INT DEFAULT 0,
  last_active   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### tasks

```sql
CREATE TABLE tasks (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(120) UNIQUE NOT NULL,      -- URL-friendly ID
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,                     -- Markdown
  details       TEXT,                              -- расширенное описание
  difficulty    VARCHAR(10) NOT NULL,              -- easy | medium | hard | expert
  categories    TEXT[] NOT NULL,                   -- {css, js, vue, react, html, a11y, ...}
  tags          TEXT[],                            -- свободные теги
  language      VARCHAR(20) NOT NULL,              -- css | html | javascript | typescript
  starter_code  TEXT NOT NULL,                     -- шаблон для редактора
  solution_code TEXT,                              -- эталонное решение (для модерации)
  requirements  TEXT[],                            -- список требований
  constraints   TEXT[],                            -- ограничения
  xp_reward     INT DEFAULT 10,
  time_limit_ms INT DEFAULT 10000,                 -- лимит на выполнение
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### task_test_suites

Каждое задание имеет набор тестов. Тесты разделены на **публичные** (видны пользователю как примеры) и **скрытые** (запускаются при submit).

```sql
CREATE TABLE task_test_suites (
  id          SERIAL PRIMARY KEY,
  task_id     INT REFERENCES tasks(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,               -- "Flexbox центрирование"
  is_public   BOOLEAN DEFAULT false,               -- видим пользователю?
  sort_order  INT DEFAULT 0,

  -- тип верификации (определяет, какой runner использовать)
  runner_type VARCHAR(30) NOT NULL,
  -- css_computed | css_visual | dom_structure | js_unit | js_output
  -- component_render | component_behavior | a11y_axe | a11y_manual
  -- html_validate | html_semantic

  -- конфигурация теста (JSON) — формат зависит от runner_type
  config      JSONB NOT NULL,

  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### task_examples

Примеры, которые отображаются в описании задания (отдельно от тестов).

```sql
CREATE TABLE task_examples (
  id              SERIAL PRIMARY KEY,
  task_id         INT REFERENCES tasks(id) ON DELETE CASCADE,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  explanation     TEXT,
  sort_order      INT DEFAULT 0
);
```

### submissions

```sql
CREATE TABLE submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  task_id     INT REFERENCES tasks(id),
  code        TEXT NOT NULL,
  language    VARCHAR(20) NOT NULL,
  mode        VARCHAR(10) NOT NULL DEFAULT 'run',  -- run | submit
  status      VARCHAR(20) DEFAULT 'pending',
  -- pending | running | passed | failed | error | timeout
  result      JSONB,                               -- детальный результат
  exec_time   INT,                                 -- мс
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submissions_user_task ON submissions(user_id, task_id);
CREATE INDEX idx_submissions_status ON submissions(status);
```

### user_task_progress

```sql
CREATE TABLE user_task_progress (
  user_id     UUID REFERENCES users(id),
  task_id     INT REFERENCES tasks(id),
  status      VARCHAR(20) DEFAULT 'unsolved',      -- unsolved | attempted | solved
  best_time   INT,                                 -- лучшее время выполнения
  attempts    INT DEFAULT 0,
  solved_at   TIMESTAMPTZ,
  last_code   TEXT,                                -- последний сохранённый код
  PRIMARY KEY (user_id, task_id)
);
```

---

## 4. Go API — роутер и хендлеры

### 4.1. Роутер (chi)

```go
func NewRouter(h *handler.Handler, mw *middleware.Middleware) *chi.Mux {
    r := chi.NewRouter()

    // глобальные middleware
    r.Use(chiMiddleware.Logger)
    r.Use(chiMiddleware.Recoverer)
    r.Use(chiMiddleware.RequestID)
    r.Use(mw.CORS)
    r.Use(mw.RateLimit)

    // публичные эндпоинты
    r.Route("/api", func(r chi.Router) {

        // auth
        r.Route("/auth", func(r chi.Router) {
            r.Post("/register", h.Register)
            r.Post("/login", h.Login)
            r.Post("/logout", h.Logout)
            r.Post("/refresh", h.RefreshToken)
            r.Post("/github", h.GitHubOAuth)
            r.With(mw.Auth).Get("/me", h.Me)
        })

        // tasks (публичные)
        r.Route("/tasks", func(r chi.Router) {
            r.Get("/", h.ListTasks)             // список с фильтрами
            r.Get("/{slug}", h.GetTask)         // детали задания

            // действия, требующие авторизации
            r.Group(func(r chi.Router) {
                r.Use(mw.Auth)
                r.Post("/{slug}/run", h.RunTests)
                r.Post("/{slug}/submit", h.SubmitSolution)
                r.Post("/{slug}/save", h.SaveDraft)
            })
        })

        // submissions
        r.Route("/submissions", func(r chi.Router) {
            r.Get("/{id}", h.GetSubmission)  // polling статуса
        })

        // users (публичные профили)
        r.Get("/users/{username}", h.GetUserProfile)
        r.Get("/leaderboard", h.GetLeaderboard)

        // авторизованные user-эндпоинты
        r.With(mw.Auth).Get("/users/me/progress", h.GetMyProgress)
    })

    return r
}
```

### 4.2. Пример хендлера (submit)

```go
// POST /api/tasks/{slug}/submit
func (h *Handler) SubmitSolution(w http.ResponseWriter, r *http.Request) {
    slug := chi.URLParam(r, "slug")
    userID := middleware.UserIDFromCtx(r.Context())

    var req struct {
        Code     string `json:"code"`
        Language string `json:"language"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid request body")
        return
    }

    // валидация
    if len(req.Code) > 50*1024 {
        respondError(w, http.StatusBadRequest, "code too large (max 50KB)")
        return
    }

    submission, err := h.submissionService.Create(r.Context(), service.CreateSubmissionParams{
        TaskSlug: slug,
        UserID:   userID,
        Code:     req.Code,
        Language: req.Language,
        Mode:     "submit",
    })
    if err != nil {
        respondError(w, http.StatusInternalServerError, err.Error())
        return
    }

    respondJSON(w, http.StatusAccepted, map[string]string{
        "submissionId": submission.ID.String(),
    })
}
```

### 4.3. Сервис submission (бизнес-логика)

```go
func (s *SubmissionService) Create(ctx context.Context, p CreateSubmissionParams) (*model.Submission, error) {
    // найти задание
    task, err := s.repo.GetTaskBySlug(ctx, p.TaskSlug)
    if err != nil {
        return nil, fmt.Errorf("task not found: %w", err)
    }

    // создать запись в БД
    sub, err := s.repo.CreateSubmission(ctx, db.CreateSubmissionParams{
        UserID:   p.UserID,
        TaskID:   task.ID,
        Code:     p.Code,
        Language: p.Language,
        Mode:     p.Mode,
        Status:   "pending",
    })
    if err != nil {
        return nil, err
    }

    // поставить задачу в очередь asynq
    err = s.queue.EnqueueRunTests(ctx, queue.RunTestsPayload{
        SubmissionID: sub.ID,
        TaskID:       task.ID,
        Code:         p.Code,
        Language:     p.Language,
        Mode:         p.Mode,
        TimeLimitMs:  task.TimeLimitMs,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to enqueue: %w", err)
    }

    return sub, nil
}
```

### 4.4. Очередь (asynq)

```go
// queue/client.go
const TypeRunTests = "submission:run_tests"

type RunTestsPayload struct {
    SubmissionID uuid.UUID `json:"submission_id"`
    TaskID       int       `json:"task_id"`
    Code         string    `json:"code"`
    Language     string    `json:"language"`
    Mode         string    `json:"mode"`       // run | submit
    TimeLimitMs  int       `json:"time_limit_ms"`
}

func (c *Client) EnqueueRunTests(ctx context.Context, p RunTestsPayload) error {
    payload, _ := json.Marshal(p)

    priority := asynq.Queue("default")
    if p.Mode == "submit" {
        priority = asynq.Queue("critical")
    }

    task := asynq.NewTask(TypeRunTests, payload,
        asynq.MaxRetry(2),
        asynq.Timeout(time.Duration(p.TimeLimitMs+5000)*time.Millisecond),
        priority,
    )

    _, err := c.client.EnqueueContext(ctx, task)
    return err
}
```

---

## 5. Связь Go API ↔ Node.js Task Runner

Go API ставит задачу в Redis-очередь (asynq). Node.js Worker слушает ту же Redis-очередь и обрабатывает задачи.

```
┌────────────┐                    ┌──────────────────┐
│  Go API    │ ── asynq task ──▶  │  Redis           │
│            │                    │  (очередь задач)  │
└────────────┘                    └────────┬─────────┘
                                           │
                                           │ asynq-compatible
                                           ▼
                                  ┌──────────────────┐
                                  │  Node.js Worker  │
                                  │  (asynq-like     │
                                  │   consumer)      │
                                  └────────┬─────────┘
                                           │
                                           │ обновляет submissions
                                           ▼
                                  ┌──────────────────┐
                                  │  PostgreSQL      │
                                  │  (напрямую или   │
                                  │   через callback)│
                                  └──────────────────┘
```

### Протокол взаимодействия

Asynq хранит задачи в Redis как JSON. Node.js worker читает задачи из Redis напрямую (используя формат asynq, либо через общую Redis list/stream).

**Вариант A: Общий Redis stream** (рекомендуется для простоты):
1. Go ставит задачу в Redis Stream (`XADD submissions:queue ...`)
2. Node.js читает из Redis Stream (`XREADGROUP ...`)
3. Node.js по завершению вызывает Go API callback: `POST /internal/submissions/{id}/result`

**Вариант B: Node.js пишет в БД напрямую**:
1. Go ставит задачу в Redis
2. Node.js читает, выполняет, обновляет `submissions` в PostgreSQL напрямую
3. Go API при polling читает свежий статус из БД

Рекомендуется **вариант A** — чище разделение: Node.js знает только про Redis и callback URL, не имеет доступа к БД.

### Internal callback endpoint (Go)

```go
// POST /internal/submissions/{id}/result — вызывается Node.js worker-ом
r.Route("/internal", func(r chi.Router) {
    r.Use(mw.InternalOnly)  // проверяет shared secret или source IP
    r.Post("/submissions/{id}/result", h.ReceiveSubmissionResult)
})
```

```go
func (h *Handler) ReceiveSubmissionResult(w http.ResponseWriter, r *http.Request) {
    subID := chi.URLParam(r, "id")

    var result model.RunnerResult
    json.NewDecoder(r.Body).Decode(&result)

    err := h.submissionService.ProcessResult(r.Context(), uuid.MustParse(subID), result)
    if err != nil {
        respondError(w, http.StatusInternalServerError, err.Error())
        return
    }

    w.WriteHeader(http.StatusOK)
}
```

---

## 6. Система запуска и верификации заданий

### 6.1. Общий pipeline

```
Пользователь нажимает "Run" / "Submit"
        │
        ▼
  POST /api/tasks/{slug}/run   или   /submit
        │
        ▼
  Go API: создаёт submission (status: pending), ставит в Redis Stream
        │
        ▼
  Node.js Worker читает задачу из Redis
        │
        ▼
  Загружает test_suites для задания из payload
        │
        ▼
  Определяет runner_type для каждого теста
        │
        ├── css_computed    → CSSComputedRunner
        ├── css_visual      → CSSVisualRunner
        ├── dom_structure   → DOMStructureRunner
        ├── js_unit         → JSUnitRunner
        ├── js_output       → JSOutputRunner
        ├── component_render    → ComponentRenderRunner
        ├── component_behavior  → ComponentBehaviorRunner
        ├── a11y_axe        → A11yAxeRunner
        ├── a11y_manual     → A11yManualRunner
        ├── html_validate   → HTMLValidateRunner
        └── html_semantic   → HTMLSemanticRunner
        │
        ▼
  POST /internal/submissions/{id}/result → Go обновляет БД
        │
        ▼
  Клиент получает результат (polling GET /api/submissions/{id})
```

### 6.2. Разница между Run и Submit

| | Run (Запустить тесты) | Submit (Отправить решение) |
|---|---|---|
| Тесты | Только публичные | Все (публичные + скрытые) |
| Rate limit | 10 запусков / мин | 5 запусков / мин |
| Очередь | `default` | `critical` (приоритетнее) |
| Сохранение | Не влияет на прогресс | Обновляет `user_task_progress` |
| XP | Не начисляется | Начисляется при первом прохождении |

### 6.3. Доставка результата клиенту

Два режима:

1. **Short polling** (MVP):
   - `POST /api/tasks/{slug}/run` → `{ "submissionId": "uuid" }`
   - Клиент опрашивает `GET /api/submissions/{id}` каждые 500мс

2. **SSE** (рекомендуется для прода):
   - `GET /api/submissions/{id}/stream` — Server-Sent Events
   - Go подписывается на Redis Pub/Sub канал `submission:{id}`
   - Node.js worker публикует промежуточные статусы в тот же канал
   - Сервер пушит: `running` → `test_1_passed` → `test_2_failed` → `completed`

SSE предпочтительнее WebSocket: проще реализовать в Go (стандартный `http.Flusher`), не требует отдельной библиотеки, работает через HTTP/2.

---

## 7. Runners — верификация по типам заданий

Все runner-ы запускаются **внутри sandbox-контейнера** (Docker).

Общие ограничения:
- Таймаут: `time_limit_ms` (по умолчанию 10 сек)
- Память: 256 MB
- Нет доступа к сети
- Нет доступа к файловой системе за пределами рабочей директории
- PID limit: 64

### 7.1. CSS — `css_computed`

**Задача**: Проверить, что CSS пользователя приводит к нужным computed-стилям на указанных элементах.

**Как работает**:
1. Собирается HTML-страница: базовый HTML задания + CSS пользователя в `<style>`
2. Playwright открывает страницу
3. Для каждого теста: выбирается элемент по селектору, читается `getComputedStyle()`
4. Значения сравниваются с ожидаемыми

**Формат config**:
```jsonc
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

### 7.2. CSS — `css_visual`

**Задача**: Пиксельное/структурное сравнение рендера с эталоном.

**Как работает**:
1. Собирается HTML + CSS пользователя
2. Playwright делает скриншот (фиксированный viewport)
3. Скриншот сравнивается с эталонным через `pixelmatch`
4. Допускается настраиваемый % расхождения

**Формат config**:
```jsonc
{
  "html": "<div class=\"card\">...</div>",
  "viewport": { "width": 1280, "height": 720 },
  "reference_screenshot": "tasks/15/reference.png",  // путь в S3
  "threshold": 0.05,
  "ignore_regions": [
    { "x": 0, "y": 0, "width": 100, "height": 50 }
  ],
  "viewports": [
    { "width": 375, "height": 667, "reference": "tasks/15/mobile.png" },
    { "width": 1280, "height": 720, "reference": "tasks/15/desktop.png" }
  ]
}
```

### 7.3. HTML — `html_validate`

**Задача**: Проверить валидность HTML.

**Как работает**:
1. HTML пользователя прогоняется через `html-validate`
2. Проверяются конкретные правила из config

**Формат config**:
```jsonc
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

### 7.4. HTML — `html_semantic`

**Задача**: Проверить семантическую структуру HTML.

**Как работает**:
1. HTML парсится в DOM (через `linkedom` или `jsdom`)
2. Проверяется наличие и вложенность элементов

**Формат config**:
```jsonc
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

### 7.5. JavaScript — `js_unit`

**Задача**: Запустить пользовательскую функцию и проверить возвращаемые значения.

**Как работает**:
1. Код пользователя выполняется в `isolated-vm` (V8 изолят)
2. Тестовые вызовы вызывают экспортированную функцию
3. Результат сравнивается с ожидаемым (deep equality)

**Формат config**:
```jsonc
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
  "comparison": "deep_equal",  // deep_equal | unordered_equal | approximate
  "timeout_per_case_ms": 2000
}
```

**Безопасность**: `isolated-vm` запускает код в отдельном V8 изоляте:
- Нет доступа к `require`, `import`, `process`, `fs`, `net`
- Ограничение по памяти (64 MB на изолят)
- Ограничение по CPU (таймаут)

### 7.6. JavaScript — `js_output`

**Задача**: Проверить вывод в console.log / DOM-манипуляции.

**Как работает**:
1. Код запускается в `jsdom` окружении
2. `console.log` перехватывается
3. Проверяется вывод и/или состояние DOM после выполнения

**Формат config**:
```jsonc
{
  "html": "<ul id=\"list\"></ul>",
  "assertions": [
    { "type": "console", "expected": ["Hello", "World"] },
    { "type": "dom", "selector": "#list li", "count": 3 },
    { "type": "dom", "selector": "#list li:first-child", "text": "Item 1" }
  ]
}
```

### 7.7. Vue — `component_render`

**Задача**: Проверить, что Vue-компонент рендерит правильную разметку.

**Как работает**:
1. Пользовательский `.vue` SFC компилируется через `@vue/compiler-sfc`
2. Компонент монтируется через `@vue/test-utils` в `jsdom`
3. Проверяется DOM-вывод

**Pipeline компиляции**:
```
User SFC (.vue)
    │
    ▼
@vue/compiler-sfc
    ├── template  → render function
    ├── script    → JS module
    └── style     → extracted CSS
    │
    ▼
esbuild (бандлинг, если есть импорты)
    │
    ▼
@vue/test-utils mount() в jsdom
    │
    ▼
Assertions
```

**Формат config**:
```jsonc
{
  "mount_options": {
    "props": { "title": "Hello", "items": ["a", "b", "c"] },
    "global": {
      "stubs": { "RouterLink": true }
    }
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

### 7.8. Vue / React — `component_behavior`

**Задача**: Проверить интерактивное поведение компонента (клики, ввод, реактивность).

**Как работает**:
1. Компонент монтируется (Vue через `@vue/test-utils`, React через `@testing-library/react`)
2. Выполняется сценарий взаимодействия
3. После каждого шага проверяются assertions

**Формат config (Vue)**:
```jsonc
{
  "framework": "vue",
  "mount_options": {
    "props": { "initialCount": 0 }
  },
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

**Формат config (React)**:
```jsonc
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

**Pipeline компиляции React**:
```
User JSX/TSX
    │
    ▼
esbuild (jsx transform, bundling)
    │
    ▼
@testing-library/react render() в jsdom
    │
    ▼
fireEvent / userEvent interactions
    │
    ▼
Assertions via DOM queries
```

### 7.9. A11y — `a11y_axe`

**Задача**: Автоматическая проверка доступности через axe-core.

**Как работает**:
1. HTML пользователя (+ CSS если есть) рендерится в Playwright
2. Запускается `@axe-core/playwright`
3. Результаты фильтруются по правилам из config

**Формат config**:
```jsonc
{
  "inject_user_code_as": "html",   // html | css | both
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

### 7.10. A11y — `a11y_manual`

**Задача**: Проверить accessibility-паттерны, которые axe не ловит.

**Как работает**:
1. HTML рендерится в Playwright
2. Проверяется клавиатурная навигация, focus management, ARIA states

**Формат config**:
```jsonc
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

## 8. Node.js Task Runner — архитектура

### 8.1. Структура

```
runner/
├── src/
│   ├── index.ts                    # точка входа, Redis consumer
│   ├── worker.ts                   # диспетчер: payload → нужный runner
│   ├── runners/
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
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 8.2. Изоляция

```
┌─ Docker Host ─────────────────────────────────────┐
│                                                   │
│  ┌─ Node.js Worker ────────────────────────────┐  │
│  │                                             │  │
│  │  Redis XREADGROUP → получает задачу         │  │
│  │           │                                 │  │
│  │           ▼                                 │  │
│  │  ┌─ Docker Container (ephemeral) ────────┐  │  │
│  │  │                                       │  │  │
│  │  │  - Read-only filesystem               │  │  │
│  │  │  - No network (--network=none)        │  │  │
│  │  │  - Memory limit: 256MB                │  │  │
│  │  │  - CPU limit: 1 core                  │  │  │
│  │  │  - PID limit: 64                      │  │  │
│  │  │  - Time limit: task.time_limit_ms     │  │  │
│  │  │                                       │  │  │
│  │  │  Node.js + Playwright (pre-cached)    │  │  │
│  │  │  Код пользователя → /tmp/solution     │  │  │
│  │  │  Тесты → /tmp/tests                  │  │  │
│  │  │                                       │  │  │
│  │  │  stdout/stderr → результат            │  │  │
│  │  └───────────────────────────────────────┘  │  │
│  │                                             │  │
│  │  Парсит результат                           │  │
│  │  POST /internal/submissions/{id}/result     │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 8.3. Docker-образ для sandbox-контейнера

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

### 8.4. Формат результата

Runner возвращает JSON в callback:

```jsonc
{
  "status": "passed",  // passed | failed | error | timeout
  "total_tests": 8,
  "passed_tests": 8,
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

Go API маппит на клиентский формат:

```go
type ClientResult struct {
    Passed      bool     `json:"passed"`
    Details     []string `json:"details"`
    TotalTests  int      `json:"totalTests"`
    PassedTests int      `json:"passedTests"`
    ExecTime    int      `json:"execTime"`
}

func ToClientResult(r RunnerResult, mode string) ClientResult {
    var details []string
    for _, t := range r.Tests {
        if mode == "run" && !t.IsPublic {
            continue
        }
        icon := "✗"
        if t.Passed {
            icon = "✓"
        }
        name := t.Name
        if !t.IsPublic {
            name = "Скрытый тест"
        }
        msg := ""
        if t.IsPublic && t.Message != "" {
            msg = " — " + t.Message
        }
        details = append(details, fmt.Sprintf("%s %s%s", icon, name, msg))
    }

    return ClientResult{
        Passed:      r.Status == "passed",
        Details:     details,
        TotalTests:  r.TotalTests,
        PassedTests: r.PassedTests,
        ExecTime:    r.ExecTimeMs,
    }
}
```

---

## 9. API Endpoints

### 9.1. Задания

```
GET    /api/tasks                 — список заданий (пагинация, фильтры)
GET    /api/tasks/{slug}          — детали задания
POST   /api/tasks/{slug}/run      — запустить публичные тесты       [auth]
POST   /api/tasks/{slug}/submit   — отправить решение (все тесты)   [auth]
POST   /api/tasks/{slug}/save     — сохранить черновик кода          [auth]
GET    /api/submissions/{id}      — статус/результат submission
GET    /api/submissions/{id}/stream — SSE стрим статуса
```

#### `GET /api/tasks`

Query params:
```
?page=1
&limit=20
&difficulty=easy,medium
&categories=css,js
&status=solved          (requires auth)
&search=flexbox
&sort=popular           (popular | acceptance-desc | difficulty-asc | newest)
```

Response:
```jsonc
{
  "tasks": [
    {
      "id": 1,
      "slug": "css-center-element",
      "title": "Центрирование элемента",
      "description": "Центрируй элемент тремя способами...",
      "difficulty": "easy",
      "categories": ["css"],
      "tags": ["CSS", "Flexbox", "Grid"],
      "solved": false,
      "attempted": false,
      "acceptance": 81,
      "solutions": 9320
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20
}
```

#### `POST /api/tasks/{slug}/run`

Request:
```jsonc
{
  "code": "/* user CSS */",
  "language": "css"
}
```

Response (202 Accepted):
```jsonc
{
  "submissionId": "uuid-here"
}
```

#### `GET /api/submissions/{id}`

Response:
```jsonc
{
  "id": "uuid",
  "status": "passed",
  "result": {
    "passed": true,
    "details": [
      "✓ Тест 1: Flexbox центрирование — пройден",
      "✓ Тест 2: Grid центрирование — пройден"
    ],
    "totalTests": 5,
    "passedTests": 5,
    "execTime": 1340
  }
}
```

### 9.2. Аутентификация

```
POST   /api/auth/register          — регистрация
POST   /api/auth/login             — вход
POST   /api/auth/logout            — выход
POST   /api/auth/refresh           — обновление токена
GET    /api/auth/me                — текущий пользователь     [auth]
POST   /api/auth/github            — OAuth через GitHub
```

JWT-токены:
- `access_token` — 15 минут, в `Authorization: Bearer` header
- `refresh_token` — 30 дней, в httpOnly cookie

### 9.3. Пользователь

```
GET    /api/users/{username}       — публичный профиль
GET    /api/users/me/progress      — прогресс по заданиям    [auth]
GET    /api/leaderboard            — таблица лидеров
```

### 9.4. Internal (Runner → API)

```
POST   /internal/submissions/{id}/result    — результат выполнения
```

Защищён shared secret в header `X-Internal-Secret`.

---

## 10. Стратегии верификации по категориям

| Категория | Типичные runner-ы | Инструменты (Node.js) |
|-----------|------------------|----------------------|
| **CSS** | `css_computed`, `css_visual` | Playwright + getComputedStyle, pixelmatch |
| **HTML** | `html_validate`, `html_semantic` | html-validate, linkedom/jsdom |
| **JavaScript** | `js_unit`, `js_output` | isolated-vm, jsdom |
| **TypeScript** | `js_unit`, `js_output` | esbuild (transpile) → isolated-vm |
| **Vue** | `component_render`, `component_behavior` | @vue/compiler-sfc, @vue/test-utils, jsdom |
| **React** | `component_render`, `component_behavior` | esbuild (JSX), @testing-library/react, jsdom |
| **A11y** | `a11y_axe`, `a11y_manual` | Playwright, axe-core |
| **SVG** | `dom_structure`, `css_visual` | jsdom (структура), Playwright (визуал) |

### Комбинирование runner-ов

Одно задание может иметь тесты разных типов. Runner-ы запускаются **последовательно** в рамках одного submission. Если тест с ранним приоритетом падает — остальные могут быть пропущены (`fail_fast: true` в конфиге задания).

---

## 11. Безопасность

### 11.1. Песочница для кода

| Уровень | Мера | Зачем |
|---------|------|-------|
| L1 | Docker container с `--network=none` | Нет сетевого доступа |
| L2 | `--read-only` filesystem | Нельзя записывать за пределами /tmp |
| L3 | `--memory=256m --cpus=1 --pids-limit=64` | Ограничение ресурсов |
| L4 | `seccomp` / `AppArmor` профиль | Блокировка опасных syscall-ов |
| L5 | `isolated-vm` для JS (отдельный V8 изолят) | JS не имеет доступа к Node.js API |
| L6 | Таймаут (kill после `time_limit_ms`) | Защита от бесконечных циклов |

### 11.2. Защита Go API

- Rate limiting через Redis (`go-chi/httprate` или свой middleware)
- Максимальный размер кода: 50 KB (проверяется в хендлере)
- Валидация language (whitelist)
- CORS: разрешён только домен фронтенда
- Secure headers (chi middleware)
- `X-Internal-Secret` для internal endpoints

### 11.3. Защита от обхода тестов

- Код пользователя не имеет доступа к тестам (тесты инжектируются runner-ом)
- Скрытые тесты не показывают ожидаемые значения при ошибке
- Код пользователя не может переопределить `console`, `setTimeout`, глобалы тестового фреймворка

---

## 12. Производительность

### 12.1. Оптимизации runner-а

- **Пре-прогретые контейнеры**: пул из N готовых Docker-контейнеров
- **Кэширование Playwright-браузера**: браузер запускается 1 раз при старте контейнера
- **Параллельный запуск тестов**: независимые тесты одного задания запускаются параллельно
- **Компиляция Vue/React SFC**: кэшируется по хэшу кода

### 12.2. Масштабирование

```
                       ┌─── Node.js Worker 1 ───┐
                       │   (Docker host)        │
Redis Stream ─────────├─── Node.js Worker 2 ───┤
                       │   (Docker host)        │
                       └─── Node.js Worker N ───┘
```

- Redis Streams поддерживают consumer groups — worker-ы масштабируются горизонтально
- Go API — stateless, масштабируется за load balancer
- Приоритеты: submit задачи попадают в `critical` очередь
- Для MVP: 1 Go инстанс + 1-2 Node.js worker-а

---

## 13. Docker Compose (development)

```yaml
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://frontskill:secret@postgres:5432/frontskill?sslmode=disable
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-me
      INTERNAL_SECRET: runner-shared-secret
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      - postgres
      - redis

  runner:
    build:
      context: ./runner
      dockerfile: Dockerfile
    environment:
      REDIS_URL: redis://redis:6379
      CALLBACK_URL: http://api:8080/internal
      INTERNAL_SECRET: runner-shared-secret
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # для запуска sandbox-контейнеров
    depends_on:
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: frontskill
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: frontskill
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  miniodata:
```

---

## 14. Пример: полный цикл CSS-задания

1. Пользователь пишет CSS на фронтенде, нажимает "Run"
2. Nuxt: `POST http://api:8080/api/tasks/css-center-element/run`
3. **Go API**:
   - Валидирует JWT, находит задание по slug
   - Создаёт `submissions` (status: pending)
   - Ставит задачу в Redis Stream вместе с test_suites (только публичные)
   - Возвращает `202 { "submissionId": "abc-123" }`
4. **Node.js Worker**:
   - Читает задачу из Redis Stream
   - Для каждого test_suite определяет runner_type
   - `css_computed`: создаёт HTML с `<style>{user_css}</style>`, открывает в Playwright
   - `page.$eval('.container', el => getComputedStyle(el).display)` → `"flex"` ✓
   - Собирает результаты
   - `POST http://api:8080/internal/submissions/abc-123/result`
5. **Go API**:
   - Получает результат, обновляет `submissions` (status: passed)
   - Если mode=submit и passed=true: обновляет `user_task_progress`, начисляет XP
6. **Nuxt**: polling `GET /api/submissions/abc-123` → получает результат, рендерит

---

## 15. MVP — план реализации

### Фаза 1: Go API + БД (неделя 1-2)
- [ ] Инициализация Go-проекта (chi, pgx, sqlc, goose)
- [ ] Миграции: users, tasks, submissions, progress
- [ ] Auth: register, login, JWT, refresh
- [ ] CRUD задач: GET /tasks, GET /tasks/{slug}
- [ ] Docker Compose: api + postgres + redis

### Фаза 2: Runner MVP (неделя 3-4)
- [ ] Redis Stream: Go producer + Node.js consumer
- [ ] Internal callback endpoint
- [ ] `css_computed` runner (Playwright)
- [ ] `js_unit` runner (isolated-vm)
- [ ] `html_semantic` runner (jsdom)
- [ ] Docker sandbox контейнер
- [ ] Polling GET /api/submissions/{id}

### Фаза 3: Расширенные runner-ы (неделя 5-6)
- [ ] `css_visual` runner (скриншоты + pixelmatch)
- [ ] `component_render` runner (Vue)
- [ ] `component_behavior` runner (Vue + React)
- [ ] `a11y_axe` runner
- [ ] SSE стрим результатов

### Фаза 4: Продуктовые фичи (неделя 7-8)
- [ ] Leaderboard, XP, streaks
- [ ] Профиль пользователя
- [ ] Сохранение черновиков
- [ ] GitHub OAuth
- [ ] Пре-прогретый пул sandbox-контейнеров
- [ ] Rate limiting, мониторинг

---

## 16. Альтернативы и trade-offs

### Песочница: Docker vs Firecracker vs WebContainers

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Docker** (рекомендуется для MVP) | Простой setup, зрелая экосистема | ~1s overhead на cold start |
| **Firecracker** (microVM) | Лёгкие VM, ~125мс старт | Сложнее настроить, только Linux |
| **WebContainers** (браузерный) | Нулевой backend | Нет Playwright, ограниченные API |

### Очередь: Redis Streams vs Asynq vs Temporal

| Вариант | Когда использовать |
|---------|-------------------|
| **Redis Streams** (рекомендуется) | Простой cross-language протокол Go ↔ Node.js |
| **Asynq** (Go only) | Если runner тоже на Go |
| **Temporal** | Сложные workflows с retry/saga |

### Почему Runner на Node.js, а не на Go

Go API отвечает за HTTP, авторизацию, бизнес-логику — здесь Go сильнее. Но runner зависит от JS-экосистемы:
- Playwright — JS API
- jsdom / linkedom — JS DOM
- @vue/compiler-sfc, @vue/test-utils — Vue toolchain
- @testing-library/react — React toolchain
- isolated-vm — V8 изоляты
- axe-core — JS accessibility engine

Переписывать эти инструменты на Go нецелесообразно. Разделение на два сервиса — естественная граница.
