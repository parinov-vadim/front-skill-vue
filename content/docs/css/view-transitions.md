---
title: "View Transitions API: плавные переходы между страницами"
description: "View Transitions API — анимации переходов между страницами и элементами, cross-document transitions, ::view-transition-old/new, snapshot и кастомизация переходов в CSS."
section: css
difficulty: intermediate
readTime: 8
order: 17
tags: [View Transitions, переходы между страницами, page transitions, анимация перехода, snapshot, CSS]
---

## Что такое View Transitions

View Transitions API позволяет создать плавную анимацию при переходе между страницами или смене состояния — без JavaScript-библиотек. Браузер делает «снимок» текущего состояния, применяет новое, и анимирует переход между ними.

## Простейший переход (SPA)

Для одностраничных приложений — вызовите `startViewTransition` при смене контента:

```js
document.startViewTransition(() => {
  updateContent()
})
```

Этого хватит, чтобы браузер сделал плавное затухание (cross-fade) между старым и новым состоянием.

## Включение для MPA (многостраничных сайтов)

Для переходов между **разными HTML-страницами** добавьте meta-тег:

```html
<meta name="view-transition" content="same-origin">
```

И опционально CSS-правило:

```css
@view-transition {
  navigation: auto;
}
```

Теперь обычные переходы по ссылкам `<a href="about.html">` будут анимироваться через cross-fade.

## Псевдоэлементы перехода

Браузер создаёт снимки старого и нового состояний. Ими можно управлять через псевдоэлементы:

```css
::view-transition-old(root) {
  animation: fade-out 0.3s ease;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

По умолчанию — cross-fade 250ms. Можно менять длительность и кривую:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Именованные переходы для отдельных элементов

Чтобы анимировать не всю страницу, а конкретный элемент — задайте `view-transition-name`:

```css
.hero-image {
  view-transition-name: hero;
}

.page-title {
  view-transition-name: title;
}
```

Теперь эти элементы будут иметь собственные переходы:

```css
::view-transition-old(hero),
::view-transition-new(hero) {
  animation-duration: 0.4s;
}

::view-transition-old(title),
::view-transition-new(title) {
  animation-duration: 0.3s;
}
```

Имя уникально — на странице не может быть двух элементов с одинаковым `view-transition-name`. Если нужно анимировать элементы списка, используйте JS для установки уникальных имён:

```js
document.querySelectorAll('.card').forEach((card, i) => {
  card.style.viewTransitionName = `card-${i}`
})
```

## Exclude: исключение элементов из перехода

Не все элементы должны участвовать в анимации — хедер, футер, сайдбар:

```css
header,
footer,
.sidebar {
  view-transition-name: none;
}
```

Элементы с `none` просто появляются мгновенно, без transition.

## Анимация morph (Shared Element Transition)

Если на обеих страницах есть элемент с одинаковым `view-transition-name`, браузер **морфирует** его — плавно меняет позицию, размер и форму:

```css
.card-image {
  view-transition-name: product-image;
}
```

При переходе со страницы каталога на карточку товара изображение «перелетит» из списка в нужную позицию. Браузер сам рассчитает разницу координат и размеров.

## Кастомизация с JS

Полный контроль через `startViewTransition`:

```js
const transition = document.startViewTransition(async () => {
  await updateDOM()
})

transition.ready.then(() => {
  document.documentElement.animate(
    [
      { clipPath: 'circle(0% at 50% 50%)' },
      { clipPath: 'circle(100% at 50% 50%)' }
    ],
    {
      duration: 500,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)'
    }
  )
})
```

Раскрытие кругом от центра — популярный эффект для модальных окон и переходов.

### Раскрытие от точки клика

```js
button.addEventListener('click', (e) => {
  const x = e.clientX
  const y = e.clientY
  const endRadius = Math.hypot(
    window.innerWidth - x,
    window.innerHeight - y
  )

  const transition = document.startViewTransition(() => {
    updateContent()
  })

  transition.ready.then(() => {
    document.documentElement.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `${endRadius}px at ${x}px ${y}px` }
      ],
      {
        duration: 400,
        easing: 'ease-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  })
})
```

## Nuxt / Vue

В Nuxt-проекте view transitions включаются через конфиг:

```ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'view-transition', content: 'same-origin' }
      ]
    }
  }
})
```

Или программно в плагине:

```ts
export default defineNuxtPlugin(() => {
  useRouter().afterEach(() => {
    if (!document.startViewTransition) return

    document.startViewTransition(async () => {
      await nextTick()
    })
  })
})
```

## Поддержка

- Chrome 111+, Edge 111+ — полная поддержка
- Firefox 126+ — полная поддержка
- Safari 18+ — частичная (SPA-переходы)
- MPA-переходы (между страницами) — Chrome/Edge, Firefox

Для проверки:

```js
if (document.startViewTransition) {
  document.startViewTransition(() => updateDOM())
} else {
  updateDOM()
}
```

## Практические паттерны

### Cross-fade страниц

```css
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: 0.25s ease both fade-and-scale-down;
}

::view-transition-new(root) {
  animation: 0.25s ease both fade-and-scale-up;
}

@keyframes fade-and-scale-down {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes fade-and-scale-up {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
}
```

### Перелёт логотипа

```css
.logo {
  view-transition-name: logo;
}

::view-transition-old(logo),
::view-transition-new(logo) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Слайд галереи

```css
.gallery-image {
  view-transition-name: gallery-main;
}

::view-transition-old(gallery-main) {
  animation: slide-out-left 0.3s ease forwards;
}

::view-transition-new(gallery-main) {
  animation: slide-in-right 0.3s ease forwards;
}

@keyframes slide-out-left {
  to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
}
```

## Итог

- `document.startViewTransition()` — запуск перехода для SPA
- `<meta name="view-transition">` — переходы между страницами (MPA)
- `view-transition-name` — именованные переходы для отдельных элементов
- Morph-эффект при одинаковом имени на двух страницах
- `::view-transition-old/new` — кастомизация анимации через CSS
- Проверяйте поддержку через `if (document.startViewTransition)`
