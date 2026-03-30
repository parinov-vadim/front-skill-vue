---
title: "Symbol в JavaScript — для чего нужны и как использовать"
description: "Symbol в JavaScript — уникальные идентификаторы, Symbol.iterator, Symbol.toPrimitive, глобальный реестр Symbol.for и практические примеры."
section: javascript
difficulty: intermediate
readTime: 7
order: 16
tags: [Symbol, Symbol.iterator, Symbol.for, уникальный идентификатор, JavaScript]
---

## Что такое Symbol

`Symbol` — это уникальный примитив. Каждый вызов `Symbol()` создаёт новое значение, которое гарантированно не совпадёт ни с каким другим:

```js
const a = Symbol('id')
const b = Symbol('id')

a === b        // false — всегда разные
typeof a       // 'symbol'
a.description  // 'id' — описание для отладки
```

Строка в скобках — описание, оно ни на что не влияет. Только для удобства разработчика.

## Зачем нужен Symbol

### Уникальные ключи объекта

Обычные строковые ключи могут столкнуться:

```js
const library = { name: 'Моя библиотека' }

// Другой код может перезаписать 'name'
library.name = 'Чужая библиотека'
```

Symbol-ключи никогда не столкнутся:

```js
const library = { name: 'Моя библиотека' }

const myId = Symbol('id')
library[myId] = 123

const otherId = Symbol('id')
library[otherId] = 456

console.log(library[myId])   // 123 — не перезаписан
console.log(library[otherId]) // 456
```

### Symbol-ключи скрыты от обычного перебора

```js
const secretKey = Symbol('secret')

const user = {
  name: 'Анна',
  age: 25,
  [secretKey]: 'пароль123',
}

Object.keys(user)          // ['name', 'age'] — Symbol не виден
Object.values(user)        // ['Анна', 25]
JSON.stringify(user)       // '{"name":"Анна","age":25}' — Symbol не попал в JSON

for (const key in user) {
  console.log(key)         // 'name', 'age'
}
```

Чтобы получить Symbol-ключи — `Object.getOwnPropertySymbols()`:

```js
Object.getOwnPropertySymbols(user) // [Symbol(secret)]
```

Все ключи включая Symbol — `Reflect.ownKeys()`:

```js
Reflect.ownKeys(user) // ['name', 'age', Symbol(secret)]
```

## Symbol.for — глобальный реестр

`Symbol.for('key')` создаёт или находит Symbol в глобальном реестре. Один и тот же ключ — один и тот же Symbol:

```js
const a = Symbol.for('app.id')
const b = Symbol.for('app.id')

a === b // true — один и тот же Symbol

Symbol.keyFor(a) // 'app.id' — получить ключ из реестра
```

Обычный `Symbol('app.id')` каждый раз создаёт новый. `Symbol.for` — находит существующий.

## Встроенные Symbol (Well-known Symbols)

JavaScript определяет набор Symbol-значений, которые управляют поведением объектов.

### Symbol.iterator

Делает объект перебираемым через `for...of`:

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from
    const last = this.to

    return {
      next: () => {
        if (current <= last) return { value: current++, done: false }
        return { done: true }
      },
    }
  },
}

for (const num of range) {
  console.log(num) // 1, 2, 3, 4, 5
}

[...range] // [1, 2, 3, 4, 5]
```

### Symbol.toPrimitive

Определяет, как объект преобразуется в примитив (при `+`, `${}`, сравнении):

```js
const price = {
  amount: 1500,
  currency: 'RUB',

  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return `${this.amount} ${this.currency}`
    if (hint === 'number') return this.amount
    return this.amount
  },
}

console.log(`Цена: ${price}`)   // 'Цена: 1500 RUB' — hint = 'string'
console.log(price + 500)        // 2000 — hint = 'default'
console.log(price * 2)          // 3000 — hint = 'number'
```

### Symbol.toStringTag

Имя, которое возвращает `Object.prototype.toString`:

```js
class ApiClient {
  [Symbol.toStringTag] = 'ApiClient'
}

const client = new ApiClient()
Object.prototype.toString.call(client) // '[object ApiClient]'
```

### Symbol.hasInstance

Определяет поведение `instanceof`:

```js
class EvenNumber {
  static [Symbol.hasInstance](num) {
    return typeof num === 'number' && num % 2 === 0
  }
}

42 instanceof EvenNumber // true
7 instanceof EvenNumber  // false
```

### Symbol.species

Указывает, какой конструктор использовать для создания производных объектов:

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array // map/filter вернут обычный Array, а не MyArray
  }
}

const arr = new MyArray(1, 2, 3)
const mapped = arr.map(x => x * 2)

arr instanceof MyArray    // true
mapped instanceof MyArray // false
mapped instanceof Array   // true
```

## Практическое использование

### «Скрытые» свойства для библиотек

```js
const VISITED = Symbol('visited')

function markVisited(element) {
  element[VISITED] = true
}

function isVisited(element) {
  return !!element[VISITED]
}

// Не засоряет объект строковыми ключами, не конфликтует с другими библиотеками
```

### Enum-подобные значения

```js
const Status = Object.freeze({
  PENDING: Symbol('pending'),
  ACTIVE: Symbol('active'),
  DONE: Symbol('done'),
})

function handleStatus(status) {
  switch (status) {
    case Status.PENDING: return 'Ожидает'
    case Status.ACTIVE: return 'Активен'
    case Status.DONE: return 'Завершён'
    default: return 'Неизвестно'
  }
}
```

Symbol гарантирует, что значение нельзя подделать — строковые константы можно передать как строку, а Symbol — только из объекта `Status`.

## Итог

- `Symbol()` — уникальный идентификатор, `Symbol.for()` — глобальный реестр
- Symbol-ключи скрыты от `Object.keys`, `for...in`, `JSON.stringify`
- Встроенные Symbol (`Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.toStringTag`) настраивают поведение объектов
- Используйте для «скрытых» свойств, enum-значений и безопасного расширения объектов
