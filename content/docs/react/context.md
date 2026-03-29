---
title: Context API
description: Context предоставляет способ передавать данные через дерево компонентов без явной передачи props на каждом уровне.
section: react
difficulty: intermediate
readTime: 8
order: 4
tags: [Context, useContext, state management, React]
---

## Проблема: Prop Drilling

```jsx
// Без Context — данные передаются через все уровни
function App() {
  const [user, setUser] = useState({ name: 'Иван' })
  return <Layout user={user} />
}

function Layout({ user }) {
  return <Sidebar user={user} />
}

function Sidebar({ user }) {
  return <UserMenu user={user} />
}

function UserMenu({ user }) {
  return <div>Привет, {user.name}!</div>
  // Только здесь нужен user, но он тащится через 3 уровня
}
```

## Создание и использование Context

```jsx
import { createContext, useContext, useState } from 'react'

// 1. Создать context (вынести в отдельный файл)
const UserContext = createContext(null)

// 2. Обернуть дерево провайдером
function App() {
  const [user, setUser] = useState({ name: 'Иван', role: 'admin' })

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  )
}

// 3. Использовать в любом потомке
function UserMenu() {
  const { user } = useContext(UserContext)
  return <div>Привет, {user.name}!</div>
}
```

## Паттерн: кастомный хук для Context

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Provider-компонент
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  async function login(email, password) {
    setLoading(true)
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setUser(data.user)
    setLoading(false)
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Кастомный хук с проверкой
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}
```

```jsx
// main.jsx
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)

// В компоненте
function LoginButton() {
  const { user, login, logout } = useAuth()

  if (user) return <button onClick={logout}>Выйти, {user.name}</button>
  return <button onClick={() => login('user@mail.com', 'pass')}>Войти</button>
}
```

## Оптимизация — разделение Context

Context вызывает ре-рендер **всех** подписчиков при изменении значения:

```jsx
// ❌ Одно большое состояние — все ре-рендерятся при любом изменении
const AppContext = createContext(null)
// value={{ user, theme, notifications, ... }}

// ✅ Разделить на независимые контексты
const UserContext = createContext(null)
const ThemeContext = createContext(null)
const NotificationContext = createContext(null)
```

## Стабильные ссылки

```jsx
// ❌ Новый объект при каждом рендере = ре-рендер всех потребителей
<Context.Provider value={{ user, login }}>

// ✅ Мемоизировать значение
const value = useMemo(
  () => ({ user, login }),
  [user, login]
)
<Context.Provider value={value}>
```

## Context vs. Zustand/Redux

| Критерий | Context | Zustand/Redux |
|----------|---------|---------------|
| Встроенный | Да | Нет (доп. пакет) |
| Производительность | Ре-рендер всех потребителей | Точечные подписки |
| DevTools | Нет | Да |
| Подходит для | Тема, язык, текущий пользователь | Сложное глобальное состояние |

**Правило:** Context отлично работает для данных, которые меняются редко (тема, авторизация). Для часто меняющихся данных используйте Zustand или другой менеджер состояния.

## Несколько провайдеров

```jsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Или использовать compose
function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
```
