---
title: Next.js — фреймворк для React
description: Next.js: App Router, маршрутизация на основе файлов, SSR, SSG, ISR, layout, loading, error — всё для продакшн React-приложения.
section: react
difficulty: intermediate
readTime: 14
order: 13
tags: [Next.js, App Router, SSR, SSG, ISR, React, фреймворк]
---

## Что такое Next.js

Next.js — фреймворк поверх React от Vercel. Добавляет серверный рендеринг, маршрутизацию на основе файлов, оптимизацию изображений и многое другое.

Создание проекта:

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm run dev
```

## App Router

Начиная с Next.js 13, основной системой маршрутизации стал **App Router** (папка `app/`). Каждый файл `page.tsx` в папке — это маршрут.

```
app/
├── layout.tsx          → Обёртка для всех страниц
├── page.tsx            → /
├── about/
│   └── page.tsx        → /about
├── blog/
│   ├── page.tsx        → /blog
│   └── [slug]/
│       └── page.tsx    → /blog/my-post
├── dashboard/
│   ├── layout.tsx      → layout только для dashboard
│   ├── page.tsx        → /dashboard
│   └── settings/
│       └── page.tsx    → /dashboard/settings
└── api/
    └── hello/
        └── route.ts    → API-маршрут /api/hello
```

## Layout

`layout.tsx` — обёртка, которая не перерисовывается при навигации:

```tsx
// app/layout.tsx
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <nav>Мой сайт</nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

Вложенные layouts — каждый сегмент URL может иметь свой layout:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
```

## Page

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Добро пожаловать!</h1>
}
```

Страница может быть **async** — для загрузки данных на сервере:

```tsx
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    cache: 'no-store',
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <ul>
      {users.map((user: { id: number; name: string }) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Динамические маршруты

```
app/
└── products/
    └── [id]/
        └── page.tsx    → /products/42
```

```tsx
// app/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  return <h1>{product.name}</h1>
}
```

## Стратегии рендеринга

### SSR — Server-Side Rendering

Страница рендерится на сервере при каждом запросе:

```tsx
// app/products/page.tsx
async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    cache: 'no-store',     // Всегда свежие данные
  }).then((r) => r.json())

  return <ProductList products={products} />
}
```

### SSG — Static Site Generation

Страница генерируется один раз при сборке:

```tsx
async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    cache: 'force-cache',    // Кэшировать навсегда
  }).then((r) => r.json())

  return <ProductList products={products} />
}
```

### ISR — Incremental Static Regeneration

Статика, которая обновляется в фоне через заданный интервал:

```tsx
async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 },   // Обновлять раз в 60 секунд
  }).then((r) => r.json())

  return <ProductList products={products} />
}
```

### Сравнение

| Стратегия | Когда рендерится | Подходит для |
|-----------|------------------|-------------|
| SSR | При каждом запросе | Личный кабинет, данные в реальном времени |
| SSG | Один раз при сборке | Лендинги, документация, блог-посты |
| ISR | При сборке + фон обновление | Каталоги, списки, контент, который обновляется |

## Loading и Error

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Загрузка...</div>
}
```

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
      <h2>Что-то пошло не так</h2>
      <button onClick={() => reset()}>Попробовать снова</button>
    </div>
  )
}
```

## API Routes

```ts
// app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Привет из API!' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body }, { status: 201 })
}
```

## Metadata — SEO

```tsx
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Мой сайт — Главная',
  description: 'Описание страницы для поисковых систем',
}

export default function HomePage() {
  return <h1>Главная</h1>
}
```

Динамические метаданные:

```tsx
// app/products/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  return {
    title: product.name,
    description: product.description,
  }
}
```

## Image — оптимизация изображений

```tsx
import Image from 'next/image'

function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Баннер"
      width={1200}
      height={600}
      priority          // Предзагрузка для LCP-изображений
    />
  )
}
```

Next.js автоматически конвертирует в WebP/AVIF, генерирует srcset и лениво загружает изображения ниже фолда.

## Link — клиентская навигация

```tsx
import Link from 'next/link'

function Navbar() {
  return (
    <nav>
      <Link href="/">Главная</Link>
      <Link href="/about">О нас</Link>
      <Link href={`/users/${userId}`}>Профиль</Link>
    </nav>
  )
}
```

Link prefetch'ит страницу при появлении в viewport — переход мгновенный.

## Клиентские компоненты

По умолчанию все компоненты в App Router — серверные. Для интерактивности добавьте `'use client'`:

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## Итог

Next.js — лучший выбор, когда React-проекту нужен SSR, SEO или сложная маршрутизация. App Router с файловой структурой, встроенная оптимизация изображений, Server Components и Server Actions закрывают большинство задач без сторонних библиотек. Для простых SPA без SEO достаточно Vite.
