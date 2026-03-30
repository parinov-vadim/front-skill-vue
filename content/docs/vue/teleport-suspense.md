---
title: Teleport и Suspense во Vue 3
description: Teleport — рендеринг контента за пределами DOM-иерархии компонента. Suspense — координация асинхронных компонентов и загрузочных состояний.
section: vue
difficulty: intermediate
readTime: 10
order: 11
tags: [Vue 3, Teleport, Suspense, async components, portal]
---

## Teleport

### Что такое Teleport

`<Teleport>` рендерит содержимое в указанный DOM-узел, оставаясь при этом в контексте текущего компонента. Это похоже на «портал» — визуально контент в другом месте, но логически он остаётся частью родителя.

```vue
<template>
  <button @click="show = true">Открыть модалку</button>

  <Teleport to="body">
    <div v-if="show" class="modal">
      <h2>Модальное окно</h2>
      <p>Этот div отрендерен внутри body</p>
      <button @click="show = false">Закрыть</button>
    </div>
  </Teleport>
</template>
```

`to` — CSS-селектор или DOM-элемент, куда телепортировать контент. Содержимое Teleport сохраняет доступ к данным и событиям родительского компонента.

### Когда использовать Teleport

- Модальные окна — чтобы избежать проблем с `overflow: hidden` и `z-index`
- Тосты и уведомления — единый контейнер поверх всего
- Dropdown-меню — когда родитель ограничен `overflow`
- Fullscreen-оверлеи

### Кнопка- Телепорт в существующий контейнер

```vue
<template>
  <Teleport to="#modals">
    <div class="modal">
      <slot />
    </div>
  </Teleport>
</template>
```

В `App.vue`:

```vue
<template>
  <div id="app">
    <RouterView />
  </div>
  <div id="modals"></div>
</template>
```

### Conditional Teleport

`disabled` отключает телепорт — контент рендерится на месте:

```vue
<Teleport to="body" :disabled="isMobile">
  <Modal>Контент</Modal>
</Teleport>
```

На мобильных модалка рендерится внутри родителя, на десктопе — в body.

### Несколько Teleport

Несколько `<Teleport>` в один `to` — содержимое добавляется в порядке рендера:

```vue
<Teleport to="#toasts">
  <Toast>Первый</Toast>
</Teleport>

<Teleport to="#toasts">
  <Toast>Второй</Toast>
</Teleport>
```

### Практический пример — Modal

```vue
<!-- components/BaseModal.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <button class="modal-close" @click="close">×</button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
```

## Suspense

### Что такое Suspense

`<Suspense>` управляет загрузочным состоянием для асинхронных компонентов. Показывает `#fallback` пока компонент загружается, и `#default` когда готов.

### Асинхронный setup

Компонент с `async setup`:

```vue
<!-- AsyncComponent.vue -->
<script setup lang="ts">
const data = await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>{{ data.title }}</div>
</template>
```

Родитель:

```vue
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <div>Загрузка...</div>
  </template>
</Suspense>
```

### События Suspense

```vue
<Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Spinner />
  </template>
</Suspense>
```

| Событие | Когда вызывается |
|---------|-----------------|
| `pending` | Асинхронная операция началась |
| `resolve` | Асинхронная операция завершилась |
| `fallback` | Показан fallback-слот |

### Suspense + async defineAsyncComponent

```ts
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))
```

```vue
<Suspense>
  <template #default>
    <HeavyChart />
  </template>
  <template #fallback>
    <div class="skeleton">Загрузка графика...</div>
  </template>
</Suspense>
```

### Suspense + несколько компонентов

Suspense ждёт все вложенные async-компоненты:

```vue
<Suspense>
  <template #default>
    <UserHeader />
    <UserPosts />
    <UserStats />
  </template>
  <template #fallback>
    <PageSkeleton />
  </template>
</Suspense>
```

Все три компонента могут быть асинхронными — Suspense покажет контент, когда загрузятся все.

### Suspense с error handling

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})
</script>

<template>
  <div v-if="error" class="error">
    Ошибка: {{ error.message }}
    <button @click="error = null">Повторить</button>
  </div>
  <Suspense v-else>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <Spinner />
    </template>
  </Suspense>
</template>
```

### Suspense в Nuxt

Nuxt использует Suspense автоматически. `useAsyncData` и `useFetch` работают с Suspense:

```vue
<script setup lang="ts">
const { data: users } = await useFetch<User[]>('/api/users')
</script>
```

Nuxt покажит loading-состояние (из `app.vue`) пока данные загружаются.

## Итог

`<Teleport>` рендерит контент в указанный DOM-узел — идеально для модалок, тостов и оверлеев. Контент остаётся в контексте родительского компонента. `<Suspense>` управляет загрузочными состояниями для асинхронных компонентов — показывает fallback пока ждёт, и основной контент когда всё загружено. В Nuxt Suspense встроен в архитектуру.
