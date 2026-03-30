---
title: Zustand — управление состоянием
description: Zustand — минималистичный менеджер состояния для React. Простое глобальное состояние без boilerplate, middleware и провайдеров.
section: react
difficulty: intermediate
readTime: 10
order: 7
tags: [Zustand, state management, React, глобальное состояние, store]
---

## Что такое Zustand

Zustand — библиотека для управления глобальным состоянием в React. Минимальный API, нет провайдеров, нет boilerplate. Состояние хранится в обычном JavaScript-объекте вне дерева компонентов.

Установка:

```bash
npm install zustand
```

## Создание store

```ts
// src/stores/useCartStore.ts
import { create } from 'zustand'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }
      }
      return { items: [...state.items, { ...item, quantity: 1 }] }
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
```

## Использование в компонентах

```tsx
import { useCartStore } from '@/stores/useCartStore'

function ProductCard({ id, name, price }: { id: number; name: string; price: number }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <div className="border rounded p-4">
      <h3>{name}</h3>
      <p>{price} ₽</p>
      <button onClick={() => addItem({ id, name, price })}>
        В корзину
      </button>
    </div>
  )
}
```

```tsx
function CartBadge() {
  const items = useCartStore((state) => state.items)

  return <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
}
```

Селектор `(state) => state.items` — важная деталь. Компонент ре-рендерится только когда `items` меняется. Если написать `useCartStore()` без селектора, компонент будет ре-рендериться при любом изменении store.

## Сравнение: Context vs Zustand vs Redux

| Критерий | Context | Zustand | Redux Toolkit |
|----------|---------|---------|---------------|
| Boilerplate | Средний | Минимум | Много |
| Провайдеры | Обязательны | Не нужны | Обязательны |
| Re-render | Всех потребителей | По селектору | По селектору |
| DevTools | Нет | Да (плагин) | Да |
| Middleware | Нет | Да | Да |
| Кривая обучения | Низкая | Низкая | Средняя |

## Подписка на часть состояния

Zustand ре-рендерит компонент только если результат селектора изменился:

```tsx
// ✅ Ре-рендер только при изменении items
const items = useCartStore((state) => state.items)

// ✅ Можно вычислять производные значения
const isEmpty = useCartStore((state) => state.items.length === 0)

// ❌ Компонент ре-рендерится при ЛЮБОМ изменении store
const store = useCartStore()
```

Для сложных вычислений в селекторе используйте `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow'

function CartSummary() {
  const { items, totalPrice } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      totalPrice: state.totalPrice(),
    })),
  )

  return (
    <div>
      <p>Товаров: {items.length}</p>
      <p>Итого: {totalPrice} ₽</p>
    </div>
  )
}
```

## Persist: сохранение в localStorage

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  theme: 'light' | 'dark'
  language: string
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ru',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings',
    },
  ),
)
```

Состояние автоматически сохраняется в `localStorage` и восстанавливается при перезагрузке страницы.

## Immer middleware

Для удобного обновления вложенных объектов:

```bash
npm install immer
```

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UserStore {
  profile: {
    name: string
    address: {
      city: string
      street: string
    }
  }
  updateCity: (city: string) => void
}

export const useUserStore = create<UserStore>()(
  immer((set) => ({
    profile: {
      name: 'Иван',
      address: { city: 'Москва', street: 'Тверская' },
    },
    updateCity: (city) =>
      set((state) => {
        state.profile.address.city = city
      }),
  })),
)
```

Без immer пришлось бы писать `set(s => ({ profile: { ...s.profile, address: { ...s.profile.address, city } } }))`.

## Async actions

Zustand работает с асинхронностью без лишних усложнений:

```ts
interface PostStore {
  posts: Post[]
  loading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/posts')
      const posts = await res.json()
      set({ posts, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
```

## DevTools

```ts
import { devtools } from 'zustand/middleware'

export const useCartStore = create<CartStore>()(
  devtools(
    (set, get) => ({
      // ... store
    }),
    { name: 'CartStore' },
  ),
)
```

Расширение Redux DevTools покажет все действия и состояние store.

## Итог

Zustand — лучший выбор для большинства React-проектов, которым нужно глобальное состояние. Нет провайдеров, нет шаблонного кода, точечные ре-рендеры через селекторы. Persist и DevTools подключаются одной строчкой. Если Redux кажется громоздким — попробуйте Zustand.
