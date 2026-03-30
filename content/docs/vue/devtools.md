---
title: Vue DevTools — отладка и профилирование
description: Vue DevTools — браузерное расширение для отладки Vue-приложений. Инспекция компонентов, реактивности, Pinia, роутов, timeline и производительности.
section: vue
difficulty: beginner
readTime: 8
order: 15
tags: [Vue 3, DevTools, debugging, profiling, performance]
---

## Установка

Vue DevTools доступен в двух вариантах:

1. **Браузерное расширение** — для Chrome, Firefox, Edge
2. **Standalone-приложение** — для любой среды (Electron, мобильные браузеры)

### Vite-плагин (рекомендуется)

Для разработки с Vite — встраиваемая версия DevTools:

```bash
npm install -D vite-plugin-vue-devtools
```

```ts
// vite.config.ts
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), VueDevTools()],
})
```

Это добавляет иконку DevTools прямо на страницу — работает в любом браузере.

### Nuxt

В Nuxt DevTools встроены:

```ts
export default defineNuxtConfig({
  devtools: { enabled: true },
})
```

## Основные панели

### Components

Дерево компонентов в реальном времени:

- Иерархия всех смонтированных компонентов
- Инспекция props, emits, data, computed
- Редактирование reactive-свойств прямо в DevTools
- Поиск по имени компонента
- Переход к исходному коду (кнопка «Open in editor»)

Клик по компоненту в дереве открывает панель справа. Там можно видеть и менять значения реактивных свойств.

### Inspector (Reactivity)

Отслеживание зависимостей реактивности:

- Какие `ref` и `reactive` существуют
- Кто подписан на каждое значение
- Когда и почему происходит перерендер

### Pinia

Отдельная вкладка для Pinia-stores:

- Все stores и их текущее состояние
- History изменений — можно откатить
- Редактирование state прямо в DevTools
- Время выполнения actions

### Timeline

Хронология событий приложения:

- **Component events** — mount, update, unmount
- **Router** — навигация между роутами
- **Pinia** — mutations и actions
- **Custom events** — ваши собственные события
- **Performance** — время рендера компонентов

Таймлайн показывает, когда произошло событие, какой компонент затронут и сколько времени заняло.

### Router

Текущий маршрут, параметры, query, meta-поля. История навигации.

## Практические приёмы

### Поиск багов в реактивности

Когда компонент не обновляется:

1. Откройте панель Components
2. Выберите проблемный компонент
3. Проверьте reactive-свойства — изменилось ли значение?
4. Посмотрите Timeline — было ли событие обновления?

### Отладка Pinia

1. Откройте вкладку Pinia
2. Выберите нужный store
3. Проверьте текущее состояние
4. В Timeline видно, какой action изменил state

### Профилирование рендера

1. Перейдите на панель Timeline
2. Включите запись (кнопка Record)
3. Выполните действие (клик, навигация)
4. Остановите запись
5. Смотрите, какие компоненты перерендерились и сколько времени заняло

## Программный доступ

### devtools-хелперы в коде

```ts
// Логирование состояния компонента в DevTools
import { devtools } from 'vue'

// Кастомное событие в Timeline
if (import.meta.env.DEV) {
  // Vue DevTools plugin API
}
```

### Inspector для composables

DevTools автоматически показывает composables, использующие `effectScope`. Для кастомных composables можно добавить отладочную информацию:

```ts
export function useFeature() {
  const state = ref(0)

  if (import.meta.env.DEV) {
    // DevTools увидит этот ref в инспекторе компонента
  }

  return { state }
}
```

## Горячие клавиши

| Действие | Клавиша |
|----------|---------|
| Выбрать компонент на странице | Клик с зажатым DevTools-инспектором |
| Перейти к исходнику | «Open in editor» |
- Сбросить состояние | Pinia → кнопка «Reset» |

## Советы

- В production DevTools автоматически отключается — не нужно убирать из кода
- Используйте Vue DevTools вместе с Chrome DevTools — первый для Vue-специфики, второй для сети и DOM
- `console.log` reactive-объектов лучше заменять на инспекцию в DevTools — там объекты разворачиваются полностью
- Timeline помогает найти «залипающие» компоненты, которые перерендериваются без причины

## Итог

Vue DevTools — главный инструмент отладки Vue-приложений. Панель Components для инспекции props и state, Pinia для stores, Timeline для хронологии событий, Router для маршрутизации. Для Vite-проектов используйте `vite-plugin-vue-devtools`, для Nuxt — встроенный `devtools: { enabled: true }`.
