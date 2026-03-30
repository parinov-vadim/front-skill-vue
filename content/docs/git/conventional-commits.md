---
title: "Conventional Commits: стандарт коммитов"
description: Conventional Commits — соглашение о формате сообщений коммита. feat, fix, breaking change, commitizen для интерактивного ввода, автоматический changelog и семантическое версионирование.
section: git
difficulty: intermediate
readTime: 10
order: 10
tags: [git, commits, conventional, commitizen, changelog, semver]
---

## Что такое Conventional Commits

Conventional Commits — это спецификация, которая задаёт единый формат сообщений коммита. Вместо произвольных текстов типа «fix bug» или «updates» каждый коммит следует структуре:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Примеры:

```bash
git commit -m "feat: add user search with debounce"
git commit -m "fix: resolve login redirect loop"
git commit -m "docs: update API reference for v2"
git commit -m "feat(auth)!: change token format — breaking change"
```

Зачем это нужно:
- **Автоматический changelog** — по типам коммитов генерируется список изменений
- **Семантическое версионирование** — `feat` → минорная версия, `fix` → патч, `!` → мажорная
- **История читается как документация** — `git log --oneline` сразу понятен
- **Фильтрация** — можно найти все багфиксы или фичи

## Типы коммитов

| Тип | Описание | Влияние на версию |
|---|---|---|
| `feat` | Новая функциональность | minor (1.1.0) |
| `fix` | Исправление бага | patch (1.0.1) |
| `docs` | Изменение документации | — |
| `style` | Форматирование, пробелы (не логика) | — |
| `refactor` | Рефакторинг без изменения поведения | — |
| `perf` | Улучшение производительности | patch |
| `test` | Добавление или исправление тестов | — |
| `build` | Сборка, зависимости (webpack, npm) | — |
| `ci` | Конфигурация CI/CD | — |
| `chore` | Рутинные задачи, не затрагивающие код | — |
| `revert` | Откат предыдущего коммита | — |

## Формат

### Обязательные части

```
<type>: <subject>
```

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: prevent double form submission"
```

### Scope — область изменений

```
<type>(<scope>): <subject>
```

```bash
git commit -m "feat(auth): add Google OAuth provider"
git commit -m "fix(api): handle 503 status code"
git commit -m "docs(readme): add installation instructions"
git commit -m "refactor(utils): extract date formatting to helper"
```

Scope помогает группировать изменения по модулям. Это опционально, но полезно в крупных проектах.

### Body — подробное описание

```bash
git commit -m "feat: add task filtering by difficulty" -m "
Add filter dropdown on task list page. Supports easy/medium/hard.
Preserves filter in query params for shareable URLs.

Closes #42"
```

В редакторе (без -m):

```
feat: add task filtering by difficulty

Add filter dropdown on task list page. Supports easy/medium/hard.
Preserves filter in query params for shareable URLs.

Closes #42
```

### Breaking changes

Для изменений, ломающих обратную совместимость:

```bash
# Вариант 1: ! после type
git commit -m "feat(api)!: change response format to camelCase"

# Вариант 2: через footer
git commit -m "feat(api): change response format to camelCase" -m "
BREAKING CHANGE: API now returns camelCase instead of snake_case.
Update all API consumers."
```

Breaking change автоматически увеличивает мажорную версию (2.0.0).

### Ссылки на issues

```bash
# Закрыть issue при мерже
git commit -m "fix: resolve login redirect loop

Closes #42"

# Упомянуть issue
git commit -m "refactor: simplify auth service

Related to #42"
```

## commitizen — интерактивный ввод коммитов

commitizen — CLI-инструмент, который помогает писать коммиты в правильном формате через интерактивный диалог.

### Установка

```bash
npm install --save-dev commitizen cz-conventional-changelog
```

### Настройка

```json
// package.json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### Использование

Вместо `git commit`:

```bash
git add .
npm run commit
```

Интерактивный диалог:

```
? Select the type of change: feat
? What is the scope of this change (optional): auth
? Write a short description: add Google OAuth provider
? Provide a longer description (optional): 
? Are there any breaking changes? No
? Does this change affect any open issues? Yes
? Add issue references: Closes #42

[feat(auth): add Google OAuth provider
Closes #42]
```

### Адаптер для русского языка

```bash
npm install --save-dev cz-customizable
```

```javascript
// .cz-config.js
module.exports = {
  types: [
    { value: 'feat',     name: 'feat:     Новая функциональность' },
    { value: 'fix',      name: 'fix:      Исправление бага' },
    { value: 'docs',     name: 'docs:     Документация' },
    { value: 'style',    name: 'style:    Форматирование' },
    { value: 'refactor', name: 'refactor: Рефакторинг' },
    { value: 'perf',     name: 'perf:     Производительность' },
    { value: 'test',     name: 'test:     Тесты' },
    { value: 'chore',    name: 'chore:    Рутина' },
  ],
  scopes: [
    { name: 'auth' },
    { name: 'api' },
    { name: 'ui' },
    { name: 'tasks' },
    { name: 'profile' },
  ],
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
}
```

```json
// package.json
{
  "config": {
    "commitizen": {
      "path": "cz-customizable"
    }
  }
}
```

## commitlint — принудительная проверка

commitlint проверяет формат сообщения коммита и отклоняет неправильные (подробнее — в статье про Git Hooks):

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
}
```

```bash
# .husky/commit-msg
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

Теперь неправильный формат сообщения — коммит отклонён:

```bash
git commit -m "fix bug"
# ⧗   input: fix bug
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]
```

## Автоматический changelog

### standard-version

```bash
npm install --save-dev standard-version
```

```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

```bash
# Автоматически:
# 1. Определяет версию по коммитам (feat → minor, fix → patch, ! → major)
# 2. Генерирует CHANGELOG.md
# 3. Обновляет package.json
# 4. Создаёт git tag
npm run release
```

Результат в CHANGELOG.md:

```markdown
# Changelog

## 1.2.0 (2024-03-30)

### Features
* **auth:** add Google OAuth provider (abc1234)
* **tasks:** add filtering by difficulty (def5678)

### Bug Fixes
* resolve login redirect loop (ghi9012)
* prevent double form submission (jkl3456)

### BREAKING CHANGES
* **api:** response format changed to camelCase
```

### semantic-release

Более мощный инструмент — полностью автоматизирует релизы:

```bash
npm install --save-dev semantic-release
```

```json
// package.json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

semantic-release:
- Анализирует коммиты с момента последнего релиза
- Определяет следующую версию
- Генерирует changelog
- Создаёт git tag и GitHub release
- Публикует пакет в npm (если нужно)

Настройка через GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Практические примеры

### Типичный рабочий день

```bash
# Утро: начал новую фичу
git commit -m "feat(tasks): add task creation form"

# Добавил валидацию
git commit -m "feat(tasks): add form validation with Zod"

# Нашёл баг в существующем коде
git commit -m "fix(tasks): prevent empty title submission"

# Обновил документацию
git commit -m "docs: add task creation guide"

# Рефакторинг
git commit -m "refactor(tasks): extract form validation to composable"

# Перед релизом
npm run release
```

### Scope по модулям проекта

```
feat(auth): add JWT token refresh
feat(tasks): add drag-and-drop sorting
feat(profile): add avatar upload
fix(api): handle 503 gateway timeout
fix(ui): fix mobile navigation overlap
docs(api): add endpoint descriptions
chore(deps): update Angular to v18
ci: add Vercel preview deployment
```

## Итог

| Концепция | Для чего |
|---|---|
| `feat:`, `fix:`, `docs:` | Тип изменения |
| `(scope)` | Область — модуль или компонент |
| `!` или `BREAKING CHANGE` | Ломает обратную совместимость |
| `commitizen` | Интерактивный ввод коммитов |
| `commitlint` | Принудительная проверка формата |
| `standard-version` | Автоматический changelog и версионирование |
| `semantic-release` | Полная автоматизация релизов |

Conventional Commits — не просто косметика. Это основа для автоматизации: changelog, версионирование, release notes — всё генерируется из истории коммитов. Один раз договорились о формате — и забыли о ручном написании списка изменений.
