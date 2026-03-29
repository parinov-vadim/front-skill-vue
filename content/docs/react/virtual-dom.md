---
title: Virtual DOM
description: Virtual DOM — абстракция реального DOM в виде JS-объектов. React использует её для эффективного обновления интерфейса через алгоритм сравнения (reconciliation).
section: react
difficulty: beginner
readTime: 7
order: 3
tags: [Virtual DOM, reconciliation, React, rendering]
---

## Проблема прямой работы с DOM

Операции с реальным DOM дорогостоящие — каждое изменение может вызвать reflow и repaint браузера:

```js
// Наивный подход — 1000 операций с DOM
for (let i = 0; i < 1000; i++) {
  document.getElementById('list').innerHTML += `<li>${i}</li>`
  // Каждая итерация вызывает reflow!
}

// Лучше — одна операция
const fragment = document.createDocumentFragment()
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li')
  li.textContent = i
  fragment.appendChild(li)
}
document.getElementById('list').appendChild(fragment)
```

Virtual DOM автоматизирует эту оптимизацию.

## Что такое Virtual DOM?

**Virtual DOM (VDOM)** — это лёгкое JavaScript-представление реального DOM в виде дерева объектов.

```js
// Реальный DOM:
// <div class="card"><h2>Заголовок</h2><p>Текст</p></div>

// Virtual DOM:
{
  type: 'div',
  props: { className: 'card' },
  children: [
    {
      type: 'h2',
      props: {},
      children: ['Заголовок']
    },
    {
      type: 'p',
      props: {},
      children: ['Текст']
    }
  ]
}
```

JSX компилируется в такие объекты через `React.createElement()`.

## Процесс обновления

```
1. Состояние изменилось (setState / useState)
       ↓
2. Компонент рендерится → создаётся новый VDOM
       ↓
3. Алгоритм Diffing сравнивает старый и новый VDOM
       ↓
4. Вычисляются минимальные изменения (patch)
       ↓
5. Только изменённые узлы обновляются в реальном DOM
```

## Алгоритм Reconciliation

React использует эвристики для O(n) сравнения деревьев (вместо теоретического O(n³)):

### Правило 1: Разные типы = пересоздание

```jsx
// До
<div><Counter /></div>

// После — тип изменился с div на span
<span><Counter /></span>
// Counter будет размонтирован и создан заново!
```

### Правило 2: Одинаковые типы = обновление атрибутов

```jsx
// До
<button className="btn" disabled={false} />

// После — React только обновит атрибуты
<button className="btn btn--active" disabled={true} />
```

### Правило 3: key для списков

```jsx
// Без key — React сравнивает по позиции
// Добавление элемента в начало заставит обновить все элементы
<ul>
  <li>A</li>
  <li>B</li>
</ul>

// С key — React отслеживает по идентификатору
// Добавление элемента = одна вставка
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
</ul>
```

## Пакетирование обновлений

React 18 автоматически группирует обновления состояния:

```jsx
function handleClick() {
  setCount(c => c + 1)   // Не вызывает рендер сразу
  setName('Иван')         // Не вызывает рендер сразу
  setActive(true)         // Не вызывает рендер сразу
  // Один ре-рендер после всех трёх обновлений
}
```

## React.memo

Предотвращает лишние ре-рендеры дочернего компонента:

```jsx
import { memo } from 'react'

const UserCard = memo(function UserCard({ name, age }) {
  console.log('Рендер UserCard')
  return <div>{name}, {age}</div>
})

// Теперь UserCard рендерится только при изменении name или age
function Parent() {
  const [count, setCount] = useState(0)
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <UserCard name="Иван" age={25} /> {/* Не ре-рендерится при клике */}
    </>
  )
}
```

## Fiber — новый движок

React 16 представил **Fiber** — полная переработка алгоритма reconciliation:

- **Приоритеты** — срочные обновления (ввод, клики) обрабатываются раньше
- **Прерываемость** — тяжёлая работа может быть прервана и возобновлена
- **Concurrent Mode** — рендеринг без блокировки UI

```jsx
// React 18 — Concurrent Features
import { startTransition, useDeferredValue } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  // Ввод отзывчивый, фильтрация — некритичная задача
  const results = useMemo(
    () => filterItems(deferredQuery),
    [deferredQuery]
  )

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList items={results} />
    </>
  )
}
```

## Virtual DOM vs. Сигналы

Современные фреймворки (SolidJS, Vue 3 Signals, Svelte) уходят от Virtual DOM в пользу **реактивных сигналов** — прямого обновления только изменившихся узлов без диффинга. Это потенциально более эффективно для гранулярных обновлений.
