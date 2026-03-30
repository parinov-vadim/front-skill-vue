---
title: Git Hooks: автоматизация перед коммитом
description: Git hooks — скрипты, которые запускаются автоматически при определённых событиях Git. Husky для управления хуками, lint-staged для линтинга только изменённых файлов, commitlint для проверки сообщений.
section: git
difficulty: intermediate
readTime: 10
order: 5
tags: [git, hooks, Husky, lint-staged, pre-commit, commitlint, automation]
---

## Что такое Git Hooks

Git hooks — скрипты, которые Git запускает автоматически при определённых действиях: перед коммитом, перед push, после получения данных и так далее. С их помощью можно автоматически линтить код, прогонять тесты, проверять формат сообщения коммита — и не пропускать некачественный код в репозиторий.

Hooks хранятся в `.git/hooks/`. Git создаёт примеры с суффиксом `.sample`:

```
.git/hooks/
├── applypatch-msg.sample
├── pre-commit.sample      # Перед коммитом
├── pre-push.sample         # Перед push
├── commit-msg.sample       # Проверка сообщения коммита
└── ...
```

Проблема: `.git/hooks/` не попадает в репозиторий — хуки нельзя расшарить между командой. Решение — **Husky**.

## Client-side hooks

| Hook | Когда срабатывает | Для чего |
|---|---|---|
| `pre-commit` | Перед `git commit` | Линтинг, форматирование |
| `prepare-commit-msg` | Перед открытием редактора сообщения | Шаблон сообщения |
| `commit-msg` | Проверка сообщения коммита | Conventional Commits |
| `pre-push` | Перед `git push` | Запуск тестов |
| `post-checkout` | После `git checkout` | Установка зависимостей |
| `post-merge` | После `git pull` | Установка зависимостей |

## Husky — управление хуками

[Husky](https://typicode.github.io/husky/) — инструмент, который позволяет хранить Git hooks прямо в репозитории. Работает на macOS, Linux и Windows.

### Установка

```bash
npm install --save-dev husky
npx husky init
```

Команда `npx husky init`:
1. Создаст папку `.husky/` в корне проекта
2. Добавит `prepare` скрипт в `package.json`
3. Создаст пример хука `.husky/pre-commit`

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

`prepare` запускается автоматически после `npm install` — Husky настроится у каждого разработчика в команде.

### Добавление хуков

```bash
# Создать pre-commit хук
echo 'npx eslint .' > .husky/pre-commit

# Создать commit-msg хук
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

# Создать pre-push хук
echo 'npm test' > .husky/pre-push
```

Или вручную:

```bash
# .husky/pre-commit
npm run lint
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

### Структура .husky

```
.husky/
├── _
│   ├── .gitignore
│   └── husky.sh
├── pre-commit       # Запускается перед git commit
├── commit-msg       # Проверяет сообщение коммита
└── pre-push         # Запускается перед git push
```

### Обход хуков (когда нужно)

```bash
# Пропустить все хуки
git commit --no-verify -m "emergency fix"

# Или через переменную окружения
HUSKY=0 git commit -m "emergency fix"
```

Не злоупотребляйте — `--no-verify` существует для экстренных ситуаций, а не для повседневной работы.

## lint-staged — линтинг только изменённых файлов

Если запускать ESLint на весь проект перед каждым коммитом — это будет долго, особенно в крупных проектах. lint-staged решает проблему: запускает линтер только на файлах, которые попадут в коммит (staged files).

### Установка

```bash
npm install --save-dev lint-staged
```

### Настройка

Создайте `.lintstagedrc.json` (или секцию `lint-staged` в `package.json`):

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss,html,md,json}": [
    "prettier --write"
  ],
  "*.vue": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

Что это делает:
- Для `.ts` и `.tsx` файлов — запускает ESLint с автофиксом и Prettier
- Для стилей, HTML, Markdown и JSON — только Prettier
- Всё это применяется **только к staged-файлам**

### Интеграция с Husky

```bash
# .husky/pre-commit
npx lint-staged
```

Теперь перед каждым коммитом:
1. Husky запускает `lint-staged`
2. lint-staged находит staged-файлы
3. Запускает соответствующие команды для каждого файла
4. Если линтер нашёл ошибку — коммит отменяется
5. Если всё чисто — файлы форматированы и коммит проходит

### Конфигурация через package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

### Фильтрация по glob-паттернам

```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix"],
  "tests/**/*.{ts,tsx}": ["eslint --fix"],
  "*.{json,md}": ["prettier --write"]
}
```

## commitlint — проверка сообщений коммита

commitlint проверяет, что сообщение коммита соответствует конвентиру (например, Conventional Commits).

### Установка

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Настройка

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [0],  // Отключить проверку регистра
  }
}
```

### Интеграция с Husky

```bash
# .husky/commit-msg
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

Теперь коммит с неправильным форматом будет отклонён:

```bash
# ❌ Отклонено
git commit -m "fix bug"
# ⇒ subject must not be sentence-case, start-case, pascal-case, upper-case

# ✅ Принято
git commit -m "fix: resolve login redirect loop"
git commit -m "feat: add user search with debounce"
```

## Полная настройка: Husky + lint-staged + commitlint

### Шаг за шагом

```bash
# 1. Установить всё
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional

# 2. Инициализировать Husky
npx husky init

# 3. Создать pre-commit хук
echo 'npx lint-staged' > .husky/pre-commit

# 4. Создать commit-msg хук
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

# 5. Добавить prepare скрипт (если не добавлен)
npm pkg set scripts.prepare="husky"
```

### Итоговые файлы

```json
// package.json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,html,md,json}": ["prettier --write"]
  }
}
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

Теперь каждый коммит автоматически:
1. Линтит и форматирует staged-файлы
2. Проверяет формат сообщения коммита
3. Отменяет коммит, если что-то не так

## Практические примеры

### Pre-push — запуск тестов

```bash
# .husky/pre-push
npm run test -- --browsers=ChromeHeadless --watch=false
```

Тесты прогоняются перед push. Если падают — push отменяется.

### Post-merge — обновление зависимостей

```bash
# .husky/post-merge
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

if echo "$changed_files" | grep -q "package-lock.json\|pnpm-lock.yaml\|bun.lockb"; then
  echo "📦 Зависимости изменились, выполняем install..."
  npm install
fi

if echo "$changed_files" | grep -q "migrations/"; then
  echo "🗃 Есть новые миграции"
fi
```

После `git pull`, если обновился lockfile — зависимости установятся автоматически.

### Pre-commit — проверка типов TypeScript

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "bash -c 'npx tsc --noEmit'",
      "prettier --write"
    ]
  }
}
```

`bash -c 'npx tsc --noEmit'` запустит проверку типов. Но будьте осторожны — это медленно для больших проектов. Лучше вынести в pre-push.

## Итог

| Инструмент | Для чего |
|---|---|
| `Husky` | Хранить Git hooks в репозитории |
| `lint-staged` | Линтить только staged-файлы перед коммитом |
| `commitlint` | Проверять формат сообщений коммита |
| `pre-commit` хук | Автолинтинг и форматирование |
| `commit-msg` хук | Проверка Conventional Commits |
| `pre-push` хук | Запуск тестов |
| `--no-verify` | Обойти хуки (экстренные случаи) |

Git hooks — невидимый, но мощный слой защиты. Они гарантируют, что каждый коммит в репозитории проходит базовую проверку качества. Настроить один раз — и команда забудет о «забыл запустить линтер».
