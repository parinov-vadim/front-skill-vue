---
title: "@layer в CSS: управление каскадом"
description: "CSS @layer — каскадные слои для управления приоритетом стилей. Как @layer решает конфликты, порядок слоёв, @import layer и лучшие практики."
section: css
difficulty: intermediate
readTime: 7
order: 16
tags: [@layer, cascade layers, каскад, CSS, приоритет стилей, @import]
---

## Проблема

Когда подключаете CSS-библиотеку, её стили могут конфликтовать с вашими. Приходится использовать `!important` или повышать специфичность. `@layer` решает это элегантно.

## Что такое @layer

`@layer` создаёт именованные «слои» каскада. Стили в **позднем** слое побеждают стили в **раннем**, независимо от специфичности:

```css
@layer base, components, utilities;

@layer base {
  a {
    color: blue;
    text-decoration: underline;
  }

  h1 {
    font-size: 2rem;
  }
}

@layer components {
  a {
    color: #6366f1;
    text-decoration: none;
  }
}

@layer utilities {
  .text-red {
    color: red !important;
  }
}
```

Порядок объявления имён слоёв **определяет приоритет**: `base` < `components` < `utilities`. Стиль из `components` перезапишет `base`, даже если селектор в `base` специфичнее.

## Объявление порядка слоёв

Первый способ — перечислить все слои одним правилом:

```css
@layer reset, base, components, utilities;
```

Второй — через `@import`:

```css
@import url('normalize.css') layer(reset);
@import url('components.css') layer(components);
```

Третий — порядок определяется первым появлением:

```css
@layer base { /* ... */ }
@layer components { /* ... */ }
@layer utilities { /* ... */ }
```

Важно: порядок определяется **первым** вхождением. Если написать `@layer base` ещё раз — он не сдвинется.

## Стили без слоя — самый высокий приоритет

Стили не помещённые в `@layer`, **всегда побеждают** стили из слоёв:

```css
@layer base {
  h1 { color: gray; }
}

/* Это перезапишет слой base, даже с меньшей специфичностью */
h1 { color: black; }
```

Это позволяет вашим стилям побеждать библиотечные, если библиотека использует `@layer`.

## Вложенные слои

```css
@layer framework {
  @layer reset { /* ... */ }
  @layer base { /* ... */ }
  @layer components { /* ... */ }
}

/* Обратиться к вложенному слою */
@layer framework.components {
  .btn { /* ... */ }
}
```

## Практическое применение

### Организация CSS в проекте

```css
@layer reset, tokens, base, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

@layer tokens {
  :root {
    --color-primary: #6366f1;
    --color-text: #111827;
    --font-sans: 'Inter', sans-serif;
  }
}

@layer base {
  body {
    font-family: var(--font-sans);
    color: var(--color-text);
    line-height: 1.6;
  }

  a {
    color: var(--color-primary);
  }
}

@layer components {
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }

  .card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

### Изоляция сторонней библиотеки

```css
@import url('some-library.css') layer(vendor);

/* Ваши стили — без слоя — всегда побеждают */
.button {
  background: #6366f1;
}
```

Библиотека не сможет перезаписать ваши стили (кроме `!important`).

### Tailwind через @layer

```css
@layer base {
  body { font-family: system-ui; }
}

@layer components {
  .card { border-radius: 12px; }
}

@layer utilities {
  .text-gradient {
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

Tailwind сам использует `@layer` — ваши слои не конфликтуют с его.

## @layer и !important

`!important` **инвертирует** приоритет слоёв. `!important` в раннем слое побеждает `!important` в позднем:

```css
@layer base, components;

@layer base {
  h1 { color: red !important; } /* побеждает — ранний слой + !important */
}

@layer components {
  h1 { color: blue !important; } /* проигрывает */
}
```

Это 设计но — `!important` означает «это правило критически важно», и ранние слои (reset, base) считаются более фундаментальными.

## Когда использовать @layer

- В проектах с несколькими источниками стилей (библиотеки + свои)
- Для чёткой структуры: reset → tokens → base → components → utilities
- При подключении CSS-фреймворков — чтобы их можно было перезаписать
- В дизайн-системах для разделения ответственности

## Итог

- `@layer` управляет приоритетом через слои, а не специфичность
- Поздние слои побеждают ранние. Стили без слоя побеждают все слои
- Порядок определяется **первым** упоминанием имён
- `!important` инвертирует приоритет слоёв
- Используйте для организации: reset → base → components → utilities
