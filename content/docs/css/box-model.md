---
title: Блочная модель (Box Model)
description: Каждый HTML-элемент — это прямоугольник из контента, padding, border и margin. Понимание Box Model — основа CSS-вёрстки.
section: css
difficulty: beginner
readTime: 6
order: 1
tags: [box model, padding, margin, border, sizing]
---

## Что такое Box Model?

Каждый HTML-элемент браузер отображает как прямоугольную коробку (box), состоящую из четырёх слоёв:

```
┌─────────────────────────────┐  ← margin
│  ┌───────────────────────┐  │  ← border
│  │  ┌─────────────────┐  │  │  ← padding
│  │  │    content      │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

| Слой | Описание |
|------|----------|
| **content** | Область с текстом, изображением, дочерними элементами |
| **padding** | Внутренний отступ между контентом и границей |
| **border** | Граница вокруг элемента |
| **margin** | Внешний отступ от других элементов |

## box-sizing

По умолчанию `width` задаёт только ширину **контента**, не учитывая padding и border:

```css
/* box-sizing: content-box (по умолчанию) */
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid;
  /* Реальная ширина: 200 + 20*2 + 2*2 = 244px */
}
```

Чтобы `width` включал padding и border:

```css
/* box-sizing: border-box */
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 2px solid;
  /* Реальная ширина: 200px (padding и border внутри) */
}
```

Рекомендуется устанавливать `border-box` глобально:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

## Padding

```css
/* Все стороны */
padding: 20px;

/* Вертикальные | Горизонтальные */
padding: 10px 20px;

/* Верх | Горизонтальные | Низ */
padding: 10px 20px 15px;

/* Верх | Право | Низ | Лево (по часовой) */
padding: 10px 20px 15px 5px;

/* Отдельные стороны */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;
```

## Margin

```css
margin: 20px;          /* Все стороны */
margin: 10px auto;     /* Вертикальные auto | Горизонтальные auto = центрирование */
margin: 0 auto;        /* Центрирование блока */

/* Отрицательный margin */
margin-top: -10px;     /* Перекрыть соседний элемент */
```

### Margin collapse

Вертикальные margin-ы смежных элементов **схлопываются** — берётся максимальный:

```css
.first  { margin-bottom: 20px; }
.second { margin-top: 30px; }
/* Реальный отступ между ними: 30px, а не 50px */
```

Схлопывание не происходит при:
- Flexbox/Grid контейнере
- `overflow` не `visible`
- `padding` или `border` между родителем и первым/последним дочерним

## Border

```css
/* Сокращённая запись: ширина стиль цвет */
border: 1px solid #ccc;

/* Отдельные свойства */
border-width: 2px;
border-style: solid | dashed | dotted | double | none;
border-color: #333;

/* Отдельные стороны */
border-top: 2px solid red;
border-bottom: none;

/* Скруглённые углы */
border-radius: 8px;
border-radius: 50%;        /* Круг (если width == height) */
border-radius: 8px 0 8px 0; /* Диагональные углы */
```

## Outline

`outline` похож на `border`, но не влияет на размеры и не занимает место:

```css
/* Используется для фокуса */
button:focus-visible {
  outline: 2px solid #7c3aed;
  outline-offset: 2px;
}

/* Не убирайте outline у фокусируемых элементов! */
/* Это важно для доступности */
```

## Блочные и строчные элементы

| Свойство | Block | Inline | Inline-block |
|----------|-------|--------|--------------|
| Новая строка | Да | Нет | Нет |
| width/height | Работает | Нет | Работает |
| padding/margin вертикальный | Работает | Частично | Работает |

```css
span { display: inline-block; } /* Как inline, но с box model */
div  { display: block; }
```

## Полезные паттерны

```css
/* Карточка с фиксированными отступами */
.card {
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

/* Центрирование по горизонтали */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Растянуть на весь экран */
.full-height {
  min-height: 100vh;
  box-sizing: border-box;
}
```
