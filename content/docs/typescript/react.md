---
title: TypeScript с React
description: Типизация React-компонентов — FC, Props, useState, useRef, useEffect, useContext, handle-функции и work with external libraries.
section: typescript
difficulty: intermediate
readTime: 14
order: 12
tags: [typescript, react, FC, props, useState, useRef, hooks]
---

## React и TypeScript

React хорошо типизируется через `@types/react`. Все хуки имеют встроенные типы, а компоненты описываются через generic-типы.

## Типизация компонентов

### Function Components (FC)

```tsx
interface GreetingProps {
  name: string
  age?: number
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>Привет, {name}!</h1>
      {age && <p>Возраст: {age}</p>}
    </div>
  )
}
```

Тип `React.FC` (или `React.FunctionComponent`) добавляет неявный возврат `ReactElement | null` и поддержку `children`:

```tsx
const Greeting: React.FC<GreetingProps> = ({ name, age }) => {
  return <h1>Привет, {name}!</h1>
}
```

Многие команды предпочитают обычные функции — они гибче и не добавляют лишний `children`.

### children

```tsx
interface LayoutProps {
  children: React.ReactNode
  title: string
}

function Layout({ children, title }: LayoutProps) {
  return (
    <div>
      <h1>{title}</h1>
      <main>{children}</main>
    </div>
  )
}
```

Типы для `children`:

| Тип | Когда использовать |
|-----|-------------------|
| `React.ReactNode` | Любой контент (строка, число, JSX, null) |
| `React.ReactElement` | Только JSX-элемент |
| `string` | Только текст |
| `JSX.Element` | Конкретный JSX |

### Пропсы с функциями-callback

```tsx
interface ButtonProps {
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {label}
    </button>
  )
}
```

### Пропсы с render-функциями

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}
```

## useState

TypeScript выводит тип из начального значения:

```tsx
const [count, setCount] = useState(0) // number
const [name, setName] = useState('') // string
const [active, setActive] = useState(false) // boolean
```

Для сложных типов или `null`:

```tsx
interface User {
  id: number
  name: string
  email: string
}

const [user, setUser] = useState<User | null>(null)
const [items, setItems] = useState<User[]>([])
```

Union-типы:

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error'

const [status, setStatus] = useState<Status>('idle')
```

Функциональное обновление:

```tsx
const [count, setCount] = useState(0)

setCount(prev => prev + 1) // TypeScript знает, что prev: number
```

## useRef

### Ссылка на DOM-элемент

```tsx
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  inputRef.current?.focus()
}, [])

return <input ref={inputRef} />
```

### Ссылка на произвольное значение

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

useEffect(() => {
  timerRef.current = setTimeout(() => {
    console.log('Таймер')
  }, 1000)

  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [])
```

### Ссылка на компонент

```tsx
const modalRef = useRef<React.ComponentRef<typeof Modal>>(null)
// или
const modalRef = useRef<HTMLDialogElement>(null)
```

## useEffect

`useEffect` не требует типизации — он всегда возвращает `void`. Но функции внутри могут потребовать типов:

```tsx
useEffect(() => {
  const controller = new AbortController()

  async function load() {
    const res = await fetch('/api/users', { signal: controller.signal })
    const data: User[] = await res.json()
    setUsers(data)
  }

  load()

  return () => controller.abort()
}, [])
```

## useContext

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider')
  }
  return context
}

function ThemedButton() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>Тема: {theme}</button>
}
```

Паттерн с `null` и проверкой лучше, чем `createContext({})` — TypeScript заставит обработать случай, когда контекст не предоставлен.

## useReducer

```tsx
interface State {
  count: number
  step: number
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    case 'reset':
      return { count: 0, step: 1 }
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })

dispatch({ type: 'increment' })
dispatch({ type: 'setStep', payload: 5 })
```

Discriminated union в `Action` гарантирует, что `payload` доступен только для `setStep`.

## Обработка событий

```tsx
function Form() {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleChange} onKeyDown={handleKeyDown} />
      <button type="submit">Отправить</button>
    </form>
  )
}
```

Шпаргалка по типам событий:

| Событие | Тип |
|---------|-----|
| Click | `React.MouseEvent<T>` |
| Change (input) | `React.ChangeEvent<T>` |
| Submit | `React.FormEvent<T>` |
| KeyDown/Up | `React.KeyboardEvent<T>` |
| Focus/Blur | `React.FocusEvent<T>` |
| Drag | `React.DragEvent<T>` |
| Scroll | `React.UIEvent<T>` |

## forwardRef и generic-компоненты

```tsx
interface InputProps {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} />
        {error && <span className="error">{error}</span>}
      </div>
    )
  }
)
```

Generic-компонент с `forwardRef`:

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

const List = forwardRef<HTMLUListElement, ListProps<any>>(
  ({ items, renderItem }, ref) => {
    return (
      <ul ref={ref}>
        {items.map((item, i) => (
          <li key={i}>{renderItem(item)}</li>
        ))}
      </ul>
    )
  }
) as <T>(
  props: ListProps<T> & { ref?: React.Ref<HTMLUListElement> }
) => React.ReactElement
```

## Практический пример — типизированный Form

```tsx
interface FormValues {
  email: string
  password: string
  remember: boolean
}

function LoginForm() {
  const [values, setValues] = useState<FormValues>({
    email: '',
    password: '',
    remember: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!values.email) newErrors.email = 'Введите email'
    if (!values.password) newErrors.password = 'Введите пароль'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    console.log('Отправка:', values)
  }

  const updateField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={e => updateField('email', e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={values.password}
        onChange={e => updateField('password', e.target.value)}
        placeholder="Пароль"
      />
      {errors.password && <span>{errors.password}</span>}

      <label>
        <input
          type="checkbox"
          checked={values.remember}
          onChange={e => updateField('remember', e.target.checked)}
        />
        Запомнить
      </label>

      <button type="submit">Войти</button>
    </form>
  )
}
```

## Итог

React отлично типизируется. Компоненты — через обычные функции с типизированными props, хуки — через generic-параметры. `useState<T>` и `useRef<T>` для сложных случаев, `useContext` с `null`-паттерном для обязательной проверки, discriminated unions для `useReducer`. Типы событий (`React.MouseEvent`, `React.ChangeEvent`) обеспечивают типобезопасность обработчиков.
