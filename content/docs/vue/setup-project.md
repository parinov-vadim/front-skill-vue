---
title: Установка и создание проекта Vue
description: Как создать Vue-проект с помощью create-vue и Vite. Структура проекта, конфигурация, выбор опций при установке и первые шаги.
section: vue
difficulty: beginner
readTime: 8
order: 6
tags: [Vue 3, create-vue, Vite, проект, установка]
---

## Создание проекта

Официальный способ создать Vue-проект — утилита `create-vue`. Она генерирует проект на Vite с современными настройками:

```bash
npm create vue@latest my-app
```

Альтернативно с bun:

```bash
bun create vue@latest my-app
```

Запустится интерактивный мастер с вопросами:

```
✔ Add TypeScript? … Yes
✔ Add JSX Support? … No
✔ Add Vue Router? … Yes
✔ Add Pinia? … Yes
✔ Add Vitest? … Yes
✔ Add ESLint? … Yes
✔ Add Vue DevTools? … Yes
```

Выбирайте то, что нужно. Можно добавить всё и потом убрать лишнее.

После создания:

```bash
cd my-app
npm install
npm run dev
```

## Альтернативные способы

### Vite напрямую

```bash
npm create vite@latest my-app -- --template vue-ts
```

Минимальный проект без Router, Pinia и тестов. Подходит, если нужен полный контроль.

### Nuxt

```bash
npx nuxi@latest init my-app
```

Nuxt — фреймворк поверх Vue с SSR, маршрутизацией и автоимпортами из коробки. Если проект предполагает SEO и серверный рендеринг — Nuxt лучший выбор.

### Vue через CDN

Для прототипов и экспериментов:

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<div id="app">{{ message }}</div>
<script>
  const { createApp } = Vue
  createApp({
    data() {
      return { message: 'Привет, Vue!' }
    }
  }).mount('#app')
</script>
```

## Структура проекта

Типичная структура проекта, созданного через `create-vue`:

```
my-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── HelloWorld.vue
│   │   └── TheWelcome.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── counter.ts
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── AboutView.vue
│   ├── App.vue
│   └── main.ts
├── .eslintrc.cjs
├── env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### Ключевые файлы

**`index.html`** — входная точка. Vite использует его как шаблон:

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Мое Vue-приложение</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**`src/main.ts`** — точка входа JavaScript:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

**`src/App.vue`** — корневой компонент:

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Главная</RouterLink>
      <RouterLink to="/about">О проекте</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
```

## vite.config.ts

Базовая конфигурация:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Добавление плагинов

Vue Router DevTools:

```ts
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), VueDevTools()],
})
```

Автоимпорт компонентов:

```ts
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      dts: true,
    }),
  ],
})
```

## Рекомендуемые расширения VS Code

- **Vue - Official** (ранее Volar) — подсветка синтаксиса, IntelliSense, форматирование
- **ESLint** — линтинг
- **Prettier** — автоформатирование

Настройка `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## npm-скрипты

```bash
npm run dev       # Запуск dev-сервера (обычно http://localhost:5173)
npm run build     # Сборка для production (результат в dist/)
npm run preview   # Превью production-сборки
npm run lint      # Проверка ESLint
npm run test      # Запуск тестов (Vitest)
```

## Environment variables

Переменные окружения хранятся в файлах `.env`:

```
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=Моё приложение
```

Доступ в коде через `import.meta.env`:

```ts
const apiUrl = import.meta.env.VITE_API_URL
const title = import.meta.env.VITE_APP_TITLE
```

Типизация через `env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}
```

Режимы:

```
.env                # Общие
.env.local          # Локальные (не коммитится)
.env.development    # npm run dev
.env.production     # npm run build
.env.staging        # --mode staging
```

## Итог

`create-vue` — рекомендуемый способ создания Vue-проекта. Он генерирует структуру на Vite с опциональным TypeScript, Router, Pinia и тестами. Для SSR-проектов используйте Nuxt. Настройте VS Code с Vue - Official для комфортной разработки.
