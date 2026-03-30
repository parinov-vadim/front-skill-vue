---
title: "Адаптивная верстка: media queries, mobile-first, container queries"
description: "Адаптивная верстка CSS — media queries, подход mobile-first, breakpoints, container queries, @container и советы по отзывчивому дизайну."
section: css
difficulty: beginner
readTime: 11
order: 6
tags: [адаптивная верстка, media queries, responsive, mobile-first, breakpoints, container queries, CSS]
---

## Что такое адаптивная верстка

Адаптивная (responsive) верстка — страница выглядит хорошо на любом экране: телефон, планшет, ноутбук, широкий монитор. Ключевой инструмент — media queries.

## Media Queries

Media query применяет стили только при определённых условиях:

```css
.card {
  width: 100%;
  padding: 16px;
}

@media (min-width: 768px) {
  .card {
    width: 48%;
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .card {
    width: 31%;
    padding: 32px;
  }
}
```

### Условия

```css
@media (min-width: 768px) { }  /* ширина viewport от 768px */
@media (max-width: 767px) { }  /* ширина viewport до 767px */
@media (min-width: 768px) and (max-width: 1023px) { }  /* диапазон */

@media (orientation: landscape) { }  /* горизонтальная ориентация */
@media (prefers-color-scheme: dark) { }  /* тёмная тема ОС */
@media (prefers-reduced-motion: reduce) { }  /* пользователь просит меньше анимаций */
@media (hover: hover) { }  /* устройство с мышью (не тач-экран) */
```

### Диапазонный синтаксис (современный)

```css
@media (width >= 768px) { }
@media (768px <= width < 1200px) { }
```

Поддержка уже хорошая, но для продакшна пока надёжнее `min-width` / `max-width`.

## Mobile-first

Пишите стили для мобильных, а затем расширяйте для больших экранов через `min-width`:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

Почему mobile-first лучше desktop-first:

```css
/* Mobile-first: стили по умолчанию для мобильных, дополняем */
@media (min-width: 768px) { /* добавляем */ }

/* Desktop-first: стили по умолчанию для десктопа, переписываем */
@media (max-width: 767px) { /* отменяем */ }
```

При mobile-first вы **добавляете** стили, при desktop-first — **перезаписываете**. Меньше кода — меньше багов.

## Популярные breakpoints

Нет единого стандарта, но часто используют:

| Breakpoint | Устройство |
|------------|-----------|
| `320–479px` | маленький телефон |
| `480–767px` | телефон |
| `768–1023px` | планшет |
| `1024–1279px` | ноутбук |
| `1280–1535px` | десктоп |
| `1536px+` | широкий монитор |

Не пишите стили под конкретные устройства — устройств тысячи. Проверяйте на breakpoints и между ними.

## Относительные единицы вместо фиксированных

```css
.bad {
  width: 960px;  /* не поместится на телефоне */
  font-size: 16px;
}

.good {
  max-width: 1200px;
  width: 100%;
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}
```

### clamp() — отзывчивые значения

```css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* минимум 1.5rem, предпочтительно 4vw, максимум 3rem */
}

.container {
  padding: clamp(16px, 4vw, 48px);
}
```

## Container Queries

Media queries реагируют на размер **viewport**. Container queries — на размер **родительского элемента**. Компонент адаптируется к месту, где он размещён.

### Определение контейнера

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main-content {
  container-type: inline-size;
  container-name: main;
}
```

### Правила @container

```css
.card {
  display: flex;
  flex-direction: column;
}

@container sidebar (min-width: 300px) {
  .card {
    flex-direction: row;
  }
}

@container main (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

Одна и та же `.card` будет выглядеть по-разному в sidebar и в main — без дополнительных классов.

## Практические паттерны

### Адаптивная навигация

```css
.nav {
  display: flex;
  gap: 8px;
}

.nav-links {
  display: none;
}

.nav-burger {
  display: block;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }

  .nav-burger {
    display: none;
  }
}
```

### Адаптивный герой-блок

```css
.hero {
  padding: clamp(2rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem);
  text-align: center;
}

.hero h1 {
  font-size: clamp(1.75rem, 5vw, 4rem);
  line-height: 1.1;
}

@media (min-width: 768px) {
  .hero {
    text-align: left;
  }
}
```

### Скрытие на мобильных / десктопе

```css
.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: block;
  }
}

@media (max-width: 767px) {
  .hide-desktop {
    display: none;
  }
}
```

### Адаптивные изображения

```css
.responsive-img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Фон */
.hero-bg {
  background-image: url('hero-mobile.jpg');
  background-size: cover;
  background-position: center;
}

@media (min-width: 768px) {
  .hero-bg {
    background-image: url('hero-tablet.jpg');
  }
}

@media (min-width: 1200px) {
  .hero-bg {
    background-image: url('hero-desktop.jpg');
  }
}
```

Через HTML — элемент `picture`:

```html
<picture>
  <source media="(min-width: 768px)" srcset="hero-desktop.webp">
  <source media="(min-width: 480px)" srcset="hero-tablet.webp">
  <img src="hero-mobile.webp" alt="Герой" width="800" height="600">
</picture>
```

## Метатег viewport

Без этого метатега мобильные браузеры покажут десктопную версию, уменьшив её:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Обязательно на каждой странице.

## Итог

- Mobile-first: стили для мобильных по умолчанию, `min-width` для расширения
- `@media (min-width: Npx)` — основной инструмент
- `clamp()` — отзывчивые значения без media queries
- Container queries (`@container`) — компонент реагирует на размер родителя, не viewport
- `max-width: 100%; height: auto` — адаптивные изображения
- Метатег viewport обязателен
