---
title: Продвинутые типы TypeScript
description: Conditional Types, Mapped Types, Template Literal Types, infer и keyof — продвинутые возможности системы типов TypeScript для создания гибких утилит.
section: typescript
difficulty: advanced
readTime: 14
order: 8
tags: [typescript, conditional types, mapped types, template literal, infer, keyof]
---

## keyof

`keyof` извлекает ключи типа как union строковых литералов:

```ts
interface User {
  name: string
  age: number
  email: string
}

type UserKeys = keyof User // 'name' | 'age' | 'email'
```

Применение — типобезопасный доступ к свойствам:

```ts
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user: User = { name: 'Анна', age: 25, email: 'anna@mail.ru' }

get(user, 'name')  // string
get(user, 'age')   // number
get(user, 'foo')   // Ошибка: 'foo' не keyof User
```

## typeof

`typeof` в TypeScript (в контексте типов, не runtime) извлекает тип из переменной:

```ts
const config = {
  host: 'localhost',
  port: 3000,
  debug: true,
}

type Config = typeof config
// { host: string; port: number; debug: boolean }
```

Комбинация `keyof typeof` для получения ключей конкретного объекта:

```ts
type ConfigKeys = keyof typeof config // 'host' | 'port' | 'debug'
```

## Conditional Types

Условный тип выбирает один из двух типов на основе условия:

```ts
type IsString<T> = T extends string ? 'yes' : 'no'

type A = IsString<string>  // 'yes'
type B = IsString<number>  // 'no'
type C = IsString<'hello'> // 'yes' (literal-строка extends string)
```

Практический пример — типизация unwrap:

```ts
type Unwrap<T> = T extends Promise<infer U> ? U : T

type A = Unwrap<Promise<string>> // string
type B = Unwrap<number>          // number
type C = Unwrap<Promise<Promise<string>>> // Promise<string>
```

### infer

Ключевое слово `infer` объявляет переменную типа внутри `extends`:

```ts
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never

type Fn = (x: number) => string
type Result = ReturnTypeOf<Fn> // string
```

Извлечение типа элемента массива:

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never

type Item = ElementOf<string[]> // string
type Num = ElementOf<number[]>  // number
```

Извлечение типа из Promise:

```ts
type Awaited<T> = T extends Promise<infer U>
  ? U extends Promise<infer V>
    ? V
    : U
  : T

type A = Awaited<Promise<string>>         // string
type B = Awaited<Promise<Promise<number>>> // number
type C = Awaited<boolean>                  // boolean
```

Несколько `infer` в одном условии:

```ts
type FunctionParams<T> = T extends (first: infer F, second: infer S, ...rest: any[]) => any
  ? { first: F; second: S }
  : never

type Params = FunctionParams<(a: string, b: number) => void>
// { first: string; second: number }
```

### Distributive Conditional Types

Когда условный тип применяется к union, он «распределяется» по каждому варианту:

```ts
type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// string[] | number[] (не (string | number)[])
```

Чтобы отключить распределение — оберните в кортеж:

```ts
type ToArrayNonDist<T> = [T] extends any ? T[] : never

type Result = ToArrayNonDist<string | number>
// (string | number)[]
```

## Mapped Types

Mapped type создаёт новый тип, преобразуя каждое свойство существующего:

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Optional<T> = {
  [P in keyof T]?: T[P]
}
```

Синтаксис: `[P in keyof T]` — перебираем все ключи `T`, `T[P]` — берём тип значения.

Изменение типов значений:

```ts
type Stringify<T> = {
  [P in keyof T]: string
}

interface User {
  name: string
  age: number
  active: boolean
}

type StringUser = Stringify<User>
// { name: string; age: string; active: string }
```

Фильтрация ключей через `as` (TypeScript 4.1+):

```ts
type RemoveNull<T> = {
  [P in keyof T as T[P] extends null ? never : P]: T[P]
}

interface Data {
  name: string
  middleName: string | null
  age: number
  nickname: null
}

type WithoutNull = RemoveNull<Data>
// { name: string; age: number }
```

Преобразование ключей:

```ts
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }
```

### Модификаторы в Mapped Types

`+` и `-` управляют модификаторами `readonly` и `?`:

```ts
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface Frozen {
  readonly name: string
  readonly age: number
}

type Thawed = Mutable<Frozen>
// { name: string; age: number } — без readonly
```

Убрать optional:

```ts
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

## Template Literal Types

Шаблонные типы работают как шаблонные строки, но на уровне системы типов:

```ts
type EventName = `on${Capitalize<string>}`

type CSSProperty = `margin-${'top' | 'right' | 'bottom' | 'left'}`

type Margin = CSSProperty
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'
```

Встроенные утилиты для работы со строками:

| Утилита | Описание | Пример |
|---------|----------|--------|
| `Uppercase<S>` | Верхний регистр | `Uppercase<'hello'>` → `'HELLO'` |
| `Lowercase<S>` | Нижний регистр | `Lowercase<'HELLO'>` → `'hello'` |
| `Capitalize<S>` | Первая буква заглавная | `Capitalize<'hello'>` → `'Hello'` |
| `Uncapitalize<S>` | Первая буква строчная | `Uncapitalize<'Hello'>` → `'hello'` |

Практический пример — CSS-свойства:

```ts
type Direction = 'top' | 'right' | 'bottom' | 'left'
type CSSMargin = `margin-${Direction}`
type CSSPadding = `padding-${Direction}`

function setMargin(prop: CSSMargin, value: string) {
  // prop: 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'
}
```

## Практические примеры

Типобезопасный Event Bus:

```ts
type EventMap = {
  'user:login': { userId: string }
  'user:logout': undefined
  'page:view': { url: string }
}

type EventHandler<T extends keyof EventMap> = EventMap[T] extends undefined
  ? () => void
  : (data: EventMap[T]) => void

function on<T extends keyof EventMap>(event: T, handler: EventHandler<T>) {
  // ...
}

on('user:login', (data) => {
  console.log(data.userId) // типизировано
})

on('user:logout', () => {
  // без параметров
})
```

Глубокий Readonly:

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

interface Config {
  db: {
    host: string
    port: number
  }
  cache: {
    enabled: boolean
  }
}

type FrozenConfig = DeepReadonly<Config>
```

Паттерн Builder:

```ts
type Builder<T> = {
  [P in keyof T as `with${Capitalize<string & P>}`]: (value: T[P]) => Builder<T>
} & {
  build: () => T
}

interface User {
  name: string
  age: number
  email: string
}

type UserBuilder = Builder<User>
// {
//   withName: (value: string) => Builder<User>
//   withAge: (value: number) => Builder<User>
//   withEmail: (value: string) => Builder<User>
//   build: () => User
// }
```

## Итог

Продвинутые типы — инструмент для создания сложных, переиспользуемых утилит типа. `keyof` и `typeof` — основа, conditional types с `infer` — мощный механизм извлечения типов, mapped types — для трансформации форм объектов, а template literal types — для генерации строковых типов. Эти возможности используются во встроенных Utility Types и в типобезопасных библиотеках.
