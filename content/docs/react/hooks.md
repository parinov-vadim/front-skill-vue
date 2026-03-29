---
title: Хуки React
description: Хуки позволяют использовать состояние и другие функции React в функциональных компонентах. useState, useEffect, useCallback, useMemo и другие.
section: react
difficulty: intermediate
readTime: 12
order: 2
tags: [hooks, useState, useEffect, useCallback, useMemo, React]
---

## useState

Добавляет локальное состояние в функциональный компонент:

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Счётчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  )
}
```

### Функциональное обновление

```jsx
// ✅ Используйте функцию для получения актуального состояния
setCount(prev => prev + 1)

// ❌ Может привести к race conditions при нескольких обновлениях
setCount(count + 1)
```

### Объект состояния

```jsx
const [user, setUser] = useState({ name: '', email: '' })

// Обновление — нужно разворачивать предыдущее состояние
setUser(prev => ({ ...prev, name: 'Иван' }))
```

## useEffect

Выполняет побочные эффекты: запросы, подписки, изменение DOM:

```jsx
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Эффект запускается после рендера
    async function fetchUser() {
      const res = await fetch(`/api/users/${userId}`)
      setUser(await res.json())
    }

    fetchUser()

    // Функция очистки — запускается перед следующим эффектом или при размонтировании
    return () => {
      // Отмена запроса если нужно
    }
  }, [userId]) // Массив зависимостей — эффект запускается при их изменении

  return user ? <div>{user.name}</div> : <div>Загрузка...</div>
}
```

### Варианты массива зависимостей

```jsx
useEffect(() => { /* ... */ })          // Каждый рендер
useEffect(() => { /* ... */ }, [])      // Только при монтировании
useEffect(() => { /* ... */ }, [id])    // При изменении id
```

## useCallback

Мемоизирует функцию, предотвращая её пересоздание при каждом рендере:

```jsx
import { useState, useCallback } from 'react'

function Parent() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])

  // ✅ addItem не пересоздаётся при изменении count
  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item])
  }, []) // Нет зависимостей — функция создаётся один раз

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ChildList items={items} onAdd={addItem} />
    </>
  )
}
```

## useMemo

Мемоизирует результат вычисления:

```jsx
import { useMemo } from 'react'

function ProductList({ products, filter }) {
  // Пересчитывается только при изменении products или filter
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  )

  return (
    <ul>
      {filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

**Правило:** использовать `useMemo`/`useCallback` только когда это реально нужно — для тяжёлых вычислений или стабильных ссылок для дочерних компонентов с `memo`.

## useRef

Хранит изменяемое значение без ре-рендера:

```jsx
import { useRef, useEffect } from 'react'

function AutoFocusInput() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return <input ref={inputRef} />
}

// Хранение предыдущего значения
function Timer() {
  const timerRef = useRef(null)

  function start() {
    timerRef.current = setInterval(() => console.log('tick'), 1000)
  }

  function stop() {
    clearInterval(timerRef.current)
  }
}
```

## useContext

Подписывается на значение из Context:

```jsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext('light')

function App() {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  )
}

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={`btn--${theme}`}>Кнопка</button>
}
```

## useReducer

Для сложной логики состояния:

```jsx
import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 }
    case 'decrement': return { count: state.count - 1 }
    case 'reset':     return { count: 0 }
    default: throw new Error('Неизвестное действие')
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Сброс</button>
    </>
  )
}
```

## Пользовательские хуки

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react'

export function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(url)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}

// Использование
function Posts() {
  const { data: posts, loading, error } = useFetch('/api/posts')

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```
