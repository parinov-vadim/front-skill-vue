---
title: Жизненный цикл компонента
description: Хуки жизненного цикла позволяют выполнять код на определённых этапах существования компонента — от создания до уничтожения.
section: vue
difficulty: intermediate
readTime: 8
order: 4
tags: [lifecycle, onMounted, onUnmounted, hooks, Vue]
---

## Этапы жизненного цикла

```
Создание компонента
      ↓
  setup() / <script setup>
      ↓
  onBeforeMount
      ↓
  Рендер + монтирование в DOM
      ↓
  onMounted ← здесь доступен DOM
      ↓
  Изменение данных → onBeforeUpdate → onUpdated
      ↓
  Размонтирование
      ↓
  onBeforeUnmount
      ↓
  onUnmounted ← очистка ресурсов
```

## Хуки Composition API

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
} from 'vue'

onBeforeMount(() => {
  console.log('DOM ещё не создан')
})

onMounted(() => {
  console.log('Компонент смонтирован, DOM доступен')
  // Здесь: работа с DOM, запросы к API, подписки
})

onBeforeUpdate(() => {
  console.log('Данные изменились, DOM ещё не обновлён')
})

onUpdated(() => {
  console.log('DOM обновлён')
  // Осторожно: не изменяйте данные здесь — бесконечный цикл!
})

onBeforeUnmount(() => {
  console.log('Компонент скоро будет удалён')
})

onUnmounted(() => {
  console.log('Компонент удалён')
  // Здесь: очистка таймеров, отписки от событий
})
</script>
```

## Практические примеры

### Запрос данных при монтировании

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/users')
    users.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>
```

### Работа с DOM-элементом

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  // Автофокус при монтировании
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" type="text" placeholder="Введите запрос">
</template>
```

### Подписка и отписка от событий

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  console.log('Размер изменился:', window.innerWidth)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Обязательно убираем слушатель, иначе утечка памяти!
  window.removeEventListener('resize', handleResize)
})
</script>
```

### Таймеры и интервалы

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    time.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
```

## Хуки в composables

Хуки жизненного цикла можно вызывать внутри composable — они привязываются к текущему экземпляру компонента:

```ts
// composables/useEventListener.ts
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}
```

```vue
<script setup>
import { useEventListener } from '@/composables/useEventListener'

useEventListener(window, 'resize', () => {
  console.log('resize')
})
</script>
```

## onErrorCaptured

Перехватывает ошибки из дочерних компонентов:

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err.message
  console.error('Ошибка в дочернем компоненте:', err, info)
  return false // Предотвратить дальнейшее всплытие
})
</script>

<template>
  <div v-if="error" class="error">{{ error }}</div>
  <slot v-else />
</template>
```

## nextTick

`nextTick` выполняет callback **после** следующего обновления DOM:

```vue
<script setup>
import { ref, nextTick } from 'vue'

const list = ref([])

async function addItem() {
  list.value.push('Новый элемент')

  // DOM ещё не обновлён
  await nextTick()
  // Теперь DOM обновлён — можно работать с ним
  const lastItem = document.querySelector('.list-item:last-child')
  lastItem?.scrollIntoView()
}
</script>
```
