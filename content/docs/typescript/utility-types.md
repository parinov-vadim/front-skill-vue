---
title: Utility Types в TypeScript
description: Встроенные утилитарные типы TypeScript — Partial, Required, Pick, Omit, Record, Exclude, Extract, ReturnType и другие. Примеры использования и практические паттерны.
section: typescript
difficulty: intermediate
readTime: 12
order: 6
tags: [typescript, utility types, Partial, Pick, Omit, Record]
---

## Что такое Utility Types

Utility Types — встроенные типы-преобразователи. Они берут существующий тип и возвращают его модифицированную версию. Не нужно писать свои — TypeScript предоставляет готовый набор.

## Partial<T>

Делает все свойства необязательными:

```ts
interface User {
  name: string
  age: number
  email: string
}

type PartialUser = Partial<User>
// { name?: string; age?: number; email?: string }
```

Практическое применение — функция обновления, где можно передать любые поля:

```ts
function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

updateUser(user, { name: 'Новое имя' })
updateUser(user, { age: 26, email: 'new@mail.ru' })
```

## Required<T>

Обратное `Partial` — делает все свойства обязательными:

```ts
interface Config {
  host?: string
  port?: number
  debug?: boolean
}

type StrictConfig = Required<Config>
// { host: string; port: number; debug: boolean }
```

## Readonly<T>

Делает все свойства только для чтения:

```ts
interface Point {
  x: number
  y: number
}

type ReadonlyPoint = Readonly<Point>
// { readonly x: number; readonly y: number }

const point: ReadonlyPoint = { x: 0, y: 0 }
point.x = 5 // Ошибка
```

## Pick<T, K>

Выбирает только указанные свойства из типа:

```ts
interface User {
  id: number
  name: string
  email: string
  password: string
  avatar: string
}

type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>
// { id: number; name: string; avatar: string }
```

Можно выбрать и одно поле:

```ts
type UserId = Pick<User, 'id'> // { id: number }
```

## Omit<T, K>

Исключает указанные свойства — противоположность `Pick`:

```ts
type UserSafe = Omit<User, 'password'>
// { id: number; name: string; email: string; avatar: string }
```

Частый паттерн при создании сущности — исключить `id`, потому что он генерируется на сервере:

```ts
type CreateUser = Omit<User, 'id'>

function create(data: CreateUser): Promise<User> {
  return fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => r.json())
}
```

## Record<K, V>

Создаёт тип объекта с ключами `K` и значениями `V`:

```ts
type UserRole = 'admin' | 'editor' | 'viewer'

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Читатель',
}
```

Если забыть одну из ролей — TypeScript укажет на ошибку:

```ts
const bad: Record<UserRole, string> = {
  admin: 'Администратор',
  // Ошибка: отсутствуют 'editor' и 'viewer'
}
```

## Exclude<T, U>

Исключает из union-типа `T` те варианты, которые входят в `U`:

```ts
type AllTypes = string | number | boolean | null
type WithoutNull = Exclude<AllTypes, null>
// string | number | boolean
```

Практический пример:

```ts
type Status = 'loading' | 'success' | 'error' | 'idle'
type ActiveStatus = Exclude<Status, 'idle'>
// 'loading' | 'success' | 'error'
```

## Extract<T, U>

Извлекает из union-типа `T` те варианты, которые входят в `U`:

```ts
type T = string | number | boolean
type OnlyStringOrNumber = Extract<T, string | number>
// string | number
```

## NonNullable<T>

Исключает `null` и `undefined` из типа:

```ts
type MaybeString = string | null | undefined
type DefiniteString = NonNullable<MaybeString>
// string
```

## ReturnType<T>

Извлекает тип возвращаемого значения функции:

```ts
function getUser() {
  return { id: 1, name: 'Анна', email: 'anna@mail.ru' }
}

type User = ReturnType<typeof getUser>
// { id: number; name: string; email: string }
```

Это особенно удобно, когда функция возвращает сложный объект, а вы не хотите дублировать тип:

```ts
function createConfig() {
  return {
    api: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    headers: { Authorization: '' },
  }
}

type Config = ReturnType<typeof createConfig>
```

## Parameters<T>

Извлекает типы параметров функции в виде кортежа:

```ts
function createUser(name: string, age: number, active: boolean) {
  // ...
}

type UserParams = Parameters<typeof createUser>
// [string, number, boolean]
```

Можно получить конкретный параметр по индексу:

```ts
type NameParam = Parameters<typeof createUser>[0] // string
```

## Awaited<T>

Раскрывает тип из `Promise`. Появился в TypeScript 4.5:

```ts
type ResolvedUser = Awaited<Promise<User>>
// User

type Nested = Awaited<Promise<Promise<string>>>
// string (раскрывает все уровни)
```

Полезно для типизации результатов `async`-функций:

```ts
async function fetchUsers() {
  const res = await fetch('/api/users')
  return res.json() as Promise<User[]>
}

type Users = Awaited<ReturnType<typeof fetchUsers>>
// User[]
```

## NoInfer<T>

Запрещает TypeScript выводить тип параметра. Появился в TypeScript 5.4:

```ts
function createRouter<T extends string>(routes: T[], basePath: T) {
  // ...
}

// Без NoInfer TypeScript может вывести basePath как любой string
// С NoInfer basePath должен совпадать с одним из routes
```

## Комбинирование Utility Types

Utility Types можно комбинировать для создания сложных производных типов:

```ts
interface Article {
  id: number
  title: string
  content: string
  author: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

type CreateArticle = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
// Для POST-запроса — без auto-generated полей

type UpdateArticle = Partial<Omit<Article, 'id'>>
// Для PATCH-запроса — можно обновить любые поля, кроме id

type ArticlePreview = Pick<Article, 'id' | 'title' | 'author'>
// Для списка — только нужные поля
```

## Практические примеры

Типобезопасный Form:

```ts
interface FormData {
  username: string
  password: string
  remember: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>
// { username?: string; password?: string; remember?: string }

type FormState = {
  values: FormData
  errors: FormErrors
  touched: Partial<Record<keyof FormData, boolean>>
}
```

Типобезопасный API-client:

```ts
interface ApiRoutes {
  '/users': {
    GET: { response: User[]; query?: { page: number } }
    POST: { response: User; body: CreateUser }
  }
  '/users/:id': {
    GET: { response: User; params: { id: string } }
    PUT: { response: User; params: { id: string }; body: UpdateUser }
    DELETE: { response: void; params: { id: string } }
  }
}

type CreateUser = Omit<User, 'id'>
type UpdateUser = Partial<Omit<User, 'id'>>
```

DeepPartial (кастомный на основе идей Utility Types):

```ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface Config {
  database: {
    host: string
    port: number
    credentials: {
      user: string
      password: string
    }
  }
  cache: {
    enabled: boolean
    ttl: number
  }
}

type PartialConfig = DeepPartial<Config>
// Все свойства на всех уровнях — optional
```

## Шпаргалка

| Utility Type | Что делает |
|-------------|-----------|
| `Partial<T>` | Все свойства optional |
| `Required<T>` | Все свойства обязательные |
| `Readonly<T>` | Все свойства readonly |
| `Pick<T, K>` | Выбрать свойства |
| `Omit<T, K>` | Исключить свойства |
| `Record<K, V>` | Объект с ключами K и значениями V |
| `Exclude<T, U>` | Исключить из union |
| `Extract<T, U>` | Извлечь из union |
| `NonNullable<T>` | Убрать null/undefined |
| `ReturnType<T>` | Тип возврата функции |
| `Parameters<T>` | Типы параметров функции |
| `Awaited<T>` | Раскрыть Promise |

## Итог

Utility Types — готовые инструменты для преобразования типов без ручного дублирования. Самые используемые: `Partial` для обновлений, `Pick` и `Omit` для проекций, `Record` для словарей, `ReturnType` для извлечения типа из функции. Комбинируя их, можно описать любой производный тип в одну строку.
