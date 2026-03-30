---
title: TypeScript с Vue
description: Типизация Vue 3-компонентов — defineProps, defineEmits, defineExpose, composables, reactive, ref, provide/inject и работа с Nuxt.
section: typescript
difficulty: intermediate
readTime: 14
order: 11
tags: [typescript, vue, defineProps, defineEmits, composables, nuxt]
---

## Vue 3 и TypeScript

Vue 3 написан на TypeScript, поэтому типизация работает из коробки. Во всех примерах используется `<script setup lang="ts">` — стандартный подход для SFC-компонентов.

## defineProps

### Декларативный синтаксис

```vue
<script setup lang="ts">
defineProps<{
  title: string
  count?: number
  items: string[]
}>()
</script>
```

Знак `?` делает свойство необязательным.

### С значениями по умолчанию

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  count?: number
  variant?: 'primary' | 'secondary'
}>(), {
  count: 0,
  variant: 'primary',
})
</script>
```

### Реактивные props

```vue
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

// props — readonly, деструктуризация с потерей реактивности
const { modelValue } = props // теряет реактивность!

// Используйте toRefs
const { modelValue } = toRefs(props) // реактивно
</script>
```

### Интерфейсы из отдельного файла

```ts
// types.ts
export interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}
```

```vue
<script setup lang="ts">
import type { ButtonProps } from './types'

defineProps<ButtonProps>()
</script>
```

## defineEmits

### Базовый синтаксис

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()

emit('update', 'новое значение')
emit('delete', 42)
</script>
```

### Альтернативный синтаксис (Vue 3.3+)

```vue
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
  change: []
}>()

emit('update', 'новое значение')
emit('delete', 42)
emit('change')
</script>
```

### v-model с типами

```vue
<!-- CustomInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>
```

```vue
<!-- Использование -->
<script setup lang="ts">
const name = ref('Анна')
</script>

<template>
  <CustomInput v-model="name" />
</template>
```

Несколько v-model:

```vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
</script>
```

## defineExpose

Определяет, что компонент раскрывает наружу через template ref:

```vue
<script setup lang="ts">
const count = ref(0)

const increment = () => count.value++

defineExpose({
  count,
  increment,
})
</script>
```

```vue
<script setup lang="ts">
const counter = ref()

onMounted(() => {
  counter.value.increment()
  console.log(counter.value.count)
})
</script>

<template>
  <Counter ref="counter" />
</template>
```

## ref и reactive

```ts
const name = ref<string>('Анна')
const count = ref<number>(0)

// TypeScript выводит тип автоматически
const items = ref(['a', 'b', 'c']) // Ref<string[]>

// Для сложных объектов
interface User {
  id: number
  name: string
  email: string
}

const user = ref<User | null>(null)
```

`reactive`:

```ts
const state = reactive<{
  loading: boolean
  data: User[]
  error: string | null
}>({
  loading: false,
  data: [],
  error: null,
})
```

## Computed

```ts
const fullName = computed<string>(() => `${firstName.value} ${lastName.value}`)

const filteredItems = computed(() =>
  items.value.filter(item => item.active)
)
```

Тип выводится автоматически, но можно указать явно:

```ts
const total = computed<number>(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0)
})
```

## Composables

Composable — функция, использующая Composition API. С TypeScript они становятся ещё мощнее:

```ts
// composables/useUser.ts
interface User {
  id: number
  name: string
  email: string
}

export function useUser() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUser(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/users/${id}`)
      user.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка'
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, fetchUser }
}
```

```vue
<script setup lang="ts">
const { user, loading, fetchUser } = useUser()

onMounted(() => fetchUser(1))
</script>
```

### Универсальный composable с дженериком

```ts
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute() {
    loading.value = true
    try {
      const res = await fetch(url)
      data.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
```

```vue
<script setup lang="ts">
const { data: users, execute } = useFetch<User[]>('/api/users')
</script>
```

## Provide / Inject

```ts
// symbols.ts
export const UserKey: InjectionKey<Ref<User | null>> = Symbol('user')
export const ThemeKey: InjectionKey<'light' | 'dark'> = Symbol('theme')
```

```ts
// Provider
provide(UserKey, user)
provide(ThemeKey, 'dark')
```

```ts
// Consumer
const user = inject(UserKey) // Ref<User | null> | undefined
const theme = inject(ThemeKey, 'light') // 'light' | 'dark'
```

Использование `InjectionKey` гарантирует типобезопасность — TypeScript проверит, что типы `provide` и `inject` совпадают.

## Template refs

```vue
<script setup lang="ts">
const inputRef = ref<HTMLInputElement | null>(null)

function focus() {
  inputRef.value?.focus()
}
</script>

<template>
  <input ref="inputRef" />
</template>
```

Для компонента:

```vue
<script setup lang="ts">
const modal = ref<InstanceType<typeof Modal> | null>(null)

function open() {
  modal.value?.show()
}
</script>
```

## Типизация событий DOM

```vue
<script setup lang="ts">
function handleClick(event: MouseEvent) {
  console.log(event.clientX, event.clientY)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    // ...
  }
}
</script>

<template>
  <button @click="handleClick">Клик</button>
  <input @input="handleInput" @keydown="handleKeydown" />
</template>
```

## Nuxt и TypeScript

Nuxt полностью поддерживает TypeScript. Автоимпорты работают с типами из коробки.

### Типизация API-роутов

```ts
// server/api/users/index.ts
export default defineEventHandler(async (event): Promise<User[]> => {
  const users = await db.users.findMany()
  return users
})
```

```ts
// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await db.users.findById(Number(id))

  if (!user) {
    throw createError({ statusCode: 404, message: 'Не найден' })
  }

  return user
})
```

### useAsyncData

```vue
<script setup lang="ts">
const { data: users, pending, error } = await useAsyncData<User[]>(
  'users',
  () => $fetch('/api/users'),
)
</script>
```

### useFetch

```vue
<script setup lang="ts">
const { data, pending } = await useFetch<User[]>('/api/users')
const { data: user } = await useFetch<User>(`/api/users/${id}`)
</script>
```

## Практический пример — типизированный Table

```vue
<script setup lang="ts">
interface Column<T> {
  key: keyof T
  label: string
  format?: (value: T[keyof T]) => string
}

interface Props<T> {
  items: T[]
  columns: Column<T>[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props<User>>(), {
  loading: false,
})

const emit = defineEmits<{
  rowClick: [item: User]
  sort: [key: keyof User]
}>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="String(col.key)" @click="emit('sort', col.key)">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id" @click="emit('rowClick', item)">
        <td v-for="col in columns" :key="String(col.key)">
          {{ col.format ? col.format(item[col.key]) : item[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

## Итог

Vue 3 и TypeScript отлично работают вместе. `defineProps` и `defineEmits` с generic-синтаксисом дают полную типобезопасность компонентов. Composables с дженериками (`useFetch<T>`) переиспользуются между проектами. `InjectionKey` гарантирует совпадение типов в provide/inject. В Nuxt типизация API-роутов и `useFetch` работает из коробки.
