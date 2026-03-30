---
title: "Tailwind CSS: основы и подход Utility-First"
description: "Tailwind CSS — фреймворк с подходом utility-first. Основные классы Tailwind, responsive-префиксы, модификаторы состояний, кастомизация, @apply и сравнение с обычным CSS."
section: css
difficulty: beginner
readTime: 10
order: 21
tags: [Tailwind CSS, utility-first, CSS фреймворк, Tailwind классы, Tailwind основы, responsive, "@apply"]
---

## Что такое Tailwind CSS

Tailwind — CSS-фреймворк, который даёт набор утилитарных классов. Вместо того чтобы писать CSS для кнопки, вы собираете её из готовых классов прямо в HTML:

```html
<button class="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition">
  Нажми
</button>
```

Без единой строки в CSS-файле.

## Подход Utility-First

Традиционный CSS:

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
```

Utility-first:

```html
<div class="bg-white rounded-xl p-6 shadow-sm">
  <h3 class="text-xl font-bold mb-2">Заголовок</h3>
</div>
```

Каждый класс делает одну вещь. Вы комбинируете их как конструктор.

### Плюсы

- Не придумываете имена классам
- CSS-файл не растёт — каждый класс переиспользуется
- Видите стили прямо в разметке
- Проще копировать компоненты между проектами

### Минусы

- Длинные строки классов в HTML
- Кривая обучения — нужно запомнить синтаксис классов
- Без Prettier-плагина код трудно читать

## Основные классы

### Размеры и отступы

```html
<div class="p-4">          <!-- padding: 1rem -->
<div class="px-6 py-3">    <!-- padding по горизонтали и вертикали -->
<div class="m-2">          <!-- margin: 0.5rem -->
<div class="mt-4 mb-8">    <!-- margin-top и margin-bottom -->
<div class="w-full">       <!-- width: 100% -->
<div class="max-w-3xl">    <!-- max-width: 48rem -->
<div class="h-screen">     <!-- height: 100vh -->
```

Шкала отступов: `0.5` (0.125rem), `1` (0.25rem), `2` (0.5rem), `3` (0.75rem), `4` (1rem), `6` (1.5rem), `8` (2rem), `12` (3rem), `16` (4rem), `24` (6rem).

### Цвета

```html
<div class="bg-white">              <!-- background -->
<div class="bg-gray-100">           <!-- светлый серый -->
<div class="text-gray-900">         <!-- тёмный текст -->
<div class="text-indigo-500">       <!-- основной цвет -->
<div class="border-gray-200">       <!-- рамка -->
<div class="ring-2 ring-indigo-500"> <!-- обводка -->
```

Цвета: `slate`, `gray`, `zinc`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`. Оттенки: `50`–`950`.

### Типографика

```html
<p class="text-sm">         <!-- 0.875rem -->
<p class="text-base">       <!-- 1rem -->
<p class="text-lg">         <!-- 1.125rem -->
<p class="text-2xl">        <!-- 1.5rem -->
<h1 class="text-4xl">       <!-- 2.25rem -->

<p class="font-normal">     <!-- 400 -->
<p class="font-medium">     <!-- 500 -->
<p class="font-bold">       <!-- 700 -->

<p class="leading-relaxed"> <!-- line-height: 1.625 -->
<p class="tracking-tight">  <!-- letter-spacing: -0.025em -->
<p class="uppercase">       <!-- text-transform -->
```

### Flexbox и Grid

```html
<div class="flex items-center justify-between gap-4">
  <!-- display: flex; align-items: center; justify-content: space-between; gap: 1rem -->
</div>

<div class="grid grid-cols-3 gap-6">
  <!-- display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem -->
</div>

<div class="flex flex-col md:flex-row">
  <!-- колонка на мобильных, строка на десктопе -->
</div>
```

### Border-radius и shadow

```html
<div class="rounded">        <!-- 4px -->
<div class="rounded-lg">     <!-- 8px -->
<div class="rounded-xl">     <!-- 12px -->
<div class="rounded-full">   <!-- 50% (круг) -->

<div class="shadow">         <!-- маленькая -->
<div class="shadow-md">      <!-- средняя -->
<div class="shadow-lg">      <!-- большая -->
<div class="shadow-xl">      <!-- ещё больше -->
```

## Responsive-префиксы

Mobile-first — стили без префикса для мобильных, с префиксом для больших экранов:

```html
<div class="
  grid
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
```

| Префикс | Min-width |
|---------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

Пример — навигация:

```html
<nav class="flex items-center justify-between p-4">
  <a href="/" class="text-xl font-bold">Logo</a>

  <div class="hidden md:flex gap-6">
    <a href="/about">О нас</a>
    <a href="/blog">Блог</a>
    <a href="/contacts">Контакты</a>
  </div>

  <button class="md:hidden">
    <span class="text-2xl">☰</span>
  </button>
</nav>
```

На мобильных ссылки скрыты, видна кнопка-бургер. На десктопе — наоборот.

## Модификаторы состояний

### hover, focus, active

```html
<button class="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white">
  Кнопка
</button>

<input class="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none">

<a class="text-gray-600 hover:text-indigo-500 transition">
  Ссылка
</a>
```

### first, last, odd, even

```html
<ul>
  <li class="py-2 border-b last:border-b-0">Пункт</li>
  <li class="py-2 border-b last:border-b-0">Пункт</li>
  <li class="py-2 border-b last:border-b-0">Пункт</li>
</ul>

<table>
  <tr class="odd:bg-gray-50 even:bg-white">
    <td>Ячейка</td>
  </tr>
</table>
```

### group — стилизация по родителю

```html
<div class="group rounded-xl overflow-hidden shadow hover:shadow-lg transition">
  <img src="photo.jpg" class="group-hover:scale-105 transition">
  <div class="p-4">
    <h3 class="group-hover:text-indigo-500 transition">Заголовок</h3>
  </div>
</div>
```

При hover на `.group` — все дочерние элементы с `group-hover:` реагируют.

### peer — стилизация по соседу

```html
<input class="peer border border-gray-300 focus:border-indigo-500" type="text">
<label class="peer-focus:text-indigo-500 transition">Label</label>
```

### dark mode

```html
<div class="bg-white dark:bg-gray-900">
  <h2 class="text-gray-900 dark:text-white">Заголовок</h2>
  <p class="text-gray-600 dark:text-gray-400">Описание</p>
</div>
```

## Кастомизация

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f0ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
```

### Произвольные значения

Когда стандартного класса нет:

```html
<div class="top-[117px]">              <!-- произвольное значение -->
<div class="grid-cols-[1fr_2fr_1fr]">  <!-- произвольный шаблон -->
<div class="text-[#1da1f2]">           <!-- произвольный цвет -->
<p class="text-[clamp(1rem,2vw,1.5rem)]">
```

## @apply — извлечение классов в CSS

Когда HTML перегружен классами, вынесите в CSS:

```css
.btn-primary {
  @apply bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition font-medium;
}

.card {
  @apply bg-white rounded-xl shadow-sm p-6 border border-gray-100;
}
```

Не злоупотребляйте — `@apply` возвращает к подходу «один класс = куча стилей», от которого Tailwind уходит. Используйте для часто повторяющихся паттернов.

## Установка

### Через Vite

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

В CSS-файле:

```css
@import 'tailwindcss';
```

### Через Nuxt

Для Nuxt с `@nuxt/ui` Tailwind уже подключён. Для standalone:

```bash
npx nuxi module add @nuxtjs/tailwindcss
```

## Nuxt UI

Этот проект использует Nuxt UI — компонентную библиотеку поверх Tailwind. Вместо чистых утилитарных классов — готовые компоненты:

```html
<UButton label="Нажми" color="primary" />
<UInput placeholder="Введите текст" />
<UCard>
  <template #header>Заголовок</template>
  Контент карточки
</UCard>
```

Компоненты Nuxt UI принимают Tailwind-классы через проп `class` и кастомизируются через `app.config.ts`.

## Практический пример — карточка

```html
<div class="max-w-sm mx-auto">
  <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group">
    <div class="aspect-video overflow-hidden">
      <img
        src="photo.jpg"
        alt="Фото"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      >
    </div>
    <div class="p-5">
      <span class="text-xs font-medium text-indigo-500 uppercase tracking-wider">
        Категория
      </span>
      <h3 class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
        Название статьи
      </h3>
      <p class="mt-2 text-sm text-gray-600 line-clamp-2">
        Краткое описание статьи которое обрезается после двух строк
      </p>
      <div class="mt-4 flex items-center justify-between">
        <span class="text-sm text-gray-400">5 мин чтения</span>
        <span class="text-indigo-500 text-sm font-medium hover:underline">
          Читать →
        </span>
      </div>
    </div>
  </div>
</div>
```

## Когда использовать Tailwind

Подходит:
- Быстрая разработка UI без написания CSS
- Компонентный подход (React, Vue, Svelte)
- Дизайн-системы с ограниченным набором значений
- Стартапы и прототипы

Не подходит:
- Крупные проекты с выделенной командой CSS-разработчиков
- Когда нужен полный контроль над CSS-архитектурой
- Сайты с уникальным дизайном, далёким от стандартных паттернов

## Итог

- Utility-first — каждый класс делает одну вещь, вы комбинируете в HTML
- `sm:`, `md:`, `lg:` — responsive-префиксы (mobile-first)
- `hover:`, `focus:`, `dark:`, `group-hover:` — модификаторы состояний
- `tailwind.config.ts` — кастомизация цветов, шрифтов, breakpoints
- `@apply` — извлечение повторяющихся паттернов в CSS
- Произвольные значения через квадратные скобки: `top-[117px]`
