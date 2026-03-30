---
title: React.memo, useMemo, useCallback — оптимизация рендера
description: "Как избежать лишних ре-рендеров в React: React.memo для компонентов, useMemo для вычислений, useCallback для стабильных ссылок на функции."
section: react
difficulty: intermediate
readTime: 10
order: 17
tags: [React.memo, useMemo, useCallback, оптимизация, рендер, React]
---

## Когда React ре-рендерит компонент

1. Изменился state (`useState`, `useReducer`)
2. Изменился context
3. **Родитель ре-риндерился** — все дочерние компоненты рендерятся заново

Третий пункт — главная причина лишних ре-рендеров. Даже если props не изменились, дочерний компонент всё равно рендерится, потому что рендерится родитель.

## React.memo

`React.memo` — HOC, который запоминает результат рендера и пропускает ре-рендер, если props не изменились:

```tsx
import { memo } from 'react'

interface UserCardProps {
  name: string
  email: string
  avatar: string
}

const UserCard = memo(function UserCard({ name, email, avatar }: UserCardProps) {
  return (
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
    </div>
  )
})
```

Если родитель ре-рендерится, но `name`, `email` и `avatar` не изменились — `UserCard` рендер не запустит.

### Кастомная функция сравнения

По умолчанию memo делает поверхностное сравнение (`Object.is`). Для сложных случаев:

```tsx
const ExpensiveList = memo(
  function ExpensiveList({ items, filter }) {
    return items.filter(filter).map(/* ... */)
  },
  (prevProps, nextProps) => {
    return (
      prevProps.items.length === nextProps.items.length &&
      prevProps.items === nextProps.items &&
      prevProps.filter === nextProps.filter
    )
  },
)
```

## useMemo

`useMemo` кэширует результат вычисления между ре-рендерами:

```tsx
import { useMemo } from 'react'

function ProductTable({ products, searchTerm, category }) {
  const filtered = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((p) => !category || p.category === category)
      .sort((a, b) => a.price - b.price)
  }, [products, searchTerm, category])

  return (
    <table>
      {filtered.map((product) => (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>{product.price} ₽</td>
        </tr>
      ))}
    </table>
  )
}
```

Фильтрация и сортировка запустятся только когда `products`, `searchTerm` или `category` изменятся.

### Когда useMemo нужен

```tsx
// ✅ Тяжёлые вычисления
const sortedItems = useMemo(() => heavySort(items), [items])

// ✅ Создание объекта, который передаётся как prop
const options = useMemo(() => ({ page, limit, sort }), [page, limit, sort])

// ✅ Значение используется как зависимость в другом useEffect
const userId = useMemo(() => getUserId(token), [token])
useEffect(() => { fetchUser(userId) }, [userId])

// ❌ Простые вычисления — memo только замедлит
const sum = useMemo(() => a + b, [a, b])  // Сложение и так быстрое
```

## useCallback

`useCallback` кэширует функцию между ре-рендерами:

```tsx
import { useCallback } from 'react'

function TodoList({ todos }) {
  const [filter, setFilter] = useState('all')

  const handleToggle = useCallback((id: number) => {
    toggleTodo(id)
  }, [])

  return (
    <div>
      <FilterButtons current={filter} onChange={setFilter} />
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
      ))}
    </div>
  )
}
```

Без `useCallback` при каждом ре-рендере `TodoList` создавалась бы новая функция `handleToggle`, и `TodoItem` (если он обёрнут в `memo`) ре-рендерился бы каждый раз.

### useCallback и memo работают вместе

```tsx
const TodoItem = memo(function TodoItem({ todo, onToggle }) {
  return (
    <div onClick={() => onToggle(todo.id)}>
      {todo.title}
    </div>
  )
})
```

`memo` проверяет props → `onToggle` не изменился (thanks to `useCallback`) → рендер пропускается.

### Когда useCallback нужен

```tsx
// ✅ Функция передаётся в memo-компонент
const handleClick = useCallback(() => select(id), [id])
return <MemoizedButton onClick={handleClick} />

// ✅ Функция — зависимость в useEffect
const fetchData = useCallback(() => fetch(url), [url])
useEffect(() => { fetchData() }, [fetchData])

// ❌ Функция используется только внутри компонента
const handleSubmit = useCallback(() => { /* ... */ }, [])
// Нет смысла — никто не проверяет эту ссылку
```

## Общая схема

```
Родитель ре-рендерился
  → Дочерний компонент ре-рендерится?
    → Нет memo: ДА, всегда
    → Есть memo: зависит от props
      → Примитивные props (string, number): сравнит по значению
      → Объект/массив/функция: сравнит по ссылке
        → Пересоздаётся каждый рендер? → memo не поможет
        → Обёрнуто в useMemo/useCallback? → memo сработает
```

## Антипаттерны

### Мемоизация всего подряд

```tsx
// ❌ Бессмысленно — memo имеет свою стоимость
const name = useMemo(() => user.name, [user.name])
const handleClick = useCallback(() => setOpen(true), [])

// ✅ Мемоизируйте только то, что реально тормозит
```

### Мемоизация вместо исправления архитектуры

```tsx
// ❌ Передаём весь store, memo бесполезно
const AllProducts = memo(function AllProducts({ store }) {
  return store.products.map(/* ... */)
})

// ✅ Передаём только нужные данные
const ProductList = memo(function ProductList({ products }: { products: Product[] }) {
  return products.map(/* ... */)
})
```

### Ссылки в JSX

```tsx
// ❌ Новый объект при каждом рендере
<Child style={{ color: 'red' }} />
<Child items={[1, 2, 3]} />
<Child onChange={(e) => setValue(e.target.value)} />

// ✅ Вынести или мемоизировать
const style = useMemo(() => ({ color: 'red' }), [])
const items = useMemo(() => [1, 2, 3], [])
const handleChange = useCallback((e) => setValue(e.target.value), [])
```

## Profiler — измеряйте прежде чем оптимизировать

React DevTools → Profiler → записать взаимодействие → посмотреть, какие компоненты ре-рендерятся и сколько времени занимает рендер. Оптимизируйте только то, что реально влияет на производительность.

## Итог

Не мемоизируйте всё подряд. Порядок действий: измерьте → найдите проблему → мемоизируйте. `React.memo` для компонентов, `useMemo` для вычислений и объектов, `useCallback` для функций, которые передаются в memo-компоненты или используются как зависимости.
