---
title: "CSS-анимации: @keyframes, transition и transform"
description: "Анимации в CSS — transition для простых переходов, @keyframes для сложных анимаций, transform для трансформаций, свойства animation-duration, timing-function, will-change."
section: css
difficulty: intermediate
readTime: 11
order: 7
tags: [CSS анимации, transition, keyframes, transform, animation, timing-function, CSS]
---

## Transition — простые переходы

`transition` анимирует изменение свойства при смене значения (hover, класс, JS):

```css
.button {
  background: #6366f1;
  color: white;
  transition: background 0.3s ease, transform 0.2s ease;
}

.button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}
```

Свойство, которое нужно анимировать, указывается у **начального** состояния, а не у `:hover`.

### Полный синтаксис

```css
transition: свойство длительность функция задержка;

transition: background 0.3s ease 0.1s;
transition: all 0.3s ease; /* все анимируемые свойства */
transition: transform 0.2s, opacity 0.3s; /* несколько */
```

### Timing functions

```css
transition-timing-function: linear;       /* равномерно */
transition-timing-function: ease;         /* медленно → быстро → медленно (по умолчанию) */
transition-timing-function: ease-in;      /* медленный старт */
transition-timing-function: ease-out;     /* медленный финиш */
transition-timing-function: ease-in-out;  /* медленный старт и финиш */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* кастомная кривая */
```

Популярные кривые:

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);  /* Material Design */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55); /* «пружина» */
--ease-snap: cubic-bezier(0.9, 0, 0.1, 1);     /* резкий */
```

### Какие свойства можно анимировать

Хорошо анимируются: `opacity`, `transform`, `color`, `background-color`, `box-shadow`, `border-radius`.

Плохо (вызывают reflow): `width`, `height`, `top`, `left`, `margin`, `padding`.

Замените `width`/`height` на `transform: scale()`, а `top`/`left` на `transform: translate()`:

```css
.bad {
  transition: width 0.3s;
}
.bad:hover { width: 300px; }

.good {
  transition: transform 0.3s;
}
.good:hover { transform: scaleX(1.2); }
```

## Transform — трансформации

Не вызывают reflow —GPU-ускоренные:

```css
.translate { transform: translate(50px, 20px); }
.scale    { transform: scale(1.5); }
.rotate   { transform: rotate(45deg); }
.skew     { transform: skew(10deg, 5deg); }

/* Комбинация — порядок важен! */
.combined { transform: translateX(50%) rotate(45deg) scale(0.8); }
```

### translate

```css
transform: translateX(20px);        /* сдвиг по X */
transform: translateY(-50%);        /* сдвиг на 50% высоты элемента */
transform: translate(20px, 30px);   /* по X и Y */

/* Центрирование */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### scale

```css
transform: scale(1.5);       /* увеличить в 1.5 раза */
transform: scaleX(2);        /* растянуть по горизонтали */
transform: scale(0.8);       /* уменьшить */
transform: scale(-1, 1);     /* отразить по горизонтали */
```

### rotate

```css
transform: rotate(45deg);    /* по часовой на 45° */
transform: rotate(-90deg);   /* против часовой */
transform: rotateX(180deg);  /* 3D — перевернуть */
```

### transform-origin

Точка, вокруг которой происходит трансформация:

```css
transform-origin: center;        /* по умолчанию */
transform-origin: top left;
transform-origin: 50% 100%;      /* нижний центр */
transform-origin: 0 0;           /* левый верхний угол */
```

## @keyframes — сложные анимации

Для анимаций с несколькими шагами:

```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.element {
  animation: slideIn 0.5s ease forwards;
}
```

### Промежуточные шаги через %

```css
@keyframes bounce {
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-20px); }
  50%  { transform: translateY(0); }
  70%  { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.ball {
  animation: bounce 1s ease infinite;
}
```

### Полный синтаксис animation

```css
animation: name duration timing-function delay iteration-count direction fill-mode play-state;

animation: slideIn 0.5s ease 0.2s 1 normal forwards;
```

Разбор по свойствам:

```css
animation-name: slideIn;            /* имя @keyframes */
animation-duration: 0.5s;           /* длительность одного цикла */
animation-timing-function: ease;    /* кривая */
animation-delay: 0.2s;              /* задержка перед стартом */
animation-iteration-count: 1;       /* повторов (infinite — бесконечно) */
animation-direction: normal;        /* normal | reverse | alternate | alternate-reverse */
animation-fill-mode: forwards;      /* что после завершения */
animation-play-state: running;      /* running | paused */
```

### fill-mode

```css
animation-fill-mode: none;      /* после завершения — начальные стили (по умолчанию) */
animation-fill-mode: forwards;  /* остаются стили последнего ключевого кадра */
animation-fill-mode: backwards; /* до старта — стили первого кадра */
animation-fill-mode: both;      /* оба поведения */
```

### direction

```css
animation-direction: normal;            /* 0% → 100% */
animation-direction: reverse;           /* 100% → 0% */
animation-direction: alternate;         /* 0% → 100% → 0% → ... */
animation-direction: alternate-reverse; /* 100% → 0% → 100% → ... */
```

## Практические примеры

### Появление при скролле (fade in)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running'
      observer.unobserve(entry.target)
    }
  })
})

document.querySelectorAll('.fade-in').forEach(el => {
  el.style.animationPlayState = 'paused'
  observer.observe(el)
})
```

### Пульсирующая кнопка

```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
  50%      { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
}

.cta-button {
  animation: pulse 2s ease infinite;
}
```

### Загрузочный спиннер

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Hover-эффект для карточки

```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

## will-change — подсказка браузеру

Указывает, какие свойства будут анимироваться — браузер заранее оптимизирует:

```css
.animated-element {
  will-change: transform, opacity;
}
```

Не ставьте `will-change` всем элементам подряд — это расходует память. Только для элементов, которые **сейчас** будут анимироваться.

## prefers-reduced-motion

Уважайте настройки пользователя — если он попросил меньше движения:

```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

.element {
  animation: slideIn 0.5s ease;
}

@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

## Итог

- `transition` — для простых переходов при hover/focus/class change
- `@keyframes` + `animation` — для многошаговых и бесконечных анимаций
- `transform` — GPU-ускоренные трансформации, не вызывают reflow
- Анимируйте `transform` и `opacity` — не `width`/`height`/`top`
- `will-change` — подсказка для оптимизации, не используйте везде
- Уважайте `prefers-reduced-motion`
