---
title: Pinia — хранилище состояния
description: Pinia — официальное хранилище состояния для Vue 3. Создание stores, state, getters, actions, плагины и лучшие практики.
section: vue
difficulty: intermediate
readTime: 12
order: 8
tags: [Vue 3, Pinia, state management, store, Vuex]
---

## Что такое Pinia

**Pinia** — официальное хранилище состояния для Vue 3, пришедшее на смену Vuex. Оно проще, лучше типизируется и работает с Composition API.

Установка:

```bash
npm install pinia
```

Подключение:

```ts
import { createPinia } from 'pinia'

app.use(createPinia())
```

## Определение Store

Pinia поддерживает два синтаксиса: Options API (похож на Vuex) и Setup Store (как Composition API).

### Options Store

```ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Счётчик',
  }),

  getters: {
    doubled: (state) => state.count * 2,

    fullName(): string {
      return `${this.name}: ${this.count}`
    },
  },

  actions: {
    increment() {
      this.count++
    },

    incrementBy(amount: number) {
      this.count += amount
    },

    async fetchCount() {
      const res = await fetch('/api/count')
      const data = await res.json()
      this.count = data.count
    },
  },
})
```

### Setup Store

```ts
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Счётчик')

  const doubled = computed(() => count.value * 2)
  const fullName = computed(() => `${name.value}: ${count.value}`)

  function increment() {
    count.value++
  }

  function incrementBy(amount: number) {
    count.value += amount
  }

  async function fetchCount() {
    const res = await fetch('/api/count')
    const data = await res.json()
    count.value = data.count
  }

  return { count, name, doubled, fullName, increment, incrementBy, fetchCount }
})
```

Setup Store гибче: можно использовать любые composables, `watch()`, `watchEffect()` и другие Composition API функции.

## Использование Store

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <p>{{ counter.name }}: {{ counter.count }}</p>
  <p>Удвоенное: {{ counter.doubled }}</p>
  <button @click="counter.increment()">+</button>
  <button @click="counter.incrementBy(5)">+5</button>
</template>
```

## Деструктуризация с storeToRefs

Прямая деструктуризация теряет реактивность:

```ts
const { count, name } = useCounterStore() // НЕ реактивно!
```

Используйте `storeToRefs`:

```ts
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { count, name, doubled } = storeToRefs(store) // реактивно

// Actions деструктуризировать можно напрямую
const { increment, incrementBy } = store
```

## Изменение состояния

### Через actions (рекомендуется)

```ts
counter.increment()
counter.incrementBy(10)
```

### Напрямую

```ts
counter.count = 42
counter.$patch({ count: 42, name: 'Новое имя' })
```

### $patch с функцией

```ts
counter.$patch((state) => {
  state.count = 0
  state.name = 'Сброс'
})
```

### Сброс к начальным значениям

```ts
counter.$reset() // Работает только в Options Store
```

Для Setup Store — добавьте action вручную:

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function $reset() {
    count.value = 0
  }

  return { count, $reset }
})
```

## Подписка на изменения

### $subscribe

Отслеживает все изменения state:

```ts
const store = useCounterStore()

store.$subscribe((mutation, state) => {
  console.log(mutation.type)   // 'direct' | 'patch object' | 'patch function'
  console.log(mutation.storeId) // 'counter'

  localStorage.setItem('counter', JSON.stringify(state))
})
```

### $onAction

Отслеживает вызовы actions:

```ts
const unsubscribe = store.$onAction(({ name, after, onError }) => {
  console.log(`Action "${name}" вызвана`)

  after((result) => {
    console.log(`Action "${name}" завершена с результатом:`, result)
  })

  onError((error) => {
    console.error(`Action "${name}" ошибка:`, error)
  })
})
```

## Плагины

Плагины расширяют функциональность всех stores:

### Плагин для localStorage

```ts
// plugins/pinia-plugin.ts
import type { PiniaPluginContext } from 'pinia'

export function piniaLocalStoragePlugin({ store }: PiniaPluginContext) {
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }

  store.$subscribe((_, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}
```

Подключение:

```ts
const pinia = createPinia()
pinia.use(piniaLocalStoragePlugin)
app.use(pinia)
```

### Плагин для добавления свойств

```ts
function timestampPlugin({ store }: PiniaPluginContext) {
  store.$state._createdAt = new Date().toISOString()
}
```

## Практические примеры

### Auth Store

```ts
// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Неверные данные')

    const data = await res.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function fetchUser() {
    if (!token.value) return

    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (res.ok) {
      user.value = await res.json()
    } else {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, login, fetchUser, logout }
})
```

### Cart Store

```ts
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  function addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(item => item.id === product.id)

    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(item => item.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) removeItem(productId)
    }
  }

  function clear() {
    items.value = []
  }

  return { items, totalCount, totalPrice, addItem, removeItem, updateQuantity, clear }
})
```

## Взаимодействие stores

Store может использовать другой store:

```ts
export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()

  async function checkout() {
    if (!auth.isLoggedIn) throw new Error('Нужна авторизация')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ items: items.value }),
    })

    return res.json()
  }
})
```

## Итог

Pinia — простое и мощное хранилище состояния. Setup Store даёт полную свободу Composition API. Деструктуризируйте через `storeToRefs`, подписывайтесь через `$subscribe` и `$onAction`, расширяйте через плагины. Pinia пришла на смену Vuex и стала стандартом для Vue 3.
