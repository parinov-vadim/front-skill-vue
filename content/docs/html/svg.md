---
title: "SVG: основы, inline SVG, анимации, иконки"
description: "SVG в веб-разработке — inline SVG, теги path, circle, rect, polygon, анимации через CSS и SMIL, система иконок, оптимизация и viewBox."
section: html
difficulty: intermediate
readTime: 9
order: 8
tags: [SVG, векторная графика, path, анимации SVG, иконки, viewBox, inline SVG]
---

## Что такое SVG

SVG (Scalable Vector Graphics) — формат векторной графики. Изображение описывается кодом, а не пикселями. Масштабируется без потери качества, весит меньше растра для иконок и иллюстраций.

## Способы вставки SVG

### 1. Inline — прямо в HTML

```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
</svg>
```

Плюсы: стилизация через CSS, обработка событий через JS, анимации, нет лишнего HTTP-запроса.

### 2. Тег img

```html
<img src="icon.svg" alt="Иконка" width="24" height="24">
```

Минус: нельзя стилизовать через CSS, нет интерактивности.

### 3. CSS background

```css
.icon {
  background: url('icon.svg') center / contain no-repeat;
  width: 24px;
  height: 24px;
}
```

### 4. Тег object

```html
<object data="diagram.svg" type="image/svg+xml" width="400" height="300"></object>
```

### Когда какой способ

| Способ | Стилизация CSS | JS-события | Кэширование |
|--------|---------------|------------|-------------|
| Inline | Да | Да | Нет |
| `<img>` | Нет | Нет | Да |
| CSS background | Нет | Нет | Да |
| `<object>` | Частично | Да | Да |

Для иконок — inline. Для картинок и иллюстраций — `<img>`.

## Основные теги SVG

### Прямоугольник — rect

```html
<rect x="10" y="10" width="100" height="60" rx="8" fill="#6366f1"/>
```

### Круг — circle

```html
<circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" stroke-width="2"/>
```

### Эллипс — ellipse

```html
<ellipse cx="100" cy="50" rx="80" ry="40" fill="#6366f1"/>
```

### Линия — line

```html
<line x1="0" y1="0" x2="100" y2="100" stroke="#6366f1" stroke-width="2"/>
```

### Ломаная — polyline

```html
<polyline points="0,100 50,25 100,75 150,0" fill="none" stroke="#6366f1"/>
```

### Многоугольник — polygon

```html
<polygon points="50,5 100,100 0,100" fill="#6366f1"/>
```

### Текст — text

```html
<text x="10" y="40" font-size="24" fill="#6366f1">Привет</text>
```

### Путь — path

Самый мощный тег. Рисует любую фигуру:

```html
<path d="M10 10 L90 10 L90 90 L10 90 Z" fill="#6366f1"/>
```

Команды path (заглавные — абсолютные координаты, строчные — относительные):

| Команда | Что делает |
|---------|-----------|
| `M x y` | moveTo — начать путь в точке |
| `L x y` | lineTo — линия до точки |
| `H x` | Горизонтальная линия |
| `V y` | Вертикальная линия |
| `C x1 y1, x2 y2, x y` | Кубическая кривая Безье |
| `S x2 y2, x y` | Гладкая кубическая |
| `Q x1 y1, x y` | Квадратичная кривая Безье |
| `A rx ry, rotation, large-arc, sweep, x y` | Дуга эллипса |
| `Z` | Закрыть путь (вернуться к началу) |

Иконка «дом»:

```html
<path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
```

## viewBox

`viewBox` определяет систему координат SVG. Формат: `min-x min-y width height`:

```html
<svg width="100" height="100" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80" fill="#6366f1"/>
</svg>
```

SVG рисуется в координатах 200x200, но отображается в 100x100px — масштабируется.

`viewBox="0 0 24 24"` — стандарт для иконок. Координаты от 0 до 24.

Если `viewBox` не указан — SVG не масштабируется, отображается 1:1.

## Стилизация SVG через CSS

Inline SVG стилизуется как обычный HTML:

```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
</svg>
```

```css
.icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
  transition: color 0.2s;
}

.icon:hover {
  color: #6366f1;
}
```

`currentColor` — цвет наследуется от CSS-свойства `color`. Это позволяет менять цвет SVG через `color`, как текст.

### fill и stroke

```css
.icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

## Анимации SVG

### CSS-анимации

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

```html
<svg class="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="3"/>
  <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
</svg>
```

Анимация обводки (stroke-dasharray):

```css
.draw {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw 2s ease forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

Эффект «рисования» линии — линия появляется постепенно.

### SMIL-анимации

Анимации прямо в SVG без CSS:

```html
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1">
    <animate
      attributeName="r"
      from="40"
      to="45"
      dur="1s"
      repeatCount="indefinite"
      values="40;45;40"
    />
  </circle>
</svg>
```

SMIL работает, но Chrome рекомендует CSS-анимации или Web Animations API.

## Группировка и переиспользование

### g — группа

```html
<svg viewBox="0 0 100 100">
  <g fill="#6366f1" stroke="white" stroke-width="2">
    <circle cx="30" cy="50" r="20"/>
    <circle cx="70" cy="50" r="20"/>
  </g>
</svg>
```

Атрибуты `g` наследуются дочерними элементами.

### defs и use — переиспользование элементов

```html
<svg viewBox="0 0 100 100">
  <defs>
    <circle id="dot" r="5" fill="#6366f1"/>
  </defs>

  <use href="#dot" x="20" y="50"/>
  <use href="#dot" x="50" y="50"/>
  <use href="#dot" x="80" y="50"/>
</svg>
```

`defs` — определяет элемент без отрисовки. `use` — рисует копию в указанной позиции.

### symbol — шаблон с собственным viewBox

```html
<svg style="display:none">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1V10"/>
  </symbol>
  <symbol id="icon-user" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
  </symbol>
</svg>

<svg class="icon"><use href="#icon-home"/></svg>
<svg class="icon"><use href="#icon-user"/></svg>
```

## Система иконок

### SVG sprite

Все иконки в одном файле, подключаемом через `<use>`:

```html
<!-- sprite.svg -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </symbol>
</svg>
```

```html
<svg class="icon"><use href="sprite.svg#menu"/></svg>
```

### В Vue/Nuxt — компоненты

```vue
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <slot/>
  </svg>
</template>

<script setup>
defineProps({ size: { type: [Number, String], default: 24 } })
</script>
```

Использование:

```vue
<IconBase :size="20">
  <path d="M3 12l9-9 9 9"/>
</IconBase>
```

### Nuxt Icon / @nuxt/ui

В этом проекте иконки через `@iconify-json/lucide`:

```vue
<UIcon name="i-lucide-home" />
<UIcon name="i-lucide-user" :size="20" />
```

Иконки автоматически tree-shake'ятся — в сборку попадают только используемые.

## Оптимизация SVG

**SVGO** — удаляет мусор из SVG-файлов:

```bash
npx svgo icon.svg
npx svgo -f ./icons/
```

Что удаляет:
- Редакторские метаданные (Illustrator, Figma)
- Пустые атрибуты и группы
- Округляет координаты
- Убирает скрытые элементы

## Практические примеры

### Иконка с hover

```html
<button class="icon-btn">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
</button>
```

```css
.icon-btn {
  color: #9ca3af;
  transition: color 0.2s, transform 0.2s;
}

.icon-btn:hover {
  color: #ef4444;
  transform: scale(1.2);
}
```

### Чекбокс с SVG-галочкой

```html
<label class="checkbox">
  <input type="checkbox">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</label>
```

### Загрузочный спиннер

```html
<svg class="spinner" viewBox="0 0 50 50" width="40" height="40">
  <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" stroke-width="4"/>
  <circle cx="25" cy="25" r="20" fill="none" stroke="#6366f1" stroke-width="4"
    stroke-dasharray="80 126" stroke-linecap="round"/>
</svg>
```

## Итог

- Inline SVG — для иконок и интерактивной графики (стилизация CSS, события JS)
- `<img>` — для иллюстраций, не требующих стилизации
- `viewBox` — система координат, обязательно для масштабируемых иконок
- `path` — универсальный тег для любых форм
- `currentColor` — цвет SVG наследуется от CSS `color`
- `defs` + `use` / `symbol` — переиспользование и спрайты
- SVGO — оптимизация SVG-файлов
