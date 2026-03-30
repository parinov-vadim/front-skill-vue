---
title: "CSS Nesting: вложенные правила без препроцессора"
description: "Вложенные CSS-правила (Nesting) — нативная вложенность без Sass, синтаксис &, вложенные media queries, правила и сравнение с препроцессорами."
section: css
difficulty: beginner
readTime: 6
order: 15
tags: [CSS nesting, вложенные стили, вложенность CSS, нативный nesting, CSS]
---

## Что такое CSS Nesting

Раньше для вложенности нужен был Sass/LESS. Теперь CSS поддерживает вложенность нативно:

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 1rem;

  .title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .body {
    color: #6b7280;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}
```

Компилируется в:

```css
.card { background: white; border-radius: 12px; padding: 1rem; }
.card .title { font-size: 1.25rem; font-weight: 700; }
.card .body { color: #6b7280; }
.card:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); }
```

## Синтаксис & (амперсанд)

`&` — ссылка на родительский селектор:

```css
.button {
  background: #6366f1;
  color: white;

  &:hover {
    background: #4f46e5;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  &.primary {
    background: #6366f1;
  }

  &.secondary {
    background: #e5e7eb;
    color: #374151;
  }
}
```

### & не только в начале

```css
.card {
  /* ... */

  .wrapper & {
    /* .wrapper .card */
    margin: 0;
  }

  body.dark & {
    /* body.dark .card */
    background: #1f2937;
    color: white;
  }
}
```

## Вложенные media queries

Media queries можно вкладывать прямо в правило:

```css
.container {
  width: 100%;
  padding: 1rem;

  @media (min-width: 768px) {
    width: 750px;
    padding: 2rem;
  }

  @media (min-width: 1024px) {
    width: 980px;
  }
}
```

Это удобнее, чем выносить media query отдельно для каждого компонента.

### Другие at-правила

```css
.card {
  @supports (backdrop-filter: blur(12px)) {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.1);
  }

  @container (min-width: 400px) {
    grid-template-columns: 1fr 2fr;
  }
}
```

## Глубина вложенности

Технически — неограниченная. Практически — не вкладывайте глубже 3 уровней:

```css
/* OK */
.card {
  .title { }
  .body { }
}

/* Уже сомнительно */
.card {
  .header {
    .title { }
    .subtitle { }
  }
}

/* Слишком глубоко — рефакторите */
.card {
  .header {
    .title {
      .icon {
        svg { }
      }
    }
  }
}
```

## Порядок вложенных правил

Вложенные правила **могут** идти вперемешку с объявлениями:

```css
.card {
  background: white;   /* объявление */

  .title { }           /* вложенное правило */

  padding: 1rem;       /* ещё объявление — работает */

  .body { }            /* ещё правило */
}
```

## Сравнение с Sass

```css
/* Нативный CSS */
.nav {
  display: flex;
  gap: 8px;

  a {
    color: #6366f1;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* Sass — то же самое */
.nav {
  display: flex;
  gap: 8px;

  a {
    color: #6366f1;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

Синтаксис идентичен. Если вы переходите с Sass, менять ничего не нужно.

Что Sass умеет, а CSS нет: переменные с `$`, `@mixin`/`@include`, `@extend`, `@function`, математические операции `+`, `-`. Нативный CSS заменяет `@mixin` через кастомные свойства и `@layer`.

## Когда использовать

- В компонентных CSS-файлах — группировка стилей одного компонента
- Вместо Sass для новых проектов — меньше зависимостей
- В `<style>` Vue-компонентов — уже работает

```vue
<style scoped>
.card {
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .content {
    padding: 1rem;
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
}
</style>
```

## Поддержка

CSS Nesting поддерживается во всех современных браузерах с 2023 года. Для старых браузеров используйте PostCSS-плагин `postcss-nesting` или Sass в качестве полифилла.

## Итог

- Нативная вложенность — без Sass, LESS и других препроцессоров
- `&` — ссылка на родительский селектор
- Media queries вкладываются прямо в правило
- Не вкладывайте глубже 3 уровней
- Поддержка во всех современных браузерах
