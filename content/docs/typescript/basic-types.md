---
title: Базовые типы TypeScript
description: Основные типы TypeScript — string, number, boolean, array, tuple, enum, any, unknown, void, never. Примеры использования и подводные камни.
section: typescript
difficulty: beginner
readTime: 12
order: 2
tags: [typescript, types, string, number, boolean, array, enum, tuple]
---

## Примитивные типы

TypeScript начинает с тех же примитивов, что и JavaScript. Разница в том, что теперь тип фиксируется:

```ts
const name: string = 'Анна'
const age: number = 25
const isActive: boolean = true
```

Тип `number` объединяет целые числа и числа с плавающей точкой — отдельного типа `int` или `float` нет:

```ts
const integer: number = 42
const float: number = 3.14
const hex: number = 0xff
const binary: number = 0b1010
```

## Тип any

`any` отключает проверку типов для переменной. Фактически это возвращение к JavaScript:

```ts
let data: any = 'строка'
data = 42         // ok
data = true       // ok
data.foo()        // ok для TypeScript, но упадёт в рантайме
```

Используйте `any` только когда действительно не знаете тип — например, при работе с внешними данными, которые пока не типизированы. В остальном `any` лучше избегать.

## Тип unknown

`unknown` — безопасная альтернатива `any`. Переменной можно присвоить что угодно, но перед использованием нужно проверить тип:

```ts
let value: unknown = 'hello'

value.toUpperCase() // Ошибка: Object is of type 'unknown'

if (typeof value === 'string') {
  value.toUpperCase() // ok
}
```

Когда стоит использовать `unknown`: приём данных из внешнего API, парсинг JSON, работа с пользовательским вводом.

## Массивы

Два способа объявить массив:

```ts
const numbers: number[] = [1, 2, 3]
const names: Array<string> = ['Анна', 'Иван']
```

Оба варианта равнозначны, но `number[]` встречается чаще. Массив строго типизирован — нельзя добавить элемент другого типа:

```ts
numbers.push('строка') // Ошибка
```

Массивы readonly защищают от изменений:

```ts
const readonlyArr: readonly number[] = [1, 2, 3]
readonlyArr.push(4) // Ошибка: Property 'push' does not exist
```

## Кортежи (Tuples)

Кортеж — массив фиксированной длины, где каждый элемент имеет свой тип:

```ts
const pair: [string, number] = ['Анна', 25]
const triple: [string, number, boolean] = ['Иван', 30, true]
```

Порядок важен. Если перепутать — будет ошибка:

```ts
const wrong: [string, number] = [25, 'Анна'] // Ошибка
```

Практический пример — результат `Object.entries()`:

```ts
const entries: [string, string][] = Object.entries({ name: 'Анна', city: 'Москва' })
```

Кортежи с optional-элементами:

```ts
const record: [string, number?] = ['только имя']
```

Кортежи с rest-элементами:

```ts
type StringNumberBooleans = [string, number, ...boolean[]]
const data: StringNumberBooleans = ['hello', 42, true, false, true]
```

## Enum

Enum (перечисление) — набор именованных констант:

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const move = Direction.Up // 0
```

По умолчанию значения начинаются с `0` и увеличиваются. Можно задать свои:

```ts
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

const current: Status = Status.Active // 'ACTIVE'
```

Числовые enum'ы поддерживают обратное отображение (reverse mapping):

```ts
enum Color {
  Red,
  Green,
  Blue,
}

Color[0] // 'Red'
Color.Red // 0
```

### const enum

Если добавить `const`, TypeScript встроит значения прямо в код вместо генерации объекта:

```ts
const enum FontSize {
  Small = 12,
  Medium = 16,
  Large = 20,
}

const size = FontSize.Medium // компилируется в: const size = 16
```

Это полезно для производительности, но усложняет отладку. В современных проектах многие предпочитают обычные объекты с `as const`:

```ts
const FontSize = {
  Small: 12,
  Medium: 16,
  Large: 20,
} as const

type FontSize = typeof FontSize[keyof typeof FontSize] // 12 | 16 | 20
```

## void

`void` означает, что функция ничего не возвращает:

```ts
function log(message: string): void {
  console.log(message)
}
```

Использовать `void` как тип переменной почти никогда не нужно — он нужен именно для функций.

## never

`never` — тип, который никогда не возникает. Два основных случая:

Функция, которая всегда выбрасывает ошибку:

```ts
function fail(message: string): never {
  throw new Error(message)
}
```

Функция с бесконечным циклом:

```ts
function infiniteLoop(): never {
  while (true) {}
}
```

Ещё `never` используется при exhaustive checking — проверке, что все варианты union обработаны:

```ts
type Shape = 'circle' | 'square'

function getArea(shape: Shape) {
  switch (shape) {
    case 'circle': return Math.PI
    case 'square': return 4
    default:
      const _exhaustive: never = shape
      return _exhaustive
  }
}
```

Если позже добавить `'triangle'` в `Shape`, TypeScript выдаст ошибку в `default`, потому что `shape` больше не будет `never`.

## null и undefined

Два типа для «отсутствия значения»:

```ts
const a: null = null
const b: undefined = undefined
```

Когда включён `strictNullChecks` (рекомендуется), TypeScript заставляет явно обрабатывать `null` и `undefined`:

```ts
function findUser(id: number): User | null {
  // ...
}

const user = findUser(1)
user.name // Ошибка: user может быть null

if (user !== null) {
  user.name // ok
}
```

## Union и Intersection

Union (объединение) — переменная может быть одного из нескольких типов:

```ts
type ID = string | number

function findById(id: ID) {
  // id может быть строкой или числом
}
```

Intersection (пересечение) — переменная должна удовлетворять всем типам одновременно:

```ts
interface HasName {
  name: string
}

interface HasAge {
  age: number
}

type Person = HasName & HasAge

const person: Person = { name: 'Анна', age: 25 }
```

## Literal types

Literal-типы ограничивают значение конкретным литералом:

```ts
type Status = 'loading' | 'success' | 'error'
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

const status: Status = 'loading'
const method: Method = 'GET'
```

Это удобнее enum'ов, когда вариантов немного и они строковые.

Числовые литералы:

```ts
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6
const roll: DiceRoll = 3
```

## Практические примеры

Типизация ответа API:

```ts
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

type UserResponse = ApiResponse<{
  id: number
  name: string
  email: string
}>
```

Функция с optional-параметрами:

```ts
function createUser(
  name: string,
  age: number,
  role: 'admin' | 'user' = 'user',
  avatar?: string,
) {
  return { name, age, role, avatar }
}

createUser('Анна', 25)              // ok, role = 'user', avatar = undefined
createUser('Иван', 30, 'admin')     // ok
createUser('Олег', 22, 'user', '🦊') // ok
```

## Шпаргалка по типам

| Тип | Описание | Пример |
|-----|----------|--------|
| `string` | Строка | `'hello'` |
| `number` | Число | `42` |
| `boolean` | Логический | `true` |
| `any` | Любой тип (отключает проверки) | `*` |
| `unknown` | Любой тип, но с проверкой | `*` |
| `void` | Нет возвращаемого значения | функции |
| `never` | Недостижимый код | `throw` |
| `null` | Отсутствие значения | `null` |
| `undefined` | Не задано | `undefined` |
| `T[]` | Массив типа T | `number[]` |
| `[A, B]` | Кортеж | `[string, number]` |
| `A \| B` | Union (один из) | `string \| number` |
| `A & B` | Intersection (все) | `HasName & HasAge` |
| `'a' \| 'b'` | Literal type | `'loading'` |

## Итог

Базовые типы — фундамент TypeScript. Самые используемые: `string`, `number`, `boolean`, массивы, union-типы и literal-типы. `any` старайтесь избегать, заменяя на `unknown`. `void` и `never` пригодятся при типизации функций. Enum'ы полезны, но часто заменяются на union literal-типы.
