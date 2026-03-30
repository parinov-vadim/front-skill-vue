---
title: Функции в TypeScript
description: Типизация параметров, возвращаемых значений, стрелочных функций, перегрузок и callback-ов в TypeScript. Практические примеры и паттерны.
section: typescript
difficulty: beginner
readTime: 10
order: 4
tags: [typescript, functions, overloads, callback, generics]
---

## Базовая типизация функции

TypeScript позволяет типизировать как параметры, так и возвращаемое значение:

```ts
function add(a: number, b: number): number {
  return a + b
}
```

TypeScript умеет выводить тип возвращаемого значения автоматически, но явная типизация помогает при рефакторинге и служит документацией:

```ts
function greet(name: string): string {
  return `Привет, ${name}!`
}
```

Если функция ничего не возвращает — тип `void`:

```ts
function log(message: string): void {
  console.log(message)
}
```

## Стрелочные функции

Синтаксис тот же, что и для обычных функций:

```ts
const add = (a: number, b: number): number => a + b

const greet = (name: string): string => `Привет, ${name}!`
```

Часто стрелочные функции используются как callback-и:

```ts
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map((n: number): number => n * 2)
```

В большинстве случаев TypeScript сам выведет тип callback-а из контекста:

```ts
const doubled = numbers.map(n => n * 2) // TypeScript знает, что n: number
```

## Опциональные и дефолтные параметры

Параметры с `?` можно не передавать:

```ts
function createUser(name: string, age?: number): string {
  if (age !== undefined) {
    return `${name}, ${age} лет`
  }
  return name
}

createUser('Анна')      // ok
createUser('Анна', 25)  // ok
```

Дефолтные значения не требуют явной типизации опциональности:

```ts
function request(url: string, method: string = 'GET'): void {
  console.log(`${method} ${url}`)
}

request('/api/users')           // GET /api/users
request('/api/users', 'POST')   // POST /api/users
```

## Rest-параметры

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}

sum(1, 2, 3)       // 6
sum(1, 2, 3, 4, 5) // 15
```

Rest-параметр всегда должен быть массивом.

## Тип функции как тип переменной

Функцию можно описать через type alias:

```ts
type MathOperation = (a: number, b: number) => number

const add: MathOperation = (a, b) => a + b
const subtract: MathOperation = (a, b) => a - b
const multiply: MathOperation = (a, b) => a * b
```

Это удобно для callback-ов и стратегий:

```ts
type Comparator<T> = (a: T, b: T) => number

function sort<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare)
}
```

Альтернативный синтаксис через интерфейс:

```ts
interface GreetFunction {
  (name: string): string
}

const greet: GreetFunction = (name) => `Привет, ${name}!`
```

## Перегрузки (Overloads)

Перегрузки позволяют описать разные сигнатуры одной функции в зависимости от типов аргументов:

```ts
function parse(input: string): number
function parse(input: number): string
function parse(input: string | number): string | number {
  if (typeof input === 'string') {
    return Number(input)
  }
  return String(input)
}

const a = parse('42')  // TypeScript знает, что a: number
const b = parse(42)    // TypeScript знает, что b: string
```

Практический пример — утилита для создания HTML-элементов:

```ts
function createElement(tag: 'div', props?: Record<string, string>): HTMLDivElement
function createElement(tag: 'span', props?: Record<string, string>): HTMLSpanElement
function createElement(tag: string, props?: Record<string, string>): HTMLElement {
  const el = document.createElement(tag)
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      el.setAttribute(key, value)
    })
  }
  return el
}
```

## Типизация callback-ов

Callback-и типизируются как параметры-функции:

```ts
function fetchData(url: string, onSuccess: (data: unknown) => void, onError: (error: Error) => void): void {
  fetch(url)
    .then(res => res.json())
    .then(onSuccess)
    .catch(onError)
}
```

Выносить типы callback-ов в отдельные type alias — хорошая практика:

```ts
type SuccessCallback<T> = (data: T) => void
type ErrorCallback = (error: Error) => void

function fetchData<T>(url: string, onSuccess: SuccessCallback<T>, onError: ErrorCallback): void {
  // ...
}
```

## this в функциях

TypeScript позволяет явно указать тип `this` первым параметром. Этот параметр не попадёт в скомпилированный код:

```ts
interface Button {
  text: string
  click(): void
}

function handleClick(this: Button) {
  console.log(`Клик по кнопке: ${this.text}`)
}
```

## Asserts-функции

Функция-утверждение сообщает TypeScript, что условие выполняется:

```ts
function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Expected string')
  }
}

const input: unknown = 'hello'
assertString(input)
input.toUpperCase() // ok, TypeScript теперь знает, что input — string
```

## Практические примеры

Типизированный debounce:

```ts
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

Типизированный event emitter:

```ts
type EventMap = {
  login: { userId: string }
  logout: undefined
  'page-view': { url: string; timestamp: number }
}

function on<K extends keyof EventMap>(
  event: K,
  callback: EventMap[K] extends undefined ? () => void : (data: EventMap[K]) => void,
): void {
  // ...
}

on('login', (data) => {
  console.log(data.userId) // TypeScript знает тип
})

on('logout', () => {
  console.log('Вышли')
})
```

Типизированный fetch-wrapper:

```ts
async function api<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

interface User {
  id: number
  name: string
}

const user = await api<User>('/api/users/1')
// TypeScript знает, что user — User
```

## Итог

Функции в TypeScript типизируются через параметры и возвращаемое значение. Основные моменты: явная типизация возвращаемого значения помогает при рефакторинге, rest-параметры всегда массивы, перегрузки дают разные сигнатуры для одной функции, а `asserts` позволяет сужать типы. Callback-и лучше выносить в отдельные type alias для читаемости.
