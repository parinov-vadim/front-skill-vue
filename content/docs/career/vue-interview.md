---
title: "Собеседование по Vue: реактивность, Composition API, компоненты"
description: "Подготовка к Vue-собеседованию: типичные вопросы про реактивность, ref vs reactive, Composition API, lifecycle, компоненты, provide/inject, Pinia."
section: career
difficulty: intermediate
readTime: 16
order: 5
tags: [собеседование, Vue, реактивность, Composition API, компоненты, Pinia, interview, вопросы]
---

## Базовые вопросы

### Что такое Vue?

Прогрессивный фреймворк для построения UI. Ключевые особенности:
- **Реактивность** — данные и UI синхронизируются автоматически
- **Компонентный подход** — UI состоит из вложенных компонентов
- **Template syntax** — декларативные шаблоны с директивами

### Что такое `<script setup>`?

Синтаксический сахар для Composition API внутри однофайловых компонентов (SFC):

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

Все переменные и импорты в `<script setup>` автоматически доступны в шаблоне. Не нужно писать `return`.

## Реактивность

### Как работает реактивность во Vue?

Vue 3 использует `Proxy` для отслеживания изменений:

```js
const state = reactive({ name: 'Анна', age: 25 })

// При обращении к state.name Vue «запоминает», какой компонент использует это свойство
// При изменении state.name Vue «уведомляет» компонент о перерисовке
```

Когда компонент рендерится, Vue записывает, какие реактивные свойства использовались. При изменении свойства — компонент обновляется.

### Разница между `ref` и `reactive`?

```js
// ref — для примитивов и любых значений
const count = ref(0)
const user = ref({ name: 'Анна' })
count.value++          // доступ через .value

// reactive — только для объектов
const state = reactive({ name: 'Анна', age: 25 })
state.age++            // прямой доступ, без .value
```

| Свойство | `ref` | `reactive` |
|----------|-------|------------|
| Примитивы | Да | Нет |
| Объекты | Да (через .value) | Да |
| В шаблоне | Авто-распаковка | Прямой доступ |
| Переприсвоение | `ref.value = newObj` | Нельзя заменить целиком |

### Почему нельзя переприсвоить `reactive`?

```js
const state = reactive({ name: 'Анна' })
state = reactive({ name: 'Иван' }) // Ошибка — потеряна связь Proxy
```

`reactive` возвращает Proxy-объект. Переприсвоение заменяет ссылку — реактивность теряется. Для замены объекта используйте `ref` или `Object.assign`:

```js
Object.assign(state, { name: 'Иван' })
```

### Что делает `computed`?

Создаёт вычисляемое значение с кэшированием:

```js
const firstName = ref('Анна')
const lastName = ref('Иванова')

const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

`computed` пересчитывается только когда меняются зависимости. В отличие от обычной функции, которая вызывается при каждом рендере.

### Разница между `computed` и `watch`?

`computed` — вычисляет значение на основе других данных. `watch` — выполняет побочный эффект при изменении.

```js
const search = ref('')

// computed — вернуть производное значение
const results = computed(() => items.filter(i => i.name.includes(search.value)))

// watch — сделать что-то при изменении (запрос на сервер, localStorage)
watch(search, (newVal) => {
  console.log('Поиск:', newVal)
})
```

### Что делает `watchEffect`?

Как `watch`, но автоматически определяет зависимости:

```js
const userId = ref(1)

watchEffect(() => {
  // Vue сам видит, что мы используем userId.value
  fetchUser(userId.value)
})
```

В отличие от `watch`, не нужно указывать, что отслеживать. Запускается сразу при создании и при каждом изменении реактивных данных внутри.

## Компоненты

### Как передать данные в дочерний компонент?

Через `defineProps`:

```vue
<!-- Child.vue -->
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
}>()
</script>

<template>
  <h1>{{ title }}</h1>
  <p>Счёт: {{ count ?? 0 }}</p>
</template>
```

```vue
<!-- Parent.vue -->
<Child title="Привет" :count="5" />
```

### Как передать событие наверх?

Через `defineEmits`:

```vue
<!-- Child.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

const handleChange = () => emit('update', 'новое значение')
</script>
```

```vue
<!-- Parent.vue -->
<Child @update="handleUpdate" @delete="handleDelete" />
```

### Что такое `v-model` на компоненте?

Двусторонняя привязка — сокращение для `:value` + `@input`:

```vue
<!-- CustomInput.vue -->
<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <input v-model="model" />
</template>
```

```vue
<!-- Parent.vue -->
<CustomInput v-model="username" />
```

Vue 3.4+: `defineModel()` автоматически создаёт prop и emit.

### Что такое `slots`?

Слот — место в шаблоне, куда родитель передаёт контент:

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot name="header">Заголовок по умолчанию</slot>
    <slot />
    <slot name="footer" />
  </div>
</template>
```

```vue
<Card>
  <template #header>Мой заголовок</template>
  <p>Основной контент</p>
  <template #footer>Подвал</template>
</Card>
```

### Что такое `provide` / `inject`?

Альтернатива props для глубоких вложенных компонентов:

```vue
<!-- Предок -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)
</script>

<!-- Потомок (на любом уровне глубины) -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme', 'light') // 'light' — значение по умолчанию
</script>
```

Не нужно прокидывать props через каждый промежуточный компонент.

## Lifecycle

### Какие lifecycle-хуки есть?

```js
onMounted(() => {
  // Компонент добавлен в DOM. Запросы данных, подписки.
})

onUpdated(() => {
  // Компонент перерисован. Осторожно — может вызвать бесконечный цикл.
})

onUnmounted(() => {
  // Компонент удалён. Очистка таймеров, отписка от событий.
})

onBeforeMount(() => { /* Перед добавлением в DOM */ })
onBeforeUpdate(() => { /* Перед перерисовкой */ })
```

### Когда делать запрос в `onMounted`, а не в `setup`?

В `onMounted` — если нужны DOM-элементы или данные должны загружаться после начального рендера. В `setup` — если данные критичны для первого рендера и не зависят от DOM.

На практике большинство запросов данных делают в `onMounted` или в composables с `onMounted`.

## Pinia

### Что такое Pinia?

Официальное хранилище состояния для Vue (замена Vuex):

```ts
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const name = ref('Гость')
  const isLoggedIn = ref(false)

  const displayName = computed(() => isLoggedIn.value ? name.value : 'Гость')

  function login(userName: string) {
    name.value = userName
    isLoggedIn.value = true
  }

  function logout() {
    name.value = 'Гость'
    isLoggedIn.value = false
  }

  return { name, isLoggedIn, displayName, login, logout }
})
```

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()
user.login('Анна')
</script>
```

### В чём преимущество перед Vuex?

- Нет mutations — действия синхронные и асинхронные в одном месте
- TypeScript из коробки — не нужно возиться с типами
- Меньше шаблонного кода
- Можно несколько stores вместо одного огромного

## Composables

### Что такое composable?

Функция, инкапсулирующая реактивную логику для переиспользования:

```ts
// composables/useFetch.ts
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(true)

  const fetch_ = async () => {
    loading.value = true
    try {
      const res = await fetch(url)
      data.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  onMounted(fetch_)

  return { data, error, loading, refresh: fetch_ }
}
```

```vue
<script setup>
const { data: users, loading } = useFetch<User[]>('/api/users')
</script>
```

### Паттерны composables

```ts
// Мышь
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  onMounted(() => window.addEventListener('mousemove', handler))
  onUnmounted(() => window.removeEventListener('mousemove', handler))

  function handler(e: MouseEvent) {
    x.value = e.clientX
    y.value = e.clientY
  }

  return { x, y }
}

// localStorage
export function useLocalStorage(key: string, defaultValue: string) {
  const value = ref(localStorage.getItem(key) ?? defaultValue)

  watch(value, (newVal) => localStorage.setItem(key, newVal))

  return value
}
```

## Директивы

### Какие директивы часто спрашивают?

```vue
<p v-if="show">Показан</p>         <!-- Условный рендеринг (DOM убирается) -->
<p v-show="show">Показан</p>       <!-- CSS display: none -->
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
<input v-model="text" />           <!-- Двусторонняя привязка -->
<div :class="{ active: isActive }"> <!-- Динамический класс -->
<button @click="handler">Клик</button> <!-- Событие -->
<div v-html="htmlContent" />       <!-- Вывод HTML (осторожно: XSS) -->
```

### Разница `v-if` и `v-show`?

`v-if` полностью убирает/добавляет элемент в DOM. `v-show` — переключает `display: none`.

Используйте `v-if` когда элемент редко показывается. `v-show` — когда переключается часто (меньше накладных расходов).

## Производительность

### Что делает `defineAsyncComponent`?

```js
const AsyncComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
```

Загружает компонент лениво — только когда нужен. Снижает размер начального бандла.

### Что делает `<KeepAlive>`?

Кэширует компонент вместо его уничтожения:

```vue
<KeepAlive>
  <component :is="currentTab" />
</KeepAlive>
```

При переключении вкладок компонент не теряет состояние. Полезно для форм, где пользователь уже ввёл данные.

## Итог

- Реактивность основана на Proxy — Vue автоматически отслеживает зависимости
- `ref` — универсальный, `reactive` — только объекты, нельзя переприсвоить
- `computed` — кэшированные вычисления, `watch`/`watchEffect` — побочные эффекты
- `<script setup>` — стандартный синтаксис, не нужно писать return
- Props вниз, emit вверх, provide/inject — для глубоких деревьев
- Composables — главный паттерн переиспользования логики в Vue 3
- Pinia — замена Vuex, меньше шаблонного кода
