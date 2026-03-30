---
title: Дженерики в TypeScript
description: Generics (обобщения) позволяют писать функции и классы, которые работают с разными типами, сохраняя типобезопасность. Разбираем <T>, extends, default types и практические паттерны.
section: typescript
difficulty: intermediate
readTime: 12
order: 5
tags: [typescript, generics, generic functions, generic types]
---

## Зачем нужны дженерики

Представьте, что вы пишете функцию, которая возвращает первый элемент массива. Без дженериков пришлось бы использовать `any`:

```ts
function first(arr: any[]): any {
  return arr[0]
}
```

Проблема — TypeScript теряет информацию о типе. Мы передали массив чисел, но результат — `any`.

С дженериком тип сохраняется:

```ts
function first<T>(arr: T[]): T {
  return arr[0]
}

const num = first([1, 2, 3])     // num: number
const str = first(['a', 'b'])    // str: string
```

`T` — параметр типа. TypeScript подставляет его автоматически на основе переданного аргумента.

## Синтаксис

Угловые скобки после имени функции объявляют параметры типа:

```ts
function identity<T>(value: T): T {
  return value
}

const a = identity(42)       // a: number
const b = identity('hello')  // b: string
```

Можно указать тип явно, если TypeScript не может вывести его сам:

```ts
const result = identity<number>(42)
```

## Несколько параметров типа

Джинерики могут принимать несколько параметров:

```ts
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

const lengths = map(['hello', 'world'], s => s.length)
// lengths: number[]
```

Практический пример — функция `zip`:

```ts
function zip<T, U>(first: T[], second: U[]): [T, U][] {
  return first.map((item, i) => [item, second[i]])
}

const pairs = zip(['a', 'b'], [1, 2])
// pairs: [string, number][]
```

## Ограничения через extends

Иногда нужно ограничить, какие типы допустимы. `extends` задаёт «нижнюю границу»:

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length
}

getLength('hello')     // ok, у строки есть length
getLength([1, 2, 3])   // ok, у массива есть length
getLength(42)          // Ошибка: number не имеет length
```

Частый паттерн — ограничение `keyof`:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Анна', age: 25 }

const name = getProperty(user, 'name')  // name: string
const age = getProperty(user, 'age')    // age: number
getProperty(user, 'email')              // Ошибка: 'email' не keyof User
```

## Значения по умолчанию

Параметр типа может иметь дефолтное значение:

```ts
interface ApiResponse<T, E = string> {
  data: T
  error: E | null
}

type UserResponse = ApiResponse<{ name: string }>              // E = string
type NumberResponse = ApiResponse<number, number>              // E = number
```

Дефолтные типы полезны в библиотеках, где часть параметров редко меняется.

## Дженерики в интерфейсах и type aliases

Интерфейс с дженериком:

```ts
interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: number): Promise<T | null>
  create(item: Omit<T, 'id'>): Promise<T>
  update(id: number, item: Partial<T>): Promise<T>
  delete(id: number): Promise<void>
}

interface User {
  id: number
  name: string
  email: string
}

type UserRepository = Repository<User>
```

Type alias:

```ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

const ok: Result<string> = { success: true, data: 'Всё хорошо' }
const err: Result<number> = { success: false, error: new Error('Ошибка') }
```

## Дженерики в классах

```ts
class DataStore<T> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  get(index: number): T | undefined {
    return this.items[index]
  }

  getAll(): T[] {
    return [...this.items]
  }

  count(): number {
    return this.items.length
  }
}

const store = new DataStore<string>()
store.add('hello')
store.add('world')
store.get(0) // string | undefined
```

## Встроенные дженерики

TypeScript поставляется с несколькими встроенными дженерик-типами:

### Array<T>

```ts
const numbers: Array<number> = [1, 2, 3]
```

### Promise<T>

```ts
async function fetchUser(): Promise<User> {
  const res = await fetch('/api/user')
  return res.json()
}
```

### Record<K, V>

```ts
const scores: Record<string, number> = {
  alice: 95,
  bob: 87,
}
```

### Readonly<T>

```ts
const config: Readonly<{ host: string; port: number }> = {
  host: 'localhost',
  port: 3000,
}
config.host = 'example.com' // Ошибка
```

## Вывод типов в дженериках

TypeScript старается вывести тип автоматически. Когда вызываем:

```ts
function wrap<T>(value: T): { value: T } {
  return { value }
}

const wrapped = wrap(42) // { value: number }
```

TypeScript видит, что передан `number`, и подставляет `T = number`.

В некоторых ситуациях вывод невозможен, и тип нужно указать явно:

```ts
function createSet<T>(): Set<T> {
  return new Set()
}

const stringSet = createSet<string>() // без <string> будет Set<unknown>
```

## Практические примеры

Типобезопасный EventEmitter:

```ts
type EventMap = Record<string, unknown>

class EventEmitter<T extends EventMap> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>()

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }
}

interface AppEvents {
  'user:login': { userId: string }
  'user:logout': undefined
  'page:view': { url: string }
}

const bus = new EventEmitter<AppEvents>()

bus.on('user:login', (data) => {
  console.log(data.userId) // типизировано
})

bus.emit('page:view', { url: '/home' })
```

Репозиторий с CRUD:

```ts
interface Entity {
  id: string
}

function createRepository<T extends Entity>() {
  const items = new Map<string, T>()

  return {
    getAll: (): T[] => [...items.values()],
    getById: (id: string): T | undefined => items.get(id),
    create: (item: Omit<T, 'id'>): T => {
      const newItem = { ...item, id: crypto.randomUUID() } as T
      items.set(newItem.id, newItem)
      return newItem
    },
    update: (id: string, data: Partial<T>): T | undefined => {
      const existing = items.get(id)
      if (!existing) return undefined
      const updated = { ...existing, ...data }
      items.set(id, updated)
      return updated
    },
    delete: (id: string): boolean => items.delete(id),
  }
}
```

## Итог

Дженерики — механизм для создания переиспользуемого типобезопасного кода. Ключевые моменты: `T` — параметр типа, который TypeScript выводит автоматически; `extends` ограничивает допустимые типы; дефолтные значения упрощают использование. Дженерики используются в интерфейсах, классах, функциях и type aliases. Без них невозможно написать типобезопасную библиотеку.
