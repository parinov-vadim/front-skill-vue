---
title: Тестирование React — Jest и React Testing Library
description: Тестирование React-компонентов: рендер, поиск элементов, взаимодействие, моки, асинхронные тесты и покрытие кода.
section: react
difficulty: intermediate
readTime: 14
order: 19
tags: [тестирование, Jest, React Testing Library, Vitest, React]
---

## Инструменты

Для тестирования React есть два основных варианта:

| Инструмент | Test runner | Рекомендуется |
|------------|-------------|---------------|
| Vitest | Vitest | Vite-проекты |
| Jest | Jest | Create React App, Next.js |

React Testing Library (RTL) — библиотека для рендера и взаимодействия с компонентами. Работает с обоими.

Установка (Vitest):

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Конфигурация `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

Setup-файл:

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

## Первый тест

```tsx
// src/components/Greeting.tsx
function Greeting({ name }: { name: string }) {
  return <h1>Привет, {name}!</h1>
}
export default Greeting
```

```tsx
// src/components/Greeting.test.tsx
import { render, screen } from '@testing-library/react'
import Greeting from './Greeting'

test('отображает приветствие с именем', () => {
  render(<Greeting name="Иван" />)
  expect(screen.getByText('Привет, Иван!')).toBeInTheDocument()
})
```

## Поиск элементов

RTL предоставляет несколько методов поиска:

```tsx
render(<UserCard name="Иван" email="ivan@mail.com" />)

// Точное совпадение текста
screen.getByText('Иван')

// По роли (accessibility)
screen.getByRole('button', { name: 'Отправить' })
screen.getByRole('textbox', { name: 'Email' })
screen.getByRole('heading', { level: 1 })

// По test-id (крайний случай)
screen.getByTestId('user-card')

// По label
screen.getByLabelText('Пароль')

// По placeholder
screen.getByPlaceholderText('Введите имя')
```

| Метод | Описание | Когда использовать |
|-------|----------|-------------------|
| `getBy*` | Находит ровно один элемент | Основной вариант |
| `getAllBy*` | Находит все элементы | Списки |
| `queryBy*` | Возвращает null, если не нашёл | Проверка отсутствия |
| `findBy*` | Асинхронный поиск | Появление после загрузки |

## Взаимодействие

`userEvent` имитирует реальные действия пользователя:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('форма отправляет данные', async () => {
  const onSubmit = vi.fn()
  render(<LoginForm onSubmit={onSubmit} />)

  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Email'), 'ivan@mail.com')
  await user.type(screen.getByLabelText('Пароль'), 'secret123')
  await user.click(screen.getByRole('button', { name: 'Войти' }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'ivan@mail.com',
    password: 'secret123',
  })
})
```

Основные действия:

```tsx
await user.click(element)
await user.type(element, 'текст')
await user.clear(element)
await user.selectOptions(element, 'value')
await user.hover(element)
await user.unhover(element)
await user.tab()
await user.keyboard('{Enter}')
await user.upload(input, file)
```

## Тестирование async

```tsx
import { render, screen, waitFor } from '@testing-library/react'

test('загружает и отображает пользователя', async () => {
  render(<UserProfile userId={1} />)

  // Пока загружается
  expect(screen.getByText('Загрузка...')).toBeInTheDocument()

  // Ждём появления данных
  await screen.findByText('Иван Иванов')

  // Или с дополнительными проверками
  await waitFor(() => {
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument()
  })
})
```

`findByText` = `getByText` + `waitFor` — удобнее для одного элемента.

## Моки

### Мокание функций

```tsx
test('вызывает onClick при клике', async () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Клик</Button>)

  await userEvent.click(screen.getByRole('button'))

  expect(onClick).toHaveBeenCalledTimes(1)
})
```

### Мокание модулей

```tsx
import { vi } from 'vitest'

vi.mock('@/services/api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Иван' },
    { id: 2, name: 'Мария' },
  ]),
}))

test('отображает список пользователей', async () => {
  render(<UserList />)

  await screen.findByText('Иван')
  expect(screen.getByText('Мария')).toBeInTheDocument()
})
```

### Мокание fetch

```tsx
beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Иван' }),
  } as Response)
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

## Тестирование хуков

Для тестирования кастомных хуков используйте `renderHook`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

test('useCounter: increment и decrement', () => {
  const { result } = renderHook(() => useCounter())

  expect(result.current.count).toBe(0)

  act(() => result.current.increment())
  expect(result.current.count).toBe(1)

  act(() => result.current.decrement())
  expect(result.current.count).toBe(0)
})
```

## Структура тестов

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── useDebounce.test.ts
├── pages/
│   ├── Home.tsx
│   └── Home.test.tsx
└── test/
    └── setup.ts
```

Каждый тестовый файл рядом с тестируемым — так проще найти.

## Покрытие кода

```bash
# Vitest
npx vitest run --coverage

# Jest
npx jest --coverage
```

Хорошие цели для покрытия:
- Утилиты и бизнес-логика: 80-100%
- Компоненты: 60-80%
- Страницы: 40-60% (сложнее тестировать интеграцию)

## Рекомендации

- Тестируйте поведение, а не реализацию — `getByRole` и `getByText` предпочтительнее `getByTestId`
- Не тестируйте внутреннее состояние — проверяйте то, что видит пользователь
- Используйте `screen` — не деструктурируйте `getByRole` из render
- Один тест — одна проверка (или несколько связанных)
- `userEvent` предпочтительнее `fireEvent` — он ближе к реальным действиям

## Итог

React Testing Library учит тестировать как пользователь: найти кнопку по роли, кликнуть, проверить текст. Vitest — быстрый test runner, отлично подходит для Vite-проектов. Начинайте с тестирования критичных компонентов и утилит, постепенно увеличивая покрытие.
