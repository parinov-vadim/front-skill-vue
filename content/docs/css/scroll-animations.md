---
title: "Scroll-driven animations: CSS-анимации при прокрутке"
description: "Scroll-driven animations в CSS — animation-timeline: scroll() и view(), анимации привязанные к прокрутке, progress bar, reveal-эффекты без JavaScript."
section: css
difficulty: intermediate
readTime: 8
order: 18
tags: [scroll-driven animations, анимации при прокрутке, scroll animations, animation-timeline, CSS анимации, parallax]
---

## Что такое scroll-driven animations

Обычные CSS-анимации привязаны ко времени. Scroll-driven — к позиции прокрутки. Прокрутите вниз — анимация продвигается. Прокрутите вверх — откатывается. Никакого JavaScript и IntersectionObserver.

## animation-timeline: scroll()

Привязывает анимацию к прокрутке **ближайшего предка с overflow: scroll/auto**:

```css
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll();
}

@keyframes grow {
  from { width: 0; }
  to { width: 100%; }
}
```

Полоса заполняется по мере прокрутки страницы.

### Указание контейнера прокрутки

По умолчанию берётся ближайший scroll-контейнер. Можно указать конкретный через имя:

```css
.scroll-container {
  overflow-y: auto;
  scroll-timeline-name: --my-scroll;
}

.animated-element {
  animation: fade-in linear;
  animation-timeline: scroll(--my-scroll);
}
```

### Ось прокрутки

```css
.animated {
  animation-timeline: scroll();
  animation-axis: block;  /* вертикальная (по умолчанию) */
  animation-axis: inline; /* горизонтальная */
}
```

Короткая запись:

```css
animation-timeline: scroll(block);
animation-timeline: scroll(inline inline);
animation-timeline: scroll(--name block);
```

## animation-timeline: view()

Анимация привязана к **появлению элемента в видимой области**. Начинается, когда элемент входит во viewport, заканчивается — когда выходит:

```css
.reveal {
  animation: reveal linear both;
  animation-timeline: view();
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### animation-range

Задаёт, на каком отрезке видимости работает анимация:

```css
.reveal {
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

Значения range:

| Значение | Когда |
|----------|-------|
| `entry` | элемент входит в viewport |
| `exit` | элемент выходит из viewport |
| `entry-crossing` | элемент полностью вошёл |
| `exit-crossing` | элемент полностью вышел |
| `contain` | элемент полностью виден |

Комбинирование:

```css
.fade-in {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Элемент появляется в первые 40% прокрутки через его область.

## Практические примеры

### Прогресс-бар чтения статьи

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: #6366f1;
  animation: progress linear;
  animation-timeline: scroll();
  z-index: 100;
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
}
```

### Parallax-слои

```css
.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll();
}

@keyframes parallax {
  from { transform: translateY(0); }
  to { transform: translateY(-150px); }
}
```

Разная скорость для разных слоёв — регулируйте `translateY`:

```css
.slow { animation: parallax-slow linear; animation-timeline: scroll(); }
.fast { animation: parallax-fast linear; animation-timeline: scroll(); }

@keyframes parallax-slow { to { transform: translateY(-50px); } }
@keyframes parallax-fast { to { transform: translateY(-200px); } }
```

### Reveal при появлении

```css
.reveal-up {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
}

.reveal-left {
  animation: reveal-left linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes reveal-left {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
}
```

### Масштабирование при скролле

```css
.zoom-in {
  animation: zoom linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 50%;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Горизонтальная прокрутка (scroll snap + timeline)

```css
.horizontal-gallery {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.gallery-item {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 300px;
  animation: scale-in linear both;
  animation-timeline: view();
  animation-axis: inline;
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0.5; }
  to { transform: scale(1); opacity: 1; }
}
```

### Фиксированная секция с меняющимся контентом

```css
.sticky-section {
  position: sticky;
  top: 0;
  height: 100vh;
}

.sticky-section .frame {
  animation: frame-in linear both;
  animation-timeline: view();
}

@keyframes frame-in {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
```

## Timeline scope

Чтобы элемент анимировался по прокрутке **не своего** контейнера, используйте `timeline-scope`:

```css
.wrapper {
  timeline-scope: --page-scroll;
  scroll-timeline-name: --page-scroll;
}

.animated-child {
  animation: grow linear;
  animation-timeline: scroll(--page-scroll);
}
```

Это связывает анимацию дочернего элемента с прокруткой wrapper, даже если дочерний элемент не является прямым потомком scroll-контейнера.

## Поддержка

- Chrome 115+, Edge 115+ — полная поддержка
- Firefox — в разработке (за флагом)
- Safari — пока нет

Фоллбэк — обычная анимация или IntersectionObserver:

```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  animation: reveal-up linear both;
  animation-timeline: view();
}

@supports not (animation-timeline: view()) {
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

```js
if (!CSS.supports('animation-timeline', 'view()')) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  })
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
}
```

## Итог

- `animation-timeline: scroll()` — анимация привязана к прокрутке контейнера
- `animation-timeline: view()` — анимация привязана к появлению элемента
- `animation-range` — настройка начала и конца анимации
- Не нужен JavaScript для базовых эффектов (reveal, parallax, progress)
- Поддержка — Chrome/Edge 115+, для остальных — фоллбэк через IntersectionObserver
