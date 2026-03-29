---
title: Доступность (a11y)
description: Веб-доступность позволяет людям с ограниченными возможностями использовать ваш сайт. ARIA, семантика и клавиатурная навигация — ключевые инструменты.
section: html
difficulty: intermediate
readTime: 10
order: 3
tags: [accessibility, a11y, ARIA, screen reader]
---

## Почему доступность важна?

- ~15% людей имеют то или иное ограничение
- Улучшает UX для всех (клавиатурная навигация, контраст)
- Требуется по закону во многих странах
- Хорошо влияет на SEO

## Семантический HTML — основа

Правильная семантика уже решает 80% задач доступности:

```html
<!-- Плохо -->
<div onclick="navigate()">Главная</div>
<div class="btn">Сохранить</div>
<div class="heading">Заголовок</div>

<!-- Хорошо -->
<a href="/">Главная</a>
<button>Сохранить</button>
<h2>Заголовок</h2>
```

Скринридеры объявляют роли элементов. `<button>` автоматически объявляется как «кнопка», `<a>` — как «ссылка».

## Альтернативный текст для изображений

```html
<!-- Информативное изображение -->
<img src="chart.png" alt="График роста продаж: +42% в 2024 году">

<!-- Декоративное изображение (скринридер пропустит) -->
<img src="divider.png" alt="">

<!-- Иконка с функцией -->
<button>
  <img src="search.png" alt="Поиск">
</button>

<!-- SVG-иконка -->
<svg aria-hidden="true" focusable="false">
  <use href="#icon-close"/>
</svg>
<span class="sr-only">Закрыть</span>
```

## ARIA (Accessible Rich Internet Applications)

ARIA добавляет семантику там, где HTML её не предоставляет:

### aria-label — текстовая метка

```html
<!-- Когда видимый текст отсутствует или недостаточен -->
<button aria-label="Закрыть диалог">×</button>

<nav aria-label="Главная навигация">
  <ul>...</ul>
</nav>

<nav aria-label="Хлебные крошки">
  <ol>...</ol>
</nav>
```

### aria-describedby — дополнительное описание

```html
<input type="password" aria-describedby="pwd-rules">
<p id="pwd-rules">Минимум 8 символов, включая цифру</p>
```

### aria-labelledby — связь с заголовком

```html
<section aria-labelledby="features-title">
  <h2 id="features-title">Возможности</h2>
  <ul>...</ul>
</section>
```

### Роли (role)

```html
<div role="alert">Файл успешно загружен!</div>
<div role="status">Загрузка: 75%</div>
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Подтверждение</h2>
</div>
```

### Состояния

```html
<button aria-expanded="false" aria-controls="menu">Меню</button>
<ul id="menu" hidden>...</ul>

<input type="checkbox" aria-checked="mixed"><!-- Indeterminate state -->

<li role="option" aria-selected="true">Выбранный пункт</li>

<input aria-invalid="true" aria-describedby="error">
<span id="error" role="alert">Обязательное поле</span>
```

## Клавиатурная навигация

Все интерактивные элементы должны быть доступны с клавиатуры:

```html
<!-- focusable по умолчанию: a, button, input, select, textarea -->

<!-- Добавить в Tab-порядок -->
<div tabindex="0" role="button" onkeydown="handleKey(event)">
  Кастомный элемент
</div>

<!-- Убрать из Tab-порядка (но оставить фокусируемым через JS) -->
<div tabindex="-1">Элемент</div>

<!-- Никогда не убирайте outline у фокусируемых элементов! -->
```

```css
/* Кастомный стиль фокуса */
:focus-visible {
  outline: 2px solid #7c3aed;
  outline-offset: 2px;
  border-radius: 4px;
}
```

## Skip Links

Позволяет пропустить навигацию и перейти к основному контенту:

```html
<a class="skip-link" href="#main-content">Перейти к содержимому</a>

<header>...</header>
<main id="main-content">...</main>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #7c3aed;
  color: white;
  padding: 8px 16px;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

## Скрытый для глаз, но видимый скринридеру

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Контраст

WCAG 2.1 требует:
- Уровень AA: соотношение 4.5:1 для обычного текста, 3:1 для крупного
- Уровень AAA: 7:1 для обычного текста

Инструменты проверки: Chrome DevTools, [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
