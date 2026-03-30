---
title: "Как браузер рендерит страницу: парсинг, DOM, CSSOM, paint, composite"
description: "Как браузер превращает HTML, CSS и JavaScript в пиксели на экране. Парсинг, DOM, CSSOM, Render Tree, Layout, Paint, Composite и оптимизация рендеринга."
section: web-fundamentals
difficulty: intermediate
readTime: 14
order: 8
tags: [browser, rendering, dom, cssom, layout, paint, performance]
---

## Зачем знать, как работает рендеринг

Понимание рендеринга помогает:
- Оптимизировать производительность — что замедляет отрисовку
- Отвечать на собеседованиях — частый вопрос
- Понимать, почему CSS в `<head>`, а JS перед `</body>`
- Разбираться с Layout Shift и jank

## Полный пайплайн рендеринга

```
HTML + CSS + JS
    │
    ▼
1. Парсинг HTML → DOM
    │
    ▼
2. Парсинг CSS → CSSOM
    │
    ▼
3. JavaScript (может менять DOM и CSSOM)
    │
    ▼
4. Render Tree (DOM + CSSOM)
    │
    ▼
5. Layout (вычисление геометрии)
    │
    ▼
6. Paint (заливка пикселей)
    │
    ▼
7. Composite (компоновка слоёв)
    │
    ▼
Пиксели на экране
```

## 1. Парсинг HTML → DOM

Браузер читает HTML-код и строит **DOM** (Document Object Model) — дерево объектов, представляющее структуру документа.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Мой сайт</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Привет</h1>
    <nav><a href="/">Главная</a></nav>
  </header>
  <main>
    <p>Текст</p>
  </main>
  <script src="app.js"></script>
</body>
</html>
```

DOM-дерево:
```
Document
└── html
    ├── head
    │   ├── title → "Мой сайт"
    │   └── link (stylesheet)
    └── body
        ├── header
        │   ├── h1 → "Привет"
        │   └── nav
        │       └── a → "Главная"
        ├── main
        │   └── p → "Текст"
        └── script (app.js)
```

### Блокирующие ресурсы

- **CSS** (`<link>`) — блокирует рендеринг (браузер не рисует без стилей)
- **JS** (`<script>`) — блокирует парсинг HTML (браузер останавливает и выполняет скрипт)

Почему CSS в `<head>`, а JS перед `</body>`:
- CSS загружается раньше, рендеринг не откладывается
- JS не блокирует парсинг остального HTML

### async и defer

```html
<!-- Загружается параллельно, выполняется сразу после загрузки -->
<script src="analytics.js" async></script>

<!-- Загружается параллельно, выполняется после парсинга HTML -->
<script src="app.js" defer></script>
```

| Атрибут | Загрузка | Выполнение | Порядок |
|---|---|---|---|
| (без атрибута) | Блокирует | Сразу | В порядке |
| `async` | Параллельно | После загрузки | Кто загрузился первым |
| `defer` | Параллельно | После DOMContentLoaded | В порядке |

Рекомендация: `defer` для основных скриптов, `async` для независимых (аналитика).

## 2. Парсинг CSS → CSSOM

Браузер парсит CSS и строит **CSSOM** (CSS Object Model) — дерево стилей.

```css
body { font-size: 16px; }
h1 { font-size: 2em; color: #333; }
p { line-height: 1.5; }
.hidden { display: none; }
```

CSSOM-дерево:
```
body  { font-size: 16px }
├── h1  { font-size: 32px; color: #333 }
├── p  { line-height: 1.5 }
└── .hidden  { display: none }
```

### Каскад

CSSOM применяет стили в порядке приоритета:
1. User Agent (стили браузера)
2. User (пользовательские)
3. Author (ваши стили)
4. `!important` (автор)
5. `!important` (пользователь)
6. `!important` (user agent)

Внутри author-стилей: inline > id > class > element.

## 3. JavaScript

JavaScript может менять и DOM, и CSSOM:

```ts
// Изменение DOM
document.querySelector('h1').textContent = 'Новый заголовок'

// Изменение стилей
document.querySelector('h1').style.color = 'red'

// Добавление элемента
const p = document.createElement('p')
p.textContent = 'Новый абзац'
document.body.appendChild(p)
```

Вот почему `<script>` блокирует парсинг — браузер должен выполнить JS, потому что тот может изменить DOM. Если бы браузер продолжал парсить HTML, потом пришлось бы перестраивать DOM.

## 4. Render Tree

**Render Tree** — комбинация DOM и CSSOM. Содержит только **видимые** элементы.

```
DOM:                                 Render Tree:
html                                 html
├── head (не видимый)                └── body
└── body                               ├── header
    ├── header                           │   ├── h1 "Привет" (font: 32px, color: #333)
    │   ├── h1 "Привет"                  │   └── nav → a "Главная"
    │   └── nav → a "Главная"            └── main
    ├── main                               └── p "Текст" (font: 16px, line-height: 1.5)
    │   └── p "Текст"
    └── p.hidden "Скрыто"              ← .hidden { display: none } → НЕ входит в Render Tree!
```

`display: none` — элемент не попадает в Render Tree (не занимает места, не рендерится).
`visibility: hidden` — элемент в Render Tree (занимает место, но невидим).

## 5. Layout (Reflow)

Layout — вычисление геометрии: размеры и позиция каждого элемента.

Браузер отвечает на вопросы:
- Какая ширина и высота у элемента?
- Где он расположен (x, y)?
- Как текст переносится на строки?

```
Layout:
  body:    x=0, y=0, width=1440, height=900
  header:  x=0, y=0, width=1440, height=60
  h1:      x=40, y=16, width=200, height=32
  p:       x=40, y=80, width=1360, height=48
```

### Что вызывает Layout (Reflow)

Любое изменение геометрии:
- Изменение `width`, `height`, `margin`, `padding`
- Добавление/удаление элементов
- Изменение `font-size`
- Изменение `display`
- `window.resize`
- Чтение `offsetWidth`, `scrollTop` и подобных

Layout — дорогая операция. Особенно на мобильных устройствах.

### Оптимизация: batch-изменения

Плохо:
```ts
elements.forEach((el) => {
  el.style.width = '100px'     // Layout
  const h = el.offsetHeight    // Layout (вынужденный)
  el.style.height = h + 'px'   // Layout
})
```

Хорошо:
```ts
const heights = elements.map((el) => el.offsetHeight) // Один Layout
elements.forEach((el, i) => {
  el.style.width = '100px'
  el.style.height = heights[i] + 'px'
})                                                      // Один Layout
```

## 6. Paint (Repaint)

Paint — заливка пикселей: цвета, фоны, границы, тени, текст.

```
Paint:
  body:    background: #ffffff
  header:  background: #6366f1
  h1:      color: #333333, font: 32px Inter Bold
  p:       color: #666666, font: 16px Inter Regular
```

### Что вызывает Repaint

- `color`, `background-color`
- `visibility`
- `box-shadow`, `text-shadow`
- `border-color`, `outline`

Repaint дешевле Layout, но всё равно затратен при больших площадях.

## 7. Composite

Composite — объединение слоёв в финальное изображение. Браузер может создать отдельные слои для:
- Элементов с `transform`
- Элементов с `opacity` (анимированных)
- `<video>`, `<canvas>`, WebGL
- Элементов с `will-change`
- Элементов с `position: fixed`

Composite не вызывает Layout и Paint — самый дешёвый этап.

### Почему transform и opacity для анимаций

```css
.bad {
  animation: move-bad 1s;
}
@keyframes move-bad {
  from { left: 0; top: 0; }
  to { left: 100px; top: 100px; }
}
/* Каждый кадр: Layout → Paint → Composite */

.good {
  animation: move-good 1s;
}
@keyframes move-good {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 100px); }
}
/* Каждый кадр: Composite только */
```

`left/top` → Layout → Paint → Composite (медленно)
`transform` → Composite только (быстро, GPU-ускорено)

### will-change

```css
.card:hover {
  will-change: transform;
}
.card.active {
  transform: scale(1.05);
}
```

`will-change` подсказывает браузеру создать отдельный слой заранее. Не злоупотребляйте — каждый слой занимает память.

## Визуализация пайплайна

```
JavaScript → Style → Layout → Paint → Composite

CSS-свойство    | Layout | Paint | Composite
────────────────|────────|-------|----------
width/height    |   ✓    |   ✓   |    ✓
margin/padding  |   ✓    |   ✓   |    ✓
color           |        |   ✓   |    ✓
background      |        |   ✓   |    ✓
box-shadow      |        |   ✓   |    ✓
transform       |        |       |    ✓
opacity         |        |       |    ✓
filter          |        |       |    ✓
```

Правило: анимируйте только `transform` и `opacity` для 60 fps.

## Critical Rendering Path

Critical Rendering Path (CRP) — последовательность шагов для первого рендера страницы. Оптимизация CRP = быстрая загрузка.

### Метрики

- **FP** (First Paint) — первый пиксель на экране
- **FCP** (First Contentful Paint) — первый контент (текст, изображение)
- **LCP** (Largest Contentful Paint) — основной контент загружен

### Оптимизация CRP

**1. Минимизируйте блокирующие ресурсы:**
```html
<link rel="stylesheet" href="critical.css">      <!-- Критический CSS inline -->
<link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
<script src="app.js" defer></script>
```

**2. Inline критического CSS:**
```html
<head>
  <style>
    /* Критический CSS — стили для первого экрана */
    body { font-family: system-ui; margin: 0; }
    .hero { min-height: 100vh; background: #6366f1; }
  </style>
</head>
```

**3. Предзагрузка важных ресурсов:**
```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero-image.webp" as="image">
<link rel="preconnect" href="https://cdn.example.com">
```

**4. Не используйте `@import` в CSS:**
```css
@import url('other.css');      /* Последовательная загрузка */
<link rel="stylesheet" href="other.css">  /* Параллельная загрузка */
```

## requestAnimationFrame

Для плавных анимаций используйте `requestAnimationFrame` — он синхронизирован с частотой обновления экрана (обычно 60 Hz):

```ts
function animate() {
  element.style.transform = `translateX(${position}px)`
  position += speed

  if (position < target) {
    requestAnimationFrame(animate)
  }
}

requestAnimationFrame(animate)
```

Не используйте `setInterval` для анимаций — он не синхронизирован с экраном.

## Итог

- **DOM** — дерево из HTML, **CSSOM** — дерево из CSS
- **Render Tree** — только видимые элементы (DOM + CSSOM)
- **Layout** — вычисление размеров и позиций (дорого)
- **Paint** — заливка пикселей (средне)
- **Composite** — объединение слоёв (дёшево)
- Анимируйте **только `transform` и `opacity`** — они проходят только Composite
- CSS в `<head>`, JS с `defer`, критический CSS inline
- Избегайте forced layout: не читайте геометрию между записями стилей
