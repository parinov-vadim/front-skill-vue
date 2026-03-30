---
title: Интерфейсы и type aliases в TypeScript
description: Интерфейсы (interface) и псевдонимы типов (type aliases) — два способа описания форм объектов в TypeScript. Разбираемся, чем они отличаются и когда что использовать.
section: typescript
difficulty: beginner
readTime: 10
order: 3
tags: [typescript, interface, type, generics, extends]
---

## Что такое интерфейс

**Интерфейс** описывает форму объекта — какие у него должны быть свойства и какого типа:

```ts
interface User {
  name: string
  age: number
  email: string
}

const user: User = {
  name: 'Анна',
  age: 25,
  email: 'anna@example.com',
}
```

Если забыть поле или добавить лишнее — TypeScript укажет на ошибку.

## Опциональные и readonly-свойства

```ts
interface Article {
  title: string
  content: string
  tags?: string[]          // необязательное свойство
  readonly createdAt: Date // нельзя изменить после создания
}

const post: Article = {
  title: 'TypeScript',
  content: 'Текст статьи',
  createdAt: new Date(),
}

post.title = 'Новое название' // ok
post.createdAt = new Date()   // Ошибка: readonly
```

## Что такое type alias

**Type alias** (псевдоним типа) — это имя для любого типа, не только объекта:

```ts
type ID = string | number
type Callback = (data: string) => void
type Coordinates = [number, number]
```

Для объектов синтаксис почти такой же, как у интерфейса:

```ts
type User = {
  name: string
  age: number
  email: string
}
```

## Интерфейсы vs type aliases

Большую часть времени можно использовать любой из вариантов. Но есть отличия:

### Наследование

Интерфейсы расширяются через `extends`:

```ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

const rex: Dog = { name: 'Rex', breed: 'Овчарка' }
```

Type alias — через `&` (intersection):

```ts
type Animal = {
  name: string
}

type Dog = Animal & {
  breed: string
}
```

### Объединение (Union)

Только `type` поддерживает union:

```ts
type Status = 'active' | 'inactive'
type Result = Success | Error
```

Интерфейс так не умеет.

### Declaration merging

Интерфейсы с одинаковым именем автоматически объединяются:

```ts
interface Config {
  host: string
}

interface Config {
  port: number
}

const config: Config = { host: 'localhost', port: 3000 }
```

Для type alias так нельзя — будет ошибка «Duplicate identifier». Это свойство полезно при написании_augmentations_ — расширении сторонних типов.

### Когда что использовать

| Ситуация | Выбор |
|----------|-------|
| Форма объекта, который может расширяться | `interface` |
| Union, tuple, примитив | `type` |
| Mapped types, conditional types | `type` |
| Расширение типов библиотеки | `interface` |
| Всё остальное | На ваш вкус |

Многие команды выбирают одно правило: интерфейсы для объектов, type aliases для всего остального. Другие используют только `type`. Оба подхода рабочие.

## Индексные сигнатуры

Когда вы не знаете заранее имена свойств, но знаете тип значений:

```ts
interface Dictionary {
  [key: string]: string
}

const translations: Dictionary = {
  hello: 'Привет',
  goodbye: 'До свидания',
  thanks: 'Спасибо',
}
```

С числовыми ключами:

```ts
interface NumberMap {
  [key: number]: string
}

const errors: NumberMap = {
  404: 'Не найдено',
  500: 'Ошибка сервера',
}
```

## Вложенные типы

Объекты часто содержат другие объекты. Типы можно описывать прямо внутри или выносить:

```ts
interface User {
  name: string
  address: {
    city: string
    street: string
    zip: string
  }
}
```

Или вынести для переиспользования:

```ts
interface Address {
  city: string
  street: string
  zip: string
}

interface User {
  name: string
  address: Address
}
```

Второй вариант лучше — `Address` можно переиспользовать.

## Методы в интерфейсах

Три способа объявить метод:

```ts
interface Logger {
  log(message: string): void
  warn(message: string): void
  error(message: string): void
}

// Альтернатива через свойство-функцию
interface Logger2 {
  log: (message: string) => void
  warn: (message: string) => void
}
```

Разница появляется только при перегрузках — интерфейсный синтаксис гибче.

## Расширение типов библиотек (Module Augmentation)

Когда нужно добавить поле к существующему интерфейсу из библиотеки:

```ts
import type { RouteMeta } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}
```

Теперь `route.meta.requiresAuth` будет доступен во всём проекте. Это работает именно благодаря declaration merging интерфейсов.

## Практические примеры

Типизация компонента Vue:

```ts
interface Props {
  title: string
  count?: number
  variant: 'primary' | 'secondary'
}

interface Emits {
  (e: 'update', value: number): void
  (e: 'delete'): void
}
```

Типизация API-ответа:

```ts
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

type UserListResponse = PaginatedResponse<{
  id: number
  name: string
  email: string
}>
```

Конфигурация с дефолтными значениями:

```ts
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

function fetchWithDefaults(url: string, options: FetchOptions = {}) {
  const {
    method = 'GET',
    headers = {},
    timeout = 5000,
  } = options

  // ...
}
```

## Итог

Интерфейсы и type aliases — два способа описать форму данных. Для объектов оба работают, но интерфейсы поддерживают `extends` и declaration merging, а type aliases — union, intersection и продвинутые типы. Выбирайте то, что удобнее в конкретной ситуации, но будьте последовательны в рамках проекта.
