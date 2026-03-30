---
title: React Router — маршрутизация
description: Маршрутизация в React-приложении: React Router v7, nested routes, динамические параметры, guards, lazy loading страниц.
section: react
difficulty: intermediate
readTime: 12
order: 6
tags: [React Router, маршрутизация, SPA, nested routes, React]
---

## Установка

```bash
npm install react-router-dom
```

React Router v7 — текущая мажорная версия. API стабилизировалось, основные хуки и компоненты те же, что и в v6.

## Базовая настройка

```tsx
// src/main.tsx
import { BrowserRouter } from 'react-router-dom'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
```

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { About } from '@/pages/About'
import { NotFound } from '@/pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

## Навигация: Link и NavLink

```tsx
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      {/* Link — обычная ссылка без стилей */}
      <Link to="/">Главная</Link>

      {/* NavLink — добавляет класс активному пункту */}
      <NavLink
        to="/about"
        className={({ isActive }) =>
          isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
        }
      >
        О нас
      </NavLink>
    </nav>
  )
}
```

## Nested routes (вложенные маршруты)

Вложенные маршруты позволяют компоненту-родителю рендерить дочерние через `<Outlet />`:

```tsx
import { Outlet } from 'react-router-dom'

// src/layouts/MainLayout.tsx
function MainLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

```tsx
// src/App.tsx
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
      </Route>
    </Routes>
  )
}
```

Главная, О нас и Блог будут обёрнуты в `MainLayout` — шапка и подвал не дублируются.

## Динамические параметры

```tsx
// Маршрут с параметром
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/posts/:postId/comments/:commentId" element={<Comment />} />
```

Чтение параметров через `useParams`:

```tsx
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { userId } = useParams()

  return <h1>Профиль пользователя {userId}</h1>
}
```

Типизация параметров:

```tsx
interface RouteParams {
  userId: string
}

function UserProfile() {
  const { userId } = useParams<RouteParams>()
  // userId: string | undefined
}
```

## Query-параметры

```tsx
import { useSearchParams } from 'react-router-dom'

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'
  const page = searchParams.get('page') ?? '1'

  function handleFilter(cat: string) {
    setSearchParams({ category: cat, page: '1' })
  }

  return (
    <div>
      <p>Категория: {category}, страница: {page}</p>
      <button onClick={() => handleFilter('electronics')}>Электроника</button>
    </div>
  )
}
```

## Программная навигация

```tsx
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // ... логика входа
    navigate('/dashboard')
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

`navigate` принимает число для навигации по истории:

```tsx
navigate(-1)   // Назад
navigate(-2)   // На две страницы назад
navigate(1)    // Вперёд
```

## Защищённые маршруты (guards)

```tsx
import { Navigate, useLocation } from 'react-router-dom'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

Использование:

```tsx
<Routes>
  <Route element={<MainLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />
  </Route>
</Routes>
```

После входа можно вернуть пользователя на ту же страницу:

```tsx
function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  function handleLogin() {
    // ... логика входа
    navigate(from, { replace: true })
  }
}
```

## Lazy loading страниц

Крупные страницы и компоненты лучше подгружать по необходимости:

```tsx
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}
```

Каждая страница будет в отдельном чанке и загрузится только при переходе.

## Scroll to top

По умолчанию React Router не скроллит наверх при смене маршрута:

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Добавить внутри BrowserRouter
<BrowserRouter>
  <ScrollToTop />
  <App />
</BrowserRouter>
```

## 404 — страница не найдена

```tsx
function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Такой страницы не существует</p>
      <Link to="/">На главную</Link>
    </div>
  )
}

// В Routes — последним маршрутом
<Route path="*" element={<NotFound />} />
```

## Основные хуки React Router

| Хук | Возвращает |
|-----|-----------|
| `useParams()` | Параметры URL (`:id`, `:slug`) |
| `useSearchParams()` | Query-параметры (`?page=2`) |
| `useNavigate()` | Функция для программной навигации |
| `useLocation()` | Текущий URL, pathname, state |
| `useMatch()` | Информация о совпадении маршрута |

## Итог

React Router покрывает все базовые сценарии: вложенные маршруты через `<Outlet />`, динамические параметры через `useParams`, защиту страниц через обёртки, lazy loading через `React.lazy()`. Для SPA на Vite это стандартный выбор.
