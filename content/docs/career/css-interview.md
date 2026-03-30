---
title: "Собеседование по CSS: layout, специфичность, адаптивность"
description: "Подготовка к собеседованию по CSS: типичные вопросы про Flexbox, Grid, специфичность, блочную модель, адаптивность, BEM, CSS-переменные."
section: career
difficulty: intermediate
readTime: 14
order: 3
tags: [собеседование, CSS, Flexbox, Grid, специфичность, адаптивность, BEM, вопросы, interview]
---

## Блочная модель

### Как работает блочная модель?

Каждый элемент — прямоугольник из четырёх слоёв: content → padding → border → margin. Итоговая ширина:

```
width + padding-left + padding-right + border-left + border-right
```

`box-sizing: border-box` включает padding и border в `width`:

```css
* {
  box-sizing: border-box;
}
```

С `border-box` заданная `width: 300px` означает, что content сожмётся, чтобы padding и border поместились в 300px. Без border-box — width 300px + padding + border = шире, чем ожидали.

### Что схлопываются margin?

Вертикальные margin соседних элементов не складываются — берётся больший:

```css
.block-1 { margin-bottom: 30px; }
.block-2 { margin-top: 20px; }
/* Отступ между ними: 30px, не 50px */
```

Не схлопываются: у элементов с `float`, `position: absolute/fixed`, `display: flex/grid` внутри.

## Специфичность

### Как браузер решает, какое правило применить?

Специфичность считается по формуле `(a, b, c)`:

- **a** — количество ID-селекторов (`#header`)
- **b** — количество классов (`.nav`), атрибутов (`[type="text"]`), псевдоклассов (`:hover`)
- **c** — количество элементов (`div`), псевдоэлементов (`::before`)

```css
div              → (0, 0, 1)
.text            → (0, 1, 0)
div.text         → (0, 1, 1)
#main .text      → (1, 1, 0)
#main div.text   → (1, 1, 1)
```

Сравниваем слева направо: `(1, 0, 0)` > `(0, 10, 0)`.

### Что побеждает inline-стиль и !important?

Приоритет от низшего к высшему:

1. Стиль элемента (`div`)
2. Класс (`.text`)
3. ID (`#main`)
4. Inline-стиль (`style="..."`)
5. `!important`

```css
p { color: red; }
.text { color: blue; }
#main { color: green; }

/* <p id="main" class="text" style="color: orange;"> */
/* Оранжевый — inline побеждает */

p { color: red !important; }
/* Красный — !important побеждает всё */
```

### Что делает `@layer`?

Позволяет группировать стили по приоритету:

```css
@layer base, components, overrides;

@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  h1 { font-size: 1.5rem; }
}

@layer overrides {
  h1 { font-size: 3rem; }
}

/* Победит overrides — он последний в списке @layer */
```

Стили вне `@layer` всегда побеждают слои.

## Flexbox

### Как отцентрировать элемент?

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

`justify-content` — главная ось (по умолчанию горизонталь). `align-items` — поперечная.

### Разница между `justify-content` и `align-items`?

- `justify-content` — выравнивание по главной оси (row → горизонталь, column → вертикаль)
- `align-items` — выравнивание по поперечной оси

```css
.container {
  display: flex;
  flex-direction: column;
  /* justify-content — вертикаль, align-items — горизонталь */
}
```

### Что делает `flex: 1`?

Это сокращение для:

```css
flex-grow: 1;    /* занять доступное пространство */
flex-shrink: 1;  /* сжиматься при нехватке места */
flex-basis: 0%;  /* начальный размер 0 */
```

Элемент займёт всё свободное место пропорционально другим `flex: 1` элементам.

### Как работает `flex-grow`, `flex-shrink`, `flex-basis`?

```css
.item-a {
  flex-grow: 2; /* получит в 2 раза больше места, чем .item-b */
}
.item-b {
  flex-grow: 1;
}
```

- `flex-basis` — начальный размер до распределения пространства
- `flex-grow` — как делить **лишнее** пространство
- `flex-shrink` — как сжиматься, если места **не хватает**

### Как сделать перенос на новую строку?

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.item {
  flex: 0 0 calc(33.333% - 11px); /* 3 колонки с учётом gap */
}
```

## CSS Grid

### Разница между Grid и Flexbox?

Flexbox — одномерный (одна строка или один столбец). Grid — двумерный (строки и колонки одновременно).

```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
}

.header  { grid-column: 1 / -1; }
.sidebar { grid-column: 1; }
.main    { grid-column: 2; }
.footer  { grid-column: 1 / -1; }
```

Grid для整体布局 страницы. Flexbox — для компонентов внутри.

### Что такое `fr`?

Fraction — доля свободного пространства:

```css
grid-template-columns: 1fr 2fr 1fr;
/* Колонки в пропорции 1:2:1 */
```

### Как сделать адаптивную сетку без media queries?

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
```

`auto-fill` автоматически пересчитывает количество колонок при изменении ширины.

### Что делает `grid-area`?

Именованная область для размещения:

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

## Позиционирование

### Виды позиционирования?

```css
position: static;    /* по умолчанию, обычный поток */
position: relative;  /* смещение от своего положения, не вырывает из потока */
position: absolute;  /* позиционируется относительно ближайшего relative/fixed */
position: fixed;     /* относительно viewport */
position: sticky;    /* обычный поток, «прилипает» при прокрутке */
```

```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}
```

### Как спрятать элемент?

```css
display: none;        /* убирает из потока, не занимает место */
visibility: hidden;   /* скрывает, но занимает место */
opacity: 0;           /* прозрачный, занимает место, кликабельный */
position: absolute;
  left: -9999px;      /* за пределами экрана, доступно для скринридеров */
clip-path: inset(50%); /* визуально скрыто, доступно */
```

## Адаптивность

### Что такое mobile-first?

Сначала пишете стили для мобильных, потом расширяете для больших экранов:

```css
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 32px;
    max-width: 720px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}
```

`min-width` = mobile-first. `max-width` = desktop-first. На практике mobile-first предпочтительнее.

### Что такое `clamp()`?

Функция, ограничивающая значение в диапазоне:

```css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* Минимум 1.5rem, предпочтительно 4vw, максимум 3rem */
}

.container {
  width: clamp(320px, 90%, 1200px);
}
```

### Как работают единицы `rem` и `em`?

```css
html { font-size: 16px; }

h1 {
  font-size: 2rem;   /* 32px — относительно корня */
  margin-bottom: 0.5em; /* 16px — относительно текущего font-size элемента */
}
```

`rem` — относительно `font-size` корня (`html`). `em` — относительно `font-size` текущего элемента.

### Контейнерные запросы?

Стили зависят от размера **контейнера**, а не viewport:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 16px;
  }
}
```

Компонент адаптируется сам, независимо от того, где он размещён.

## BEM и методологии

### Что такое BEM?

Block-Element-Modifier — именование классов:

```css
.card { }
.card__title { }
.card__image { }
.card--featured { }
.card__title--large { }
```

- **Блок** — независимый компонент (`.card`)
- **Элемент** — часть блока (`.card__title`)
- **Модификатор** — состояние/вариант (`.card--featured`)

### Почему не вложенные селекторы?

```css
/* Плохо — зависимость от структуры */
.card .header .title { }

/* Хорошо — плоский селектор */
.card__title { }
```

Вложенные селекторы хрупкие — при изменении разметки стили ломаются.

## CSS-переменные

### Как использовать CSS-переменные?

```css
:root {
  --color-primary: #3b82f6;
  --spacing: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing);
}
```

Меняются через JS:

```js
document.documentElement.style.setProperty('--color-primary', '#ef4444')
```

### Разница между CSS-переменными и SCSS-переменными?

CSS-переменные (`--var`) работают в браузере, можно менять через JS. SCSS-переменные (`$var`) компилируются на этапе сборки — в итоговом CSS обычные значения.

## Итог

- Блочная модель и `box-sizing: border-box` — основа всего
- Специфичность: inline > id > class > element. `!important` — крайняя мера
- Flexbox — для компонентов, Grid — для общего layout
- Mobile-first + `clamp()` + container queries — современная адаптивность
- BEM — для предсказуемых имён классов
- CSS-переменные — для тем и динамических значений
