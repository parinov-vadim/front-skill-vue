---
title: React Server Components
description: React Server Components (RSC) — компоненты, которые выполняются на сервере. Когда использовать, чем отличаются от клиентских компонентов, как работают в Next.js.
section: react
difficulty: advanced
readTime: 10
order: 12
tags: [React Server Components, RSC, SSR, Next.js, React]
---

## Что такое Server Components

Server Components — это компоненты React, которые рендерятся **только на сервере**. Они не попадают в JavaScript-бандл, не используют `useState`, `useEffect` и не обрабатывают события. Их код никогда не выполняется в браузере.

Зачем это нужно:

- Уменьшить размер бандла — код серверных компонентов не отправляется клиенту
- Прямой доступ к базе данных и файловой системе
- Автоматическая_streaming_ — большой контент отправляется частями

## Серверный vs клиентский компонент

```tsx
// Серверный компонент (по умолчанию в Next.js App Router)
// Файл: app/users/page.tsx

async function UsersPage() {
  // Прямой запрос к БД — без API-маршрута
  const users = await db.user.findMany()

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  )
}
```

```tsx
// Клиентский компонент — нужен 'use client'
'use client'

import { useState } from 'react'

function SearchInput() {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Поиск..."
    />
  )
}
```

## Правила Server Components

Серверный компонент **может**:

- Делать async/await запросы к БД, API, файловой системе
- Импортировать другие серверные компоненты
- Импортировать клиентские компоненты
- Читать cookies, headers, env-переменные сервера

Серверный компонент **не может**:

- Использовать `useState`, `useEffect`, `useReducer` и другие хуки состояния
- Обрабатывать события (`onClick`, `onChange`)
- Использовать браузерные API (`window`, `localStorage`, `document`)
- Импортировать клиентские компоненты и передавать им функции как children (с ограничениями)

## Взаимодействие серверных и клиентских компонентов

Серверный компонент может рендерить клиентский:

```tsx
// Серверный компонент
import { LikeButton } from './LikeButton'   // клиентский
import { getUser } from '@/lib/db'

async function ArticlePage({ id }: { id: string }) {
  const article = await getUser(id)

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      <LikeButton articleId={id} />    {/* Клиентский компонент */}
    </article>
  )
}
```

Клиентский компонент **не может** напрямую импортировать серверный. Но можно передать серверный компонент как children:

```tsx
// Клиентский компонент
'use client'

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Меню</button>
      {isOpen && children}
    </div>
  )
}
```

```tsx
// Серверный компонент — передаёт серверный контент в клиентский Layout
import { Layout } from './Layout'

function Page() {
  return (
    <Layout>
      <HeavyServerComponent />   {/* Рендерится на сервере */}
    </Layout>
  )
}
```

## Передача данных от сервера к клиенту

Props, которые передаются от серверного к клиентскому компоненту, должны быть сериализуемыми:

```tsx
// ✅ Сериализуемые: строки, числа, массивы, простые объекты
<ClientComponent name="Иван" count={42} items={['a', 'b']} />

// ❌ Несериализуемые: функции, классы, Date, Map, Set
<ClientComponent onClick={() => {}} data={new Map()} />
```

## Когда использовать Server Components

**Серверный компонент** — когда компонент:

- Загружает данные (запрос к API, БД)
- Рендерит статичный контент
- Использует секретные ключи (API ключи, токены)

**Клиентский компонент** — когда компонент:

- Отвечает на действия пользователя (клики, ввод)
- Использует состояние (`useState`, `useReducer`)
- Использует эффекты (`useEffect`)
- Использует браузерные API

## Пример: страница с серверными и клиентскими частями

```tsx
// app/products/page.tsx (серверный)
import { db } from '@/lib/db'
import { ProductGrid } from './ProductGrid'     // клиентский
import { Filters } from './Filters'             // серверный

async function ProductsPage() {
  const categories = await db.category.findMany()

  return (
    <div>
      <Filters categories={categories} />
      {/* ProductGrid — клиентский, загружает продукты через TanStack Query */}
      <ProductGrid />
    </div>
  )
}
```

## Server Actions

Server Actions — функции, которые выполняются на сервере, но вызываются с клиента:

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string

  await db.todo.create({ data: { title } })
  revalidatePath('/todos')
}
```

```tsx
// app/todos/page.tsx (серверный)
import { createTodo } from './actions'

function TodoForm() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="Новая задача" />
      <button type="submit">Добавить</button>
    </form>
  )
}
```

Форма вызывает серверную функцию напрямую — без API-маршрута и fetch.

## RSC вне Next.js

Server Components — это не только Next.js. Фреймворки вроде Remix и Waku тоже их поддерживают. Но на данный момент Next.js App Router — самая зрелая реализация.

Для Vite-проектов без SSR Server Components недоступны — это нормально, они не нужны для классических SPA.

## Итог

Server Components — не замена клиентским, а дополнение. Разделяйте код по ответственности: данные и статичный контент — на сервере, интерактивность — на клиенте. В Next.js App Router все компоненты серверные по умолчанию — добавляйте `'use client'` только там, где нужна интерактивность.
