---
title: tsconfig.json — конфигурация TypeScript
description: Полный разбор tsconfig.json — strict mode, target, module, paths, include/exclude и другие опции. Практические конфигурации для разных проектов.
section: typescript
difficulty: intermediate
readTime: 12
order: 10
tags: [typescript, tsconfig, configuration, strict mode]
---

## Что такое tsconfig.json

`tsconfig.json` — файл конфигурации TypeScript-компилятора. Он указывает, какие файлы компилировать, какой JavaScript генерировать и какие проверки включить.

Минимальный файл:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

## Основные опции

### target

Определяет, в какую версию JavaScript компилируется TypeScript:

```json
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

| Значение | Когда использовать |
|----------|-------------------|
| `ES5` | Поддержка старых браузеров (IE11) |
| `ES2020` | Современные браузеры, Node.js 14+ |
| `ES2022` | Новейшие фичи (top-level await) |
| `ESNext` | Самые свежие предложения |

В проектах с Vite или Nuxt обычно ставят `ESNext` — бандлеры сами транслируют код для нужных браузеров.

### module

Система модулей в выходном коде:

```json
{
  "compilerOptions": {
    "module": "ESNext"
  }
}
```

| Значение | Когда использовать |
|----------|-------------------|
| `CommonJS` | Node.js (старый стиль, `require`) |
| `ES2015` / `ESNext` | Браузер, современные бандлеры (`import`) |
| `NodeNext` | Node.js с ESM (Node 16+) |
| `Preserve` | Vite, Nuxt — не менять модули |

### moduleResolution

Как TypeScript ищет модули при импорте:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

| Значение | Когда использовать |
|----------|-------------------|
| `node` | Node.js (CommonJS) |
| `node16` / `nodenext` | Node.js с ESM |
| `bundler` | Vite, Webpack, Nuxt — современный стандарт |

## Strict mode

`strict: true` включает набор проверок, которые делают код максимально безопасным:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Это равносильно включению всех опций ниже:

### strictNullChecks

Самая важная опция. Запрещает неявный доступ к переменным, которые могут быть `null` или `undefined`:

```ts
const user = users.find(u => u.id === 1) // User | undefined
user.name // Ошибка: user может быть undefined

if (user) {
  user.name // ok
}
```

Без `strictNullChecks` код выше скомпилировался бы и упал в рантайме.

### noImplicitAny

Запрещает неявный `any`:

```ts
function greet(name) { // Ошибка: Parameter 'name' implicitly has 'any' type
  console.log(name)
}
```

Нужно явно указать тип:

```ts
function greet(name: string) {
  console.log(name)
}
```

### strictFunctionTypes

Проверяет типы параметров функций контравариантно:

```ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

function feed(animal: Animal) {}

const feedDog: (dog: Dog) => void = feed // Без strictFunctionTypes — ok
// Со strictFunctionTypes — ok (Dog -> Animal безопасно)

const feedAnimal: (animal: Animal) => void = (dog: Dog) => {}
// Ошибка: Dog не может быть присвоен Animal (контравариантность)
```

### strictPropertyInitialization

Проверяет, что свойства класса инициализированы в конструкторе:

```ts
class User {
  name: string // Ошибка: Property 'name' has no initializer
}

class User {
  name: string = 'Аноним' // ok
}
```

### noImplicitThis

Запрещает использование `this` с неявным типом `any`:

```ts
class Button {
  label = 'Click'

  handleClick() {
    console.log(this.label) // ok, TypeScript знает тип this
  }
}
```

## Пути и алиасы

### baseUrl

Базовая директория для относительных импортов:

```json
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

### paths

Сокращённые пути для импортов:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

### rootDirs

Несколько директорий, которые TypeScript считает одной:

```json
{
  "compilerOptions": {
    "rootDirs": ["src", "generated"]
  }
}
```

## include и exclude

Какие файлы компилировать:

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

Глобальные паттерны:
- `*` — любое имя файла
- `**/*` — любые файлы в любых поддиректориях
- `src/**/*.ts` — все `.ts`-файлы в `src`

## Декларации и типы

### declaration

Генерирует `.d.ts`-файлы рядом с `.js`:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

Полезно при разработке библиотек.

### emitDeclarationOnly

Генерирует только `.d.ts`, без `.js`. Используется, когда компиляцию делает другой инструмент (Babel, Vite, esbuild):

```json
{
  "compilerOptions": {
    "emitDeclarationOnly": true
  }
}
```

### typeRoots и types

Где искать глобальные типы:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["node", "vite/client"]
  }
}
```

## Конфигурация для разных проектов

### Vite + Vue

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

### Nuxt

Nuxt генерирует `tsconfig.json` автоматически. Не нужно его создавать вручную. Если нужен кастомный конфиг — правьте `nuxt.config.ts`.

### React + Vite

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Библиотека

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "emitDeclarationOnly": true
  },
  "include": ["src"]
}
```

## Полезные дополнительные опции

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

| Опция | Что делает |
|-------|-----------|
| `noUnusedLocals` | Ошибка при неиспользуемых переменных |
| `noUnusedParameters` | Ошибка при неиспользуемых параметрах |
| `noFallthroughCasesInSwitch` | Запрещает fall-through в switch |
| `noUncheckedIndexedAccess` | Индексный доступ возвращает `T \| undefined` |
| `exactOptionalPropertyTypes` | Различает `undefined` и отсутствие свойства |
| `skipLibCheck` | Пропускает проверку `.d.ts` файлов (ускоряет сборку) |

## References

Project references позволяют разбить большой проект на подпроекты:

```json
// tsconfig.json (корень)
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "composite": true,
    "strict": true
  },
  "include": ["src"]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "composite": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

## Итог

`tsconfig.json` — ключевой файл конфигурации TypeScript. Всегда включайте `strict: true` — это ловит большинство ошибок. Для современных фронтенд-проектов используйте `moduleResolution: "bundler"`, `noEmit: true` (компиляцию делает бандлер) и `skipLibCheck: true` для скорости. Path aliases нужно дублировать в конфигурации бандлера (Vite, Nuxt).
