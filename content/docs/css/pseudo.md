---
title: "Псевдоклассы и псевдоэлементы CSS: ::before, ::after, :nth-child, :has()"
description: "Псевдоклассы и псевдоэлементы в CSS — ::before/::after, :nth-child/:nth-of-type, :has(), :is(), :where(), :not(), ::placeholder, ::selection и практические примеры."
section: css
difficulty: intermediate
readTime: 10
order: 11
tags: [псевдоклассы, псевдоэлементы, before, after, nth-child, has, CSS, селекторы]
---

## Разница

**Псевдоклассы** (`:`) — выбирают элементы в определённом **состоянии**: `:hover`, `:first-child`, `:checked`.

**Псевдоэлементы** (`::`) — выбирают **части** элемента или создают виртуальные: `::before`, `::first-letter`.

## Псевдоэлементы

### ::before и ::after

Создают виртуальные элементы внутри целевого. Обязательно нужно `content`:

```css
.required::after {
  content: ' *';
  color: #ef4444;
}
```

```html
<label class="required">Email</label>
<!-- Результат: Email * -->
```

`content` может быть пустым — тогда элемент используется как декоративный блок:

```css
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  border-radius: inherit;
}
```

### ::first-letter и ::first-line

```css
p::first-letter {
  font-size: 2em;
  font-weight: 700;
  float: left;
  margin-right: 4px;
}

p::first-line {
  font-weight: 600;
}
```

### ::selection

Стили выделенного пользователем текста:

```css
::selection {
  background: #6366f1;
  color: white;
}
```

### ::placeholder

```css
input::placeholder {
  color: #9ca3af;
  font-style: italic;
}
```

### ::marker

Стили маркеров списков:

```css
li::marker {
  color: #6366f1;
  font-size: 1.2em;
}
```

## Псевдоклассы состояний

### :hover, :focus, :active

```css
.button {
  background: #6366f1;
  transition: all 0.2s;
}

.button:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

.button:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

Используйте `:focus-visible` вместо `:focus` — outline появляется только при навигации с клавиатуры, а не при клике мышью.

### :disabled, :checked, :required

```css
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input:required {
  border-left: 3px solid #ef4444;
}

input:valid {
  border-color: #22c55e;
}

input:invalid:not(:focus) {
  border-color: #ef4444;
}

.checkbox:checked + label {
  text-decoration: line-through;
  color: #9ca3af;
}
```

## Псевдоклассы позиции

### :first-child, :last-child

```css
li:first-child {
  font-weight: 700;
}

li:last-child {
  border-bottom: none;
}
```

### :nth-child()

Мощный селектор для выбора по позиции:

```css
/* Чётные */
li:nth-child(even) { background: #f3f4f6; }

/* Нечётные */
li:nth-child(odd) { background: white; }

/* Каждый 3-й */
li:nth-child(3n) { color: #6366f1; }

/* Конкретный номер */
li:nth-child(5) { font-weight: 700; }

/* Последние 3 */
li:nth-last-child(-n+3) { border-top: 1px solid #e5e7eb; }

/* Со 2-го по 5-й */
li:nth-child(n+2):nth-child(-n+5) { color: #6366f1; }
```

Таблица цветов зебры:

```css
tr:nth-child(even) {
  background-color: #f9fafb;
}
```

### :nth-of-type()

Считает только элементы **того же типа** — игнорирует другие теги:

```html
<div>
  <h2>Заголовок</h2>
  <p>Абзац 1</p>
  <p>Абзац 2</p>
  <p>Абзац 3</p>
</div>
```

```css
p:nth-of-type(2) { color: red; } /* «Абзац 2» — второй <p> */

p:nth-child(2) { color: red; }   /* «Абзац 1» — второй ребёнок div */
```

### :only-child и :empty

```css
.card:only-child {
  width: 100%; /* единственная карточка — на всю ширину */
}

.message:empty {
  display: none; /* пустое сообщение не показываем */
}
```

## :not() — отрицание

```css
input:not([type="submit"]):not([type="checkbox"]) {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
}

li:not(:last-child) {
  margin-bottom: 8px;
}
```

## :is() — группировка селекторов

Упрощает повторяющиеся селекторы:

```css
/* Без :is */
h1:hover, h2:hover, h3:hover {
  color: #6366f1;
}

/* С :is */
:is(h1, h2, h3):hover {
  color: #6366f1;
}

:is(header, main, footer) a {
  color: #6366f1;
  text-decoration: none;
}
```

Специфичность `:is()` = максимальная из переданных аргументов.

## :where() — то же, но с нулевой специфичностью

```css
:where(h1, h2, h3) {
  font-weight: 700;
}
```

Разница: стили через `:where()` легко перезаписать любым селектором:

```css
:where(.btn) {
  background: blue;
}

.card .btn {
  background: red; /* перезапишет — специфичность :where = 0 */
}
```

Используйте `:where()` для сбросов и базовых стилей, `:is()` — когда специфичность важна.

## :has() — «родительский» селектор

Выбирает элемент, **содержащий** потомка, соответствующего селектору:

```css
/* Карточка с изображением — другая раскладка */
.card:has(img) {
  grid-template-columns: 1fr 2fr;
}

/* Форма с невалидным полем */
form:has(:invalid) button {
  opacity: 0.5;
  pointer-events: none;
}

/* Блок без контента */
.section:has(> :empty) {
  display: none;
}

/* Input с фокусом — подсветить label */
label:has(+ input:focus) {
  color: #6366f1;
  font-weight: 600;
}

/* Dark mode через :has */
:root:has(.dark-toggle:checked) {
  color-scheme: dark;
}
```

`:has()` — один из самых ожидаемых селекторов. До него нельзя было стилизовать родителя на основе потомка.

## Практические примеры

### Декоративная кавычка через ::before

```css
blockquote::before {
  content: '\201C';
  font-size: 4em;
  line-height: 0;
  vertical-align: -0.3em;
  margin-right: 8px;
  color: #6366f1;
}
```

### Чистка最后一个 элемента

```css
nav a:not(:last-child)::after {
  content: '/';
  margin: 0 8px;
  color: #d1d5db;
}
```

### Стиль «external link»

```css
a[href^="http"]:not([href*="mysite.com"])::after {
  content: ' ↗';
  font-size: 0.8em;
}
```

## Итог

- Псевдоэлементы `::before`/`::after` — виртуальные элементы, требуют `content`
- `:nth-child()` — мощный выбор по позиции, `even`/`odd` для зебры
- `:has()` — стилизация родителя по потомку
- `:is()` — группировка с сохранением специфичности
- `:where()` — группировка с нулевой специфичностью
- `:focus-visible` — outline только при навигации клавиатурой
