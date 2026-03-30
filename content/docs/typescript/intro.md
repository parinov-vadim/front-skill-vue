---
title: Что такое TypeScript и зачем он нужен
description: TypeScript — типизированный надмножество JavaScript, которое помогает находить ошибки до запуска кода и делает разработку крупных проектов предсказуемой.
section: typescript
difficulty: beginner
readTime: 8
order: 1
tags: [typescript, types, static typing, javascript]
---

## Что такое TypeScript

**TypeScript** — это язык программирования, разработанный Microsoft, который добавляет в JavaScript статическую типизацию. Код на TypeScript компилируется в обычный JavaScript, поэтому он работает в любом браузере и на любой платформе.

Простыми словами: TypeScript = JavaScript + типы.

## Зачем нужен TypeScript

JavaScript — язык с динамической типизацией. Переменная может хранить число, а через секунду — строку, и никто не скажет, что это ошибка:

```js
let age = 25
age = 'двадцать пять' // JavaScript не ругается
```

В небольшом проекте это не страшно. Но когда кодовая база растёт, такие сюрпризы начинают стоить часы отладки. TypeScript ловит подобные проблемы **до запуска кода**:

```ts
let age: number = 25
age = 'двадцать пять' // Ошибка: Type 'string' is not assignable to type 'number'
```

## Какие проблемы решает

**Ошибки на этапе компиляции.** Опечатки в названиях свойств, передача неправильных типов в функции, обращение к несуществующим методам — всё это TypeScript найдёт ещё в редакторе.

```ts
interface User {
  name: string
  age: number
}

function greet(user: User) {
  console.log(`Привет, ${user.name}!`)
}

greet({ nme: 'Анна', age: 25 })
// Ошибка: Object literal may only specify known properties,
// and 'nme' does not exist in type 'User'. Did you mean 'name'?
```

**Автодополнение и документация.** Когда TypeScript знает тип объекта, редактор кода (VS Code, WebStorm) подсказывает доступные свойства и методы. Это ускоряет разработку и снижает количество походов в документацию.

**Безопасный рефакторинг.** Нужно переименовать поле в интерфейсе? TypeScript покажет все места, где используется старое имя. В JavaScript такие изменения часто приводят к скрытым багам.

**Командная работа.** Типы работают как документация, которая не устаревает. Когда разработчик видит `function fetchUser(id: number): Promise<User>`, ему сразу понятно, что принимает функция и что возвращает.

## Установка и первый запуск

Установить TypeScript можно через npm или bun:

```bash
npm install -g typescript
# или
bun add -g typescript
```

Проверить установку:

```bash
tsc --version
```

Создадим первый файл `hello.ts`:

```ts
const message: string = 'Привет, TypeScript!'
console.log(message)
```

Скомпилируем в JavaScript:

```bash
tsc hello.ts
```

Рядом появится файл `hello.js` с обычным JavaScript-кодом.

## TypeScript в реальных проектах

В современных проектах TypeScript используется почти везде. Popularные фреймворки полностью поддерживают типизацию:

- **Vue 3** — написан на TypeScript, `defineProps` и `defineEmits` работают с типами из коробки
- **React** — типизируется через `@types/react`, хуки полностью типизированы
- **Angular** — написан на TypeScript, типы встроены в каждый аспект фреймворка
- **Nuxt** — полная поддержка TypeScript, автоматическая генерация типов для API-роутов
- **Next.js** — встроенная поддержка TypeScript при создании проекта

## Компиляция и конфигурация

TypeScript настраивается через файл `tsconfig.json`. Минимальный конфиг:

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

В большинстве современных проектов (Vite, Nuxt, Next.js) TypeScript уже настроен — достаточно создать файл `.ts` и начать писать код.

## Что будет в этом разделе

| Статья | О чём |
|--------|-------|
| Базовые типы | string, number, boolean, array, tuple, enum |
| Интерфейсы и type aliases | Как описывать формы объектов |
| Функции | Типизация параметров и возвращаемых значений |
| Дженерики | Параметризованные типы |
| Utility Types | Partial, Pick, Omit, Record и другие |
| Type Guards | Сужение типов в рантайме |
| Продвинутые типы | Conditional, Mapped, Template Literal Types |
| tsconfig | Настройка компилятора |

## Итог

TypeScript — это не замена JavaScript, а его расширение. Он добавляет систему типов, которая помогает писать код с меньшим количеством ошибок, лучше документировать API и увереннее делать рефакторинг. Научиться основам TypeScript можно за пару дней, а польза от него растёт вместе с размером проекта.
