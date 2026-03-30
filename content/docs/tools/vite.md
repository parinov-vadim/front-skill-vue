---
title: "Vite: быстрая сборка, конфигурация, плагины"
description: "Vite — современный инструмент сборки для фронтенд-проектов. Dev-сервер на ESM, HMR за миллисекунды, Rollup-бандлер для production, плагины и конфигурация."
section: tools
difficulty: intermediate
readTime: 15
order: 2
tags: [vite, bundler, hmr, rollup, build, dev-server]
---

## Что такое Vite

Vite (читается «вит», фр. «быстрый») — это инструмент сборки, созданный Эваном Ю (автором Vue.js). Он решает главную проблему Webpack: медленный старт dev-сервера на больших проектах.

Традиционный подход: при запуске dev-сервера бандлер собирает весь граф зависимостей, транспайлит код и только потом отдаёт браузеру. На проекте с 1000 модулей это занимает 30–60 секунд.

Vite делает иначе:
1. **Dev-сервер** — не собирает ничего заранее. Браузер сам загружает модули через ES-импорты (`<script type="module">`). Зависимости (из `node_modules`)_pre-бандлятся один раз с помощью esbuild (на Go, очень быстрый).
2. **Production-сборка** — использует Rollup для оптимизации, tree-shaking и code splitting.

Результат: dev-сервер стартует за 300 мс независимо от размера проекта.

## Создание проекта

```bash
npm create vite@latest my-app        # Интерактивный выбор шаблона
npm create vite@latest my-app -- --template vue-ts   # Сразу с шаблоном
npm create vite@latest my-app -- --template react-ts
npm create vite@latest my-app -- --template vanilla-ts
```

Доступные шаблоны: `vanilla`, `vue`, `react`, `preact`, `lit`, `svelte` (с суффиксом `-ts` для TypeScript).

## Структура проекта

```
my-app/
  index.html                ← Точка входа (не src/main.ts!)
  vite.config.ts            ← Конфигурация Vite
  tsconfig.json
  public/                   ← Статика (копируется как есть)
    favicon.ico
  src/
    main.ts                 ← Entry-файл
    App.vue                 ← Корневой компонент
    style.css
    assets/
      logo.svg
```

Главная фишка: `index.html` находится в корне, а не в `public/`. Vite обрабатывает его как модуль — URL в `<script>` и `<link>` автоматически резолвятся.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Мое приложение</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Конфигурация

`vite.config.ts` — основной файл настроек:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
```

### Основные опции

#### server — настройки dev-сервера

```ts
server: {
  port: 3000,                 // Порт
  host: '0.0.0.0',           // Доступен в локальной сети
  open: true,                 // Открыть браузер
  cors: true,                 // CORS для API
  proxy: {                    // Прокси для API
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
  watch: {
    ignored: ['**/coverage/**'],  // Не перезапускать при изменении этих файлов
  },
}
```

#### build — настройки production-сборки

```ts
build: {
  outDir: 'dist',              // Папка результата
  sourcemap: true,             // Генерировать source maps
  minify: 'terser',            // 'terser' | 'esbuild'
  chunkSizeWarningLimit: 1000, // Предупреждение о размере чанка (KB)
  rollupOptions: {
    input: {                   // Несколько точек входа (MPA)
      main: resolve(__dirname, 'index.html'),
      admin: resolve(__dirname, 'admin.html'),
    },
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
}
```

#### resolve — резолвинг модулей

```ts
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@components': resolve(__dirname, 'src/components'),
    '#': resolve(__dirname, 'types'),
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
}
```

#### css — работа со стилями

```ts
css: {
  modules: {
    localsConvention: 'camelCase',   // .my-class → styles.myClass
  },
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/variables" as *;`,
    },
  },
}
```

## HMR (Hot Module Replacement)

HMR — главная фишка Vite. Когда вы меняете файл, Vite отправляет браузеру только изменённый модуль, не перезагружая страницу. Состояние приложения сохраняется.

Для Vue и React HMR работает из коробки. Для vanilla JS:

```ts
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      newModule.render()
    }
  })
}
```

## import.meta.env — переменные окружения

Vite автоматически загружает переменные из `.env`-файлов:

```ini
# .env (все окружения)
VITE_APP_TITLE=Мое приложение

# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.myapp.com
```

Только переменные с префиксом `VITE_` доступны в браузере:

```ts
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.MODE)         // 'development' | 'production'
console.log(import.meta.env.DEV)          // true в dev
console.log(import.meta.env.PROD)         // true в production
console.log(import.meta.env.BASE_URL)     // из base в конфиге
```

### Режимы

```bash
vite                                # dev-сервер (mode: development)
vite build                          # production-сборка
vite build --mode staging           # Загрузит .env.staging
vite preview                        # Превью production-сборки
```

## Глобальные импорты (Glob Import)

Vite умеет импортировать сразу несколько файлов по паттерну:

```ts
const modules = import.meta.glob('./components/*.vue')

// Результат:
// {
//   './components/Header.vue': () => import('./components/Header.vue'),
//   './components/Footer.vue': () => import('./components/Footer.vue'),
// }
```

Eager-загрузка (без lazy):

```ts
const modules = import.meta.glob('./components/*.vue', { eager: true })
```

Практический пример — авторегистрация компонентов:

```ts
const components = import.meta.glob('./components/*.vue', { eager: true })

Object.entries(components).forEach(([path, module]: [string, any]) => {
  const name = path.match(/\.\/components\/(.*)\.vue$/)?.[1]
  if (name) {
    app.component(name, module.default)
  }
})
```

## Статические ресурсы

```ts
import logoUrl from '@/assets/logo.svg'         // URL строки
import logoUrl from '@/assets/logo.svg?url'      // Явно URL
import logoRaw from '@/assets/logo.svg?raw'      // Как строку (SVG-код)

const workers = new Worker(new URL('./worker.ts', import.meta.url))
```

Изображения, шрифты и SVG, импортированные в JS, будут оптимизированы (хешированное имя, small файлы → inline data URI).

## Плагины

Vite использует плагины на основе Rollup (с расширениями).

### Популярные плагины

```ts
import vue from '@vitejs/plugin-vue'             // Vue SFC
import react from '@vitejs/plugin-react'          // React + Fast Refresh
import svgr from 'vite-plugin-svgr'               // SVG как React-компоненты
import compression from 'vite-plugin-compression'  // Gzip/Brotli
import mkcert from 'vite-plugin-mkcert'           // Локальный HTTPS
import { visualizer } from 'rollup-plugin-visualizer'  // Визуализация бандла
import { VitePWA } from 'vite-plugin-pwa'         // PWA
```

### Пример конфигурации с плагинами

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'gzip' }),
    visualizer({ open: true, gzipSize: true }),
  ],
})
```

### Свой плагин

```ts
const myPlugin = {
  name: 'my-plugin',
  resolveId(id) {
    if (id === 'virtual:my-module') {
      return id
    }
  },
  load(id) {
    if (id === 'virtual:my-module') {
      return 'export default "This is virtual!"'
    }
  },
  transform(code, id) {
    if (id.endsWith('.vue')) {
      return code.replace(/console\.log\(.*\)/g, '')
    }
  },
}

export default defineConfig({
  plugins: [myPlugin],
})
```

Хуки плагинов: `configResolved`, `configureServer`, `transformIndexHtml`, `handleHotUpdate`, `buildStart`, `buildEnd`, `closeBundle`.

## Прокси для API

При разработке фронтенд обычно запускается на `localhost:5173`, а бэкенд — на `localhost:8080`. Прямой запрос с фронтенда вызовет CORS. Прокси решает это:

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

Теперь `fetch('/api/users')` → `http://localhost:8080/users`.

## Деплой

### SPA-маршрутизация

При деплое SPA нужно, чтобы все пути вели к `index.html`:

**nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify (_redirects):**
```
/* /index.html 200
```

### base — если приложение не в корне

```ts
export default defineConfig({
  base: '/my-app/',                 // Все URL будут начинаться с /my-app/
})
```

## Сравнение с Webpack

| Критерий | Vite | Webpack |
|---|---|---|
| Старт dev-сервера | < 1 сек | 10–60 сек |
| HMR | < 50 мс | 1–5 сек |
| Конфигурация | Простой объект | Сложный, много boilerplate |
| Production-сборка | Rollup | Webpack |
| Код-сплиттинг | Автоматический | Нужна настройка |
| Экосистема плагинов | Растёт (совместим с Rollup) | Огромная |
| TypeScript | Из коробки (esbuild) | Нужен loader |

## Итог

- Vite — стандарт де-факто для новых Vue, React, Svelte-проектов
- Dev-сервер на ESM обеспечивает мгновенный старт и HMR
- Production-сборка через Rollup даёт оптимальный бандл
- Конфигурация простая, но при необходимости — гибкая
- Для Nuxt 3/4 Vite используется по умолчанию
- Если вы начинаете новый проект — выбирайте Vite, а не Webpack
