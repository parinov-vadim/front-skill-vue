---
title: CSS-in-JS — стили в React
description: CSS-in-JS подходы в React: styled-components, Emotion, CSS Modules. Плюсы, минусы, сравнение и когда использовать.
section: react
difficulty: intermediate
readTime: 10
order: 20
tags: [CSS-in-JS, styled-components, Emotion, CSS Modules, React, стили]
---

## Что такое CSS-in-JS

CSS-in-JS — подход, где стили пишутся прямо в JavaScript-файлах. Библиотека генерирует уникальные классы и вставляет стили в `<style>`-теги при рендере.

Основные решения:

| Библиотека | Размер | Особенности |
|------------|--------|-------------|
| styled-components | 16 KB | Template literals, theming |
| Emotion | 8 KB | Быстрая, два API |
| CSS Modules | 0 KB | Встроен в Vite/Webpack |

## styled-components

```bash
npm install styled-components
```

### Базовые стилизованные компоненты

```tsx
import styled from 'styled-components'

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;

  background-color: #6366f1;
  color: white;

  &:hover {
    background-color: #4f46e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

function App() {
  return <Button>Нажми меня</Button>
}
```

### Props

```tsx
const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;

  background-color: ${({ $variant }) =>
    $variant === 'primary' ? '#6366f1' : '#e5e7eb'};
  color: ${({ $variant }) =>
    $variant === 'primary' ? 'white' : '#1f2937'};

  &:hover {
    opacity: 0.9;
  }
`

function Toolbar() {
  return (
    <div>
      <Button $variant="primary">Сохранить</Button>
      <Button $variant="secondary">Отмена</Button>
    </div>
  )
}
```

Префикс `$` — это transient props. Styled-components не передаёт их в DOM-элемент.

### Наследование и расширение

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
`

const IconButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`
```

### Theming

```tsx
import styled, { ThemeProvider } from 'styled-components'

const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#e5e7eb',
    text: '#1f2937',
    background: '#ffffff',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
  borderRadius: '0.375rem',
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.lg};
`

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Card>
        <h2>Карточка</h2>
      </Card>
    </ThemeProvider>
  )
}
```

## Emotion

```bash
npm install @emotion/react @emotion/styled
```

Emotion предлагает два синтаксиса — `css` prop и `styled`:

### css prop

```tsx
/** @jsxImportSource @emotion/react */

function Card({ title }: { title: string }) {
  return (
    <div
      css={{
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        ':hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <h2 css={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
    </div>
  )
}
```

### styled API (аналог styled-components)

```tsx
import styled from '@emotion/styled'

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
`
```

Emotion быстрее styled-components и меньше по размеру. API совместим — можно мигрировать, просто заменив импорт.

## CSS Modules

CSS Modules — не совсем CSS-in-JS, но решает ту же проблему изоляции стилей. Встроен в Vite:

```tsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #6366f1;
  color: white;
  cursor: pointer;
}

.button:hover {
  background-color: #4f46e5;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css'

function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.button}>{children}</button>
}
```

Vite преобразует классы в уникальные имена — конфликты исключены.

Композиция классов:

```css
.button {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.primary {
  composes: button;
  background-color: #6366f1;
  color: white;
}

.secondary {
  composes: button;
  background-color: #e5e7eb;
  color: #1f2937;
}
```

## Сравнение подходов

| Критерий | styled-components | Emotion | CSS Modules | Tailwind |
|----------|-------------------|---------|-------------|----------|
| Runtime | Да | Да | Нет | Нет |
| Изоляция стилей | Авто | Авто | Авто | Через утилиты |
| Динамические стили | Через props | Через props | Через JS | Через классы |
| Размер бандла | 16 KB | 8 KB | 0 KB | ~10 KB (purged) |
| SSR | Поддерживается | Поддерживается | Поддерживается | Поддерживается |
| DX (hot reload) | Медленнее | Быстрее | Быстро | Очень быстро |

## Когда что использовать

**Tailwind CSS** — лучший вариант для новых проектов. Быстрый, не требует runtime, огромная экосистема.

**CSS Modules** — если нужен обычный CSS с изоляцией. Хороший компромисс.

**styled-components / Emotion** — для дизайн-систем и библиотек компонентов, где стили зависят от props и темы. Emotion предпочтительнее — быстрее и меньше.

## Итог

CSS-in-JS даёт полную изоляцию стилей и удобную работу с темами. Но за это приходится платить runtime-накладными расходами. Для большинства проектов Tailwind или CSS Modules — более практичный выбор. styled-components и Emotion оправданы в крупных дизайн-системах.
