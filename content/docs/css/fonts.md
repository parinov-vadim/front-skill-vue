---
title: "Шрифты в CSS: @font-face, Google Fonts, системные шрифты, font-display"
description: "Подключение шрифтов в CSS — @font-face, Google Fonts, системные шрифты, font-display для оптимизации загрузки, FOIT/FOUT и стеки шрифтов."
section: css
difficulty: beginner
readTime: 9
order: 10
tags: [шрифты, font-face, Google Fonts, font-display, системные шрифты, FOIT, FOUT, CSS]
---

## Стек шрифтов (font-stack)

`font-family` задаёт приоритетный список шрифтов — браузер берёт первый доступный:

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

| Категория | Шрифты |
|-----------|--------|
| `sans-serif` | Arial, Helvetica, Verdana, Inter, Roboto |
| `serif` | Georgia, Times New Roman, Garamond |
| `monospace` | Courier New, Consolas, Menlo, Fira Code |
| `cursive` | Comic Sans MS, cursive |
| `system-ui` | Шрифт интерфейса текущей ОС |

### Системные шрифты

Если не нужен кастомный шрифт — используйте системный. Быстро грузится, привычен пользователю:

```css
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
```

## @font-face — подключение своего шрифта

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-regular.woff2') format('woff2'),
       url('/fonts/inter-regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

Правила:
- Указывайте `font-weight` и `font-style` для каждого начертания — браузер сам выберет нужный файл
- Форматы: `woff2` (предпочтительно), `woff` (запасной). Не используйте `ttf` и `otf` — они тяжелее
- Файлы шрифтов кладите в `public/fonts/` вашего проекта

### Использование

```css
body {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3 {
  font-weight: 700; /* загрузит inter-bold.woff2 */
}
```

## Google Fonts

### Через link (рекомендуется)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

`preconnect` устанавливает соединение заранее — шрифт загрузится быстрее.

### Через @import (медленнее)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
```

`@import` блокирует загрузку CSS — избегайте.

### Через Nuxt/Vite

Если проект на Nuxt (как этот):

```js
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
      ],
    },
  },
})
```

## font-display — поведение при загрузке

Пока шрифт грузится, браузер решает, что показывать:

| Значение | Поведение | Когда использовать |
|----------|-----------|-------------------|
| `auto` | Браузер решает (обычно block) | — |
| `block` | Невидимый текст максимум 3 сек, потом шрифт | Логотипы, иконки-шрифты |
| `swap` | Сразу системный шрифт, потом меняет | **Основной текст** (рекомендуется) |
| `fallback` | ~100мс невидимый, потом системный, потом шрифт | Оптимизация |
| `optional` | ~100мс невидимый, шрифт только если уже в кэше | Второстепенный текст |

**Рекомендация:** `swap` для основного шрифта — пользователь сразу видит текст.

## FOIT и FOUT

- **FOIT** (Flash of Invisible Text) — текст невидим пока шрифт не загрузится (`block`)
- **FOUT** (Flash of Unstyled Text) — текст показан системным шрифтом, потом «прыгает» на кастомный (`swap`)

FOUT лучше FOIT — пользователь сразу читает. Чтобы прыжок был незаметным, подбирайте системный шрифт похожий по размеру:

```css
body {
  font-family: 'Inter', /* кастомный */
               /* похожие системные для минимального FOUT */
               -apple-system, BlinkMacSystemFont,
               'Segoe UI', Roboto, sans-serif;
}
```

## Свойства шрифта

```css
.text {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;             /* 16px */
  font-weight: 400;            /* 100-900, обычно 400/700 */
  font-style: normal;          /* normal | italic */
  line-height: 1.5;            /* без единицы — множитель от font-size */
  letter-spacing: -0.01em;     /* межбуквенный интервал */
  word-spacing: 0.1em;         /* межсловный интервал */
  text-transform: uppercase;   /* uppercase | lowercase | capitalize | none */
  text-decoration: underline;  /* underline | line-through | none */
  text-align: left;            /* left | center | right | justify */
  white-space: nowrap;         /* nowrap | pre | pre-wrap | normal */
  text-overflow: ellipsis;     /* обрезать многоточием (требует overflow: hidden) */
}
```

### Обрезка текста многоточием

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.multiline-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## variable fonts (переменные шрифты)

Один файл содержит все начертания — нет нужды грузить separate bold, italic:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

.light  { font-weight: 300; }
.normal { font-weight: 400; }
.bold   { font-weight: 700; }
.black  { font-weight: 900; }
```

Размер одного variable font обычно меньше, чем нескольких отдельных.

## Предзагрузка шрифтов

Для критических шрифтов укажите `preload` — браузер начнёт качать раньше:

```html
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
```

`crossorigin` обязателен для шрифтов — без него preload не сработает.

## Практический стек

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
}

h1, h2, h3 {
  line-height: 1.2;
  font-weight: 700;
}

code, pre {
  font-family: var(--font-mono);
}
```

## Итог

- Указывайте стек шрифтов с системным fallback
- `@font-face` с `font-display: swap` — для кастомных шрифтов
- `woff2` — лучший формат, preload для критических шрифтов
- Google Fonts через `<link>` + `preconnect`, не через `@import`
- Variable fonts — один файл вместо нескольких
- `line-height` без единицы — лучшая практика
