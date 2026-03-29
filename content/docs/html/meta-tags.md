---
title: Мета-теги и SEO
description: Мета-теги в <head> управляют тем, как браузер и поисковые системы интерпретируют страницу и отображают её в результатах поиска.
section: html
difficulty: beginner
readTime: 6
order: 4
tags: [meta, SEO, Open Graph, head]
---

## Основные мета-теги

```html
<head>
  <!-- Кодировка — всегда первым -->
  <meta charset="UTF-8">

  <!-- Адаптивность для мобильных -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Описание страницы для поисковиков (150–160 символов) -->
  <meta name="description" content="Бесплатная платформа для практики фронтенд-разработки">

  <!-- Ключевые слова (игнорируются современными поисковиками) -->
  <meta name="keywords" content="фронтенд, HTML, CSS, JavaScript">

  <!-- Запрет индексации -->
  <meta name="robots" content="noindex, nofollow">

  <!-- Автор -->
  <meta name="author" content="FrontSkill Team">

  <!-- Заголовок вкладки -->
  <title>Главная — FrontSkill</title>
</head>
```

## Open Graph (OG) — для соцсетей

Open Graph теги управляют превью при публикации ссылки в соцсетях (ВКонтакте, Telegram, Facebook):

```html
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://frontskill.ru/tasks/flexbox">
<meta property="og:title"       content="Задача: Flexbox галерея — FrontSkill">
<meta property="og:description" content="Создайте адаптивную фотогалерею с помощью CSS Flexbox">
<meta property="og:image"       content="https://frontskill.ru/og/flexbox-task.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale"      content="ru_RU">
<meta property="og:site_name"   content="FrontSkill">
```

## Twitter Card

```html
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="Flexbox галерея — FrontSkill">
<meta name="twitter:description" content="Практическая задача по Flexbox">
<meta name="twitter:image"       content="https://frontskill.ru/og/flexbox.png">
<meta name="twitter:creator"     content="@frontskill">
```

## Favicon

```html
<!-- Современный подход -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" href="/favicon.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<!-- Manifest для PWA -->
<link rel="manifest" href="/manifest.json">

<!-- Тема браузера на мобильных -->
<meta name="theme-color" content="#7c3aed">
```

## Канонический URL

Предотвращает проблемы с дублированным контентом:

```html
<!-- На всех вариантах URL указываем один канонический -->
<link rel="canonical" href="https://frontskill.ru/tasks/flexbox">
```

## Языковые атрибуты

```html
<html lang="ru"><!-- Обязательно! -->

<!-- Для конкретного блока на другом языке -->
<blockquote lang="en">
  "Any fool can write code that a computer can understand."
</blockquote>

<!-- hreflang для мультиязычных сайтов -->
<link rel="alternate" hreflang="en" href="https://frontskill.ru/en/">
<link rel="alternate" hreflang="ru" href="https://frontskill.ru/">
```

## Производительность

```html
<!-- Предзагрузка критических ресурсов -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>
<link rel="preload" href="/hero-image.jpg" as="image">

<!-- Предварительное соединение с внешним доменом -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.frontskill.ru">

<!-- Предзагрузка следующей страницы -->
<link rel="prefetch" href="/tasks/grid">
```

## Полный шаблон `<head>`

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>FrontSkill — Практика фронтенда</title>
  <meta name="description" content="...">

  <!-- OG -->
  <meta property="og:type"  content="website">
  <meta property="og:title" content="FrontSkill">
  <meta property="og:image" content="https://frontskill.ru/og.png">

  <!-- Icons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#7c3aed">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">

  <!-- CSS -->
  <link rel="stylesheet" href="/styles.css">
</head>
```
