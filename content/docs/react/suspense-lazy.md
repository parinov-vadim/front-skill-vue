---
title: Suspense и lazy — ленивая загрузка
description: React.lazy и Suspense для code splitting: загрузка компонентов по требованию, fallback-UI, lazy-маршруты и Suspense для данных.
section: react
difficulty: intermediate
readTime: 8
order: 16
tags: [Suspense, React.lazy, code splitting, ленивая загрузка, React]
---

## Зачем ленивая загрузка

Если всё приложение в одном бандле — пользователь загружает мегабайты JS, хотя видит только одну страницу. Code splitting разбивает бандл на чанки, которые загружаются по необходимости.

## React.lazy

`React.lazy` загружает компонент динамически — только когда он нужен:

```tsx
import { lazy } from 'react'

const HeavyChart = lazy(() => import('./components/HeavyChart'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'))
```

Каждый `lazy`-компонент попадает в отдельный файл. Он загрузится при первом рендере.

## Suspense

`Suspense` показывает fallback, пока lazy-компонент загружается:

```tsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <div>
      <h1>Дашборд</h1>

      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

## Несколько Suspense

Можно обернуть каждый компонент отдельно или группу целиком:

```tsx
// Каждый компонент со своим fallback
function Page() {
  return (
    <div>
      <Suspense fallback={<div>Загрузка графика...</div>}>
        <Chart />
      </Suspense>

      <Suspense fallback={<div>Загрузка таблицы...</div>}>
        <DataTable />
      </Suspense>
    </div>
  )
}

// Группа с одним fallback — ждёт ВСЕ компоненты
function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Chart />
      <DataTable />
    </Suspense>
  )
}
```

## Lazy-маршруты

Самый частый сценарий — lazy loading для страниц:

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-64 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  )
}
```

## Named exports

`React.lazy` требует default export. Если компонент использует named export:

```tsx
// Компонент с named export
export function Editor() { /* ... */ }
```

```tsx
// Обернуть в lazy
const Editor = lazy(() =>
  import('./Editor').then((module) => ({ default: module.Editor }))
)
```

## Suspense для данных

Suspense работает не только с `lazy`, но и с библиотеками, которые поддерживают Suspense-протокол (TanStack Query, Relay):

```tsx
// TanStack Query с suspense
import { useSuspenseQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: number }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
  })

  return <div>{data.name}</div>
}

// Родительский компонент
function Page() {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userId={1} />
    </Suspense>
  )
}
```

## Вложенные Suspense

```tsx
function App() {
  return (
    <Suspense fallback={<AppShell />}>
      <Header />
      <main>
        <Suspense fallback={<ContentSkeleton />}>
          <Feed />
        </Suspense>
      </main>
      <Footer />
    </Suspense>
  )
}
```

Внутренний `Suspense` не блокирует внешний. Header и Footer отобразятся сразу, Feed покажет свой fallback.

## Предзагрузка

Для критичных компонентов можноpreload'ить до рендера:

```tsx
const AdminPanel = lazy(() => import('./AdminPanel'))

function Dashboard() {
  function preloadAdmin() {
    import('./AdminPanel')
  }

  return (
    <div>
      <button onMouseEnter={preloadAdmin}>Админка</button>
      <Suspense fallback={<div>Загрузка...</div>}>
        {showAdmin && <AdminPanel />}
      </Suspense>
    </div>
  )
}
```

При наведении на кнопку компонент начнёт загружаться — к моменту клика он уже будет готов.

## Итог

`React.lazy` + `Suspense` — встроенный механизм code splitting в React. Главные сценарии: lazy loading страниц и тяжёлых компонентов. Suspense также используется библиотеками для загрузки данных. Добавляйте lazy на маршруты и тяжёлые компоненты — это существенно ускоряет начальную загрузку.
