---
title: React + TypeScript
description: "Типизация React-компонентов: FC, Props, generics, useState, useRef, useRef typing, event handlers и полезные паттерны."
section: react
difficulty: intermediate
readTime: 12
order: 11
tags: [React, TypeScript, FC, Props, типизация, generics]
---

## Типизация компонентов

### Function Components (FC)

```tsx
type Props = {
  title: string
  count: number
}

function Header({ title, count }: Props) {
  return <h1>{title} ({count})</h1>
}

// Альтернатива через FC
const Header: React.FC<Props> = ({ title, count }) => {
  return <h1>{title} ({count})</h1>
}
```

В современной практике `FC` используют реже — обычная функция с типизированным props понятнее и гибче.

### Children

```tsx
type CardProps = {
  children: React.ReactNode
  title?: string
}

function Card({ children, title }: CardProps) {
  return (
    <div className="border rounded p-4">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  )
}

// Использование
<Card title="Профиль">
  <p>Содержимое карточки</p>
</Card>
```

### Расширение HTML-элементов

```tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className ?? ''}`}
      {...rest}
    />
  )
}

// Все нативные атрибуты button доступны: onClick, disabled, type и т.д.
<Button type="submit" disabled={false} onClick={() => {}}>
  Отправить
</Button>
```

## useState

```tsx
const [name, setName] = useState<string>('')

const [user, setUser] = useState<{ name: string; age: number } | null>(null)

const [items, setItems] = useState<string[]>([])

// TypeScript выводит тип из начального значения — аннотация не нужна
const [count, setCount] = useState(0)       // number
const [isOpen, setIsOpen] = useState(false) // boolean

// Но для null/undefined начального значения тип нужен
const [data, setData] = useState<User | null>(null)
```

### Обновление через функцию

```tsx
setUser((prev) => ({
  ...prev!,
  name: 'Иван',
}))
```

## useRef

```tsx
// Ссылка на DOM-элемент
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  inputRef.current?.focus()
}, [])

return <input ref={inputRef} />

// Ссылка на произвольное значение (мутабельное)
const timerRef = useRef<number | null>(null)

useEffect(() => {
  timerRef.current = window.setTimeout(() => { /* ... */ }, 1000)
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [])
```

`useRef<number>` создаёт `MutableRefObject<number | undefined>`. Если нужно строго без `undefined` — передайте начальное значение:

```tsx
const countRef = useRef(0)   // MutableRefObject<number>
```

## Обработчики событий

```tsx
function Form() {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    console.log('Клик')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Отправить</button>
    </form>
  )
}
```

Основные типы событий:

| Событие | Тип |
|---------|-----|
| `onChange` | `React.ChangeEvent<HTMLInputElement>` |
| `onClick` | `React.MouseEvent<HTMLButtonElement>` |
| `onSubmit` | `React.FormEvent<HTMLFormElement>` |
| `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` |
| `onFocus` | `React.FocusEvent<HTMLInputElement>` |

## Props с generic-компонентами

```tsx
type ListProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string | number
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Использование
<List
  items={[{ id: 1, name: 'Иван' }, { id: 2, name: 'Мария' }]}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

## forwardRef

Для передачи ref в дочерний компонент:

```tsx
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...rest }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...rest} />
      </div>
    )
  },
)

Input.displayName = 'Input'

// Использование
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <Input ref={inputRef} label="Email" />
}
```

## ComponentProps — извлечение типов

```tsx
// Получить тип props компонента
type ButtonProps = React.ComponentProps<typeof Button>

// Получить тип props HTML-элемента
type DivProps = React.ComponentProps<'div'>

// ComponentPropsWithRef включает ref
type InputProps = React.ComponentPropsWithRef<'input'>
```

## Паттерн: discriminated union для варианта компонента

```tsx
type AlertProps =
  | { variant: 'success'; message: string }
  | { variant: 'error'; error: Error }
  | { variant: 'warning'; warnings: string[] }

function Alert(props: AlertProps) {
  switch (props.variant) {
    case 'success':
      return <div className="text-green-600">{props.message}</div>
    case 'error':
      return <div className="text-red-600">{props.error.message}</div>
    case 'warning':
      return (
        <ul className="text-yellow-600">
          {props.warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )
  }
}
```

TypeScript гарантирует, что в каждом `case` доступны только соответствующие поля.

## Типизация кастомных хуков

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : initialValue
  })

  function setStored(newValue: T) {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setStored] as const
}

// Использование
const [name, setName] = useLocalStorage<string>('name', '')
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
```

## Итог

Типизация React — это в первую очередь типизация props и событий. `React.ButtonHTMLAttributes`, `React.ChangeEvent`, `React.ComponentProps` покрывают большинство случаев. Для сложных вариантов используйте discriminated unions и generics. Чем точнее типы — тем меньше багов.
