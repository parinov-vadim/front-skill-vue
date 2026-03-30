---
title: Паттерны Custom Hooks
description: "Практические кастомные хуки React: useDebounce, useLocalStorage, useMedia, useToggle, useFetch и другие полезные паттерны."
section: react
difficulty: intermediate
readTime: 12
order: 18
tags: [custom hooks, useDebounce, useLocalStorage, useMedia, React, паттерны]
---

## Что такое кастомный хук

Кастомный хук — функция, имя которой начинается с `use`, и которая может вызывать другие хуки. Позволяет вынести переиспользуемую логику из компонентов.

```tsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle] as const
}

// Использование
function Component() {
  const [isOpen, toggle] = useToggle()
  return <button onClick={toggle}>{isOpen ? 'Закрыть' : 'Открыть'}</button>
}
```

## useDebounce

Задержка выполнения функции — полезно для поиска:

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

```tsx
function SearchUsers() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data } = useQuery({
    queryKey: ['users', debouncedQuery],
    queryFn: () => fetch(`/api/users?q=${debouncedQuery}`).then((r) => r.json()),
    enabled: debouncedQuery.length > 0,
  })

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск пользователей..."
      />
      <ul>
        {data?.map((user: User) => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  )
}
```

## useLocalStorage

Сохранение состояния в localStorage:

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

```tsx
function Settings() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
  const [language, setLanguage] = useLocalStorage('language', 'ru')

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </select>
    </div>
  )
}
```

## useMediaQuery

Реагирует на media query — удобно для адаптивности:

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }
    mql.addEventListener('change', handleChange)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
```

```tsx
function Navbar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  return isMobile ? <MobileNav /> : <DesktopNav />
}
```

## useClickOutside

Закрывать выпадающие списки и модалки при клике вне:

```tsx
function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
```

```tsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setIsOpen(false))

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Меню</button>
      {isOpen && (
        <ul className="absolute bg-white border rounded shadow">
          <li>Пункт 1</li>
          <li>Пункт 2</li>
        </ul>
      )}
    </div>
  )
}
```

## useInterval

Декларативный `setInterval`:

```tsx
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
```

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useInterval(() => setSeconds((s) => s + 1), running ? 1000 : null)

  return (
    <div>
      <p>{seconds} сек</p>
      <button onClick={() => setRunning(!running)}>
        {running ? 'Стоп' : 'Старт'}
      </button>
    </div>
  )
}
```

## useWindowSize

```tsx
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

```tsx
function Layout() {
  const { width } = useWindowSize()

  return width < 768 ? <MobileLayout /> : <DesktopLayout />
}
```

## useDocumentTitle

```tsx
function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => { document.title = previous }
  }, [title])
}
```

```tsx
function UserProfile({ name }: { name: string }) {
  useDocumentTitle(`${name} — Профиль`)
  return <h1>{name}</h1>
}
```

## Правила кастомных хуков

1. Имя начинается с `use` — обязательно, иначе линтер не проверит правила хуков
2. Вызывайте хуки только на верхнем уровне — не в условиях и циклах
3. Возвращайте кортеж (`as const`) или объект — кортеж удобнее, когда 2-3 значения
4. Изолируйте side effects внутри хука — пользователь хука не должен думать об очистке

## Итог

Кастомные хуки — главный механизм переиспользования логики в React. Если один и тот же паттерн встречается в двух и более компонентах — выносите в хук. `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useClickOutside` — это базовый набор, который есть почти в каждом проекте.
