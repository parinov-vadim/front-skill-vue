---
title: CSS переменные (Custom Properties)
description: CSS Custom Properties позволяют хранить значения в переменных, переиспользовать их и изменять динамически через JavaScript.
section: css
difficulty: beginner
readTime: 7
order: 4
tags: [css variables, custom properties, theming, dark mode]
---

## Объявление и использование

CSS-переменные (Custom Properties) объявляются через `--` и используются через `var()`:

```css
:root {
  --color-primary: #7c3aed;
  --spacing-md: 16px;
  --border-radius: 8px;
  --font-size-base: 1rem;
}

.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}
```

`:root` — псевдокласс, соответствующий `<html>`. Объявленные здесь переменные **доступны глобально**.

## Значение по умолчанию

```css
.component {
  color: var(--text-color, #333);
  /* Если --text-color не определена, используется #333 */

  font-size: var(--size, var(--fallback-size, 16px));
  /* Вложенные fallback-и */
}
```

## Область видимости

Переменные следуют каскаду CSS — дочерние элементы наследуют переменные родителя:

```css
:root {
  --card-bg: white;
}

.dark-section {
  --card-bg: #1e1e1e;  /* Переопределяем для этого раздела */
}

.card {
  background: var(--card-bg); /* Будет разным в зависимости от контекста */
}
```

## Тёмная тема

```css
:root {
  --bg: #ffffff;
  --text: #111827;
  --border: #e5e7eb;
  --surface: #f9fafb;
}

.dark {
  --bg: #0f172a;
  --text: #f1f5f9;
  --border: #1e293b;
  --surface: #1e293b;
}

body {
  background: var(--bg);
  color: var(--text);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
}
```

Переключение темы — просто добавить/убрать класс `dark` на `<html>` через JavaScript.

## Динамическое изменение через JavaScript

```js
const root = document.documentElement

// Получить значение
const primary = getComputedStyle(root).getPropertyValue('--color-primary')

// Установить значение
root.style.setProperty('--color-primary', '#3b82f6')

// Удалить (вернуть к значению из таблицы стилей)
root.style.removeProperty('--color-primary')
```

## Компонентный подход

```css
/* Дефолтные значения компонента */
.button {
  --btn-bg: #7c3aed;
  --btn-color: white;
  --btn-padding: 8px 16px;
  --btn-radius: 6px;

  background: var(--btn-bg);
  color: var(--btn-color);
  padding: var(--btn-padding);
  border-radius: var(--btn-radius);
}

/* Кастомизация через переопределение */
.button.danger {
  --btn-bg: #dc2626;
}

.button.ghost {
  --btn-bg: transparent;
  --btn-color: #7c3aed;
}

/* Кастомизация снаружи */
.my-form .button {
  --btn-bg: #0ea5e9;
}
```

## Расчёты с переменными

```css
:root {
  --base-spacing: 4px;
}

.section {
  padding: calc(var(--base-spacing) * 6); /* 24px */
  margin-bottom: calc(var(--base-spacing) * 8); /* 32px */
}

/* Система шрифтов */
:root {
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
}
```

## Анимация значений

```css
/* Анимация через изменение переменной */
.progress {
  --progress: 0;
  width: calc(var(--progress) * 100%);
  transition: width 0.3s ease;
}
```

```js
bar.style.setProperty('--progress', '0.75')
```

## Ограничения

- CSS-переменные не работают в медиазапросах: `@media (min-width: var(--breakpoint))` — не работает
- Не поддерживаются в `url()`: `background: url(var(--image-path))` — не работает
- Синтаксис с `@property` (Houdini) позволяет добавить типизацию и анимацию числовых значений

```css
@property --progress {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}
```
