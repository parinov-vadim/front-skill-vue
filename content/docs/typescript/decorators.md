---
title: Декораторы в TypeScript
description: "Декораторы TypeScript — @decorator для классов, методов, свойств и параметров. Практические примеры: логирование, валидация, deprecated, memoize."
section: typescript
difficulty: advanced
readTime: 12
order: 13
tags: [typescript, decorators, class decorators, metadata, reflect]
---

## Что такое декораторы

Декоратор — функция, которая модифицирует класс, метод, свойство или параметр. Синтаксис `@name` пришёл из Python и стал стандартом в TypeScript 5.0.

```ts
function log(target: any, context: ClassMethodDecoratorContext) {
  // ...
}

class UserService {
  @log
  getUsers() {
    return fetch('/api/users')
  }
}
```

## Включение декораторов

В `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Начиная с TypeScript 5.0 поддерживается нативный стандарт декораторов (TC39 stage 3). Он работает без `experimentalDecorators`, но синтаксис отличается. В этой статье — оба подхода.

## Декораторы классов

Декоратор класса принимает конструктор класса и может его модифицировать или заменить:

### Нативный стандарт (TS 5.0+)

```ts
function logged<T extends { new (...args: any[]): any }>(
  value: T,
  context: ClassDecoratorContext,
) {
  const name = context.name ?? value.name
  console.log(`Класс ${String(name)} создан`)

  return class extends value {
    constructor(...args: any[]) {
      console.log(`new ${String(name)}(${args.join(', ')})`)
      super(...args)
    }
  }
}

@logged
class User {
  constructor(public name: string) {}
}

const user = new User('Анна')
// new User(Анна)
```

### Экспериментальные декораторы (legacy)

```ts
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class Config {
  static host = 'localhost'
}
```

## Декораторы методов

### Нативный стандарт

```ts
function log(
  method: (...args: any[]) => any,
  context: ClassMethodDecoratorContext,
) {
  const name = String(context.name)

  return function (this: any, ...args: any[]) {
    console.log(`→ ${name}(${args.join(', ')})`)
    const result = method.call(this, ...args)
    console.log(`← ${name} = ${result}`)
    return result
  }
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b
  }

  @log
  multiply(a: number, b: number): number {
    return a * b
  }
}

const calc = new Calculator()
calc.add(2, 3)
// → add(2, 3)
// ← add = 5
```

### Декоратор-фабрика

Декоратор, принимающий параметры — это функция, которая возвращает декоратор:

```ts
function debounce(delay: number) {
  return function (
    method: (...args: any[]) => any,
    context: ClassMethodDecoratorContext,
  ) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => method.call(this, ...args), delay)
    }
  }
}

class Search {
  @debounce(300)
  handleInput(query: string) {
    console.log('Поиск:', query)
  }
}
```

## Декораторы свойств

### Нативный стандарт

```ts
function defaultValue(value: unknown) {
  return function (
    _: unknown,
    context: ClassFieldDecoratorContext,
  ) {
    return function (initialValue: unknown) {
      return initialValue ?? value
    }
  }
}

class User {
  @defaultValue('Аноним')
  name: string = ''

  @defaultValue(0)
  age: number = 0
}

const user = new User()
console.log(user.name) // 'Аноним'
```

### Readonly-свойство

```ts
function readonly(
  _: unknown,
  context: ClassFieldDecoratorContext,
) {
  return function (initialValue: unknown) {
    return initialValue
  }
}
```

## Практические декораторы

### @memoize — кэширование результата

```ts
function memoize(
  method: (...args: any[]) => any,
  context: ClassMethodDecoratorContext,
) {
  const cache = new Map<string, any>()

  return function (this: any, ...args: any[]) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = method.call(this, ...args)
    cache.set(key, result)
    return result
  }
}

class MathService {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}

const math = new MathService()
math.fibonacci(40) // считается
math.fibonacci(40) // из кэша
```

### @validate — проверка аргументов

```ts
function validate(
  method: (...args: any[]) => any,
  context: ClassMethodDecoratorContext,
) {
  return function (this: any, ...args: any[]) {
    if (args.some(arg => arg === undefined || arg === null)) {
      throw new Error(`Аргументы ${String(context.name)} не могут быть null/undefined`)
    }
    return method.call(this, ...args)
  }
}

class UserService {
  @validate
  createUser(name: string, email: string) {
    return { name, email }
  }
}

const service = new UserService()
service.createUser('Анна', 'anna@mail.ru') // ok
service.createUser('Анна', null) // Error
```

### @deprecated — предупреждение об устаревшем методе

```ts
function deprecated(message?: string) {
  return function (
    method: (...args: any[]) => any,
    context: ClassMethodDecoratorContext,
  ) {
    const name = String(context.name)

    return function (this: any, ...args: any[]) {
      console.warn(`⚠ ${name} устарел.${message ? ` ${message}` : ''}`)
      return method.call(this, ...args)
    }
  }
}

class API {
  @deprecated('Используйте fetchUsers()')
  getUsers() {
    return fetch('/api/users')
  }

  fetchUsers() {
    return fetch('/api/users')
  }
}
```

### @enumerable / @nonEnumerable

```ts
function enumerable(
  method: (...args: any[]) => any,
  context: ClassMethodDecoratorContext,
) {
  context.addInitializer(function () {
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(this),
      context.name,
    )
    if (descriptor) {
      descriptor.enumerable = true
      Object.defineProperty(Object.getPrototypeOf(this), context.name, descriptor)
    }
  })
}
```

## Декораторы и metadata (experimental)

При включении `emitDecoratorMetadata` в `tsconfig.json` TypeScript генерирует метаданные типов:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Это используется в фреймворках вроде NestJS и TypeORM:

```ts
import { IsString, IsEmail, MinLength } from 'class-validator'

class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string
}
```

## Когда использовать декораторы

| Ситуация | Подход |
|----------|--------|
| Angular, NestJS | Декораторы — часть фреймворка |
| Валидация форм (class-validator) | Декораторы удобны |
| Логирование, profiling | Декораторы-обёртки |
| React, Vue | Обычно HOC / composables вместо декораторов |
| Простые утилиты | Обычные функции |

## Итог

Декораторы — удобный способ добавить поведение к классам и методам без изменения их кода. В TypeScript 5.0 поддерживается нативный стандарт. Самые полезные паттерны: логирование, кэширование (`@memoize`), валидация и пометка устаревших методов (`@deprecated`). В Angular и NestJS декораторы — основа фреймворка, в React и Vue они почти не используются.
