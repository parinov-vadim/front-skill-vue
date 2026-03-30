---
title: Создание React приложения
description: "Как создать React-проект с нуля: Vite, структура папок, TypeScript, ESLint. Пошаговое руководство по настройке современного React-приложения."
section: react
difficulty: beginner
readTime: 10
order: 5
tags: [React, Vite, настройка проекта, структура, TypeScript]
---

## Способы создания React-проекта

Раньше все использовали Create React App (CRA). Сейчас он устарел — вместо него Vite или Next.js.

| Инструмент | Для чего | Сборка |
|------------|----------|--------|
| Vite | SPA, лендинги, дашборды | Да (клиентская) |
| Next.js | SSR, SEO, крупные проекты | Свой сервер |
| Remix | SSR, progressive enhancement | Свой сервер |

Для большинства задач Vite — лучший старт.

## Создание проекта через Vite

```bash
# С TypeScript
npm create vite@latest my-app -- --template react-ts

# С JavaScript
npm create vite@latest my-app -- --template react

# Или через yarn / pnpm / bun
yarn create vite my-app --template react-ts
pnpm create vite my-app --template react-ts
bunx create-vite my-app --template react-ts
```

Устанавливаем зависимости и запускаем:

```bash
cd my-app
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:5173`.

## Структура проекта

```
my-app/
├── public/             # Статические файлы (favicon, изображения)
│   └── vite.svg
├── src/
│   ├── assets/         # Файлы, которые обрабатывает сборщик
│   │   └── react.svg
│   ├── components/     # Переиспользуемые компоненты
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── hooks/          # Кастомные хуки
│   │   └── useWindowSize.ts
│   ├── pages/          # Страницы / views
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── layouts/        # Шаблоны страниц
│   │   └── MainLayout.tsx
│   ├── services/       # API-клиенты, запросы
│   │   └── api.ts
│   ├── stores/         # Глобальное состояние (Zustand, Redux)
│   │   └── useCartStore.ts
│   ├── utils/          # Вспомогательные функции
│   │   └── format.ts
│   ├── types/          # TypeScript типы и интерфейсы
│   │   └── index.ts
│   ├── styles/         # Глобальные стили
│   │   └── globals.css
│   ├── App.tsx         # Корневой компонент
│   └── main.tsx        # Точка входа
├── index.html          # HTML-шаблон
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.cjs
```

Vite не навязывает структуру — это один из возможных вариантов. Главное правило: группировать файлы по их роли.

## Конфигурация Vite

Файл `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

Алиас `@` позволяет писать чистые импорты:

```ts
// Без алиаса
import { Button } from '../../../components/Button'

// С алиасом
import { Button } from '@/components/Button'
```

Чтобы TypeScript понимал алиас, добавьте в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Точка входа

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**StrictMode** включает дополнительные проверки в development-режиме: предупреждает об устаревших API и дважды вызывает рендер для обнаружения побочных эффектов.

## Корневой компонент

```tsx
// src/App.tsx
import { useState } from 'react'
import { Button } from '@/components/Button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Привет, React + Vite!</h1>
      <Button onClick={() => setCount(c => c + 1)}>
        Кликнули {count} раз
      </Button>
    </div>
  )
}

export default App
```

## Добавление роутинга

```bash
npm install react-router-dom
```

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { About } from '@/pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

## CSS: подключение Tailwind

```bash
npm install -D tailwindcss @tailwindcss/vite
```

В `vite.config.ts` добавьте плагин:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

В `src/styles/globals.css`:

```css
@import 'tailwindcss';
```

Всё, Tailwind работает — классы вроде `bg-blue-500`, `text-white`, `p-4` доступны сразу.

## Переменные окружения

Vite подхватывает переменные из `.env`-файлов с префиксом `VITE_`:

```bash
# .env.local
VITE_API_URL=http://localhost:4000/api
VITE_APP_TITLE=Мое приложение
```

Доступ в коде:

```ts
const apiUrl = import.meta.env.VITE_API_URL
const title = import.meta.env.VITE_APP_TITLE
```

## Сборка для продакшена

```bash
npm run build
```

Vite соберёт проект в папку `dist/`. Результат можно проверить локально:

```bash
npm run preview
```

## Проверка кода: ESLint + Prettier

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier
```

Минимальный `eslint.config.js`:

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

## Итог

Для старта React-проекта достаточно Vite — он быстрый, простой и гибкий. Базовый набор для комфортной разработки: Vite + TypeScript + ESLint + Tailwind. По мере роста проекта добавляются роутинг (react-router), менеджер состояния (Zustand) и работа с API (TanStack Query).
