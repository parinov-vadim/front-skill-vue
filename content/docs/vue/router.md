---
title: Vue Router — маршрутизация
description: Vue Router — официальная библиотека маршрутизации для Vue. Настройка роутов, динамические параметры, nested routes, guards, lazy loading и программная навигация.
section: vue
difficulty: intermediate
readTime: 14
order: 7
tags: [Vue 3, Vue Router, маршрутизация, guards, lazy loading]
---

## Установка

```bash
npm install vue-router
```

В проекте, созданном через `create-vue`, роутер уже установлен.

## Базовая настройка

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
  ],
})

export default router
```

Подключение в `main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

В шаблоне — `<RouterView />` для рендера текущего роута и `<RouterLink>` для навигации:

```vue
<template>
  <nav>
    <RouterLink to="/">Главная</RouterLink>
    <RouterLink to="/about">О проекте</RouterLink>
  </nav>
  <RouterView />
</template>
```

`<RouterLink>` становится тегом `<a>`, но работает без перезагрузки страницы. У активного роута автоматически добавляется класс `router-link-active`.

## Динамические роуты

Параметры в пути обозначаются через `:`:

```ts
{
  path: '/users/:id',
  name: 'user',
  component: () => import('@/views/UserView.vue'),
}
```

Доступ к параметрам в компоненте:

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.id // string | string[]
</script>
```

Необязательный параметр:

```ts
{ path: '/users/:id/:tab?' }
```

Повторяющийся параметр:

```ts
{ path: '/files/:path(.*)*' } // /files/a/b/c → path = ['a', 'b', 'c']
```

## Nested Routes (вложенные роуты)

Вложенные роуты позволяют создавать компоненты с вложенным `<RouterView>`:

```ts
{
  path: '/dashboard',
  component: () => import('@/views/DashboardLayout.vue'),
  children: [
    {
      path: '',           // /dashboard
      component: () => import('@/views/DashboardHome.vue'),
    },
    {
      path: 'settings',   // /dashboard/settings
      component: () => import('@/views/DashboardSettings.vue'),
    },
    {
      path: 'profile',    // /dashboard/profile
      component: () => import('@/views/DashboardProfile.vue'),
    },
  ],
}
```

В `DashboardLayout.vue`:

```vue
<template>
  <aside>
    <RouterLink to="/dashboard">Обзор</RouterLink>
    <RouterLink to="/dashboard/settings">Настройки</RouterLink>
    <RouterLink to="/dashboard/profile">Профиль</RouterLink>
  </aside>
  <main>
    <RouterView />
  </main>
</template>
```

## Программная навигация

```ts
import { useRouter } from 'vue-router'

const router = useRouter()

// Переход по имени роута
router.push({ name: 'user', params: { id: '42' } })

// Переход по пути
router.push('/about')

// С query-параметрами
router.push({ path: '/search', query: { q: 'vue', page: '1' } })

// Замена текущей записи в истории
router.replace({ name: 'home' })

// Переход назад/вперёд
router.go(-1)
router.go(1)
```

## Navigation Guards

### Глобальные

Вызываются при каждом переходе:

```ts
router.beforeEach((to, from) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})
```

```ts
router.afterEach((to, from) => {
  document.title = to.meta.title ?? 'Моё приложение'
})
```

### Per-route guards

Привязаны к конкретному роуту:

```ts
{
  path: '/admin',
  component: () => import('@/views/AdminView.vue'),
  beforeEnter: (to, from) => {
    if (!isAdmin()) return { name: 'home' }
  },
}
```

### In-component guards

Прямо в компоненте через `<script setup>`:

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  const hasChanges = false // проверка несохранённых данных
  if (hasChanges) {
    const answer = confirm('Есть несохранённые изменения. Уйти?')
    if (!answer) return false
  }
})

onBeforeRouteUpdate(async (to, from) => {
  // Вызывается при смене параметров того же роута
  // /users/1 → /users/2
  await fetchUser(to.params.id)
})
</script>
```

## Lazy Loading

Загрузка компонентов по необходимости — сокращает размер начального бандла:

```ts
// Ленивая загрузка (рекомендуется)
{
  path: '/about',
  component: () => import('@/views/AboutView.vue'),
}

// Eager-загрузка (для критичных роутов)
import HomeView from '@/views/HomeView.vue'
{
  path: '/',
  component: HomeView,
}
```

Группировка чанков:

```ts
{
  path: '/admin',
  component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue'),
}

// Vite: именованные чанки
{
  path: '/admin',
  component: () => import('@/views/AdminView.vue'),
}
// Vite автоматически группирует файлы из одной директории
```

## Route Meta

Метаданные роута — произвольные данные, доступные в guards и компонентах:

```ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    permissions?: string[]
  }
}

const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Панель управления',
      permissions: ['dashboard:read'],
    },
  },
]
```

Типизация `RouteMeta` через augmentation (как выше) даёт автодополнение.

## 404 и редиректы

```ts
const routes = [
  // Редирект
  { path: '/home', redirect: '/' },
  { path: '/old-page', redirect: { name: 'new-page' } },

  // 404 — ловит все неизвестные роуты
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
```

## Query-параметры

```ts
router.push({ path: '/search', query: { q: 'vue', sort: 'date' } })
```

В компоненте:

```ts
const route = useRoute()
const query = route.query.q     // string | string[]
const sort = route.query.sort   // string | string[]
```

Отслеживание изменений query:

```ts
watch(() => route.query, (newQuery) => {
  search(newQuery.q)
})
```

## useLink

Composition API для `<RouterLink>`:

```vue
<script setup lang="ts">
import { RouterLink, useLink } from 'vue-router'

const props = defineProps<{ to: string }>()
const { route, href, isActive, isExactActive, navigate } = useLink(props)
</script>

<template>
  <a :href="href" @click="navigate" :class="{ active: isActive }">
    <slot />
  </a>
</template>
```

## Scroll Behavior

Контроль позиции прокрутки при переходе:

```ts
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) return { el: to.hash, behavior: 'smooth' }

    return { top: 0 }
  },
})
```

## Практический пример

Полная конфигурация роутера с guards и meta:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/DashboardHome.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, _, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Приложение'} | Мой сайт`
})

export default router
```

## Итог

Vue Router — полноценная библиотека маршрутизации. Основные возможности: динамические параметры, вложенные роуты, guards для защиты переходов, lazy loading для оптимизации бандла, meta-поля для хранения данных роута. Используйте `useRoute()` для доступа к параметрам и `useRouter()` для программной навигации.
