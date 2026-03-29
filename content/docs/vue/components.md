---
title: Компоненты Props и Emits
description: Props передают данные от родителя к ребёнку, emits — события от ребёнка к родителю. Это основа коммуникации между компонентами Vue.
section: vue
difficulty: beginner
readTime: 9
order: 5
tags: [components, props, emits, slots, Vue]
---

## Props — от родителя к ребёнку

```vue
<!-- Дочерний компонент: UserCard.vue -->
<script setup lang="ts">
interface Props {
  name: string
  age: number
  avatar?: string
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: '/default-avatar.png',
  isActive: true,
})
</script>

<template>
  <div :class="['card', { 'card--active': props.isActive }]">
    <img :src="props.avatar" :alt="props.name">
    <h3>{{ props.name }}</h3>
    <p>{{ props.age }} лет</p>
  </div>
</template>
```

```vue
<!-- Родительский компонент -->
<template>
  <UserCard
    name="Иван Иванов"
    :age="25"
    :is-active="true"
  />

  <!-- Привязка объекта как props -->
  <UserCard v-bind="user" />
</template>
```

### Правила props

- Props — **только для чтения** в дочернем компоненте
- Изменяйте локально через вычисляемое свойство или локальный ref:

```vue
<script setup>
const props = defineProps(['value'])

// ✅ Локальная копия для редактирования
const localValue = ref(props.value)
</script>
```

## Emits — от ребёнка к родителю

```vue
<!-- Дочерний компонент: BaseModal.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  close: []
  confirm: [value: string]
  'update:title': [title: string]
}>()

function handleConfirm() {
  emit('confirm', 'Подтверждено')
}
</script>

<template>
  <div class="modal">
    <button @click="$emit('close')">×</button>
    <button @click="handleConfirm">Подтвердить</button>
  </div>
</template>
```

```vue
<!-- Родитель -->
<template>
  <BaseModal
    @close="isOpen = false"
    @confirm="handleConfirm"
  />
</template>
```

## Slots — содержимое от родителя

### Обычный слот

```vue
<!-- BaseCard.vue -->
<template>
  <div class="card">
    <slot /> <!-- Сюда попадёт содержимое от родителя -->
  </div>
</template>
```

```vue
<!-- Использование -->
<BaseCard>
  <h2>Заголовок</h2>
  <p>Содержимое карточки</p>
</BaseCard>
```

### Именованные слоты

```vue
<!-- BaseLayout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">Заголовок по умолчанию</slot>
    </header>
    <main>
      <slot /> <!-- Слот по умолчанию -->
    </main>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>
```

```vue
<!-- Использование -->
<BaseLayout>
  <template #header>
    <h1>Моя страница</h1>
  </template>

  <p>Основной контент</p>

  <template #footer>
    <p>Подвал</p>
  </template>
</BaseLayout>
```

### Scoped slots — данные из дочернего в слот

```vue
<!-- DataList.vue — передаёт элемент в слот -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>
```

```vue
<!-- Родитель получает данные и решает как рендерить -->
<DataList :items="products">
  <template #default="{ item, index }">
    <span>{{ index + 1 }}. {{ item.name }} — {{ item.price }}₽</span>
  </template>
</DataList>
```

## provide / inject — передача через уровни

Для передачи данных глубоко вложенным потомкам без prop drilling:

```vue
<!-- Родитель (или корневой компонент) -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)
provide('updateTheme', (val) => { theme.value = val })
</script>
```

```vue
<!-- Любой потомок -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const updateTheme = inject('updateTheme', () => {}) // с дефолтом
</script>
```

## defineExpose — публичное API компонента

```vue
<!-- InputComponent.vue -->
<script setup>
import { ref } from 'vue'

const inputRef = ref(null)

// Только то, что явно указано — доступно снаружи
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: () => { inputRef.value.value = '' },
})
</script>
```

```vue
<!-- Родитель -->
<script setup>
const inputRef = ref(null)

function focusInput() {
  inputRef.value.focus()
}
</script>

<template>
  <InputComponent ref="inputRef" />
  <button @click="focusInput">Фокус</button>
</template>
```
