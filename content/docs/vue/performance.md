---
title: Оптимизация производительности Vue
description: Профилирование и оптимизация Vue-приложений — keep-alive, v-memo, v-once, lazy components, виртуальный скроллинг, уменьшение бандла и другие техники.
section: vue
difficulty: advanced
readTime: 12
order: 17
tags: [Vue 3, performance, optimization, keep-alive, v-memo, lazy loading]
---

## Подход к оптимизации

Не оптимизируйте заранее. Сначала измерьте, потом оптимизируйте. Vue DevTools Timeline и Chrome DevTools Performance — основные инструменты профилирования.

## KeepAlive

`<KeepAlive>` кэширует экземпляры компонентов вместо уничтожения:

```vue
<KeepAlive>
  <component :is="currentTab" />
</KeepAlive>
```

Без `KeepAlive` при переключении табов данные (введённый текст, прокрутка) теряются, а при возврате компонент создаётся заново.

Ограничьте количество кэшированных компонентов:

```vue
<KeepAlive :max="5">
  <component :is="currentTab" />
</KeepAlive>
```

Не оборачивайте в `KeepAlive` компоненты с тяжёлым `onActivated` — они будут обновляться при каждом показе.

## v-memo

`v-memo` запоминает результат рендера и обновляет его только при изменении зависимостей:

```vue
<div v-for="item in items" :key="item.id" v-memo="[item.selected]">
  <ExpensiveComponent :data="item" />
</div>
```

Компонент перерендерится только если `item.selected` изменится. Остальные обновления `item` проигнорируются.

Практический пример — большая таблица:

```vue
<tr v-for="row in rows" :key="row.id" v-memo="[row.status]">
  <td>{{ row.name }}</td>
  <td>{{ row.email }}</td>
  <td><StatusBadge :status="row.status" /></td>
</tr>
```

Если `row.name` или `row.email` изменились, но `row.status` нет — строка не перерендерится.

## v-once

`v-once` рендерит элемент один раз и больше не обновляет:

```vue
<h1 v-once>{{ title }}</h1>
<p>Это обновляется: {{ count }}</p>
```

Полезно для статического контента, который не меняется после первого рендера:

```vue
<div v-once>
  <MarkdownContent :source="readme" />
</div>
```

## Ленивая загрузка компонентов

### defineAsyncComponent

```ts
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))
```

### Lazy в роутах

```ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
]
```

Критичные для первого экрана компоненты загружайте eagerly, остальные — lazily.

## Виртуальный скроллинг

Для длинных списков (1000+ элементов) рендерить только видимые:

```bash
npm install vue-virtual-scroller
```

```vue
<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>

<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.name }}</div>
  </RecycleScroller>
</template>
```

Альтернативы: `@tanstack/vue-virtual`, `vue3-virtual-scroll-list`.

## Уменьшение реактивных данных

Не делайте реактивным то, что не меняется:

```ts
// Плохо — массив в 10000 элементов становится реактивным
const items = ref(largeArray)

// Хорошо — статические данные без реактивности
const items = largeArray

// Хорошо — реактивна только ссылка на массив
const items = shallowRef(largeArray)
```

`shallowRef` отслеживает только изменение самой ссылки, не содержимого:

```ts
const items = shallowRef<Item[]>([])

// Обновление — создаём новый массив
items.value = [...items.value, newItem]
```

## shallowRef и shallowReactive

Для больших объектов и массивов:

```ts
// Полная реактивность — Vue отслеживает каждое свойство
const state = reactive({ ... })

// Поверхностная — отслеживается только корневой уровень
const state = shallowReactive({ ... })
```

```ts
const form = shallowReactive({
  name: '',
  email: '',
  address: {
    city: '',
    street: '',
  },
})
// form.name — реактивно
// form.address.city — НЕ реактивно
```

## Computed vs Methods

`computed` кэшируется. Используйте его для производных данных:

```ts
const filtered = computed(() =>
  items.value.filter(item => item.active)
)
```

Если результат зависит только от реактивных данных — `computed`. Если от аргументов — функция.

## Debounce watcher

Тяжёлые операции в `watch` — debounce:

```ts
watch(searchQuery, () => {
  // Не делайте так — запрос на каждый символ
  fetchResults(searchQuery.value)
})
```

```ts
let timeout: ReturnType<typeof setTimeout>

watch(searchQuery, (query) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    fetchResults(query)
  }, 300)
})
```

Или composable:

```ts
watchDebounced(searchQuery, (query) => {
  fetchResults(query)
}, { debounce: 300 })
```

## Разделение бандла

### Code splitting по роутам

Каждый роут — отдельный чанк:

```ts
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/admin', component: () => import('@/views/AdminView.vue') },
  { path: '/settings', component: () => import('@/views/SettingsView.vue') },
]
```

### Динамический import по условию

```ts
if (featureFlags.value.chartEnabled) {
  const { Chart } = await import('./components/Chart.vue')
}
```

### Tree-shaking

Импортируйте только нужное:

```ts
// Плохо — вся библиотека
import _ from 'lodash'

// Хорошо — только нужная функция
import debounce from 'lodash/debounce'
```

## Анализ бандла

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: true, gzipSize: true }),
  ],
})
```

После `npm run build` откроется страница с визуализацией бандла — видно, какие модули занимают больше всего места.

## Избегание ненужных обновлений

### v-if vs v-show

- `v-if` — полностью удаляет/создаёт элемент. Дороже переключение, дешевле начальный рендер
- `v-show` — всегда рендерит, переключает `display`. Дешевле переключение, дороже начальный рендер

Для частых переключений — `v-show`. Для редких — `v-if`.

### Стабильные ключи

```vue
<div v-for="item in items" :key="item.id">  <!-- Хорошо: стабильный id -->
<div v-for="item in items" :key="index">    <!-- Плохо: index меняется -->
```

Нестабильный ключ заставляет Vue пересоздавать элементы вместо перемещения.

## Итог

Оптимизация Vue: `KeepAlive` для кэширования компонентов, `v-memo` для пропуска перерендеров, `shallowRef` для больших данных, lazy loading и code splitting для уменьшения начального бандла, виртуальный скроллинг для длинных списков. Измеряйте перед оптимизацией — DevTools Timeline и bundle analyzer покажут, где реальные узкие места.
