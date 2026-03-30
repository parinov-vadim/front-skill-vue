---
title: "npm / yarn / pnpm / bun: сравнение пакетных менеджеров"
description: "Сравнение пакетных менеджеров для JavaScript: npm, Yarn, pnpm и Bun. Установка пакетов, lock-файлы, монорепозитории, скорость работы и когда какой выбрать."
section: tools
difficulty: beginner
readTime: 14
order: 1
tags: [npm, yarn, pnpm, bun, package-manager, node.js, dependencies]
---

## Что такое пакетный менеджер

Пакетный менеджер — это инструмент, который скачивает, устанавливает, обновляет и удаляет библиотеки (пакеты) в вашем проекте. Без него пришлось бы вручную скачивать каждый файл и складывать в нужную папку.

Когда вы пишете `npm install axios`, пакетный менеджер:
1. Находит пакет `axios` в реестре (registry.npmjs.org)
2. Скачивает его и все его зависимости
3. Кладёт в папку `node_modules`
4. Записывает в `package.json` и lock-файл точные версии

Сегодня есть четыре основных пакетных менеджера: **npm**, **Yarn**, **pnpm** и **Bun**. Разберём каждый.

## npm

npm (Node Package Manager) — стандартный менеджер, который ставится вместе с Node.js. Самый популярный, самый старый, работает из коробки.

### Основные команды

```bash
npm init -y                          # Создать package.json
npm install                          # Установить все зависимости из package.json
npm install axios                    # Установить пакет (в dependencies)
npm install -D typescript            # Установить как devDependencies
npm uninstall axios                  # Удалить пакет
npm run dev                          # Запустить скрипт "dev"
npm update                           # Обновить пакеты по правиламSemVer
npm outdated                         # Показать устаревшие пакеты
npm list --depth=0                   # Список установленных пакетов
```

### package.json — скрипты

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### Версии в package.json

```
^1.2.3  →  >=1.2.3, <2.0.0   (минорные и патчи)
~1.2.3  →  >=1.2.3, <1.3.0   (только патчи)
1.2.3   →  ровно 1.2.3       (точная версия)
*       →  любая версия
latest  →  последняя версия
```

### package-lock.json

npm создаёт `package-lock.json` — файл, где зафиксированы точные версии всех зависимостей (включая вложенные). Его обязательно нужно коммитить в Git, чтобы у всех разработчиков были одинаковые версии.

### npx

```bash
npx create-vue@latest my-app        # Запустить пакет без глобальной установки
npx playwright install               # Одноразовая утилита
npx jest                             # Запустить локальный jest
```

`npx` скачивает и запускает пакет, не устанавливая его глобально.

### Плюсы и минусы npm

| Плюсы | Минусы |
|---|---|
| Ставится с Node.js | Установка медленнее pnpm и Bun |
| Огромная экосистема | Дублирует пакеты в монорепозиториях |
| Стабильный, проверенный | Нет встроенной поддержки workspaces (до v7) |

## Yarn

Yarn создан Facebook (Meta) в 2016 году, чтобы решить проблемы npm с производительностью и детерминированностью. Сейчас актуальны две версии:

- **Yarn 1 (Classic)** — самостоятельный, без плагинов. Устарел, но ещё встречается
- **Yarn 2+ (Berry)** — современный, с плагинами и PnP (Plug'n'Play)

### Установка

```bash
corepack enable                      # Включить corepack (Node.js 16+)
yarn init -y                         # Создать package.json
yarn install                         # Установить зависимости
yarn add axios                       # Добавить пакет
yarn add -D typescript               # Добавить в devDependencies
yarn remove axios                    # Удалить
yarn dev                             # Запустить скрипт (без "run"!)
```

### Plug'n'Play (PnP)

Yarn Berry может работать вообще без папки `node_modules`. Вместо этого он генерирует файл `.pnp.cjs`, который содержит карту расположения пакетов в кэше.

```bash
yarn set version berry               # Переключиться на Yarn 2+
yarn config set nodeLinker pnp       # Включить PnP (по умолчанию)
```

Плюсы PnP — скорость установки и экономия места. Минусы — не все инструменты совместимы.

### Zero-Installs

Yarn Berry умеет коммитить кэш в репозиторий. После `git clone` не нужно запускать `yarn install` — всё уже есть. Подходит для небольших проектов.

### Плюсы и минусы Yarn

| Плюсы | Минусы |
|---|---|
| Быстрее npm | PnP ломает некоторые инструменты |
| Workspaces «из коробки» | Настройка Berry сложнее |
| Кэширование пакетов глобально | Меньше сообщество, чем у npm |

## pnpm

pnpm (performant npm) — пакетный менеджер, который решает главную проблему npm: дублирование пакетов.

### Как работает pnpm

Когда npm устанавливает пакет, он кладёт его в `node_modules` каждого проекта. Если у вас 10 проектов с React, React скачан и хранится 10 раз.

pnpm хранит каждый пакет **один раз** в глобальном хранилище (`~/.local/share/pnpm/store`), а в `node_modules` создаёт символические ссылки (symlinks).

```
node_modules/
  .pnpm/
    react@18.2.0/
      node_modules/
        react/           ← реальный пакет (один раз на диске)
  react -> .pnpm/react@18.2.0/node_modules/react   ← симлинк
```

Результат: 10 проектов с React занимают место как один.

### Установка и команды

```bash
npm install -g pnpm                  # Установить pnpm
pnpm init                            # Создать package.json
pnpm install                         # Установить зависимости
pnpm add axios                       # Добавить пакет
pnpm add -D typescript               # devDependencies
pnpm remove axios                    # Удалить
pnpm dev                             # Запустить скрипт
pnpm store prune                     # Очистить глобальное хранилище от неиспользуемых пакетов
```

### Строгая изоляция

pnpm не даёт пакету импортировать то, что он явно не указал в зависимостях. Если `axios` использует `lodash` внутри, но не указал его в `dependencies`, npm и Yarn «простят» это. pnpm — нет. Это избавляет от багов, когда вы случайно импортируете чужую зависимость.

### Workspaces (монорепозитории)

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```bash
pnpm --filter @myapp/ui build        # Собрать только пакет @myapp/ui
pnpm --filter app1 dev               # Запустить dev только для app1
pnpm -r build                        # Запустить build во всех пакетах
```

pnpm считается лучшим менеджером для монорепозиториев — он быстрее npm workspaces и стабильнее Yarn.

### Плюсы и минусы pnpm

| Плюсы | Минусы |
|---|---|
| Очень быстрый | Строгая изоляция может ломать старые пакеты |
| Экономит место на диске | Нужно привыкнуть к структуре node_modules |
| Отличные workspaces | Меньше гайдов и документации |

## Bun

Bun — это не просто пакетный менеджер, а полноценный JavaScript-рантайм (как Node.js), написанный на Zig. Включает в себя: рантайм, пакетный менеджер, бандлер, тест-раннер.

### Установка

```bash
curl -fsSL https://bun.sh/install | bash   # macOS / Linux
powershell -c "irm bun.sh/install.ps1 | iex"  # Windows
```

### Пакетный менеджер

```bash
bun init                             # Создать проект
bun install                          # Установить зависимости (создаёт bun.lockb)
bun add axios                        # Добавить пакет
bun add -d typescript                # devDependencies
bun remove axios                     # Удалить
bun run dev                          # Запустить скрипт
```

### Скорость

Bun значительно быстрее остальных менеджеров при установке пакетов. На проекте с 1000 зависимостей:

```
npm install     →  ~30 секунд
yarn install    →  ~20 секунд
pnpm install    →  ~10 секунд (с warmed-кэшем)
bun install     →  ~2 секунды
```

### Bun как рантайм

```bash
bun run server.ts                    # Запустить TypeScript без компиляции
bun test                            # Запустить тесты
bun build ./src/index.ts --outdir ./dist  # Собрать бандл
```

### bun.lockb

Bun использует бинарный lock-файл `bun.lockb` вместо текстового. Он быстрее читается и записывается, но его нельзя просмотреть в текстовом редакторе. Для просмотра:

```bash
bun lockfile print                   # Показать содержимое lock-файла
```

### Совместимость

Bun совместим с большинством npm-пакетов, но не со всеми. Нативные модули (.node) и некоторые Node.js API могут не работать.

### Плюсы и минусы Bun

| Плюсы | Минусы |
|---|---|
| Самый быстрый | Молодой проект, возможны баги |
| Всё в одном: рантайм + менеджер + бандлер | Не 100% совместимость с Node.js |
| Поддерживает npm-пакеты | Меньше экосистема |

## Сравнение

### Команды

| Действие | npm | Yarn | pnpm | Bun |
|---|---|---|---|---|
| Установить все | `npm i` | `yarn` | `pnpm i` | `bun i` |
| Добавить пакет | `npm i pkg` | `yarn add pkg` | `pnpm add pkg` | `bun add pkg` |
| Dev-зависимость | `npm i -D pkg` | `yarn add -D pkg` | `pnpm add -D pkg` | `bun add -d pkg` |
| Удалить | `npm rm pkg` | `yarn remove pkg` | `pnpm rm pkg` | `bun rm pkg` |
| Запустить скрипт | `npm run dev` | `yarn dev` | `pnpm dev` | `bun run dev` |
| Lock-файл | package-lock.json | yarn.lock | pnpm-lock.yaml | bun.lockb |

### Что выбрать

| Ситуация | Рекомендация |
|---|---|
| Начинающий, небольшой проект | **npm** — работает из коробки |
| Монорепозиторий | **pnpm** — лучшие workspaces |
| Команда, где все используют один менеджер | **pnpm** или **Yarn Berry** |
| Максимальная скорость | **Bun** |
| Проект с Nuxt | **pnpm** или **Bun** (официально поддерживаются) |
| Legacy-проект | Что уже используется — то и используйте |

### Как зафиксировать менеджер в проекте

Чтобы все разработчики в команде использовали один и тот же менеджер:

**package.json:**
```json
{
  "packageManager": "pnpm@9.1.0"
}
```

**Corepack** (встроен в Node.js 16+):
```bash
corepack enable
corepack prepare pnpm@9.1.0 --activate
```

Теперь при попытке запустить `npm install` в проекте с `packageManager: "pnpm@..."` будет ошибка с подсказкой использовать pnpm.

## Практика: смена менеджера в проекте

Допустим, вы хотите перейти с npm на pnpm:

```bash
npm install -g pnpm
rm -rf node_modules package-lock.json
pnpm import                           # Создаёт pnpm-lock.yaml из package-lock.json
pnpm install                          # Установка через pnpm
```

Для Bun:
```bash
rm -rf node_modules package-lock.json
bun install                           # Создаёт bun.lockb
```

## .npmrc — конфигурация

Файл `.npmrc` в корне проекта настраивает поведение менеджера:

```ini
# .npmrc
save-exact=true                      # Устанавливать точные версии (без ^)
auto-install-peers=true              # Автоустановка peer-зависимостей
strict-peer-dependencies=false       # Не падать при конфликте peer deps
shamefully-hoist=true                # pnpm: поднять все пакеты наверх (как npm)
```

## .nvmrc и Volta — управление версиями Node.js

Пакетные менеджеры зависят от версии Node.js. Чтобы все в команде использовали одну версию:

```
# .nvmrc
20.11.0
```

```bash
nvm use                              # Переключиться на версию из .nvmrc
```

Или **Volta** — автоматически подхватывает нужную версию:

```bash
volta pin node@20                    # Записать версию в package.json
```

## Итог

- **npm** — стандарт, работает везде, не нужно ничего дополнительно ставить
- **Yarn** — быстрый, с workspaces и PnP, но настройка Berry требует усилий
- **pnpm** — быстрый, экономит диск, лучший выбор для монорепозиториев
- **Bun** — самый быстрый, «всё в одном», но ещё молодой

Для новых проектов в 2025 году чаще всего выбирают **pnnpm** или **Bun**. Если вы только начинаете — начните с npm, а когда столкнётесь с его ограничениями, переходите на pnpm.
