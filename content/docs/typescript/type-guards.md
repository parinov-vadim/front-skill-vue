---
title: Type Guards и Type Narrowing в TypeScript
description: Способы сужения типов в TypeScript — typeof, instanceof, in, discriminated unions, пользовательские type guards. Практические примеры и паттерны.
section: typescript
difficulty: intermediate
readTime: 10
order: 7
tags: [typescript, type guards, type narrowing, typeof, instanceof, discriminated unions]
---

## Что такое Type Narrowing

TypeScript часто знает о переменной меньше, чем существует типов. Например, переменная может быть `string | number`. **Type narrowing** (сужение типа) — процесс, при котором TypeScript в блоке кода уточняет тип до более конкретного.

```ts
function process(value: string | number) {
  // value: string | number

  if (typeof value === 'string') {
    // value: string — TypeScript сузил тип
    console.log(value.toUpperCase())
  } else {
    // value: number
    console.log(value.toFixed(2))
  }
}
```

## typeof

Самый частый способ сужения. Работает для примитивов:

```ts
typeof 'hello'  === 'string'
typeof 42       === 'number'
typeof true     === 'boolean'
typeof undefined === 'undefined'
typeof Symbol() === 'symbol'
typeof BigInt(1) === 'bigint'
typeof (() => {}) === 'function'
```

Практический пример:

```ts
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return value ? 'да' : 'нет'
}
```

Ограничение: `typeof null === 'object'` и `typeof [] === 'object'`. Для объектов и массивов используйте другие методы.

## instanceof

Проверяет, является ли объект экземпляром определённого класса:

```ts
function handleError(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.message) // error: Error
  } else {
    console.log(error.toUpperCase()) // error: string
  }
}
```

Работает с любыми классами:

```ts
function formatDate(input: Date | string): string {
  if (input instanceof Date) {
    return input.toLocaleDateString('ru-RU')
  }
  return new Date(input).toLocaleDateString('ru-RU')
}
```

С DOM-элементами:

```ts
function handleElement(el: HTMLElement) {
  if (el instanceof HTMLInputElement) {
    console.log(el.value) // есть только у HTMLInputElement
  }
  if (el instanceof HTMLDivElement) {
    console.log(el.innerHTML)
  }
}
```

## Оператор in

Проверяет наличие свойства в объекте:

```ts
interface Dog {
  bark(): void
}

interface Cat {
  meow(): void
}

function speak(pet: Dog | Cat) {
  if ('bark' in pet) {
    pet.bark() // pet: Dog
  } else {
    pet.meow() // pet: Cat
  }
}
```

Удобно для различения похожих типов:

```ts
interface ApiResponse {
  data: unknown
  error?: string
}

if ('error' in response) {
  console.log(response.error) // string
}
```

## Literal-сужение

Сравнение с конкретным значением сужает тип до литерала:

```ts
type Status = 'loading' | 'success' | 'error'

function getStatusIcon(status: Status): string {
  if (status === 'loading') return '⏳'
  if (status === 'success') return '✅'
  return '❌' // TypeScript знает, что тут status === 'error'
}
```

С `switch`:

```ts
function handleStatus(status: Status) {
  switch (status) {
    case 'loading':
      // status: 'loading'
      break
    case 'success':
      // status: 'success'
      break
    case 'error':
      // status: 'error'
      break
    default:
      const _exhaustive: never = status
  }
}
```

## Discriminated Unions

Discriminated union (размеченное объединение) — паттерн, при котором все варианты имеют общее поле (дискриминант) с разными literal-значениями:

```ts
interface Circle {
  kind: 'circle'
  radius: number
}

interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}

interface Triangle {
  kind: 'triangle'
  base: number
  height: number
}

type Shape = Circle | Rectangle | Triangle
```

Теперь TypeScript сужает тип по полю `kind`:

```ts
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return 0.5 * shape.base * shape.height
  }
}
```

В каждом `case` TypeScript знает конкретный тип и подсказывает доступные поля.

Exhaustive check — убедиться, что все варианты обработаны:

```ts
function assertNever(value: never): never {
  throw new Error(`Необработанный вариант: ${value}`)
}

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return 0.5 * shape.base * shape.height
    default:
      return assertNever(shape)
  }
}
```

Если добавить новый вариант в `Shape` и забыть обработать — TypeScript укажет на ошибку.

## Пользовательские Type Guards

### Type Predicate

Функция-предикат возвращает `boolean`, но при этом уточняет тип через синтаксис `value is Type`:

```ts
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function processValue(value: unknown) {
  if (isString(value)) {
    // value: string
    console.log(value.toUpperCase())
  }
}
```

Пример с массивом — фильтрация `null`:

```ts
const items: (string | null)[] = ['hello', null, 'world', null]
const filtered = items.filter((item): item is string => item !== null)
// filtered: string[]
```

Без type predicate TypeScript считал бы `filtered` как `(string | null)[]`.

Проверка для DOM:

```ts
function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return el instanceof HTMLInputElement
}

if (isInputElement(target)) {
  console.log(target.value)
}
```

### Assertion Functions

Функция-утверждение через `asserts`:

```ts
function assertDefined<T>(value: T | undefined | null, message?: string): asserts value is T {
  if (value == null) {
    throw new Error(message ?? 'Значение не должно быть null/undefined')
  }
}

const maybeUser: User | undefined = getUser()
assertDefined(maybeUser, 'Пользователь не найден')
// После этой строки: maybeUser: User
console.log(maybeUser.name)
```

## Сужение через Truthiness

TypeScript сужает тип, когда проверяется на truthy/falsy:

```ts
function printLength(value: string | null) {
  if (value) {
    // value: string (null исключён)
    console.log(value.length)
  }
}
```

С optional chaining и nullish coalescing:

```ts
const name = user?.name ?? 'Аноним'
// name: string (не string | undefined)
```

## Сужение через присваивание

TypeScript сужает тип при присваивании:

```ts
let value: string | number

value = 'hello'
value.toUpperCase() // ok, TypeScript знает что string

value = 42
value.toFixed(2) // ok, TypeScript знает что number
```

## Практические примеры

Обработка ответа API:

```ts
interface SuccessResponse<T> {
  status: 'success'
  data: T
}

interface ErrorResponse {
  status: 'error'
  message: string
  code: number
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.status === 'success') {
    console.log('Данные:', response.data)
  } else {
    console.error(`Ошибка ${response.code}: ${response.message}`)
  }
}
```

Безопасное извлечение из массива:

```ts
function assertStringArray(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
    throw new TypeError('Ожидается массив строк')
  }
}

const rawData: unknown = JSON.parse('["a", "b", "c"]')
assertStringArray(rawData)
rawData.map(s => s.toUpperCase()) // ok
```

Проверка типа события:

```ts
interface KeyboardEvent {
  type: 'keydown' | 'keyup'
  key: string
}

interface MouseEvent {
  type: 'click' | 'dblclick'
  x: number
  y: number
}

type UIEvent = KeyboardEvent | MouseEvent

function handleEvent(event: UIEvent) {
  switch (event.type) {
    case 'keydown':
    case 'keyup':
      console.log(`Клавиша: ${event.key}`)
      break
    case 'click':
    case 'dblclick':
      console.log(`Позиция: ${event.x}, ${event.y}`)
      break
  }
}
```

## Итог

Type narrowing — механизм, который помогает TypeScript понимать, какой конкретно тип у переменной в данном блоке кода. Основные способы: `typeof` для примитивов, `instanceof` для классов, `in` для проверки свойств, literal-сравнение и discriminated unions. Пользовательские type guards через `value is Type` нужны для сложных проверок. Exhaustive check через `never` гарантирует, что все варианты union обработаны.
