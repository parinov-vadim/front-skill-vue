---
title: "VS Code: лучшие расширения для фронтендера, settings.json"
description: "Настройка VS Code для фронтенд-разработки: лучшие расширения, настройка settings.json, горячие клавиши, сниппеты, терминал и Debug-конфигурация."
section: tools
difficulty: beginner
readTime: 14
order: 6
tags: [vscode, editor, extensions, settings, productivity]
---

## Почему VS Code

VS Code (Visual Studio Code) — самый популярный редактор кода среди фронтенд-разработчиков. Бесплатный, кроссплатформенный, с огромной экосистемой расширений.

Что делает его хорошим для фронтенда:
- Отличная поддержка TypeScript и JavaScript «из коробки»
- Интегрированный терминал
- Git-интеграция
- Debug-инструменты
- Тысячи расширений
- Remote-разработка (SSH, контейнеры, WSL)

## Лучшие расширения для фронтендера

### Обязательные

**Vue - Official** (`vue.volar`) — поддержка Vue 3: подсветка, IntelliSense, TypeScript в `<script setup>`, проверка шаблонов. Ранее назывался Volar.

**ESLint** (`dbaeumer.vscode-eslint`) — подчёркивает ошибки линтинга прямо в редакторе. Автоисправление при сохранении.

**Prettier** (`esbenp.prettier-vscode`) — автоформатирование кода при сохранении. Работает с JS, TS, CSS, HTML, Markdown, JSON.

**TypeScript Import Sorter** (`ymotongpoo.licenser`) или **Organize Imports** — сортировка и удаление неиспользуемых импортов.

### Удобные

**GitLens** (`eamodio.gitlens`) — показывает, кто и когда написал каждую строку (blame), историю коммитов файла, сравнение веток.

**Error Lens** (`usernamehw.error-lens`) — выводит ошибки ESLint и TypeScript прямо в строку с кодом, а не только в панели Problems. Экономит кучу времени.

**Auto Rename Tag** (`formulahendry.auto-rename-tag`) — при переименовании открывающего HTML/Vue-тега автоматически переименовывает закрывающий.

**Path Intellisense** (`christian-kohler.path-intellisense`) — автодополнение путей при импорте файлов.

**Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — автодополнение классов Tailwind, подсветка конфликтующих классов, preview при hover.

**CSS Peek** (`pranaygp.vscode-css-peek`) — `Cmd+Click` на CSS-классе в HTML → переход к определению в CSS-файле.

### Отладка и инструменты

**Thunder Client** (`rangav.vscode-thunder-client`) — REST API клиент внутри VS Code (аналог Postman).

**Live Server** (`ritwickdey.LiveServer`) — локальный dev-сервер с автообновлением для статических HTML-файлов.

**DotENV** (`mikestead.dotenv`) — подсветка `.env`-файлов.

**Markdown All in One** (`yzhang.markdown-all-in-one`) — превью Markdown, автодополнение, генерация оглавления.

### Визуальные

**Material Icon Theme** (`PKief.material-icon-theme`) — красивые иконки для файлов в Explorer по типам (`.vue`, `.ts`, `.css`).

**One Dark Pro** (`zhuangtongfa.Material-theme`) или **GitHub Theme** — популярные цветовые темы.

**Indent Rainbow** (`oderwat.indent-rainbow`) — раскрашивает отступы разными цветами. Помогает видеть вложенность.

**Bracket Pair Color** — встроен в VS Code (с версии 1.67). Цветные пары скобок.

## settings.json — базовая настройка

Открыть: `Cmd+Shift+P` → «Open User Settings (JSON)»

```json
{
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Menlo, monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "editor.minimap": { "enabled": false },
  "editor.wordWrap": "on",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.stickyScroll": { "enabled": true },
  "editor.linkedEditing": true,
  "editor.inlineSuggest.enabled": true,

  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "files.associations": {
    "*.vue": "vue",
    "*.css": "css",
    "*.md": "markdown"
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.nuxt": true,
    "**/.output": true,
    "pnpm-lock.yaml": true
  },

  "terminal.integrated.fontSize": 13,
  "terminal.integrated.defaultProfile.osx": "zsh",

  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.startupEditor": "none",

  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,

  "vue.inlayHints.inlineHandlerLeading": true,

  "prettier.requireConfig": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ]
}
```

### Настройки проекта

Можно создать `.vscode/settings.json` в корне проекта — настройки применятся только к нему:

```json
{
  "editor.tabSize": 2,
  "prettier.singleQuote": true,
  "prettier.semi": false,
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Горячие клавиши

### Навигация

| Комбинация | Действие |
|---|---|
| `Cmd+P` | Быстрый переход к файлу |
| `Cmd+Shift+P` | Командная палитра (все команды) |
| `Cmd+Click` | Перейти к определению |
| `Cmd+Shift+Click` | Открыть определение в другом столбце |
| `Ctrl+-` | Назад (после перехода) |
| `Ctrl+Shift+-` | Вперёд |
| `Cmd+Shift+O` | Символы в файле (функции, классы) |
| `Cmd+T` | Символы во всём проекте |
| `Cmd+G` | Перейти к строке |

### Редактирование

| Комбинация | Действие |
|---|---|
| `Alt+↑/↓` | Переместить строку вверх/вниз |
| `Shift+Alt+↑/↓` | Дублировать строку |
| `Cmd+Shift+K` | Удалить строку |
| `Cmd+D` | Выделить следующее вхождение |
| `Cmd+Shift+L` | Выделить все вхождения |
| `Cmd+/` | Комментарий (toggle) |
| `Cmd+Shift+\` | Перейти к парной скобке |
| `Cmd+Enter` | Новая строка снизу |
| `Cmd+Shift+Enter` | Новая строка сверху |
| `Cmd+Shift+F` | Глобальный поиск |
| `Cmd+F` | Поиск в файле |
| `Cmd+H` | Замена в файле |

### Мультикурсор

| Комбинация | Действие |
|---|---|
| `Alt+Click` | Добавить курсор |
| `Cmd+Alt+↑/↓` | Курсор сверху/снизу |
| `Cmd+L` | Выделить строку |
| `Cmd+Shift+L` | Курсор на всех выделенных |

### Панели

| Комбинация | Действие |
|---|---|
| `Cmd+B` | Показать/скрыть Explorer |
| `Cmd+J` | Показать/скрыть терминал |
| `Cmd+Shift+E` | Explorer |
| `Cmd+Shift+F` | Поиск |
| `Cmd+Shift+G` | Source Control |
| `Cmd+Shift+D` | Debug |
| `Cmd+Shift+X` | Расширения |
| `` Cmd+` `` | Терминал |
| `Cmd+\` | Разделить редактор |

## Сниппеты

Пользовательские сниппеты для быстрого ввода: `Cmd+Shift+P` → «Configure Snippets».

**vue.json** — сниппеты для Vue:

```json
{
  "Vue SFC": {
    "prefix": "vfc",
    "body": [
      "<script setup lang=\"ts\">",
      "$2",
      "</script>",
      "",
      "<template>",
      "  <div>",
      "    $1",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      "</style>"
    ],
    "description": "Vue SFC with script setup"
  },
  "Vue Composable": {
    "prefix": "vcom",
    "body": [
      "export function use${1:Name}() {",
      "  const ${2:state} = ref($3)",
      "",
      "  function ${4:action}() {",
      "    $0",
      "  }",
      "",
      "  return { ${2:state}, ${4:action} }",
      "}"
    ],
    "description": "Vue composable function"
  }
}
```

**typescript.json**:

```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:Component}({ $3 }: ${1:Component}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ]
  }
}
```

## Терминал в VS Code

VS Code имеет встроенный терминал — не нужно переключаться на отдельное окно.

### Несколько терминалов

- `` Cmd+` `` — открыть/закрыть терминал
- `Cmd+Shift+`` — создать новый терминал
- Кнопка `+` в панели терминала — добавить ещё один
- Split terminal — разделить на два рядом

### Задачи (Tasks)

`.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

Запуск: `Cmd+Shift+P` → «Run Task» → выбрать задачу.

## Debug-конфигурация

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vue/Nuxt",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "Debug React (Vite)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "Debug Current TS File",
      "type": "node",
      "request": "launch",
      "program": "${file}",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--loader", "ts-node/esm"]
    }
  ]
}
```

Для работы нужен расширение **Debugger for Chrome** или встроенный js-debug.

## Workspace рекомендованных расширений

`.vscode/extensions.json` — при открытии проекта VS Code предложит установить рекомендованные расширения:

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens",
    "usernamehw.error-lens",
    "PKief.material-icon-theme"
  ]
}
```

## Практика: настройка нового проекта

1. Создайте `.vscode/` в корне проекта
2. Добавьте `settings.json` с настройками формата и линтинга
3. Добавьте `extensions.json` с рекомендациями
4. Добавьте `launch.json` для отладки
5. Закоммитьте эти файлы — вся команда получит одинаковые настройки

## Итог

- VS Code — лучший редактор для фронтенда, если правильно настроить
- Обязательные расширения: Volar (Vue) / ES7+ React Snippets, ESLint, Prettier
- Error Lens экономит время — ошибки видны прямо в коде
- `settings.json` с `formatOnSave` и `fixAll.eslint` — база
- Сниппеты ускоряют написание повторяющихся конструкций
- Проектные настройки в `.vscode/` обеспечивают единообразие в команде
