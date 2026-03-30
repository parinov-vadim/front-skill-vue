---
title: "CSS счётчики: автоматическая нумерация через counter-reset и counter-increment"
description: "CSS счётчики — автоматическая нумерация элементов через counter-reset, counter-increment, counter() и counters(). Нумерованные списки, заголовки, разделы и вложенные счётчики."
section: css
difficulty: beginner
readTime: 6
order: 20
tags: [CSS счётчики, counter-reset, counter-increment, counter, автоматическая нумерация, CSS counters, нумерация]
---

## Что такое CSS-счётчики

CSS-счётчики — встроенный механизм нумерации элементов. Не нужно вручную проставлять номера в HTML или писать JavaScript. CSS сам считает и выводит числа.

Три шага: создать счётчик → увеличивать → вывести.

## counter-reset — создание счётчика

Создаёт и обнуляет счётчик. Обычно на родительском элементе:

```css
ol {
  counter-reset: item;
}

section {
  counter-reset: heading;
}
```

Начальное значение можно задать (по умолчанию 0):

```css
ol {
  counter-reset: item 1;
}

section {
  counter-reset: heading -1;
}
```

Несколько счётчиков сразу:

```css
article {
  counter-reset: section subsection;
}
```

## counter-increment — увеличение

Увеличивает счётчик на заданный шаг (по умолчанию на 1):

```css
li {
  counter-increment: item;
}

h2 {
  counter-increment: heading;
}
```

Шаг можно указать:

```css
li {
  counter-increment: item 2;
}

li {
  counter-increment: item -1;
}
```

Несколько счётчиков:

```css
h2 {
  counter-increment: section 1 subsection -1;
}
```

## counter() — вывод значения

Выводит текущее значение через `content` в псевдоэлементе:

```css
li::before {
  counter-increment: item;
  content: counter(item) ". ";
}
```

Стиль нумерации — второй аргумент:

```css
li::before {
  content: counter(item, decimal-leading-zero) ". ";
}

h2::before {
  content: "Глава " counter(heading, upper-roman) ": ";
}
```

Доступные стили:

| Значение | Результат |
|----------|-----------|
| `decimal` | 1, 2, 3 |
| `decimal-leading-zero` | 01, 02, 03 |
| `lower-roman` | i, ii, iii |
| `upper-roman` | I, II, III |
| `lower-alpha` | a, b, c |
| `upper-alpha` | A, B, C |
| `lower-greek` | α, β, γ |

## counters() — вложенная нумерация

Для многоуровневых списков вида 1.1, 1.2, 2.1:

```css
ol {
  counter-reset: item;
  list-style: none;
}

li {
  counter-increment: item;
}

li::before {
  content: counters(item, ".") " ";
}
```

```html
<ol>
  <li>Раздел</li>          <!-- 1 -->
  <li>Раздел</li>          <!-- 2 -->
  <ol>
    <li>Подраздел</li>     <!-- 2.1 -->
    <li>Подраздел</li>     <!-- 2.2 -->
  </ol>
  <li>Раздел</li>          <!-- 3 -->
</ol>
```

Третий аргумент — стиль:

```css
li::before {
  content: counters(item, ".", lower-alpha) ") ";
}
```

## Практические примеры

### Нумерация заголовков

```css
body {
  counter-reset: h2-counter;
}

h2 {
  counter-reset: h3-counter;
  counter-increment: h2-counter;
}

h2::before {
  content: counter(h2-counter) ". ";
  color: #6366f1;
  font-weight: 700;
}

h3 {
  counter-increment: h3-counter;
}

h3::before {
  content: counter(h2-counter) "." counter(h3-counter) " ";
  color: #8b5cf6;
}
```

Результат: `1. Введение` → `1.1 Цель` → `1.2 Задачи` → `2. Основная часть` → `2.1 Анализ`

### Красивый нумерованный список

```css
.styled-list {
  counter-reset: item;
  list-style: none;
  padding: 0;
}

.styled-list li {
  counter-increment: item;
  padding: 12px 12px 12px 48px;
  position: relative;
}

.styled-list li::before {
  content: counter(item);
  position: absolute;
  left: 0;
  top: 8px;
  width: 32px;
  height: 32px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 700;
}
```

### Боковая нумерация секций

```css
article {
  counter-reset: section;
}

section {
  counter-increment: section;
}

section::before {
  content: counter(section, decimal-leading-zero);
  position: absolute;
  left: -40px;
  font-size: 2rem;
  font-weight: 800;
  color: #e5e7eb;
  line-height: 1;
}
```

### Шаги инструкции

```css
.steps {
  counter-reset: step;
}

.step {
  counter-increment: step;
  position: relative;
  padding-left: 60px;
  margin-bottom: 24px;
}

.step::before {
  content: "Шаг " counter(step);
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 700;
  color: #6366f1;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.step::after {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 20px;
  width: 40px;
  height: 40px;
  border: 2px solid #6366f1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
}
```

### Счётчик для изображений

```css
.gallery {
  counter-reset: figure;
}

figure {
  counter-increment: figure;
}

figcaption::before {
  content: "Рис. " counter(figure) " — ";
  font-weight: 600;
  color: #374151;
}
```

### Таблица с автонумерацией строк

```css
table {
  counter-reset: row;
}

tbody tr {
  counter-increment: row;
}

tbody td:first-child::before {
  content: counter(row);
  font-weight: 600;
  color: #6b7280;
  margin-right: 8px;
}
```

## Сброс внутри элемента

`counter-reset` на одном уровне автоматически обнуляет вложенные счётчики:

```css
h2 {
  counter-reset: h3-counter;
  counter-increment: h2-counter;
}
```

Каждый `h2` сбрасывает счётчик `h3-counter` — нумерация subsection начинается заново.

## counter() в calc

Значение счётчика можно использовать в вычислениях, но только для содержания:

```css
li::before {
  content: counter(item);
}

ol {
  counter-reset: item;
}

li:nth-child(5) {
  counter-increment: item;
}
```

## Итог

- `counter-reset` — создать/обнулить счётчик (обычно на родителе)
- `counter-increment` — увеличить (обычно на повторяющемся элементе)
- `counter()` — вывести значение через `content`
- `counters()` — вложенная нумерация через разделитель (1.1, 1.2)
- Второй аргумент — стиль: `decimal`, `upper-roman`, `lower-alpha`
