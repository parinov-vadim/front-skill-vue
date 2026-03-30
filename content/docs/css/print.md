---
title: "Стили для печати: @media print, разрывы страниц, @page"
description: "CSS для печати — @media print, разрывы страниц (break-before, break-after, break-inside), @page, скрытие элементов, вывод URL ссылок и подготовка страницы к печати."
section: css
difficulty: beginner
readTime: 7
order: 19
tags: [печать CSS, media print, стили для печати, разрывы страниц, page break, "@page", print stylesheet]
---

## Зачем нужны стили для печати

Когда пользователь нажимает Ctrl+P, браузер показывает превью. Без стилей для печати страница выглядит сломанной — навигация, фиксированные элементы, фоновые цвета. Через `@media print` вы контролируете, что попадёт на бумагу.

## @media print

Стили внутри этого блока применяются только при печати или сохранении в PDF:

```css
@media print {
  nav,
  footer,
  .ads,
  .sidebar,
  .cookie-banner {
    display: none;
  }

  body {
    font-size: 12pt;
    color: black;
    background: white;
  }
}
```

### Что скрывать

Элементы, бесполезные на бумаге:

```css
@media print {
  nav,
  .navigation,
  .burger-menu,
  .social-links,
  .cookie-banner,
  .ad-banner,
  .video-player,
  .comments-section,
  button,
  .no-print {
    display: none !important;
  }
}
```

### Сброс фиксированных элементов

Fixed-хедер и sticky-элементы на печати ведут себя непредсказуемо:

```css
@media print {
  header,
  .sticky-sidebar {
    position: static !important;
  }

  * {
    float: none !important;
    position: static !important;
    overflow: visible !important;
  }
}
```

## Цвета и фон

Браузеры по умолчанию **убирают фоны** при печати, чтобы сэкономить чернила. Если фон нужен:

```css
@media print {
  .logo,
  .badge {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

Для тёмных тем — переключите на светлую:

```css
@media print {
  body {
    background: white;
    color: black;
  }

  .card {
    border: 1px solid #d1d5db;
    background: white;
    color: black;
  }
}
```

## Разрывы страниц

### break-before и break-after

Заставляют элемент начинаться на новой странице:

```css
h1, h2, h3 {
  break-after: avoid;
}

section {
  break-before: page;
}

h2 {
  break-before: page;
}
```

Значения:

| Значение | Что делает |
|----------|-----------|
| `auto` | браузер решает (по умолчанию) |
| `avoid` | не разрывать здесь |
| `page` | разрыв перед/после элемента |
| `always` | синоним `page` |
| `left` / `right` | разрыв до левой/правой страницы (для книги) |

### break-inside — не разрывать элемент

Не разрывать таблицу, карточку, блок кода:

```css
table,
figure,
pre,
.blockquote,
.card {
  break-inside: avoid;
}
```

### orphans и widows

- **widows** — минимальное количество строк абзаца вверху новой страницы
- **orphans** — минимальное количество строк абзаца внизу текущей страницы

```css
p {
  orphans: 3;
  widows: 3;
}
```

Не оставляйте одну-две строки «висеть» на другой странице.

## @page — настройка страницы

```css
@page {
  size: A4;
  margin: 2cm;
}

@page {
  size: A4 landscape;
  margin: 1.5cm 2cm;
}
```

Размеры: `A4`, `A3`, `letter`, `legal`, или произвольный `10cm 20cm`.

### Именованные страницы

Разные стили для разных секций:

```css
@page cover {
  margin: 0;
}

@page content {
  margin: 2cm;
}

.cover-page {
  page: cover;
}

.content-page {
  page: content;
}
```

### Колонтитулы через margin boxes

Счетчик страниц в нижнем колонтитуле:

```css
@page {
  @bottom-center {
    content: counter(page);
  }

  @bottom-right {
    content: "Страница " counter(page) " из " counter(pages);
  }
}
```

Доступные позиции: `@top-left`, `@top-center`, `@top-right`, `@bottom-left`, `@bottom-center`, `@bottom-right`.

Поддержка margin boxes — только в Firefox и print-движках (Prince, WeasyPrint). Chrome пока не поддерживает.

## Ссылки — вывод URL

На бумаге пользователь не может кликнуть по ссылке. Покажите URL рядом:

```css
@media print {
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #6b7280;
  }

  a[href^="#"]::after,
  a[href^="javascript"]::after {
    content: "";
  }
}
```

Для длинных URL добавьте разрывы:

```css
@media print {
  a[href]::after {
    content: " (" attr(href) ")";
    word-break: break-all;
    hyphens: auto;
  }
}
```

## Адаптация изображений

```css
@media print {
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }

  .hero-image,
  .background-image {
    display: none;
  }
}
```

## Шрифты для печати

Пункты (pt) — стандартная единица для печати:

```css
@media print {
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.5;
    color: black;
  }

  h1 {
    font-size: 18pt;
  }

  h2 {
    font-size: 14pt;
  }

  code, pre {
    font-size: 10pt;
    border: 1px solid #d1d5db;
    padding: 8px;
  }
}
```

## Практический шаблон

Полный набор стилей для печати статьи или документа:

```css
@media print {
  @page {
    size: A4;
    margin: 2cm;
  }

  nav,
  footer,
  .sidebar,
  .ads,
  .cookie-banner,
  .share-buttons,
  .comments,
  video,
  audio,
  iframe,
  .no-print {
    display: none !important;
  }

  * {
    position: static !important;
    float: none !important;
    overflow: visible !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  body {
    font-family: Georgia, serif;
    font-size: 12pt;
    color: black;
    line-height: 1.6;
  }

  h1, h2, h3 {
    break-after: avoid;
    page-break-after: avoid;
  }

  table, figure, pre, img, blockquote {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  h2 {
    break-before: page;
    page-break-before: page;
  }

  h2:first-of-type {
    break-before: avoid;
    page-break-before: avoid;
  }

  a[href]:not([href^="#"]):not([href^="javascript"])::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    word-break: break-all;
  }

  p {
    orphans: 3;
    widows: 3;
  }
}
```

## Кнопка «Распечатать»

```html
<button onclick="window.print()" class="no-print">
  Распечатать
</button>
```

С классом `no-print` кнопка не появится на бумаге.

## Итог

- `@media print` — стили только для печати
- Скрывайте навигацию, рекламу, интерактивные элементы
- `break-inside: avoid` — не разрывать блоки
- `break-before: page` — начинать с новой страницы
- `@page` — размеры и отступы листа
- Выводите URL ссылок через `a::after { content: attr(href) }`
- Используйте `pt` для шрифтов и `cm` для отступов
