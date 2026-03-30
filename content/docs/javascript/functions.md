---
title: "Функции в JavaScript: декларация vs выражение, стрелочные функции, this"
description: "Всё о функциях JavaScript — объявление, функциональные выражения, стрелочные функции, контекст this, call/apply/bind, аргументы по умолчанию и rest-параметры."
section: javascript
difficulty: beginner
readTime: 11
order: 11
tags: [функции, function, стрелочные функции, arrow function, this, call, apply, bind, JavaScript]
---

## Три способа создать функцию

### Декларация функции (Function Declaration)

```js
function greet(name) {
  return `Привет, ${name}!`
}

console.log(greet('Анна')) // 'Привет, Анна!'
```

Особенность — всплывает (hoisting). Можно вызвать до объявления:

```js
console.log(greet('Анна')) // работает

function greet(name) {
  return `Привет, ${name}!`
}
```

### Функциональное выражение (Function Expression)

```js
const greet = function (name) {
  return `Привет, ${name}!`
}
```

Не всплывает. Вызов до объявления — ошибка:

```js
console.log(greet('Анна')) // ReferenceError

const greet = function (name) {
  return `Привет, ${name}!`
}
```

### Стрелочная функция (Arrow Function)

Появились в ES6. Компактный синтаксис:

```js
const greet = (name) => {
  return `Привет, ${name}!`
}

// Если одно выражение — можно без {} и return
const greet = (name) => `Привет, ${name}!`

// Один параметр — скобки можно опустить
const double = n => n * 2

// Без параметров — пустые скобки
const sayHi = () => 'Привет!'
```

Если возвращаете объект — оберните в `()`:

```js
const createUser = (name, age) => ({ name, age })
// без скобок { name, age } будет воспринято как тело функции
```

## Ключевая разница: this

Это главная причина, почему стрелочные функции существуют.

### Обычная функция — свой this

`this` определяется тем, **как** вызвана функция:

```js
const user = {
  name: 'Анна',
  greet() {
    console.log(`Привет, я ${this.name}`)
  },
}

user.greet() // 'Привет, я Анна' — this = user
```

Но стоит «оторвать» метод от объекта — и `this` потеряется:

```js
const greet = user.greet
greet() // 'Привет, я undefined' — this = undefined (в строгом режиме)
```

### Стрелочная функция — this из окружения

Стрелочная функция **не создаёт свой `this`**. Она берёт его из места, где была написана (лексический this):

```js
const user = {
  name: 'Анна',
  friends: ['Иван', 'Мария'],

  showFriends() {
    this.friends.forEach((friend) => {
      // стрелочная функция берёт this из showFriends
      console.log(`${this.name} дружит с ${friend}`)
    })
  },
}

user.showFriends()
// 'Анна дружит с Иван'
// 'Анна дружит с Мария'
```

С обычной функцией внутри `forEach` это сломалось бы:

```js
showFriends() {
  this.friends.forEach(function (friend) {
    console.log(`${this.name} дружит с ${friend}`) // this = undefined!
  })
}
```

### Правило

- Нужен `this` (методы объекта, конструкторы) — обычная функция
- Используете `this` от окружения (callback внутри метода) — стрелочная

## Аргументы по умолчанию

```js
function createUser(name, role = 'user', active = true) {
  return { name, role, active }
}

createUser('Анна')                 // { name: 'Анна', role: 'user', active: true }
createUser('Иван', 'admin')        // { name: 'Иван', role: 'admin', active: true }
createUser('Мария', 'editor', false) // { name: 'Мария', role: 'editor', active: false }
```

Значение по умолчанию используется только когда аргумент строго `undefined`:

```js
function greet(name = 'Гость') {
  console.log(name)
}

greet()          // 'Гость'
greet(undefined) // 'Гость'
greet(null)      // null — null не заменяется на значение по умолчанию
greet('')        // '' — пустая строка тоже не заменяется
```

## Rest-параметры (...args)

Собирают «остаток» аргументов в массив:

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0)
}

sum(1, 2, 3)       // 6
sum(10, 20, 30, 40) // 100
```

Можно комбинировать с обычными параметрами — rest всегда последний:

```js
function log(level, ...messages) {
  messages.forEach(msg => console.log(`[${level}] ${msg}`))
}

log('INFO', 'Сервер запущен', 'Порт 3000')
// [INFO] Сервер запущен
// [INFO] Порт 3000
```

## Spread при вызове — обратная операция

Массив «раскрывается» в отдельные аргументы:

```js
const nums = [1, 5, 3, 9, 2]
Math.max(...nums) // 9
Math.min(...nums) // 1
```

Без spread это не сработает — `Math.max` ожидает отдельные аргументы, не массив.

## Функции высшего порядка

Функция, которая принимает другую функцию как аргумент или возвращает функцию:

```js
// Принимает функцию
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i)
  }
}

repeat(3, i => console.log(`Шаг ${i}`))

// Возвращает функцию
function multiply(a) {
  return (b) => a * b
}

const double = multiply(2)
const triple = multiply(3)
double(5) // 10
triple(5) // 15
```

## call, apply, bind — управление this

### call — вызывает функцию с указанным this

```js
function greet(greeting) {
  console.log(`${greeting}, я ${this.name}`)
}

const anna = { name: 'Анна' }
const ivan = { name: 'Иван' }

greet.call(anna, 'Привет') // 'Привет, я Анна'
greet.call(ivan, 'Здравствуйте') // 'Здравствуйте, я Иван'
```

### apply — то же, но аргументы массивом

```js
greet.apply(anna, ['Привет']) // 'Привет, я Анна'
```

Разница между `call` и `apply` — только формат аргументов. На практике `call` используют чаще.

### bind — создаёт новую функцию с привязанным this

```js
const user = {
  name: 'Анна',
  greet() {
    console.log(`Привет, я ${this.name}`)
  },
}

const boundGreet = user.greet.bind(user)
boundGreet() // 'Привет, я Анна'

// Частичное применение — зафиксировать часть аргументов
function multiply(a, b) {
  return a * b
}

const double = multiply.bind(null, 2)
double(5) // 10
double(10) // 20
```

## Когда использовать стрелочные, а когда обычные

| Ситуация | Использовать |
|----------|-------------|
| Метод объекта | Обычную (`method() {}`) |
| Callback (forEach, map, then) | Стрелочную |
| Конструктор (`new`) | Только обычную |
| Обработчик события DOM | Обычную (нужен `this`) |
| Функция-утилита | Любую |
| Когда нужен `arguments` | Только обычную |

```js
// Метод объекта — обычная
const button = {
  text: 'Нажми',
  handleClick() {
    console.log(this.text) // OK
  },
}

// Callback — стрелочная
const items = ['a', 'b', 'c']
items.forEach((item) => {
  console.log(item)
})

// Обработчик DOM — обычная
element.addEventListener('click', function () {
  this.classList.toggle('active') // this = элемент
})
```

## Итог

- Декларация всплывает, выражение — нет. В остальном разницы почти нет
- Стрелочные функции короче и не имеют своего `this`
- `this` в обычной функции зависит от вызова, в стрелочной — от места написания
- `bind` привязывает `this` навсегда, `call`/`apply` — на один вызов
- Rest-параметры `...args` собирают аргументы в массив, spread `...arr` — раскрывают
