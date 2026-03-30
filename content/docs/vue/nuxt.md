---
title: "Vue + Nuxt: SSR, server routes, auto-imports"
description: Nuxt — фреймворк поверх Vue с SSR, файловой маршрутизацией, автоимпортами и server routes. Основы Nuxt для Vue-разработчика.
section: vue
difficulty: intermediate
readTime: 14
order: 14
tags: [Vue 3, Nuxt, SSR, server routes, auto-imports, Nitro]
---

## Что такое Nuxt

**Nuxt** — фреймворк поверх Vue, который добавляет:
- **SSR** (Server-Side Rendering) и **SSG** (Static Site Generation)
- **Файловую маршрутизацию** — роуты из структуры папок
- **Автоимпорты** — компоненты, composables, утилиты
- **Server routes** — API прямо во фронтенд-проекте
- **SEO-оптимизацию** — meta-теги, og:tags из коробки

Создание проекта:

```bash
npx nuxi@latest init my-app
cd my-app
npm run dev
```

## Структура проекта

```
my-app/
├── app/
│   ├── components/     ← автоимпорт компонентов
│   ├── composables/    ← автоимпорт composables
│   ├── layouts/        ← шаблоны страниц
│   ├── pages/          ← файловая маршрутизация
│   └── app.vue         ← корневой компонент
├── server/
│   ├── api/            ← API-эндпоинты
│   ├── routes/         ← серверные роуты
│   └── middleware/     ← серверная middleware
├── content/            ← Markdown-контент
├── public/             ← статические файлы
├── nuxt.config.ts      ← конфигурация
└── package.json
```

## Файловая маршрутизация

Структура папок `app/pages/` определяет роуты:

```
pages/
├── index.vue              → /
├── about.vue              → /about
├── users/
│   ├── index.vue          → /users
│   ├── [id].vue           → /users/:id
│   └── [id]/
│       └── settings.vue   → /users/:id/settings
└── blog/
    ├── index.vue          → /blog
    └── [...slug].vue      → /blog/* (catch-all)
```

Доступ к параметрам:

```vue
<script setup lang="ts">
const route = useRoute()
const id = route.params.id
</script>
```

Навигация:

```vue
<template>
  <NuxtLink to="/about">О проекте</NuxtLink>
  <NuxtLink :to="`/users/${userId}`">Профиль</NuxtLink>
</template>
```

## Автоимпорты

Nuxt автоматически импортирует:

### Компоненты

Любой `.vue`-файл в `app/components/` доступен без импорта:

```
components/
├── AppHeader.vue      → <AppHeader>
├── AppFooter.vue      → <AppFooter>
└── user/
    └── UserCard.vue   → <UserCard>
```

### Composables

Файлы `use*.ts` в `app/composables/`:

```ts
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  return { count, increment }
}
```

```vue
<script setup lang="ts">
// Без импорта!
const { count, increment } = useCounter()
</script>
```

### Vue и Nuxt утилиты

`ref`, `computed`, `watch`, `onMounted`, `useRouter`, `useRoute`, `useFetch`, `useState` и многие другие — без импортов.

## Data Fetching

### useFetch

```vue
<script setup lang="ts">
const { data: users, pending, error, refresh } = await useFetch<User[]>('/api/users')
</script>

<template>
  <div v-if="pending">Загрузка...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="refresh()">Обновить</button>
</template>
```

### useAsyncData

Для произвольных асинхронных операций:

```ts
const { data } = await useAsyncData('users', () => $fetch<User[]>('/api/users'))
```

### Параметры запроса

```ts
const route = useRoute()
const { data: user } = await useFetch<User>(`/api/users/${route.params.id}`)

// С query-параметрами
const { data: search } = await useFetch('/api/search', {
  query: { q: searchQuery },
})

// С watch — автоматический перезапрос
const { data } = await useFetch('/api/users', {
  query: { page },
  watch: [page],
})
```

## Server Routes

API-эндпоинты прямо в проекте — powered by Nitro:

### GET

```ts
// server/api/users/index.ts
export default defineEventHandler(async () => {
  const users = await db.users.findMany()
  return users
})
```

### С параметрами

```ts
// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await db.users.findById(Number(id))

  if (!user) {
    throw createError({ statusCode: 404, message: 'Пользователь не найден' })
  }

  return user
})
```

### POST

```ts
// server/api/users/index.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, message: 'name и email обязательны' })
  }

  const user = await db.users.create(body)
  return user
})
```

### С query-параметрами

```ts
// server/api/search.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  const results = await db.users.search({
    q: query.q as string,
    page,
    limit,
  })

  return results
})
```

## Layouts

Шаблоны страниц в `app/layouts/`:

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

```vue
<!-- pages/about.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>
```

Layout по умолчанию — `layouts/default.vue`. Можно сменить через `definePageMeta`.

## Meta-теги и SEO

```vue
<script setup lang="ts">
useHead({
  title: 'Главная страница',
  meta: [
    { name: 'description', content: 'Описание страницы' },
    { property: 'og:title', content: 'Главная' },
    { property: 'og:image', content: '/og-image.png' },
  ],
})
</script>
```

Динамические meta:

```ts
const { data: article } = await useFetch(`/api/articles/${slug}`)

useHead({
  title: () => article.value?.title ?? 'Загрузка...',
  meta: [
    { name: 'description', content: () => article.value?.excerpt ?? '' },
  ],
})
```

## Nuxt Config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    // Серверные (не暴露 клиенту)
    apiSecret: process.env.API_SECRET,

    // Публичные (доступны на клиенте)
    public: {
      apiBase: process.env.API_BASE ?? 'http://localhost:3000',
    },
  },

  app: {
    head: {
      title: 'Моё приложение',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})
```

## Render Modes

Nuxt поддерживает несколько режимов рендеринга:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },         // SSG — статический HTML
    '/api/**': { cors: true },        // CORS для API
    '/admin/**': { ssr: false },      // SPA — без SSR
    '/blog/**': { swr: 3600 },        // ISR — кэш на 1 час
  },
})
```

| Режим | Когда |
|-------|-------|
| SSR (default) | SEO важен, динамический контент |
| SPA (`ssr: false`) | Дашборды, админки |
| SSG (`prerender: true`) | Лендинги, документация |
| SWR/ISR (`swr: N`) | Блоги, каталоги |

## State

`useState` — SSR-безопасное состояние (cross-request state sharing):

```ts
const counter = useState('counter', () => 0)
```

Отличие от `ref`: `useState` разделяет состояние между компонентами на сервере и клиенте без проблем гидратации.

## Middleware

### Route middleware

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  if (!auth.isLoggedIn && to.path.startsWith('/dashboard')) {
    return navigateTo('/login')
  }
})
```

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>
```

Глобальная middleware — файл с суффиксом `.global`:

```ts
// middleware/Analytics.global.ts
export default defineNuxtRouteMiddleware((to) => {
  console.log('Переход:', to.path)
})
```

## Итог

Nuxt — мощный фреймворк поверх Vue. Файловая маршрутизация упрощает структуру, автоимпорты убирают бойлерплейт, server routes дают API без отдельного бэкенда. SSR/SSG/ISR настраиваются через `routeRules`. Для Vue-проектов, где нужен SEO или полный стек, Nuxt — лучший выбор.
