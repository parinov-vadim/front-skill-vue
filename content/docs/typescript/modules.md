---
title: Модули и namespaces в TypeScript
description: Организация кода в TypeScript — ES-модули (import/export), namespaces, barrel-экспорты, паттерны реэкспорта и структура проекта.
section: typescript
difficulty: intermediate
readTime: 10
order: 9
tags: [typescript, modules, namespaces, import, export, barrel]
---

## ES-модули в TypeScript

TypeScript использует тот же синтаксис модулей, что и JavaScript (ES2015+). Любой файл с `import` или `export` считается модулем.

### Named exports

```ts
// utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const PI = 3.14
```

```ts
// main.ts
import { formatDate, capitalize } from './utils'

formatDate(new Date())
capitalize('hello')
```

Можно импортировать с псевдонимом:

```ts
import { formatDate as fmtDate } from './utils'
```

### Default export

```ts
// config.ts
export default {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}
```

```ts
import config from './config'
config.apiUrl
```

### Re-export

Перенаправление экспортов из другого модуля:

```ts
export { formatDate, capitalize } from './utils'
export { default as config } from './config'
```

Re-export с переименованием:

```ts
export { formatDate as formatDateString } from './utils'
```

## Barrel-экспорты

Barrel-файл (обычно `index.ts`) реэкспортирует всё из модулей директории:

```
components/
  Button.ts
  Input.ts
  Modal.ts
  index.ts    ← barrel
```

```ts
// components/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
```

```ts
// Можно импортировать из директории
import { Button, Input } from './components'
```

Экспорт всего через `*`:

```ts
export * from './Button'
export * from './Input'
export * from './Modal'
```

Осторожно: `export *` может создать конфликты имён, если несколько модулей экспортируют одно и то же.

## Типы в модулях

TypeScript позволяет экспортировать и импортировать типы:

```ts
// types.ts
export interface User {
  id: number
  name: string
  email: string
}

export type UserRole = 'admin' | 'editor' | 'viewer'
```

```ts
import type { User, UserRole } from './types'
```

`import type` гарантирует, что импорт будет удалён при компиляции и не попадёт в JavaScript-бандл:

```ts
import { type User, formatDate } from './utils'
//     ^^^^^^^^^^^ только тип, удалится
//                  ^^^^^^^^^^^ останется в бандле
```

## Namespaces

Namespaces — способ организации кода, который появился в TypeScript до того, как ES-модули стали стандартом. Сейчас они используются реже, но встречаются в старых проектах и при написании определений типов (`.d.ts`).

```ts
// validation.ts
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean
  }

  export class EmailValidator implements StringValidator {
    isValid(s: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
    }
  }

  export class PhoneValidator implements StringValidator {
    isValid(s: string): boolean {
      return /^\+?\d{10,15}$/.test(s)
    }
  }
}

const emailValidator = new Validation.EmailValidator()
emailValidator.isValid('test@mail.ru')
```

### Вложенные namespaces

```ts
namespace App {
  export namespace Models {
    export interface User {
      id: number
      name: string
    }
  }

  export namespace Services {
    export function getUser(id: number): Models.User {
      return { id, name: 'Анна' }
    }
  }
}

const user = App.Services.getUser(1)
```

### Когда использовать namespaces

| Ситуация | Рекомендация |
|----------|-------------|
| Новый проект | ES-модули |
| Определения типов (`.d.ts`) | Namespaces или модули |
| Глобальная утилита | Namespace с `declare global` |
| Организация бизнес-логики | ES-модули |

## Файловые модули vs глобальные

Файл без `import`/`export` — глобальный скрипт. Переменные и типы, объявленные в нём, видны всем:

```ts
// global.d.ts
declare global {
  interface Window {
    analytics: {
      track(event: string, data?: Record<string, unknown>): void
    }
  }
}

export {}
```

`export {}` в конце превращает файл в модуль, но позволяет объявлять глобальные типы через `declare global`.

## Разделение типов и реализации

Популярный паттерн — вынести все интерфейсы и типы в отдельный файл:

```
features/
  users/
    types.ts        ← только типы
    api.ts          ← функции для работы с API
    hooks.ts        ← composables / hooks
    index.ts        ← barrel
```

```ts
// features/users/types.ts
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface CreateUserPayload {
  name: string
  email: string
  password: string
}

export type UpdateUserPayload = Partial<Omit<User, 'id'>>
```

```ts
// features/users/api.ts
import type { User, CreateUserPayload, UpdateUserPayload } from './types'

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users')
  return res.json()
}

export async function createUser(data: CreateUserPayload): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}
```

## Path aliases

В `tsconfig.json` можно настроить сокращённые пути:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

```ts
import { Button } from '@components/Button'
import { formatDate } from '@utils/format'
```

В Vite-проектах нужно продублировать алиасы в `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

В Nuxt алиас `~/` и `@/` работают из коробки.

## Итог

В новых проектах используйте ES-модули — это стандарт JavaScript. Namespaces нужны в основном для `.d.ts`-файлов и старого кода. Barrel-экспорты через `index.ts` помогают упростить импорты. `import type` гарантирует, что типы не попадут в бандл. Path aliases сокращают пути, но требуют настройки и в `tsconfig.json`, и в бандлере.
