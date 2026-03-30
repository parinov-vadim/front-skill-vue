---
title: "CSS фильтры: blur, brightness, drop-shadow, backdrop-filter"
description: "CSS фильтры — filter и backdrop-filter для эффектов размытия, яркости, теней, насыщенности. Практические примеры: glassmorphism, hover-эффекты, обработка изображений."
section: css
difficulty: intermediate
readTime: 7
order: 13
tags: [фильтры, filter, backdrop-filter, blur, drop-shadow, glassmorphism, CSS]
---

## filter — фильтры элемента

Применяет графические эффекты к элементу:

```css
.image {
  filter: blur(4px);
  filter: brightness(1.2);
  filter: contrast(1.5);
  filter: grayscale(100%);
  filter: saturate(2);
  filter: sepia(80%);
  filter: hue-rotate(90deg);
  filter: invert(100%);
  filter: opacity(50%);
  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));
}
```

Комбинирование:

```css
.photo {
  filter: brightness(1.1) contrast(1.2) saturate(1.3);
}
```

### blur — размытие

```css
.blurred {
  filter: blur(8px);
}

/* При hover — убрать размытие */
.card img {
  filter: blur(4px);
  transition: filter 0.3s;
}

.card:hover img {
  filter: blur(0);
}
```

### brightness — яркость

```css
img {
  transition: filter 0.3s;
}

img:hover {
  filter: brightness(1.2);
}

/* Затемнение */
.overlay-image {
  filter: brightness(0.6);
}
```

### grayscale — чёрно-белое

```css
.logo {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.logo:hover {
  filter: grayscale(0%);
}
```

### drop-shadow — тень по контуру

В отличие от `box-shadow`, `drop-shadow` следует форме элемента — работает с прозрачностью PNG/SVG:

```css
.icon {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.png-image {
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}
```

### hue-rotate — сдвиг цвета

```css
.rainbow {
  animation: hue 3s linear infinite;
}

@keyframes hue {
  to { filter: hue-rotate(360deg); }
}
```

## backdrop-filter — фильтры фона

Применяет фильтр к **содержимому за элементом**, а не к самому элементу. Требует полупрозрачный фон:

```css
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}
```

### Glassmorphism

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  color: white;
}
```

Тёмный вариант:

```css
.glass-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Фиксированный header с blur

```css
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}
```

При прокрутке контент мягко просвечивает через header.

### Sidebar с blur

```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

## Практические примеры

### Hover-эффект для карточки с изображением

```css
.card img {
  transition: filter 0.3s ease;
}

.card:hover img {
  filter: brightness(0.7);
}
```

###Disabled состояние

```css
.avatar.disabled {
  filter: grayscale(100%) opacity(0.5);
}
```

### Тёмная тема изображения

```css
@media (prefers-color-scheme: dark) {
  .hero-image {
    filter: brightness(0.8) contrast(1.1);
  }
}
```

### Модальное окно с размытым фоном

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
}
```

### Фильтры с CSS-переменными

```css
:root {
  --blur: 0px;
  --brightness: 1;
  --saturate: 1;
}

.image {
  filter:
    blur(var(--blur))
    brightness(var(--brightness))
    saturate(var(--saturate));
  transition: filter 0.3s ease;
}
```

```js
document.querySelector('.image').style.setProperty('--blur', '8px')
```

## Предупреждения

- `backdrop-filter` требует **полупрозрачный фон** — без `background` ничего не будет видно
- Safari требует префикс `-webkit-backdrop-filter`
- Фильтры влияют на производительность — не применяйте к слишком большому числу элементов
- `filter: blur()` может выйти за границы элемента — добавьте `overflow: hidden` на родителя

## Итог

- `filter` — эффекты на сам элемент (blur, brightness, grayscale, drop-shadow)
- `backdrop-filter` — эффекты на фон за элементом (glassmorphism)
- `drop-shadow` следует контуру элемента, `box-shadow` — прямоугольнику
- Для glassmorphism: полупрозрачный фон + `backdrop-filter: blur()`
- Не забывайте `-webkit-` префикс для Safari
