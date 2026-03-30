---
title: Error Boundaries — обработка ошибок
description: Error Boundaries в React: перехват ошибок рендера, отображение fallback-UI, логирование ошибок и паттерны восстановления.
section: react
difficulty: intermediate
readTime: 8
order: 14
tags: [Error Boundaries, обработка ошибок, React, componentDidCatch]
---

## Проблема

Ошибка в одном компоненте «ломает» всё приложение:

```tsx
function UserProfile({ user }: { user: { name: string } | null }) {
  return <h1>{user.name}</h1>  // TypeError: Cannot read property 'name'
}
```

JavaScript-ошибка внутри рендера «пузырится» до корня — React размонтирует всё дерево.

## Error Boundary

Error Boundary — компонент, который перехватывает ошибки рендера своих детей и показывает fallback.

Важно: Error Boundary — **единственный механизм React для перехвата ошибок рендера**. `try/catch` тут не работает.

```tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 bg-red-50 text-red-700 rounded">
            <h2>Что-то пошло не так</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

## Использование

```tsx
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <ErrorBoundary fallback={<div>Ошибка загрузки профиля</div>}>
        <UserProfile />
      </ErrorBoundary>
      <ErrorBoundary fallback={<div>Лента недоступна</div>}>
        <Feed />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  )
}
```

Каждый Error Boundary изолирует свою часть UI. Ошибка в Feed не ломает UserProfile.

## Error Boundary с возможностью повтора

```tsx
interface State {
  hasError: boolean
  error: Error | null
  key: number
}

class RetryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, key: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState((prev) => ({ hasError: false, error: null, key: prev.key + 1 }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleRetry}>Попробовать снова</button>
        </div>
      )
    }

    return <div key={this.state.key}>{this.props.children}</div>
  }
}
```

Увеличение `key` заставляет React пересоздать дочерний компонент с нуля.

## Логирование ошибок

```tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  logErrorToService({
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  })
}
```

`errorInfo.componentStack` — стек React-компонентов, где произошла ошибка. Это один из самых полезных инструментов для отладки.

## Что перехватывает Error Boundary

| Перехватывает | Не перехватывает |
|---------------|-----------------|
| Ошибки рендера | Обработчики событий (onClick) |
| `componentDidMount` | Асинхронный код (setTimeout) |
| `componentDidUpdate` | Серверный рендеринг (SSR) |
| Конструкторы дочерних компонентов | Ошибки в самом Error Boundary |

Для обработки ошибок в обработчиках событий используйте `try/catch`:

```tsx
function SaveButton() {
  async function handleClick() {
    try {
      await saveData()
    } catch (error) {
      showToast((error as Error).message)
    }
  }

  return <button onClick={handleClick}>Сохранить</button>
}
```

## Функциональная обёртка с react-error-boundary

Библиотека `react-error-boundary` избавляет от написания класса:

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Повторить</button>
        </div>
      )}
      onReset={() => {
        // Сбросить состояние, которое привело к ошибке
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## Error Boundary в Next.js

Next.js App Router предоставляет файл `error.tsx` — это Error Boundary для сегмента маршрута:

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Ошибка в дашборде</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Попробовать снова</button>
    </div>
  )
}
```

## Итог

Error Boundaries — единственный способ перехватить ошибки рендера в React. Оборачивайте критичные части UI в Error Boundary, чтобы ошибка в одном месте не ломала всё приложение. Для удобства используйте `react-error-boundary` или встроенные механизмы Next.js.
