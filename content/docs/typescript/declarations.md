---
title: Объявления типов в TypeScript
description: .d.ts файлы, @types/*, declare module, augmentation и создание собственных файлов объявлений типов для JavaScript-библиотек.
section: typescript
difficulty: intermediate
readTime: 10
order: 14
tags: [typescript, d.ts, declare, module augmentation, @types, typings]
---

## Что такое файлы объявлений

Файлы с расширением `.d.ts` содержат только объявления типов — без реализации. Они говорят TypeScript, какие типы, функции и переменные существуют, даже если код написан на JavaScript.

```ts
// utils.d.ts
export function formatDate(date: Date): string
export function capitalize(str: string): string
export const VERSION: string
```

```ts
// main.ts
import { formatDate, VERSION } from './utils'
// TypeScript знает типы, даже если utils.js — JavaScript
```

## @types/* — DefinitelyTyped

Большинство JavaScript-библиотек не поставляются с типами. Для них существует репозиторий DefinitelyTyped — пакеты `@types/*`:

```bash
npm install -D @types/lodash
npm install -D @types/node
npm install -D @types/react
```

После установки TypeScript автоматически подхватывает типы. `import _ from 'lodash'` будет типизирован.

Как проверить, есть ли типы у библиотеки:

1. Посмотреть в `package.json` библиотеки поля `types` или `typings`
2. Проверить наличие `@types/имя-пакета` на npm
3. Если ни того, ни другого — написать типы вручную

## declare

### declare var / let / const

Объявляет глобальную переменную:

```ts
declare const API_URL: string
declare var jQuery: (selector: string) => HTMLElement
```

### declare function

Объявляет функцию, которая существует в рантайме:

```ts
declare function ga(command: string, ...args: any[]): void
declare function gtag(type: string, ...args: any[]): void
```

### declare class

```ts
declare class Observable<T> {
  subscribe(observer: {
    next?: (value: T) => void
    error?: (error: Error) => void
    complete?: () => void
  }): Subscription
}

declare class Subscription {
  unsubscribe(): void
}
```

### declare module

Типизирует целый модуль, написанный на JavaScript:

```ts
declare module 'legacy-lib' {
  export function init(config: { apiKey: string }): void
  export function track(event: string, data?: Record<string, unknown>): void
  export const version: string
}
```

```ts
import { init, track, version } from 'legacy-lib'

init({ apiKey: 'xxx' })    // типизировано
track('click', { x: 100 }) // типизировано
```

Быстрый способ сделать «заглушку», когда типов нет и писать их лень:

```ts
declare module 'some-lib' {
  const lib: any
  export default lib
}
```

### declare module для augmentations

Расширение существующих типов модуля:

```ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    permissions?: string[]
  }
}
```

Теперь во всём проекте:

```ts
route.meta.requiresAuth // boolean | undefined — типизировано
route.meta.title        // string | undefined
```

Расширение Window:

```ts
declare global {
  interface Window {
    analytics: {
      track(event: string, data?: Record<string, unknown>): void
      identify(userId: string): void
    }
  }
}

export {}
```

`export {}` нужен, чтобы файл стал модулем и `declare global` работал.

## Структура .d.ts файла

```ts
// analytics.d.ts
declare namespace Analytics {
  interface User {
    id: string
    traits?: Record<string, unknown>
  }

  interface TrackOptions {
    anonymousId?: string
    timestamp?: Date
  }

  function identify(user: User): void
  function track(event: string, properties?: Record<string, unknown>, options?: TrackOptions): void
  function page(name: string): void
}
```

## Написание .d.ts для JavaScript-библиотеки

Допустим, есть JavaScript-библиотека `format.js`:

```js
export function currency(amount, locale = 'ru-RU') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB' }).format(amount)
}

export function plural(count, words) {
  const cases = [2, 0, 1, 1, 1, 2]
  return words[Math.min(cases.length - 1, cases[amount % 100 > 4 && amount % 100 < 20 ? 2 : cases[Math.min(amount % 10, 5)]])]
}

export default function format(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? '')
}
```

Файл объявлений `format.d.ts`:

```ts
export function currency(amount: number, locale?: string): string

export function plural(count: number, words: [string, string, string]): string

export default function format(template: string, data: Record<string, string | number>): string
```

## triple-slash directives

Специальные комментарии, которые дают инструкции компилятору:

### Ссылка на другой .d.ts

```ts
/// <reference path="types/global.d.ts" />
/// <reference types="node" />
```

### Ссылка на типы пакета

```ts
/// <reference types="vite/client" />
```

В современных проектах эти директивы встречаются редко — `tsconfig.json` и `import type` решают большинство задач.

## Практические примеры

### Типизация глобальных переменных (Vite env)

```ts
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Расширение типов Nuxt

```ts
// types/index.d.ts
declare module '#app' {
  interface NuxtApp {
    $auth: {
      login(email: string, password: string): Promise<void>
      logout(): Promise<void>
      user: Ref<User | null>
    }
  }
}
```

### Типизация CSS Modules

```ts
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}
```

### Типизация изображений

```ts
declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}
```

### Типизация env-переменных

```ts
// env.d.ts для Nuxt
interface RuntimeConfig {
  public: {
    apiBase: string
    appName: string
  }
  secretKey: string
}
```

### Generic module declaration

```ts
declare module 'my-lib' {
  interface Options<T> {
    data: T[]
    key: keyof T
    sort?: (a: T, b: T) => number
  }

  export function createList<T>(options: Options<T>): {
    items: T[]
    add: (item: T) => void
    remove: (id: T[keyof T]) => void
    sort: (fn?: (a: T, b: T) => number) => void
  }
}
```

## Автогенерация .d.ts

При разработке библиотеки TypeScript может сам генерировать `.d.ts`:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types",
    "emitDeclarationOnly": true
  }
}
```

После компиляции рядом с каждым `.js` появится `.d.ts` с типами.

## Публикация типов

Если вы публикуете библиотеку на npm:

1. Включите `declaration: true` в `tsconfig.json`
2. Укажите入口 в `package.json`:

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

## Итог

Файлы `.d.ts` — мост между JavaScript и TypeScript. Проверяйте `@types/*` перед написанием своих типов. `declare module` типизирует сторонние библиотеки, `declare global` расширяет глобальные типы. Module augmentation через `declare module` — способ добавить поля к существующим интерфейсам без изменения исходного кода библиотеки.
