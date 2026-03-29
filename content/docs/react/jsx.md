---
title: Что такое JSX?
description: JSX — расширение синтаксиса JavaScript, позволяющее писать HTML-подобный код в JS-файлах. Компилируется в вызовы React.createElement().
section: react
difficulty: beginner
readTime: 7
order: 1
tags: [JSX, React, components, rendering]
---

## Что такое JSX?

**JSX (JavaScript XML)** — синтаксическое расширение JavaScript, которое позволяет писать HTML-подобный код прямо в JS/TS-файлах.

```jsx
// JSX
const element = <h1 className="title">Привет, мир!</h1>

// Компилируется в:
const element = React.createElement('h1', { className: 'title' }, 'Привет, мир!')
```

JSX — не обязателен, но делает код React значительно читаемее.

## Основы синтаксиса

### JavaScript в JSX

Любое JS-выражение можно вставить в фигурных скобках `{}`:

```jsx
const name = 'Иван'
const age = 25

function Greeting() {
  return (
    <div>
      <h1>Привет, {name}!</h1>
      <p>Тебе {age * 2} лет через {age} лет</p>
      <p>{age >= 18 ? 'Совершеннолетний' : 'Несовершеннолетний'}</p>
    </div>
  )
}
```

### Атрибуты в JSX

В JSX атрибуты используют camelCase:

```jsx
// HTML          → JSX
// class         → className
// for           → htmlFor
// tabindex      → tabIndex
// onclick       → onClick
// maxlength     → maxLength

<div className="card" tabIndex={0}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    maxLength={100}
    onChange={handleChange}
  />
</div>
```

### Самозакрывающиеся теги

В JSX все теги должны быть закрыты:

```jsx
// ✅ Правильно
<img src={url} alt="Описание" />
<input type="text" />
<br />

// ❌ Ошибка — не закрыт тег
<img src={url}>
```

## Условный рендеринг

```jsx
// Тернарный оператор
function Status({ isOnline }) {
  return (
    <span className={isOnline ? 'green' : 'red'}>
      {isOnline ? 'Онлайн' : 'Офлайн'}
    </span>
  )
}

// Логическое И (&&)
function Notification({ count }) {
  return (
    <div>
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  )
  // Осторожно: {0 && <span>} выведет "0"!
  // Лучше: {count > 0 && ...} или {!!count && ...}
}

// Переменная
function UserMenu({ user }) {
  let content

  if (!user) {
    content = <LoginButton />
  } else if (user.isAdmin) {
    content = <AdminPanel />
  } else {
    content = <UserPanel user={user} />
  }

  return <nav>{content}</nav>
}
```

## Рендеринг списков

```jsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

`key` обязателен — уникальный стабильный идентификатор.

## Фрагменты

Компонент может возвращать только один корневой элемент. Фрагменты позволяют избежать лишних div:

```jsx
import { Fragment } from 'react'

function TableRow({ name, age }) {
  return (
    <Fragment>
      <td>{name}</td>
      <td>{age}</td>
    </Fragment>
  )
}

// Сокращённый синтаксис
function TableRow({ name, age }) {
  return (
    <>
      <td>{name}</td>
      <td>{age}</td>
    </>
  )
}
```

## Стили в JSX

```jsx
// className для CSS-классов
<div className="card active">

// Инлайн-стили: объект с camelCase свойствами
<div style={{ backgroundColor: '#fff', fontSize: '16px', marginTop: 8 }}>
```

## JSX — это просто JavaScript

```jsx
// JSX можно хранить в переменных
const button = <button onClick={onClick}>Нажми</button>

// Передавать как аргументы
function wrap(element) {
  return <div className="wrapper">{element}</div>
}

// Возвращать из функций
const renderTitle = (text) => <h1>{text}</h1>

// Использовать в массивах
const items = ['А', 'Б', 'В'].map((letter, i) => (
  <li key={i}>{letter}</li>
))
```

## JSX и TypeScript

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
```
