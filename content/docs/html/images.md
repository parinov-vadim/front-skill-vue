---
title: "Изображения в HTML: форматы WebP и AVIF, srcset, picture, lazy loading"
description: "Изображения в HTML — форматы WebP и AVIF, адаптивные изображения через srcset и picture, ленивая загрузка loading=lazy, декодирование и лучшие практики оптимизации графики."
section: html
difficulty: beginner
readTime: 9
order: 5
tags: [изображения, img, WebP, AVIF, srcset, picture, lazy loading, оптимизация изображений, HTML]
---

## Тег img

Базовый тег для изображений. Обязательные атрибуты — `src` и `alt`:

```html
<img src="photo.jpg" alt="Закат над морем" width="800" height="600">
```

`alt` — текстовое описание. Показывается если картинка не загрузилась, читается скринридерами. Для декоративных изображений — пустой `alt=""`.

`width` и `height` — указывайте всегда. Браузер зарезервирует место до загрузки, страница не будет прыгать.

## Форматы изображений

| Формат | Для чего | Особенность |
|--------|----------|-------------|
| WebP | Фотографии, графика | На 25-35% легче JPEG. Поддерживает прозрачность. Основной формат для веба |
| AVIF | Фотографии | На 50% легче JPEG. Лучшее сжатие, но медленнее кодируется |
| JPEG | Фотографии | Универсальный, везде работает |
| PNG | Скриншоты, графика с текстом | Без потерь, прозрачность. Тяжелее WebP |
| SVG | Иконки, логотипы, иллюстрации | Вектор, бесконечное масштабирование, маленький размер |
| GIF | Анимации | Устаревший. Замените на WebP или видео MP4 |

### WebP

Заменяет JPEG и PNG — меньше весит при том же качестве:

```html
<img src="photo.webp" alt="Фото" width="800" height="600">
```

Поддерживается всеми современными браузерами. Для старых — fallback через `picture`.

### AVIF

Новейший формат — ещё меньше при том же качестве:

```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Фото" width="800" height="600">
</picture>
```

Браузер берёт первый формат, который поддерживает.

## Адаптивные изображения: srcset

Разным экранам — разные размеры картинки. Нет смысла грузить фото 4000px на телефон.

### По плотности пикселей

Для экранов с разным device-pixel-ratio:

```html
<img
  src="photo-1x.jpg"
  srcset="photo-1x.jpg 1x, photo-2x.jpg 2x, photo-3x.jpg 3x"
  alt="Фото"
  width="800"
  height="600"
>
```

Обычный экран загрузит `photo-1x.jpg`, Retina — `photo-2x.jpg`.

### По ширине (w-дескрипторы)

Более гибкий вариант — браузер сам выберет подходящий размер:

```html
<img
  src="photo-400.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w,
    photo-1600.jpg 1600w
  "
  sizes="(max-width: 600px) 100vw, 600px"
  alt="Фото"
  width="800"
  height="600"
>
```

`sizes` подсказывает браузеру ширину изображения на экране:
- На экранах уже 600px — картинка занимает 100% ширины
- На остальных — 600px

Браузер выберет оптимальный файл из `srcset` исходя из `sizes` и плотности пикселей.

## Элемент picture

Для разных форматов и разных изображений под разные экраны:

### Форматы с fallback

```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Фото" width="800" height="600">
</picture>
```

### Разные изображения для разных экранов

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp">
  <source media="(min-width: 640px)" srcset="hero-tablet.webp">
  <img src="hero-mobile.webp" alt="Герой-блок" width="800" height="600">
</picture>
```

На десктопе — широкая картинка, на планшете — средняя, на телефоне — мобильная. Это не просто ресайз — можно показать совсем другой кадр.

### Комбинация формата и размера

```html
<picture>
  <source
    type="image/avif"
    srcset="
      photo-400.avif 400w,
      photo-800.avif 800w,
      photo-1200.avif 1200w
    "
    sizes="(max-width: 600px) 100vw, 600px"
  >
  <source
    type="image/webp"
    srcset="
      photo-400.webp 400w,
      photo-800.webp 800w,
      photo-1200.webp 1200w
    "
    sizes="(max-width: 600px) 100vw, 600px"
  >
  <img
    src="photo-800.jpg"
    srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 600px"
    alt="Фото"
    width="800"
    height="600"
  >
</picture>
```

## Lazy loading — ленивая загрузка

Изображения загружаются только когда接近аются к viewport:

```html
<img src="photo.jpg" alt="Фото" loading="lazy" width="800" height="600">
```

Одно слово — и браузер сам откладывает загрузку картинок «ниже сгиба».

### Когда НЕ использовать lazy loading

Первое видимое изображение (hero, логотип) — грузите сразу:

```html
<img src="hero.jpg" alt="Hero" loading="eager" width="1200" height="600">
```

`eager` — значение по умолчанию, но лучше указать явно для важных изображений.

## Декодирование

Для тяжёлых изображений укажите `decoding="async"` — браузер не будет блокировать рендер:

```html
<img src="photo.jpg" alt="Фото" decoding="async" loading="lazy">
```

## Предзагрузка критических изображений

Для изображения «выше сгиба», которое должно появиться мгновенно:

```html
<head>
  <link rel="preload" as="image" href="hero.webp" type="image/webp">
</head>
```

Браузер начнёт загрузку раньше, чем дойдёт до тега `<img>`.

## aspect-ratio — предотвращение скачков

Если не знаете точные размеры, укажите пропорции:

```html
<img
  src="photo.jpg"
  alt="Фото"
  loading="lazy"
  style="aspect-ratio: 16 / 9; width: 100%"
>
```

Браузер зарезервирует место, даже если width и height не указаны.

## Фоновые изображения в CSS vs img

| | `<img>` | CSS `background` |
|---|---------|-------------------|
| SEO | Индексируется поисковиками | Нет |
| Доступность | alt для скринридеров | Нет |
| Печать | Печатается | Нет по умолчанию |
| Lazy loading | Работает | Нет |
| Адаптивность | srcset, picture | media queries |

Правило: если изображение **несёт смысл** (фото товара, статья, логотип) — `<img>`. Если **декоративное** (фон, паттерн) — CSS background.

## Практический шаблон

Оптимальное изображение для контентной картинки:

```html
<figure>
  <picture>
    <source type="image/avif" srcset="photo-400.avif 400w, photo-800.avif 800w">
    <source type="image/webp" srcset="photo-400.webp 400w, photo-800.webp 800w">
    <img
      src="photo-800.jpg"
      srcset="photo-400.jpg 400w, photo-800.jpg 800w"
      sizes="(max-width: 640px) 100vw, 800px"
      alt="Описание фотографии"
      width="800"
      height="600"
      loading="lazy"
      decoding="async"
    >
  </picture>
  <figcaption>Подпись к фотографии</figcaption>
</figure>
```

## Инструменты конвертации

- **Squoosh** (squoosh.app) — онлайн-конвертер от Google
- **Sharp** (npm) — автоматическая конвертация при сборке
- **Vite-плагины** — `vite-plugin-webp`, `vite-plugin-imagemin`
- **Cloudinary / imgix** — CDN с автоконвертацией

## Итог

- WebP — основной формат, AVIF — перспективный, JPEG — fallback
- `srcset` с `w`-дескрипторами + `sizes` — адаптивные размеры
- `<picture>` — разные форматы и разные изображения под экраны
- `loading="lazy"` — ленивая загрузка, не для hero-изображений
- `width` и `height` — обязательно, предотвращают скачки layout
- Смысловые изображения — `<img>`, декоративные — CSS background
