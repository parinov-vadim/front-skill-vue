---
title: Composables во Vue 3
description: Composables — переиспользуемые функции на основе Composition API. Создание, конвенции именования, примеры: useFetch, useMouse, useLocalStorage, useDebounce.
section: vue
difficulty: intermediate
readTime: 12
order: 9
tags: [Vue 3, composables, composition api, useFetch, reusability]
---

## Что такое composables

**Composable** — функция, которая использует Composition API (`ref`, `computed`, `watch` и др.) для инкапсуляции и переиспользования логики. Название всегда начинается с `use`: `useFetch`, `useMouse`, `useLocalStorage`.

```ts
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initial
  }

  return { count, doubled, increment, decrement, reset }
}
```

```vue
<script setup lang="ts">
const { count, doubled, increment } = useCounter(10)
</script>

<template>
  <p>{{ count }} × 2 = {{ doubled }}</p>
  <button @click="increment">+</button>
</template>
```

## Конвенции

### Именование

- Файл: `composables/useCounter.ts` или `composables/useCounter.ts`
- Функция: `useCounter` (camelCase, начинается с `use`)
- Возвращает объект с реактивными значениями и методами

### Возвращаемое значение

Всегда возвращайте объект, не отдельные значения. Это позволяет деструктуризировать только нужное:

```ts
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  return { x, y }
}

const { x } = useMouse() // только x
```

### Очистка

Composable, подписывающийся на события, должен предоставлять функцию остановки или использовать `onScopeDispose`:

```ts
export function useEventListener(target: EventTarget, event: string, handler: EventListener) {
  target.addEventListener(event, handler)

  onScopeDispose(() => {
    target.removeEventListener(event, handler)
  })
}
```

Или возвращать функцию stop:

```ts
export function useInterval(callback: () => void, delay: number) {
  const id = setInterval(callback, delay)

  function stop() {
    clearInterval(id)
  }

  onScopeDispose(stop)

  return { stop }
}
```

## Практические composables

### useFetch

```ts
// composables/useFetch.ts
import { ref, toValue, type MaybeRef } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
  baseURL?: string
}

export function useFetch<T>(url: MaybeRef<string>, options: UseFetchOptions = {}) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${options.baseURL ?? ''}${toValue(url)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Неизвестная ошибка'
    } finally {
      loading.value = false
    }
  }

  if (options.immediate !== false) {
    execute()
  }

  return { data, error, loading, execute }
}
```

```vue
<script setup lang="ts">
const { data: users, loading, error, execute: reload } = useFetch<User[]>('/api/users', {
  immediate: true,
})
</script>

<template>
  <div v-if="loading">Загрузка...</div>
  <div v-else-if="error">{{ error }}</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="reload">Обновить</button>
</template>
```

### useMouse

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function handleMove(event: MouseEvent) {
    x.value = event.clientX
    y.value = event.clientY
  }

  onMounted(() => window.addEventListener('mousemove', handleMove))
  onUnmounted(() => window.removeEventListener('mousemove', handleMove))

  return { x, y }
}
```

```vue
<script setup lang="ts">
const { x, y } = useMouse()
</script>

<template>
  <p>Позиция мыши: {{ x }}, {{ y }}</p>
</template>
```

### useLocalStorage

```ts
// composables/useLocalStorage.ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue) as Ref<T>

  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return data
}
```

```vue
<script setup lang="ts">
const theme = useLocalStorage<'light' | 'dark'>('theme', 'light')
const recentSearches = useLocalStorage<string[]>('recent', [])
</script>

<template>
  <button @click="theme = theme === 'light' ? 'dark' : 'light'">
    Тема: {{ theme }}
  </button>
</template>
```

### useDebounce

```ts
// composables/useDebounce.ts
import { ref, type Ref } from 'vue'

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): Ref<(...args: Parameters<T>) => void> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = ref((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  })

  return debounced
}
```

```vue
<script setup lang="ts">
const query = ref('')

const search = useDebounce((q: string) => {
  console.log('Поиск:', q)
}, 300)

watch(query, (val) => search.value(val))
</script>
```

### useMediaQuery

```ts
// composables/useMediaQuery.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)

  let mql: MediaQueryList | null = null

  function handleChange(e: MediaQueryListEvent) {
    matches.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', handleChange)
  })

  return matches
}
```

```vue
<script setup lang="ts">
const isMobile = useMediaQuery('(max-width: 768px)')
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
</script>

<template>
  <MobileNav v-if="isMobile" />
  <DesktopNav v-else />
</template>
```

### useIntersectionObserver

```ts
// composables/useIntersectionObserver.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  options?: IntersectionObserverInit,
) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return

    observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting
    }, options)

    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return isVisible
}
```

```vue
<script setup lang="ts">
const imageRef = ref<HTMLImageElement | null>(null)
const isVisible = useIntersectionObserver(imageRef)

const src = computed(() => isVisible.value ? '/heavy-image.jpg' : '')
</script>

<template>
  <img ref="imageRef" :src="src" alt="Ленивая загрузка" />
</template>
```

## Composable, принимающий другой composable

Composables можно комбинировать:

```ts
export function useUserActivity(userId: Ref<string>) {
  const { data, loading, execute } = useFetch<UserActivity[]>(
    computed(() => `/api/users/${userId.value}/activity`),
    { immediate: false },
  )

  watch(userId, () => execute(), { immediate: true })

  return { data, loading, refresh: execute }
}
```

## Input как Ref или Getter

Composable должен принимать как `ref`, так и обычные значения. Для этого — `toValue()`:

```ts
import { toValue, type MaybeRefOrGetter } from 'vue'

export function useSorted(items: MaybeRefOrGetter<string[]>) {
  return computed(() => [...toValue(items)].sort())
}
```

Теперь можно передать и `ref`, и `computed`, и обычный массив:

```ts
const items = ref(['banana', 'apple', 'cherry'])
const sorted = useSorted(items)           // ref
const sorted2 = useSorted(['b', 'a'])     // обычный массив
const sorted3 = useSorted(() => ['b', 'a']) // getter
```

## Итог

Composables — основной способ переиспользования логики во Vue 3. Они заменяют mixins, provide/inject-паттерны и сложные утилиты. Конвенции: имя с `use`, возврат объекта с реактивными значениями, очистка ресурсов через `onScopeDispose`. Используйте `toValue()` для гибкого приёма аргументов и комбинируйте composables друг с другом.
