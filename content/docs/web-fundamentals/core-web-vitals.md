---
title: "Core Web Vitals: LCP, FID/INP, CLS — метрики производительности"
description: "Core Web Vitals — метрики Google для оценки UX: Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift. Измерение, оптимизация и влияние на SEO."
section: web-fundamentals
difficulty: intermediate
readTime: 13
order: 13
tags: [performance, lcp, inp, cls, core-web-vitals, lighthouse, seo]
---

## Что такое Core Web Vitals

Core Web Vitals — набор метрик, которые Google использует для оценки пользовательского опыта. С 2021 года они влияют на ранжирование в поиске.

Три метрики:
- **LCP** (Largest Contentful Paint) — скорость загрузки основного контента
- **INP** (Interaction to Next Paint) — отзывчивость интерфейса (заменил FID в марте 2024)
- **CLS** (Cumulative Layout Shift) — визуальная стабильность

Хорошие значения:

| Метрика | Хорошо | Нужно улучшить | Плохо |
|---|---|---|---|
| LCP | ≤ 2.5 сек | 2.5 – 4.0 сек | > 4.0 сек |
| INP | ≤ 200 мс | 200 – 500 мс | > 500 мс |
| CLS | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

## LCP (Largest Contentful Paint)

LCP — время до загрузки самого большого видимого элемента в viewport. Это может быть:
- `<img>` или фоновое изображение
- `<video>` (poster)
- Блок текста (`<p>`, `<h1>`, `<li>`)

### Что замедляет LCP

1. **Медленный TTFB** (Time to First Byte) — сервер долго отвечает
2. **Рендер-блокирующие ресурсы** — CSS и JS в `<head>`
3. **Большие изображения** — неоптимизированные, без lazy loading
4. **Клиентский рендеринг** — SPA ждёт JS, потом данные

### Оптимизация LCP

**1. Оптимизируйте серверный ответ (TTFB < 800 мс)**

```
CDN → пользователь получает данные с ближайшего сервера
Кэширование → повторные запросы не доходят до сервера
SSR → готовый HTML вместо пустого div
```

**2. Предзагрузка критических ресурсов**

```html
<link rel="preload" as="image" href="/hero-image.webp" fetchpriority="high">
<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin>
```

`fetchpriority="high"` — подсказка браузеру загрузить в первую очередь.

**3. Оптимизация изображений**

```html
<img
  src="/hero-image.webp"
  alt="Описание"
  width="1200"
  height="630"
  fetchpriority="high"
  decoding="async"
  srcset="/hero-600.webp 600w, /hero-1200.webp 1200w"
  sizes="100vw"
/>
```

- Формат **WebP** или **AVIF** (на 25–50% меньше JPEG)
- `width` и `height` — браузер сразу выделяет место
- `fetchpriority="high"` для LCP-изображения
- `decoding="async"` — не блокирует рендеринг
- `srcset` — адаптивные размеры

**4. Inline критического CSS**

```html
<head>
  <style>
    /* Стили для первого экрана — inline */
    .hero { min-height: 100vh; background: #6366f1; }
    .hero h1 { font-size: 3rem; color: white; }
  </style>
</head>
```

**5. Не ленивьте LCP-изображение**

```html
<img src="/hero.webp" />                    <!-- Ок -->
<img src="/hero.webp" loading="lazy" />     <!-- ПЛОХО для LCP-изображения! -->
```

`loading="lazy"` откладывает загрузку. Для LCP-изображения — наоборот, нужна предзагрузка.

## INP (Interaction to Next Paint)

INP (заменил FID в марте 2024) — время от первого взаимодействия (клик, ввод, нажатие клавиши) до следующего кадра отрисовки. Измеряет **худший** интерактивный отклик за время жизни страницы.

INP оценивает весь период взаимодействия, не только первое. Окончательная оценка — 98-й перцентиль всех взаимодействий.

### Что замедляет INP

1. **Долгие JavaScript-задачи** (> 50 мс блокируют основной поток)
2. **Сложные обработчики событий**
3. **Принудительные Layout** (чтение offsetWidth после записи стилей)
4. **Слишком частые re-render'ы** (React, Vue)

### Оптимизация INP

**1. Разбивайте длинные задачи**

```ts
// Плохо: одна задача на 200 мс
function processItems(items: Item[]) {
  items.forEach((item) => {
    heavyProcessing(item)
  })
}

// Хорошо: разбиваем на чанки
function processItems(items: Item[]) {
  const CHUNK_SIZE = 50
  let index = 0

  function processChunk() {
    const start = performance.now()
    while (index < items.length && performance.now() - start < 50) {
      heavyProcessing(items[index])
      index++
    }
    if (index < items.length) {
      requestAnimationFrame(processChunk)
    }
  }

  processChunk()
}
```

Или используйте `scheduler.yield()` (новый API):

```ts
async function processItems(items: Item[]) {
  for (const item of items) {
    heavyProcessing(item)
    await scheduler.yield()           // Отдаёт управление браузеру
  }
}
```

**2. Используйте Web Workers для тяжёлых вычислений**

```ts
const worker = new Worker('heavy-task.js')
worker.postMessage({ data: largeDataSet })
worker.onmessage = (event) => {
  // Результат получен, основной поток свободен
}
```

**3. Debounce и throttle для обработчиков**

```ts
function debounce(fn: Function, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const handleSearch = debounce((query: string) => {
  fetchResults(query)
}, 300)

input.addEventListener('input', (e) => handleSearch(e.target.value))
```

**4. Оптимизируйте re-render**

```vue
<script setup lang="ts">
const items = ref([])

// Плохо: перерендер всего списка при любом изменении
const filteredItems = computed(() => items.value.filter(...))

// Хорошо: v-memo для стабильных элементов
</script>

<template>
  <div v-for="item in items" :key="item.id" v-memo="[item.selected]">
    {{ item.name }}
  </div>
</template>
```

**5. Избегайте forced layout**

```ts
// Плохо: чтение после записи = forced layout
element.style.width = '100px'           // Запись
const h = element.offsetHeight           // Чтение → forced layout!
element.style.height = h + 'px'          // Запись

// Хорошо: чтение до записи
const h = element.offsetHeight           // Чтение
element.style.width = '100px'            // Запись
element.style.height = h + 'px'          // Запись
```

## CLS (Cumulative Layout Shift)

CLS — сумма неожиданных сдвигов элементов на странице. Когда контент прыгает во время загрузки — это плохой UX.

```
Пользователь собирается кликнуть на кнопку
→ Баннер загрузился, контент сдвинулся
→ Пользователь кликнул не туда
→ Это CLS
```

### Что вызывает CLS

1. **Изображения и видео без размеров** — браузер не знает размер, контент прыгает после загрузки
2. **Динамически вставляемый контент** — реклама, баннеры
3. **Веб-шрифты** — текст перерисовывается при загрузке шрифта (FOIT/FOUT)
4. **Асинхронные данные** — API-ответ сдвигает контент

### Оптимизация CLS

**1. Всегда указывайте размеры изображений**

```html
<img src="photo.webp" width="800" height="600" alt="Фото">
```

Или `aspect-ratio`:
```css
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

**2. Резервируйте место для динамического контента**

```css
.ad-slot {
  min-height: 250px;          /* Заранее занимаем место */
}

.skeleton {
  min-height: 200px;          /* Placeholder пока грузятся данные */
  background: #f0f0f0;
  animation: pulse 1.5s infinite;
}
```

**3. font-display для шрифтов**

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;         /* Показывать системный шрифт, потом поменять */
}
```

`font-display: swap` — текст сразу виден (системный шрифт), при загрузке шрифта — плавная замена.

Но swap может вызвать сдвиг (FOUT). Решение: `size-adjust` в `@font-face`:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 105%;
}
```

Значения подбираются так, чтобы системный шрифт и веб-шрифт были одного размера.

**4. Transform вместо top/left для анимаций**

```css
.bad {
  animation: slide-bad 0.3s;
}
@keyframes slide-bad {
  from { top: 0; }           /* Layout Shift */
  to { top: 100px; }
}

.good {
  animation: slide-good 0.3s;
}
@keyframes slide-good {
  from { transform: translateY(0); }    /* Нет Layout Shift */
  to { transform: translateY(100px); }
}
```

## Измерение

### Lighthouse

Chrome DevTools → Lighthouse → Performance. Оценки 0–100 по каждой метрике.

### Chrome DevTools → Performance

Запишите взаимодействие и посмотрите:
- Длинные задачи (красные блоки в Main thread)
- Layout Shifts (в Experience row)
- LCP элемент (в Timings)

### PageSpeed Insights

https://pagespeed.web.dev — введите URL, получите отчёт с реальными данными Chrome UX Report (Field Data) и лабораторными данными (Lab Data).

### web-vitals (библиотека)

```bash
npm install web-vitals
```

```ts
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP((metric) => {
  console.log('LCP:', metric.value, metric.rating)     // 1234.56, 'good'
})

onINP((metric) => {
  console.log('INP:', metric.value, metric.rating)     // 89.12, 'good'
})

onCLS((metric) => {
  console.log('CLS:', metric.value, metric.rating)     // 0.05, 'good'
})
```

Отправка в аналитику:

```ts
import { onLCP, onINP, onCLS } from 'web-vitals'

function sendToAnalytics(metric: { name: string; value: number; rating: string }) {
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      path: location.pathname,
    }),
  })
}

onLCP(sendToAnalytics)
onINP(sendToAnalytics)
onCLS(sendToAnalytics)
```

### Search Console

Google Search Console → Core Web Vitals — реальные данные для всех страниц сайта из Chrome UX Report.

## Nuxt и Core Web Vitals

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    inlineSSRStyles: false,     // Уменьшить HTML-размер
  },
  routeRules: {
    '/': { prerender: true },   // SSG для главной
  },
  image: {
    formats: ['webp', 'avif'],  // Авто-оптимизация изображений
  },
})
```

`<NuxtImg>` автоматически оптимизирует изображения:
```vue
<NuxtImg src="/hero.jpg" width="1200" height="630" format="webp" />
```

## Итог

- **Core Web Vitals** влияют на SEO и UX: LCP, INP, CLS
- **LCP** < 2.5 сек — оптимизируйте сервер, изображения, критический CSS
- **INP** < 200 мс — не блокируйте основной поток, разбивайте задачи
- **CLS** < 0.1 — указывайте размеры изображений, резервируйте место для контента
- Используйте `web-vitals` для мониторинга в production
- Lighthouse и PageSpeed Insights для лабораторных измерений
- `font-display: swap` для шрифтов, `transform` для анимаций
