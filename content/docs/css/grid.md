---
title: CSS Grid
description: CSS Grid — двумерная система раскладки для создания сложных сеток по строкам и колонкам одновременно.
section: css
difficulty: intermediate
readTime: 12
order: 3
tags: [grid, layout, css grid, columns]
---

## Включение Grid

```css
.container {
  display: grid;
}
```

В отличие от Flexbox (одна ось), Grid работает по **двум осям** одновременно — строки и колонки.

## Определение колонок и строк

```css
.container {
  /* 3 колонки по 200px */
  grid-template-columns: 200px 200px 200px;

  /* То же самое с repeat */
  grid-template-columns: repeat(3, 200px);

  /* Дробные единицы (fr) — доли свободного пространства */
  grid-template-columns: 1fr 2fr 1fr; /* 25% 50% 25% */

  /* Смешанные единицы */
  grid-template-columns: 260px 1fr;   /* Sidebar + контент */

  /* Строки */
  grid-template-rows: 80px 1fr 60px;  /* Header, main, footer */
}
```

## Единица fr

`fr` (fraction) — доля доступного пространства после вычитания фиксированных размеров:

```css
.container {
  width: 600px;
  grid-template-columns: 200px 1fr 2fr;
  /* 200px + 1fr + 2fr = 200px + (400px / 3) + (400px * 2 / 3) */
  /* = 200px, 133px, 267px */
}
```

## auto-fill и auto-fit

Адаптивные сетки без медиазапросов:

```css
.cards {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* Создаёт столько колонок, сколько влезет, минимум 280px */
}

.cards {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* То же самое, но пустые дорожки схлопываются */
}
```

## Размещение элементов

### По номерам линий

```css
.item {
  grid-column: 1 / 3;  /* С первой до третьей линии (2 колонки) */
  grid-row: 1 / 2;

  /* Span — занять N дорожек */
  grid-column: 1 / span 2;  /* Начать с 1, занять 2 колонки */

  /* От конца */
  grid-column: 1 / -1;  /* Растянуть до последней линии */
}
```

### Сокращение grid-area

```css
/* grid-area: row-start / col-start / row-end / col-end */
.item {
  grid-area: 1 / 1 / 3 / 4;
}
```

## Именованные области

```css
.layout {
  display: grid;
  grid-template-areas:
    'header header header'
    'sidebar main main'
    'footer footer footer';
  grid-template-columns: 260px 1fr 1fr;
  grid-template-rows: 80px 1fr 60px;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

## Выравнивание

```css
/* Все элементы в контейнере */
.container {
  justify-items: start | end | center | stretch; /* По оси X */
  align-items: start | end | center | stretch;   /* По оси Y */

  /* Сетка внутри контейнера */
  justify-content: start | center | space-between;
  align-content: start | center | space-between;

  /* Сокращение */
  place-items: center;          /* align-items justify-items */
  place-content: center;        /* align-content justify-content */
}

/* Отдельный элемент */
.item {
  justify-self: center;
  align-self: end;
  place-self: center end;
}
```

## gap

```css
.container {
  gap: 24px;           /* Строки и колонки */
  row-gap: 16px;
  column-gap: 24px;
}
```

## Адаптивный лейаут страницы

```css
/* Классический лейаут страницы */
.page {
  display: grid;
  grid-template-areas:
    'header'
    'main'
    'footer';
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .page {
    grid-template-areas:
      'header header'
      'sidebar main'
      'footer footer';
    grid-template-columns: 260px 1fr;
  }
}
```

## Когда Grid, когда Flexbox?

| | Flexbox | Grid |
|---|---------|------|
| Измерения | Одно | Два |
| Контроль | По элементам | По контейнеру |
| Идеально для | Навбар, кнопки, строка | Лейаут страницы, сетки |
| Вложение | Не требует | Часто вложенные |

Они отлично работают **вместе**: Grid для общего лейаута, Flexbox для компонентов внутри.

```css
/* Grid для страницы, Flexbox для шапки */
.page    { display: grid; }
.header  { display: flex; align-items: center; }
.card    { display: flex; flex-direction: column; }
```
