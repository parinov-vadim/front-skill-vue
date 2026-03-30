---
title: Redux Toolkit — управление состоянием
description: Redux Toolkit (RTK) — официальный набор инструментов для Redux. Создание slices, async thunks, оптимистичные обновления и DevTools.
section: react
difficulty: intermediate
readTime: 14
order: 8
tags: [Redux Toolkit, RTK, state management, React, Redux]
---

## Что такое Redux Toolkit

Redux Toolkit (RTK) — официальная рекомендованная библиотека для работы с Redux. Решает главные проблемы Redux: убирает boilerplate, упрощает настройку и добавляет полезные утилиты.

Установка:

```bash
npm install @reduxjs/toolkit react-redux
```

## Настройка store

```ts
// src/stores/index.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import usersReducer from './usersSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

Обёртка в корневом компоненте:

```tsx
// src/main.tsx
import { Provider } from 'react-redux'
import { store } from './stores'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
```

## Создание slice

Slice — это кусок состояния + редьюсеры + actions в одном месте:

```ts
// src/stores/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0,
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
export default counterSlice.reducer
```

Внутри reducers используется Immer — можно мутировать `state` напрямую, Immer создаст иммутабельный объект под капотом.

## Использование в компонентах

```tsx
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/stores'
import { increment, decrement, incrementByAmount } from '@/stores/counterSlice'

function Counter() {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div>
      <p>Счётчик: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(10))}>+10</button>
    </div>
  )
}
```

## Типизированные хуки

Чтобы не писать `RootState` и `AppDispatch` каждый раз:

```ts
// src/stores/hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

```tsx
import { useAppSelector, useAppDispatch } from '@/stores/hooks'

function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()
  // ...
}
```

## Async actions: createAsyncThunk

Для запросов к API используется `createAsyncThunk`:

```ts
// src/stores/usersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './index'

interface User {
  id: number
  name: string
  email: string
}

interface UsersState {
  list: User[]
  loading: boolean
  error: string | null
}

export const fetchUsers = createAsyncThunk<User[]>(
  'users/fetchAll',
  async () => {
    const res = await fetch('/api/users')
    return res.json()
  },
)

export const createUser = createAsyncThunk<User, Omit<User, 'id'>>(
  'users/create',
  async (data) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Ошибка'
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
  },
})

export default usersSlice.reducer
```

## Slice с сложным состоянием

```ts
interface TodosState {
  items: Todo[]
  filter: 'all' | 'active' | 'completed'
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], filter: 'all' } as TodosState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      })
    },
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find((t) => t.id === action.payload)
      if (todo) todo.completed = !todo.completed
    },
    setFilter: (state, action: PayloadAction<TodosState['filter']>) => {
      state.filter = action.payload
    },
  },
})
```

## Селекторы

```ts
// src/stores/todosSlice.ts
export const selectFilteredTodos = (state: RootState) => {
  const { items, filter } = state.todos
  switch (filter) {
    case 'active':
      return items.filter((t) => !t.completed)
    case 'completed':
      return items.filter((t) => t.completed)
    default:
      return items
  }
}

export const selectTodosCount = (state: RootState) => ({
  total: state.todos.items.length,
  active: state.todos.items.filter((t) => !t.completed).length,
  completed: state.todos.items.filter((t) => t.completed).length,
})
```

```tsx
function TodoList() {
  const todos = useAppSelector(selectFilteredTodos)
  const { active, total } = useAppSelector(selectTodosCount)

  return (
    <div>
      <p>Активных: {active} из {total}</p>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
```

## Когда использовать Redux Toolkit

RTK оправдан в проектах, где:

- Состояние сложное и имеет много зависимостей между разными частями
- Нужен детальный аудит изменений через DevTools
- Работает большая команда — строгая структура помогает согласованности
- Нужна сериализация состояния (undo/redo, гидратация с сервера)

Для простых случаев (корзина, тема, авторизация) Zustand или Context достаточно.

## Итог

Redux Toolkit значительно упростил работу с Redux: `createSlice` генерирует actions и reducers, `createAsyncThunk` обрабатывает асинхронные операции, Immer позволяет писать мутабельный код. Основной минус — больше кода и концепций по сравнению с Zustand. Но для крупных проектов RTK даёт предсказуемую архитектуру.
