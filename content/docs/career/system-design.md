---
title: "Системный дизайн для фронтендера: архитектура SPA-приложения"
description: "Как проектировать архитектуру фронтенд-приложения: разделение ответственности, роутинг, state management, работа с API, оптимизация и масштабирование."
section: career
difficulty: advanced
readTime: 16
order: 6
tags: [системный дизайн, архитектура, SPA, state management, роутинг, API, масштабирование, фронтенд]
---

## Зачем фронтендеру системный дизайн

На middle+ собеседованиях спрашивают не только «как написать компонент», но и «как спроектировать приложение». Не нужно строить распределённые системы — но нужно понимать, как грамотно организовать фронтенд-архитектуру.

Типичный вопрос: «Спроектируйте интернет-магазин» или «Как бы вы построили дашборд с реалтайм-данными?»

## Структура проекта

### Feature-based vs Layer-based

**Layer-based** (по типу файлов):

```
src/
  components/
  composables/
  stores/
  pages/
  utils/
```

Проблема: при росте проекта папка `components` превращается в свалку на 200 файлов.

**Feature-based** (по фичам):

```
src/
  features/
    auth/
      components/
      composables/
      stores/
      types.ts
    products/
      components/
      composables/
      stores/
      types.ts
    cart/
      components/
      composables/
      stores/
      types.ts
  shared/
    components/
    composables/
    utils/
```

Каждая фича — отдельная папка со всем необходимым. Проще находить код, проще удалять фичу целиком.

### Что кладём в shared

Переиспользуемый код, не привязанный к конкретной фиче:

- UI-компоненты: Button, Input, Modal, Card
- Утилиты: formatDate, formatCurrency, debounce
- Composables: useFetch, useLocalStorage, useMedia
- Типы: User, Product, ApiResponse

### Правило: фичи не зависят друг от друга

```
auth/ → может импортировать из shared/
cart/ → может импортировать из shared/
auth/ → НЕ может импортировать из cart/
```

Если auth нужен cart — это запах. Либо общую логику нужно вынести в shared, либо пересмотреть границы фич.

## Роутинг

### Структура маршрутов

```ts
const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: HomePage },
      { path: 'products', component: ProductsPage },
      { path: 'products/:id', component: ProductDetail },
      { path: 'cart', component: CartPage },
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
    ]
  }
]
```

### Lazy loading маршрутов

```ts
const routes = [
  {
    path: '/admin',
    component: () => import('@/features/admin/AdminPage.vue')
  }
]
```

Пользователь скачивает код страницы только когда переходит на неё. Снижает размер начального бандла.

### Защита маршрутов (guards)

```ts
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

## Работа с API

### Слой абстракции

Не вызывайте `fetch` прямо в компонентах. Создайте отдельный слой:

```ts
// api/client.ts
const BASE_URL = '/api'

export async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json()
}
```

```ts
// api/users.ts
export const usersApi = {
  getAll: () => request<User[]>('/users'),
  getById: (id: number) => request<User>(`/users/${id}`),
  create: (data: CreateUserDto) => request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}
```

Компонент не знает про URL-адреса, заголовки и формат запроса. Если API меняется — правите один файл.

### Обработка ошибок

```ts
// Глобальный перехватчик
export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, options)

  if (response.status === 401) {
    const auth = useAuthStore()
    auth.logout()
    router.push('/login')
    throw new Error('Не авторизован')
  }

  if (response.status === 403) {
    throw new Error('Нет доступа')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json()
}
```

### Кэширование

Простейший кэш через Map:

```ts
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export async function cachedRequest<T>(endpoint: string): Promise<T> {
  const cached = cache.get(endpoint)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  const data = await request<T>(endpoint)
  cache.set(endpoint, { data, timestamp: Date.now() })
  return data
}
```

Для продакшена используйте TanStack Query (React) или Pinia + плагины (Vue).

## Управление состоянием

### Когда нужен стор

| Данные | Где хранить |
|--------|-------------|
| Локальные (форма, модалка) | В компоненте (`ref`) |
| От родителя к ребёнку | Props / Emit |
| От дальнего предка | Provide / Inject |
| Глобальные (user, cart, theme) | Store (Pinia / Zustand) |
| Серверные данные | TanStack Query или composable + fetch |

Не нужно всё пихать в глобальный стор. Локальное состояние — в компоненте.

### Архитектура стора

```ts
// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Getters
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  // Actions
  function addToCart(product: Product) {
    const existing = items.value.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ productId: product.id, price: product.price, quantity: 1 })
    }
  }

  function removeFromCart(productId: number) {
    items.value = items.value.filter(i => i.productId !== productId)
  }

  // Персистенция
  watch(items, (newItems) => {
    localStorage.setItem('cart', JSON.stringify(newItems))
  }, { deep: true })

  return { items, totalItems, totalPrice, addToCart, removeFromCart }
})
```

## Оптимизация

### Code splitting

```ts
// Динамический импорт
const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'))

// Группировка
() => import(/* webpackChunkName: "admin" */ './AdminPanel.vue')
```

### Оптимизация рендера

```vue
<!-- Кэширование тяжёлых вычислений -->
<script setup>
const filteredList = computed(() =>
  items.filter(/* ... */).sort(/* ... */)
)
</script>

<!-- KeepAlive для вкладок -->
<KeepAlive>
  <component :is="currentTab" />
</KeepAlive>

<!-- Virtual scrolling для длинных списков -->
<RecycleScroller :items="items" :item-size="50">
  <template #default="{ item }">
    <UserRow :user="item" />
  </template>
</RecycleScroller>
```

### Оптимизация изображений

- WebP/AVIF вместо PNG/JPEG
- `srcset` для разных размеров экрана
- `loading="lazy"` для изображений ниже первого экрана
- `width` и `height` для предотвращения layout shift

## Типичный план ответа на интервью

Когда просят спроектировать приложение:

1. **Уточнить требования** — какие страницы, какие действия, масштаб
2. **Нарисовать структуру страниц** — роуты, layouts, вложенность
3. **Определить данные** — какие сущности, откуда берутся, где хранятся
4. **Выбрать инструменты** — фреймворк, state management, API layer
5. **Описать архитектуру** — структура папок, разделение ответственности
6. **Обсудить оптимизацию** — code splitting, lazy loading, кэширование
7. **Назвать компромиссы** — что упрощаете и почему

## Итог

- Feature-based структура лучше layer-based при росте проекта
- API-запросы — через отдельный слой абстракции, не из компонентов
- Глобальное состояние — в store, локальное — в компоненте
- Lazy loading маршрутов — снижение начального бандла
- Кэширование, code splitting, virtual scroll — инструменты оптимизации
- На интервью: уточняйте требования → структура → данные → инструменты → компромиссы
