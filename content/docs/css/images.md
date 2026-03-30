---
title: "Изображения в CSS: object-fit, background-size, градиенты"
description: "Работа с изображениями в CSS — object-fit для img/video, background-size и background-position, линейные и радиальные градиенты, conic-gradient."
section: css
difficulty: beginner
readTime: 9
order: 12
tags: [изображения, object-fit, background-size, background, градиенты, gradient, CSS]
---

## img — адаптивные изображения

Базовые стили для адаптивного изображения:

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

`display: block` убирает зазор снизу (inline-элементы имеют baseline gap).

## object-fit

Как содержимое `<img>` или `<video>` вписывается в заданные размеры:

```css
.cover {
  width: 300px;
  height: 200px;
  object-fit: cover;    /* заполнит всю область, обрезав лишнее */
}

.contain {
  width: 300px;
  height: 200px;
  object-fit: contain;  /* целиком поместится, могут быть полосы */
}

.fill {
  object-fit: fill;     /* растянется, нарушая пропорции */
}

.none {
  object-fit: none;     /* оригинальный размер, обрезано */
}
```

`cover` — самый частый выбор. Одинаковое оформление карточек с разными пропорциями фото:

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

### object-position

Сдвигает фокус изображения внутри контейнера:

```css
.hero-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  object-position: center top; /* фокус на верхней части */
}
```

## Фоновые изображения

### background-image

```css
.hero {
  background-image: url('/images/hero.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
}
```

Короткая запись:

```css
.hero {
  background: url('/images/hero.jpg') center / cover no-repeat;
  /* путь позиция / размер повтор */
}
```

### background-size

```css
background-size: cover;     /* заполнить, обрезать лишнее */
background-size: contain;   /* поместить целиком */
background-size: 50% 100%;  /* ширина 50%, высота 100% */
background-size: 200px;     /* фиксированная ширина */
```

### background-position

```css
background-position: center;       /* по центру */
background-position: top right;    /* верхний правый угол */
background-position: 50% 30%;      /* 50% по X, 30% по Y */
background-position: center bottom;
```

### Несколько фонов

```css
.hero {
  background:
    linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)),
    url('/images/hero.jpg') center / cover no-repeat;
}
```

Слои идут сверху вниз: градиент поверх фото.

## Градиенты

### Линейный — linear-gradient

```css
.gradient {
  background: linear-gradient(to right, #6366f1, #ec4899);
}

/* Диагональ */
background: linear-gradient(135deg, #6366f1, #ec4899);

/* С углом */
background: linear-gradient(45deg, #f97316, #ef4444);

#N нескольких цветов */
background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);

# фиксированной точкой остановки */
background: linear-gradient(to right, #6366f1 30%, #ec4899 70%);
```

Резкие переходы — «твёрдые» градиенты:

```css
background: linear-gradient(to right, #6366f1 50%, #ec4899 50%);
```

### Радиальный — radial-gradient

```css
background: radial-gradient(circle, #6366f1, #ec4899);

/* Эллипс (по умолчанию) */
background: radial-gradient(ellipse, #6366f1, #ec4899);

/* С центром */
background: radial-gradient(circle at top left, #6366f1, #ec4899);

# размером */
background: radial-gradient(circle 100px at center, #6366f1, #ec4899);
```

### Конический — conic-gradient

Удобен для круговых диаграмм и цветовых колёс:

```css
background: conic-gradient(
  #ef4444 0% 30%,
  #f97316 30% 60%,
  #22c55e 60% 100%
);

# начальным углом */
background: conic-gradient(from 45deg, #6366f1, #ec4899, #6366f1);
```

Пирог-чарт:

```css
.pie {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #6366f1 0% 40%,
    #22c55e 40% 70%,
    #f97316 70% 100%
  );
}
```

### repeating-linear-gradient

Повторяющийся паттерн:

```css
background: repeating-linear-gradient(
  45deg,
  #6366f1,
  #6366f1 10px,
  #4f46e5 10px,
  #4f46e5 20px
);
```

Полоски, клетка, другие паттерны:

```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 20px,
  rgba(0,0,0,0.05) 20px,
  rgba(0,0,0,0.05) 21px
);
```

## Практические паттерны

### Наложение на фоновое изображение

```css
.hero {
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)),
    url('/hero.jpg') center / cover no-repeat;
  color: white;
  min-height: 60vh;
  display: grid;
  place-items: center;
}
```

### Placeholder для отсутствующего изображения

```css
.no-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  display: grid;
  place-items: center;
  color: #9ca3af;
}
```

### Градиентный текст

```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Градиентная обводка

```css
.gradient-border {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #6366f1, #ec4899) border-box;
  border: 3px solid transparent;
  border-radius: 12px;
}
```

### Aspect ratio для адаптивных картинок

```css
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.video-container iframe,
.video-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Форматы изображений

| Формат | Когда | Особенность |
|--------|-------|-------------|
| WebP | замена JPG/PNG | на 30% легче, широкая поддержка |
| AVIF | максимальное сжатие | на 50% легче JPG, поддержка растёт |
| SVG | иконки, логотипы | вектор, бесконечное масштабирование |
| PNG | прозрачность | тяжелее WebP |
| JPG | фотографии | универсальный |

Используйте `picture` для форматов:

```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Фото" width="800" height="600" loading="lazy">
</picture>
```

## Итог

- `object-fit: cover` — главный инструмент для одинаковых карточек
- `background-size: cover` — для фоновых изображений
- Градиенты: `linear`, `radial`, `conic` — для фонов, наложений, декора
- `background-clip: text` — градиентный текст
- WebP/AVIF — современные форматы, `picture` для fallback
- `loading="lazy"` — ленивая загрузка изображений
