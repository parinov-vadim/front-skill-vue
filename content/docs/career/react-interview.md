---
title: "Собеседование по React: жизненный цикл, хуки, паттерны"
description: "Подготовка к React-собеседованию: типичные вопросы про хуки, виртуальный DOM, состояние, жизненный цикл, оптимизацию, паттерны компонентов."
section: career
difficulty: intermediate
readTime: 16
order: 4
tags: [собеседование, React, хуки, hooks, виртуальный DOM, жизненный цикл, оптимизация, interview]
---

## Базовые вопросы

### Что такое React?

Библиотека для построения пользовательских интерфейсов. Ключевые идеи:
- **Компонентный подход** — UI состоит из переиспользуемых компонентов
- **Декларативность** — описываем, как должен выглядеть UI, а не как его обновить
- **Виртуальный DOM** — React сам решает, что перерисовать

### Что такое JSX?

Синтаксис, похожий на HTML внутри JavaScript:

```jsx
const element = <h1 className="title">Привет, {name}!</h1>
```

Под капотом — вызовы `React.createElement`:

```js
const element = React.createElement('h1', { className: 'title' }, 'Привет, ', name, '!')
```

JSX — не шаблон, а выражение JavaScript. Внутри `{}` можно писать любой JS-код.

### Разница между компонентом и элементом?

Элемент — объект, описывающий, что отрисовать. Компонент — функция или класс, возвращающая элемент.

```jsx
// Компонент
function Welcome({ name }) {
  return <h1>Привет, {name}</h1>
}

// Элемент
const element = <Welcome name="Анна" />
```

## Хуки

### Что такое хуки?

Функции, позволяющие использовать состояние и другие возможности React в функциональных компонентах. Появились в React 16.8 (2019).

### Как работает `useState`?

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Нажато: {count}
    </button>
  )
}
```

`useState` возвращает пару: текущее значение и функцию для обновления. Обновление **асинхронное** — React батчит несколько вызовов.

### В чём ловушка `useState` с объектом?

```jsx
// Неправильно — не обновится
setUser({ name: 'Анна' })

// Правильно — создаём новый объект
setUser({ ...user, name: 'Анна' })
```

React сравнивает ссылки. Мутация старого объекта не вызовет перерисовку.

### Как работает `useEffect`?

Выполняет побочные эффекты после рендера:

```jsx
useEffect(() => {
  // Выполняется после каждого рендера
})

useEffect(() => {
  // Выполняется один раз при монтировании
}, [])

useEffect(() => {
  // Выполняется при изменении userId
}, [userId])
```

Третий аргумент — массив зависимостей. Пустой массив = выполнить один раз.

### Как очистить эффект?

Вернуть функцию из `useEffect`:

```jsx
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(res => res.json())
    .then(setUser)

  return () => controller.abort() // очистка при размонтировании
}, [id])
```

### Зачем `useCallback` и `useMemo`?

`useMemo` — кэширует вычисленное значение:

```jsx
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

`useCallback` — кэширует функцию:

```jsx
const handleClick = useCallback((id) => {
  setSelected(id)
}, [])
```

Оба принимают массив зависимостей и пересчитываются только при его изменении. Используйте их, когда есть реальная проблема с производительностью, а не «на всякий случай».

### Что делает `useRef`?

Хранит мутабельное значение, изменение которого **не вызывает перерисовку**:

```jsx
function Timer() {
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => tick(), 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return <div>Таймер</div>
}
```

Также используется для доступа к DOM-элементам:

```jsx
const inputRef = useRef(null)
const focusInput = () => inputRef.current?.focus()
return <input ref={inputRef} />
```

### Разница между `useRef` и `useState`?

| Свойство | `useState` | `useRef` |
|----------|-----------|----------|
| Изменение вызывает рендер | Да | Нет |
| Значение между рендерами | Да | Да |
| Использование | Состояние UI | DOM-ссылки, таймеры, предыдущие значения |

### Порядок выполнения хуков

```jsx
useEffect(() => {
  console.log('B')
  return () => console.log('C')
}, [count])

// При первом рендере: B
// При изменении count: C (cleanup) → B
// При размонтировании: C
```

Cleanup вызывается **до** следующего эффекта и при размонтировании.

## Рендеринг

### Что такое виртуальный DOM?

Лёгкое JavaScript-представление реального DOM. React:
1. Создаёт виртуальное дерево
2. Сравнивает с предыдущим (reconciliation)
3. Обновляет только изменившиеся части реального DOM

Это быстрее, чем обновлять весь DOM при каждом изменении.

### Что такое ключи (`key`) и зачем они нужны?

`key` помогает React определить, какой элемент изменился:

```jsx
{items.map(item => (
  <Item key={item.id} {...item} />
))}
```

Не используйте индекс массива как ключ, если элементы могут добавляться/удаляться — это ломает оптимизацию и может привести к багам с состоянием.

### Что делает `React.memo`?

Оборачивает компонент и предотвращает перерисовку, если props не изменились:

```jsx
const ExpensiveList = React.memo(function List({ items }) {
  return items.map(item => <div key={item.id}>{item.name}</div>)
})
```

Сравнение props — поверхностное (shallow). Для глубокого сравнения передайте вторым аргументом свою функцию.

### Что такое lazy loading?

```jsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

Компонент загружается только когда нужен. `Suspense` показывает fallback пока код подгружается.

## Состояние

### Как передавать данные между компонентами?

**Сверху вниз** — через props:

```jsx
function Parent() {
  const [user, setUser] = useState(null)
  return <Child user={user} onChange={setUser} />
}
```

**Снизу вверх** — через callback-функции в props.

**Глобально** — через Context, Redux, Zustand.

### Что такое Context API?

Способ передавать данные через дерево без props на каждом уровне:

```jsx
const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Header />
      <Main />
    </ThemeContext.Provider>
  )
}

function Header() {
  const theme = useContext(ThemeContext)
  return <header className={theme}>...</header>
}
```

Не используйте Context для данных, которые часто меняются — каждый потребитель перерисовывается при изменении.

### Как управлять формами?

```jsx
function Form() {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Отправить</button>
    </form>
  )
}
```

Для сложных форм используйте React Hook Form или Formik.

## Паттерны

### Что такое compound components?

Компонент состоит из нескольких подкомпонентов, которые работают вместе:

```jsx
<Select>
  <Select.Trigger>Выберите</Select.Trigger>
  <Select.Content>
    <Select.Item value="1">Один</Select.Item>
    <Select.Item value="2">Два</Select.Item>
  </Select.Content>
</Select>
```

### Что такое render props?

Паттерн, где компонент принимает функцию, возвращающую UI:

```jsx
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData)
  }, [url])

  return render(data)
}

<DataFetcher
  url="/api/users"
  render={(data) => data ? <UserList users={data} /> : <Spinner />}
/>
```

Сейчас чаще заменяется хуками.

### Что такое HOC (Higher-Order Component)?

Функция, принимающая компонент и возвращающая новый:

```jsx
function withAuth(Component) {
  return function Authenticated(props) {
    const user = useAuth()
    if (!user) return <Navigate to="/login" />
    return <Component {...props} user={user} />
  }
}

const ProtectedPage = withAuth(Dashboard)
```

### Что такое Error Boundaries?

Компонент, ловящий ошибки рендера в дочерних компонентах:

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return <h1>Что-то пошло не так</h1>
    return this.props.children
  }
}
```

Error Boundaries бывают только классовые. В функциональных компонентах используйте библиотеку `react-error-boundary`.

## Жизненный цикл

### Как lifecycle-методы соотносятся с хуками?

| Классовый метод | Хук |
|-----------------|-----|
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `return () => {}` внутри `useEffect` |
| `shouldComponentUpdate` | `React.memo` |

### Порядок lifecycle при обновлении

```
1. Рендер (виртуальный DOM)
2. Обновление реального DOM
3. useEffect cleanup (если зависимости изменились)
4. useEffect (новый)
```

## Типичные вопросы

### Почему в React односторонний поток данных?

Данные идут сверху вниз (от родителя к ребёнку через props). Ребёнок не может напрямую менять данные родителя — только через callback. Это делает поведение предсказуемым и облегчает отладку.

### Что такое reconciliation?

Процесс сравнения предыдущего и нового виртуального DOM. React определяет минимальный набор изменений для реального DOM.

Алгоритм:
1. Элементы разного типа → заменить полностью
2. Одинаковый тип DOM-элемент → обновить атрибуты
3. Одинаковый тип компонента → обновить props
4. Списки → использовать `key` для сопоставления

### Можно ли использовать React без JSX?

Да:

```jsx
const element = React.createElement('div', { className: 'app' },
  React.createElement('h1', null, 'Привет')
)
```

JSX — это просто удобная обёртка. Babel компилирует JSX в `createElement`.

## Итог

- Хуки — основа современных React-компонентов
- `useEffect` с правильными зависимостями — частая тема на собеседовании
- Ключи (`key`) — не используйте индексы
- `useMemo`/`useCallback` — только при реальной необходимости
- Context — для глобальных данных, не для частых обновлений
- Error Boundaries — классовые, альтернатив — react-error-boundary
- Знайте, как соотносятся классовые lifecycle и хуки
