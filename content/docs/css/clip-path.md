---
title: "Clip-path и маски в CSS: сложные формы и эффекты"
description: "Clip-path и CSS-маски — создание сложных форм обрезки, polygon, circle, ellipse, clip-path генератор, mask-image для декоративных эффектов."
section: css
difficulty: intermediate
readTime: 7
order: 14
tags: [clip-path, маски, mask, polygon, SVG маски, обрезка, CSS]
---

## clip-path

Обрезает элемент по заданной форме. Всё за пределами формы невидимо:

```css
.circle {
  clip-path: circle(50%);
}

.ellipse {
  clip-path: ellipse(40% 50% at 50% 50%);
}

.inset {
  clip-path: inset(20px 10px 30px 10px round 10px);
}

.polygon {
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}
```

### circle

```css
clip-path: circle(50%);                      /* круг от центра */
clip-path: circle(100px at 25% 50%);         /* радиус 100px, центр смещён */
```

### ellipse

```css
clip-path: ellipse(60% 40% at 50% 50%);
```

### inset — прямоугольник с отступами

```css
clip-path: inset(10px);                      /* 10px со всех сторон */
clip-path: inset(10px 20px);                 /* вертикаль горизонталь */
clip-path: inset(0 round 16px);              /* с закруглением углов */
```

### polygon — многоугольник

Координаты в `%` от элемента (X Y):

```css
/* Треугольник */
clip-path: polygon(50% 0%, 100% 100%, 0% 100%);

/* Стрелка вправо */
clip-path: polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);

/* Шестиугольник */
clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);

/* Звезда */
clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
```

### Анимация clip-path

```css
.shape {
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  transition: clip-path 0.5s ease;
}

.shape:hover {
  clip-path: polygon(50% 50%, 50% 50%, 50% 50%); /* «схлопнется» */
}
```

Обе формы должны иметь **одинаковое количество точек** — тогда анимация сработает.

Морфинг форм:

```css
.morph {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  transition: clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.morph:hover {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
```

### SVG clipPath

Для сложных форм используйте SVG:

```html
<svg width="0" height="0">
  <defs>
    <clipPath id="wave" clipPathUnits="objectBoundingBox">
      <path d="M0,0.8 C0.3,1 0.7,0.6 1,0.8 L1,1 L0,1 Z"/>
    </clipPath>
  </defs>
</svg>

<div class="wave-shape"></div>
```

```css
.wave-shape {
  clip-path: url(#wave);
}
```

## CSS-маски (mask)

Маскируют элемент изображением или градиентом. Белый = видимо, чёрный = скрыто:

```css
.masked {
  -webkit-mask-image: url('/mask.svg');
  mask-image: url('/mask.svg');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

### Градиентная маска — плавное исчезновение

```css
.fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

.fade-edges {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

### Маска-растворение

```css
.dissolve {
  -webkit-mask-image: url('/noise.png');
  mask-image: url('/noise.png');
  -webkit-mask-size: 200px;
  mask-size: 200px;
}
```

### Свойства масок

```css
.mask {
  mask-image: url('mask.svg');
  mask-mode: alpha;         /* alpha | luminance */
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  mask-composite: add;      /* пересечение нескольких масок */
}
```

Короткая запись:

```css
.mask {
  mask: url('mask.svg') center / cover no-repeat;
}
```

## Практические примеры

### Диагональная секция

```css
.diagonal-section {
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  padding: 4rem 0;
}

/* Обратная */
.diagonal-section-inverse {
  clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%);
}
```

### Карточка с фигурным краем

```css
.card-featured {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%);
}
```

### Fade-out текст

```css
.truncate-mask {
  -webkit-mask-image: linear-gradient(to right, black 70%, transparent);
  mask-image: linear-gradient(to right, black 70%, transparent);
  overflow: hidden;
  white-space: nowrap;
}
```

### Reveal-анимация

```css
.reveal {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.8s ease;
}

.reveal.visible {
  clip-path: inset(0 0 0 0);
}
```

## Поддержка

- `clip-path` — отличная поддержка, `-webkit-` для старых Safari
- `mask` — нужна поддержка через `-webkit-mask-*`, полная поддержка в современных браузерах
- Для продакшна проверяйте на [caniuse.com](https://caniuse.com)

## Итог

- `clip-path: polygon()` — основной инструмент для создания нестандартных форм
- Анимация `clip-path` — плавная, требует одинаковое количество точек
- `mask-image` с градиентом — плавное растворение краёв
- SVG `clipPath` — для сложных кривых форм
- Не забывайте `-webkit-` префиксы
