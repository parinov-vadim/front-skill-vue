---
title: GitHub Actions: CI/CD для фронтенда
description: GitHub Actions — встроенный CI/CD на GitHub. Автоматическая сборка, тестирование, линтинг и деплой фронтенд-проектов при каждом push и pull request.
section: git
difficulty: intermediate
readTime: 12
order: 6
tags: [git, GitHub, Actions, CI/CD, automation, deploy, workflow]
---

## Что такое GitHub Actions

GitHub Actions — система CI/CD, встроенная прямо в GitHub. При каждом push, pull request или другом событии GitHub может автоматически запустить ваш скрипт: собрать проект, прогнать тесты, задеплоить. Не нужно настраивать отдельный сервер — всё работает в облаке GitHub.

Workflow описывается в YAML-файлах в папке `.github/workflows/`. GitHub сам создаёт виртуальную машину, выполняет команды и показывает результат прямо в PR.

## Структура workflow

```
.github/
└── workflows/
    ├── ci.yml          # Непрерывная интеграция (тесты, линт)
    ├── deploy.yml      # Деплой на продакшен
    └── preview.yml     # Превью-деплой для PR
```

## Базовый CI-пайплайн

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout код
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Установка зависимостей
        run: npm ci

      - name: Линтинг
        run: npm run lint

      - name: Типы TypeScript
        run: npx tsc --noEmit

      - name: Тесты
        run: npm run test -- --coverage

      - name: Сборка
        run: npm run build
```

Разберём по частям.

### on — когда запускать

```yaml
# При каждом push в main
on:
  push:
    branches: [main]

# При каждом PR в main
on:
  pull_request:
    branches: [main]

# Комбинация
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

# По расписанию (каждый день в 6:00 UTC)
on:
  schedule:
    - cron: '0 6 * * *'

# Вручную (кнопка в GitHub)
on:
  workflow_dispatch:

# При создании тега
on:
  push:
    tags:
      - 'v*'
```

### jobs и steps

```yaml
jobs:
  lint:                          # Название job
    runs-on: ubuntu-latest       # ОС: ubuntu, windows, macos
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]          # Ждёт завершения lint и test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

`needs` указывает зависимости между job-ами. В примере `build` запустится только после успешного завершения `lint` и `test`. Без `needs` все job-ы запускаются параллельно.

### Matrix — тестирование на разных версиях

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20, 22]
      fail-fast: false  # Не отменять остальные, если один упал

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

Это создаст 9 комбинаций (3 OS × 3 версии Node.js).

## Кэширование

Без кэширования `npm ci` скачивает пакеты каждый раз — это медленно. Кэш ускоряет CI в 2-3 раза:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # Автоматический кэш node_modules
```

Ручное кэширование:

```yaml
- name: Кэш node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

## Переменные окружения и секреты

### Секреты

Секреты хранятся в Settings → Secrets and variables → Actions. В workflow они доступны через `${{ secrets.* }}`:

```yaml
- name: Деплой
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DEPLOY_URL: ${{ secrets.DEPLOY_URL }}
  run: |
    npm run build
    curl -X POST "$DEPLOY_URL" -H "Authorization: Bearer $API_KEY"
```

GitHub автоматически скрывает значения секретов в логах — вы увидите `***` вместо реального значения.

### Переменные

```yaml
env:
  NODE_ENV: production
  CI: true  # Отключает интерактивные промпты

jobs:
  build:
    env:
      BUILD_TARGET: production
    steps:
      - run: echo "Building for $BUILD_TARGET"
```

## Деплой на GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Деплой на Vercel

```yaml
# .github/workflows/vercel.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Нужен `VERCEL_TOKEN` — создайте в настройках Vercel и добавьте в GitHub Secrets.

## Preview-деплой для PR

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

Бот оставит комментарий в PR с ссылкой на preview-деплой.

## Полезные готовые Actions

```yaml
# Кэш Bun
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest

# Кэш pnpm
- uses: pnpm/action-setup@v4
  with:
    version: 9

# Проверка типов
- run: npx tsc --noEmit

# ESLint с аннотациями в PR
- uses: reviewdog/action-eslint@v1
  with:
    reporter: github-pr-review

# Размер бандла
- uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}

# Загрузка артефактов (сохранить build)
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/

# Скачивание артефактов
- uses: actions/download-artifact@v4
  with:
    name: build
    path: dist/
```

## Проверка PR — статус-чеки

GitHub автоматически показывает статус checks в PR:

```yaml
# ci.yml — прогоняется при каждом PR
on:
  pull_request:
    branches: [main]
```

Настроить обязательность: Settings → Branches → Branch protection rules → `main` → Require status checks to pass before merging.

Когда PR не проходит CI — кнопку Merge будет серой. Нельзя сломать main.

## Пример — полный CI/CD для Nuxt-проекта

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_ENV: production
  CI: true

jobs:
  lint:
    name: Линтинг
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    name: Проверка типов
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx nuxi typecheck

  test:
    name: Тесты
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Сборка
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: nuxt-build
          path: .output/
          retention-days: 7
```

## Итог

| Концепция | Для чего |
|---|---|
| `on: push/pull_request` | Когда запускать workflow |
| `jobs` + `steps` | Из чего состоит пайплайн |
| `needs` | Порядок выполнения job-ов |
| `matrix` | Тестирование на разных версиях |
| `cache` | Ускорить установку зависимостей |
| `secrets` | Хранение токенов и ключей |
| `upload-artifact` | Передать билд между job-ами |
| `actions/checkout@v4` | Получить код репозитория |

GitHub Actions — самый доступный CI/CD для open source проектов: 2000 бесплатных минут в месяц для публичных репозиториев. Для приватных — зависит от тарифа. Конфигурация живёт рядом с кодом, а результат виден прямо в PR.
