---
title: "ESLint + Prettier: линтинг и автоформатирование кода"
description: "ESLint для проверки качества кода и Prettier для автоформатирования. Настройка, правила, плоский конфиг, интеграция с VS Code, Husky и lint-staged."
section: tools
difficulty: intermediate
readTime: 14
order: 4
tags: [eslint, prettier, linting, formatting, code-quality, husky]
---

## Зачем нужен линтинг

Когда в команде 5 разработчиков, каждый пишет по-своему: одни ставят точку с запятой, другие нет. Одни используют `const`, другие — `let` для всего. Кто-то пишет функции на 200 строк. Без единых правил код превращается в кашу.

ESLint решает две задачи:
1. **Качество кода** — находит баги, неиспользуемые переменные, потенциальные ошибки
2. **Единый стиль** — все пишут одинаково, код легко читать

Prettier решает третью задачу:
3. **Форматирование** — отступы, переносы строк, пробелы, длина строки

Вместе они обеспечивают порядок в проекте.

## ESLint

### Установка

```bash
npm install -D eslint
npx eslint --init                        # Интерактивная настройка
```

Или вручную:

```bash
npm install -D eslint @eslint/js typescript-eslint
```

### Flat Config (ESLint 9+)

Начиная с ESLint 9 используется «плоский конфиг» — `eslint.config.js` (или `.mjs`) вместо `.eslintrc.json`:

```js
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,                              // Отключает правила, конфликтующие с Prettier
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts'],
  },
)
```

### Legacy-формат (.eslintrc.json)

Если проект старый:

```json
{
  "root": true,
  "env": { "browser": true, "node": true, "es2022": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "vue/multi-word-component-names": "off"
  },
  "ignorePatterns": ["dist", "node_modules"]
}
```

### Правила

Уровни:
- `'off'` или `0` — отключено
- `'warn'` или `1` — предупреждение
- `'error'` или `2` — ошибка (приводит к ненулевому exit code)

Полезные правила:

```js
rules: {
  'no-console': 'warn',                       // Предупреждать о console.log
  'no-debugger': 'error',                     // Ошибка при debugger
  'no-unused-vars': 'off',                    // Отключить JS-версию
  '@typescript-eslint/no-unused-vars': ['warn', {
    argsIgnorePattern: '^_',                  // _variable — можно не использовать
    varsIgnorePattern: '^_',
  }],
  '@typescript-eslint/no-explicit-any': 'warn', // Осторожнее с any
  'no-var': 'error',                          // Только let/const
  'prefer-const': 'error',                    // const если не переназначается
  'eqeqeq': ['error', 'always'],              // Только ===, не ==
  'curly': ['error', 'all'],                  // Всегда фигурные скобки
  'no-throw-literal': 'error',                // throw new Error(), не throw 'string'
}
```

Vue-специфичные:

```js
rules: {
  'vue/multi-word-component-names': 'off',      // UserCard.vue — ок
  'vue/no-v-html': 'warn',                      // XSS-риск
  'vue/require-default-prop': 'off',
  'vue/max-attributes-per-line': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/block-lang': ['error', {
    script: { lang: 'ts' },                     // Только <script lang="ts">
  }],
}
```

### Запуск

```bash
npx eslint .                            # Проверить все файлы
npx eslint src/                         # Проверить папку
npx eslint src/App.vue                  # Проверить один файл
npx eslint . --fix                      # Автоисправить что можно
npx eslint . --max-warnings 0           # Ошибка при любом предупреждении
```

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Prettier

Prettier — опinionated (самоуверенный) форматировщик. Он не спрашивает, как форматировать — он просто делает. Это и есть его главный плюс: никаких споров в команде.

### Установка

```bash
npm install -D prettier
```

### Конфигурация

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

Основные опции:

| Опция | Описание | Пример значения |
|---|---|---|
| `printWidth` | Максимальная длина строки | `100` |
| `tabWidth` | Отступ в пробелах | `2` |
| `useTabs` | Использовать табы | `false` |
| `semi` | Точка с запятой в конце | `false` |
| `singleQuote` | Одинарные кавычки | `true` |
| `trailingComma` | Запятая в конце | `'all'` |
| `bracketSpacing` | Пробелы в `{ }` | `true` |
| `arrowParens` | Скобки у стрелочных | `'always'` |
| `endOfLine` | Символ переноса строки | `'lf'` |

### Игнорирование файлов

```
# .prettierignore
dist
node_modules
*.min.js
package-lock.json
pnpm-lock.yaml
```

### Запуск

```bash
npx prettier . --check                  # Проверить (exit code 1 если есть отличия)
npx prettier . --write                  # Отформатировать
npx prettier src/App.vue --write        # Один файл
```

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

## Совместная работа ESLint и Prettier

Проблема: ESLint тоже умеет форматировать (правила вроде `quotes`, `semi`, `indent`), и его правила могут конфликтовать с Prettier.

Решение: **eslint-config-prettier** — отключает все ESLint-правила, которые дублируют Prettier.

```bash
npm install -D eslint-config-prettier
```

В flat config:
```js
import prettier from 'eslint-config-prettier'

export default [
  // ... другие конфиги
  prettier,    // Должен быть последним!
]
```

В legacy:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "prettier"        // Должен быть последним!
  ]
}
```

### eslint-plugin-prettier (опционально)

Этот плагин заставляет ESLint запускать Prettier и показывать различия как ESLint-ошибки. Удобно, но добавляет время выполнения:

```bash
npm install -D eslint-plugin-prettier
```

```js
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

export default [
  // ... другие конфиги
  eslintPluginPrettier,    // Добавляет prettier-правило и config-prettier
]
```

## Интеграция с VS Code

Автоматически исправлять и форматировать при сохранении:

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "prettier.requireConfig": true
}
```

Расширения VS Code:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Vue - Official** (для Vue-файлов)

## Husky + lint-staged: проверка перед коммитом

Чтобы некрасивый код не попадал в репозиторий, используем Git hooks:

```bash
npm install -D husky lint-staged
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,html,md,json}": [
      "prettier --write"
    ]
  }
}
```

Теперь при `git commit` автоматически:
1. ESLint исправит JS/TS/Vue-файлы
2. Prettier отформатирует всё
3. Если ESLint найдёт неисправимую ошибку — коммит прервётся

## TypeScript ESLint: специфичные правила

```js
rules: {
  '@typescript-eslint/consistent-type-imports': ['error', {
    prefer: 'type-imports',              // import type { User } вместо import { User }
  }],
  '@typescript-eslint/no-floating-promises': 'error',  // .catch() или await обязателен
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/no-unnecessary-condition': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/non-nullable-type-assertion-style': 'warn',
}
```

## Практика: настройка с нуля для Vue + TS проекта

```bash
mkdir my-app && cd my-app
npm init -y
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-vue eslint-config-prettier prettier
```

Создаём конфиги:

```js
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
)
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

```json
// package.json scripts
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier . --write",
  "format:check": "prettier . --check"
}
```

## Итог

- **ESLint** — находит ошибки и обеспечивает качество кода. Правила можно настраивать под проект
- **Prettier** — форматирует код. Не имеет сотен настроек — это фича, а не баг
- **eslint-config-prettier** — обязателен, чтобы ESLint и Prettier не конфликтовали
- **Husky + lint-staged** — автоматизируют проверку перед коммитом
- В 2025 году используйте **flat config** (`eslint.config.mjs`) для новых проектов
- Для Vue-проектов обязательно `eslint-plugin-vue`, для React — `eslint-plugin-react` + `eslint-plugin-react-hooks`
