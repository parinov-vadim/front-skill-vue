---
title: Composition API
description: Composition API — современный способ организации логики во Vue 3. Позволяет группировать связанный код и переиспользовать логику через composables.
section: vue
difficulty: beginner
readTime: 10
order: 1
tags: [Vue 3, Composition API, setup, script setup]
---

## Зачем нужен Composition API?

**Options API** (Vue 2) распределяет код по опциям: `data`, `methods`, `computed`, `watch`. При росте компонента связанная логика разбросана по всему файлу.

**Composition API** позволяет группировать **логически связанный код** вместе и выносить его в переиспользуемые функции.

```vue
<!-- Options API -->
<script>
export default {
  data() {
    return { count: 0, name: '' }
  },
  methods: {
    increment() { this.count++ }
  },
  computed: {
    doubled() { return this.count * 2 }
  }
}
</script>

<!-- Composition API с <script setup> -->
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const name = ref('')
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

## `<script setup>`

`<script setup>` — компактный синтаксис для Composition API. Всё объявленное в нём автоматически доступно в шаблоне.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Реактивные данные
const message = ref('Привет!')
const count = ref(0)

// Вычисляемое свойство
const upperMessage = computed(() => message.value.toUpperCase())

// Метод
function increment() {
  count.value++
}

// Хук жизненного цикла
onMounted(() => {
  console.log('Компонент смонтирован')
})
</script>

<template>
  <h1>{{ upperMessage }}</h1>
  <p>Счётчик: {{ count }}</p>
  <button @click="increment">+</button>
</template>
```

## ref и reactive

### ref — для примитивов и объектов

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const name = ref('Иван')
const user = ref({ age: 25, role: 'admin' })

// Доступ через .value в скрипте
console.log(count.value)     // 0
count.value = 5

// В шаблоне .value не нужен
// {{ count }} → 5
// {{ user.role }} → 'admin'
</script>
```

### reactive — для объектов

```vue
<script setup>
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Иван',
  items: [],
})

// Доступ без .value
state.count++
state.items.push('Новый элемент')
</script>
```

**Когда что использовать:**
- `ref` — для примитивов, удобен при деструктуризации
- `reactive` — для связанных данных, нет `.value`, но нельзя деструктурировать

## computed

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('Иван')
const lastName = ref('Иванов')

// Только чтение
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Чтение и запись
const editableName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    const [first, ...rest] = val.split(' ')
    firstName.value = first
    lastName.value = rest.join(' ')
  },
})

editableName.value = 'Пётр Петров'
// firstName.value → 'Пётр'
// lastName.value → 'Петров'
</script>
```

## watch и watchEffect

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const query = ref('')
const results = ref([])

// watch — явное указание источника
watch(query, async (newVal, oldVal) => {
  if (newVal.length > 2) {
    results.value = await search(newVal)
  }
}, { immediate: true, deep: false })

// watchEffect — автоматическое отслеживание зависимостей
watchEffect(async () => {
  if (query.value.length > 2) {
    results.value = await search(query.value)
  }
})
</script>
```

## Composables — переиспользование логики

Composable — функция, использующая Composition API. Заменяет миксины Vue 2.

```ts
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const isNegative = computed(() => count.value < 0)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = initial }

  return { count, isNegative, increment, decrement, reset }
}
```

```vue
<!-- В компоненте -->
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment, decrement } = useCounter(10)
</script>

<template>
  <button @click="decrement">-</button>
  <span>{{ count }}</span>
  <button @click="increment">+</button>
</template>
```

## Props и Emits

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

const emit = defineEmits<{
  update: [value: number]
  close: []
}>()

function handleClick() {
  emit('update', props.count + 1)
}
</script>
```
