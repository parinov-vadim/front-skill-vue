---
title: Транзиции и анимации во Vue
description: Transition и TransitionGroup для анимаций появления, исчезновения и перемещения элементов. CSS-классы, JavaScript-хуки, animate.css и GSAP.
section: vue
difficulty: intermediate
readTime: 12
order: 10
tags: [Vue 3, transition, animation, TransitionGroup, CSS анимации]
---

## Компонент Transition

`<Transition>` — встроенный компонент Vue для анимирования появления и исчезновения элементов:

```vue
<template>
  <button @click="show = !show">Переключить</button>
  <Transition name="fade">
    <p v-if="show">Привет, Vue!</p>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## CSS-классы транзиций

Vue автоматически добавляет 6 CSS-классов. Имя берётся из `name` (по умолчанию `v`):

```
v-enter-from    → начальное состояние появления
v-enter-active  → анимация появления
v-enter-to      → конечное состояние появления

v-leave-from    → начальное состояние исчезновения
v-leave-active  → анимация исчезновения
v-leave-to      → конечное состояние исчезновения
```

Схема:

```
Появление:  enter-from ──enter-active──→ enter-to
Исчезновение: leave-from ──leave-active──→ leave-to
```

### Fade

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

### Slide

```css
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
```

### Scale

```css
.scale-enter-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.scale-leave-active {
  transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
```

### Custom easing

```css
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

## Параметры Transition

### duration

Явное указание длительности (полезно с JS-хуками):

```vue
<Transition :duration="300">...</Transition>
<Transition :duration="{ enter: 500, leave: 200 }">...</Transition>
```

### mode

Режим переключения между элементами:

```vue
<Transition name="fade" mode="out-in">
  <ComponentA v-if="show" />
  <ComponentB v-else />
</Transition>
```

| Режим | Описание |
|-------|----------|
| `out-in` | Сначала исчезает текущий, потом появляется новый |
| `in-out` | Сначала появляется новый, потом исчезает текущий |
| (по умолчанию) | Одновременно |

### appear

Анимация при первом рендере:

```vue
<Transition name="fade" appear>
  <h1>Заголовок с анимацией при загрузке</h1>
</Transition>
```

## JavaScript-хуки

Для сложных анимаций (GSAP, Anime.js) используются JS-хуки:

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
  :css="false"
>
  <div ref="el">Контент</div>
</Transition>
```

`css="false"` отключает CSS-классы — Vue не будет их добавлять, что улучшает производительность.

Пример с GSAP:

```ts
import gsap from 'gsap'

function onEnter(el: Element, done: () => void) {
  gsap.from(el, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    onComplete: done,
  })
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    onComplete: done,
  })
}
```

Обязательно вызывайте `done()`, иначе Vue не узнает, что анимация завершена.

## TransitionGroup

`<TransitionGroup>` анимирует списки — появление, удаление и перемещение элементов:

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
      <button @click="remove(item.id)">×</button>
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-leave-active {
  position: absolute;
}
</style>
```

Класс `.list-move` анимирует перемещение элементов. `position: absolute` на `.list-leave-active` позволяет остальным элементам плавно сдвинуться.

### Flipped list (сортировка)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Item {
  id: number
  text: string
}

const items = ref<Item[]>([
  { id: 1, text: 'Банан' },
  { id: 2, text: 'Яблоко' },
  { id: 3, text: 'Вишня' },
])

function shuffle() {
  items.value = [...items.value].sort(() => Math.random() - 0.5)
}
</script>

<template>
  <button @click="shuffle">Перемешать</button>
  <TransitionGroup name="flip" tag="div" class="grid">
    <div v-for="item in items" :key="item.id" class="cell">
      {{ item.text }}
    </div>
  </TransitionGroup>
</template>

<style>
.flip-move {
  transition: transform 0.5s ease;
}
</style>
```

## Анимация маршрутов

Transition + RouterView для анимации смены страниц:

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

`:key="route.path"` заставляет Vue пересоздавать компонент при смене роута, чтобы сработала анимация.

## Reusable Transition

Wrap в компонент для переиспользования:

```vue
<!-- FadeTransition.vue -->
<script setup lang="ts">
defineProps<{ duration?: number }>()
</script>

<template>
  <Transition name="fade" :duration="duration ?? 300" mode="out-in">
    <slot />
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

```vue
<FadeTransition>
  <ComponentA v-if="show" />
</FadeTransition>
```

## Итог

`<Transition>` анимирует单个ный элемент при появлении/исчезновении через CSS-классы или JS-хуки. `<TransitionGroup>` анимирует списки с перемещением. `mode="out-in"` — стандартный паттерн для переключения компонентов. JS-хуки позволяют использовать GSAP и другие библиотеки. Оборачивайте транзиции в компоненты для переиспользования.
