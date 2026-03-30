---
title: "SEO для фронтендера: meta-теги, sitemap, robots.txt, structured data"
description: "SEO-оптимизация фронтенд-приложений: meta-теги, Open Graph, robots.txt, sitemap.xml, структурированные данные, SPA и SSR для SEO."
section: web-fundamentals
difficulty: intermediate
readTime: 14
order: 12
tags: [seo, meta-tags, open-graph, sitemap, robots, structured-data, ssr]
---

## Зачем фронтендеру SEO

SEO (Search Engine Optimization) — оптимизация сайта для поисковых систем. Если ваш сайт не видит Google — его не найдут пользователи.

Фронтендер напрямую влияет на SEO через:
- HTML-разметку (семантика, заголовки)
- Meta-теги (title, description, og:*)
- Структурированные данные (JSON-LD)
- Производительность (Core Web Vitals)
- URL-структуру и маршрутизацию

## Meta-теги

### Базовые

```html
<head>
  <title>FrontSkill — платформа для фронтенд-задач</title>
  <meta name="description" content="Практические задачи по JavaScript, TypeScript, Vue, React для фронтенд-разработчиков. Учитесь решая реальные задачи.">
  <meta name="keywords" content="frontend, javascript, задачи, обучение">
  <meta name="author" content="FrontSkill">
  <meta name="robots" content="index, follow">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
```

### Title

- 50–60 символов (Google обрезает длиннее)
- Уникальный для каждой страницы
- Ключевые слова ближе к началу

```html
<title>JavaScript замыкания — объяснение с примерами | FrontSkill</title>
```

### Description

- 150–160 символов
- Описывает содержание страницы
- Влияет на CTR (кликабельность в поиске)

```html
<meta name="description" content="Замыкания в JavaScript: что это, как работают, примеры использования. Подробное руководство для начинающих с кодом.">
```

### Canonical URL

Предотвращает дублирование контента:

```html
<link rel="canonical" href="https://frontskill.ru/docs/javascript/closures">
```

Если один и тот же контент доступен по разным URL (с/без слеша, с www/без), canonical указывает предпочтительный.

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Без этого мобильный Google понизит рейтинг (mobile-first indexing).

## Open Graph (социальные сети)

Open Graph — мета-теги для красивых превью при шаринге в соцсетях и мессенджерах:

```html
<meta property="og:type" content="article">
<meta property="og:title" content="Замыкания в JavaScript">
<meta property="og:description" content="Подробное руководство с примерами кода">
<meta property="og:image" content="https://frontskill.ru/images/og-closures.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://frontskill.ru/docs/javascript/closures">
<meta property="og:site_name" content="FrontSkill">
<meta property="og:locale" content="ru_RU">
<meta property="article:published_time" content="2025-01-15T10:00:00Z">
<meta property="article:section" content="JavaScript">
<meta property="article:tag" content="замыкания">
<meta property="article:tag" content="javascript">
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@frontskill">
<meta name="twitter:title" content="Замыкания в JavaScript">
<meta name="twitter:description" content="Руководство с примерами">
<meta name="twitter:image" content="https://frontskill.ru/images/og-closures.png">
```

### Размеры og:image

| Платформа | Рекомендуемый размер |
|---|---|
| Facebook, LinkedIn | 1200 × 630 |
| Twitter (large) | 1200 × 628 |
| VK | 1200 × 630 |
| Telegram | 1200 × 630 |

## robots.txt

`robots.txt` — файл в корне сайта, который говорит поисковым роботам, что можно индексировать:

```
# https://frontskill.ru/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /*?sort=
Disallow: /*?filter=

Sitemap: https://frontskill.ru/sitemap.xml
```

### Директивы

| Директива | Описание |
|---|---|
| `User-agent: *` | Применяется ко всем роботам |
| `Allow: /` | Разрешить всё |
| `Disallow: /admin/` | Запретить индексацию /admin/ |
| `Sitemap:` | URL карты сайта |

### Примеры

```
# Запретить индексацию всего сайта
User-agent: *
Disallow: /

# Запретить только Googlebot
User-agent: Googlebot
Disallow: /private/

# Разрешить всё
User-agent: *
Allow: /
```

## sitemap.xml

Sitemap — XML-файл со списком всех страниц сайта для поисковиков:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://frontskill.ru/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://frontskill.ru/tasks</loc>
    <lastmod>2025-01-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://frontskill.ru/docs/javascript/closures</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Генерация в Nuxt

```bash
npm install @nuxtjs/sitemap
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://frontskill.ru',
    name: 'FrontSkill',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
})
```

### Генерация скриптом

```ts
import { writeFileSync } from 'fs'

const pages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/tasks', priority: 0.9, changefreq: 'daily' },
  { url: '/docs/javascript/closures', priority: 0.7, changefreq: 'monthly' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>https://frontskill.ru${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

writeFileSync('public/sitemap.xml', sitemap)
```

## Структурированные данные (JSON-LD)

JSON-LD — формат данных, который помогает Google понять содержание страницы. Используется для расширенных результатов (rich snippets):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Замыкания в JavaScript",
  "description": "Подробное руководство с примерами",
  "image": "https://frontskill.ru/images/og-closures.png",
  "author": {
    "@type": "Organization",
    "name": "FrontSkill"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FrontSkill",
    "logo": {
      "@type": "ImageObject",
      "url": "https://frontskill.ru/logo.png"
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20"
}
</script>
```

### Типы структурированных данных

| Тип | Описание | Результат в поиске |
|---|---|---|
| `Article` | Статья | Заголовок, дата, автор |
| `FAQPage` | FAQ | Раскрывающиеся вопросы |
| `HowTo` | Инструкция | Шаги |
| `BreadcrumbList` | Хлебные крошки | Путь в поиске |
| `WebSite` + `SearchAction` | Поиск по сайту | Поисковая строка в Google |
| `Course` | Курс | Рейтинг, цена |

### BreadcrumbList

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Документация", "item": "https://frontskill.ru/docs" },
    { "@type": "ListItem", "position": 2, "name": "JavaScript", "item": "https://frontskill.ru/docs/javascript" },
    { "@type": "ListItem", "position": 3, "name": "Замыкания" }
  ]
}
</script>
```

### FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Что такое замыкание в JavaScript?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Замыкание — это функция, которая запоминает переменные из области видимости, где была создана, даже после выхода из этой области."
      }
    }
  ]
}
</script>
```

Проверка: https://search.google.com/test/rich-results

## SPA и SEO

### Проблема SPA

SPA (Single Page Application) рендерит контент через JavaScript. Поисковый бот может не выполнить JS и увидеть пустую страницу:

```html
<div id="app"></div>
<script src="app.js"></script>
<!-- Бот видит пустой div -->
```

### Решения

**1. SSR (Server-Side Rendering)** — Nuxt, Next.js:
Сервер рендерит HTML и отдаёт готовую страницу. Лучший вариант для SEO.

**2. SSG (Static Site Generation)** — для контентных сайтов:
Страницы генерируются при сборке в статические HTML-файлы.

**3. Prerendering** — для SPA:
Сервис вроде Prerender.io рендерит страницы для ботов.

**4. Dynamic Rendering** (устаревающее):
Сервер определяет бота и отдаёт prerendered HTML.

### Nuxt и SEO

Nuxt 3/4 автоматически решает SEO-проблемы:

```vue
<!-- pages/docs/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: article } = await useFetch(`/api/articles/${route.params.slug}`)

useHead({
  title: article.value.title,
  meta: [
    { name: 'description', content: article.value.description },
    { property: 'og:title', content: article.value.title },
    { property: 'og:description', content: article.value.description },
    { property: 'og:image', content: article.value.image },
  ],
})
</script>
```

`useHead()` и `useSeoMeta()` — динамические meta-теги на каждой странице.

```ts
useSeoMeta({
  title: 'Замыкания в JavaScript | FrontSkill',
  ogTitle: 'Замыкания в JavaScript',
  description: 'Подробное руководство с примерами кода',
  ogDescription: 'Подробное руководство с примерами кода',
  ogImage: 'https://frontskill.ru/images/og-closures.png',
  twitterCard: 'summary_large_image',
})
```

## Семантика и заголовки

```html
<article>
  <h1>Замыкания в JavaScript</h1>
  <section>
    <h2>Что такое замыкание</h2>
    <p>Замыкание — это...</p>
  </section>
  <section>
    <h2>Примеры использования</h2>
    <h3>Счётчик</h3>
    <pre><code>function counter() { ... }</code></pre>
  </section>
</article>
```

Правила:
- Один `<h1>` на страницу
- Иерархия: `h1` → `h2` → `h3` (не пропускать уровни)
- Семантические теги: `<article>`, `<section>`, `<nav>`, `<aside>`

## alt для изображений

```html
<img src="diagram.png" alt="Схема работы замыкания: функция имеет доступ к внешней области видимости">
```

`alt` — текст для скринридеров и поисковиков. Без `alt` Google не понимает, что на изображении.

## URL-структура

```
Хорошо:
/docs/javascript/closures
/tasks/arrays/two-sum
/blog/2025/vue-3-composition-api

Плохо:
/page?id=123
/#/docs/closures
/docs/article_15
```

Правила:
- Короткие и описательные
- Ключевые слова через дефис (`-`)
- Без хешей (`#`) для контента
- Без параметров для контентных страниц

## Итог

- **Title** (50–60 символов) и **description** (150–160) — для каждой страницы
- **Open Graph** — красивые превью при шаринге
- **robots.txt** — указать, что индексировать
- **sitemap.xml** — список всех страниц для поисковиков
- **JSON-LD** — структурированные данные для rich snippets
- **SSR/SSG** (Nuxt) — решает проблему SPA для SEO
- `useHead()` / `useSeoMeta()` — динамические meta-теги в Nuxt
- Семантическая разметка, правильные заголовки, alt для изображений
