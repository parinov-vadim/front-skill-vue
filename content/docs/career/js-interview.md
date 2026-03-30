---
title: "Вопросы на JavaScript-собеседовании: 35 вопросов с ответами"
description: "Подготовка к собеседованию по JavaScript: 35 типичных вопросов от junior до middle с краткими ответами. Типы данных, замыкания, промисы, this, прототипы, event loop."
section: career
difficulty: intermediate
readTime: 18
order: 2
tags: [собеседование, JavaScript, вопросы, interview, junior, middle, подготовка, замыкания, промисы, this]
---

## Типы данных и приведение

### 1. Какие типы данных есть в JavaScript?

8 типов: `number`, `string`, `boolean`, `undefined`, `null`, `symbol`, `bigint` и `object`. Первые семь — примитивы.

```js
typeof 42           // 'number'
typeof 'привет'     // 'string'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof null         // 'object' (баг в языке, не исправляют ради совместимости)
typeof Symbol()     // 'symbol'
typeof 10n          // 'bigint'
typeof {}           // 'object'
typeof []           // 'object' (массив — тоже объект)
```

### 2. В чём разница между `==` и `===`?

`===` проверяет и значение, и тип. `==` приводит типы перед сравнением.

```js
0 == false    // true  (0 → false)
'' == false   // true  ('' → false)
null == undefined // true
null === undefined // false

'42' == 42    // true  (строка → число)
'42' === 42   // false
```

На практике почти всегда используйте `===`.

### 3. Что такое неявное приведение типов?

JavaScript автоматически преобразует типы в выражениях:

```js
'5' + 3      // '53' (число → строка)
'5' - 3      // 2   (строка → число)
true + 1     // 2   (true → 1)
false + 1    // 1   (false → 0)
'' + 0       // '0'
!'hello'     // false (непустая строка → true → !true)
!0           // true  (0 → false → !false)
```

### 4. Разница между `null` и `undefined`?

`undefined` — переменная объявлена, но значение не присвоено. `null` — разработчик явно указал «значения нет».

```js
let a
console.log(a) // undefined

let b = null
console.log(b) // null

typeof undefined // 'undefined'
typeof null      // 'object'
```

## Переменные и область видимости

### 5. Разница между `var`, `let` и `const`?

| Свойство | `var` | `let` | `const` |
|----------|-------|-------|---------|
| Область видимости | функция | блок | блок |
| Хоистинг | да (undefined) | да (TDZ) | да (TDZ) |
| Переопределение | да | да | нет |

```js
if (true) {
  var x = 1    // доступна вне блока
  let y = 2    // только внутри блока
  const z = 3  // только внутри блока
}
console.log(x) // 1
console.log(y) // ReferenceError
```

### 6. Что такое хоистинг (hoisting)?

Объявления `var` поднимаются в начало функции. `let`/`const` тоже поднимаются, но находятся в «мёртвой зоне» (TDZ) до строки объявления.

```js
console.log(a) // undefined (var поднялось)
console.log(b) // ReferenceError (let в TDZ)
var a = 1
let b = 2
```

### 7. Что такое замыкание?

Функция, которая запоминает переменные из области видимости, где была создана, даже после того, как внешняя функция завершилась.

```js
function counter() {
  let count = 0
  return () => ++count
}

const inc = counter()
inc() // 1
inc() // 2
```

Стрелка «помнит» `count` — это замыкание.

## this

### 8. Как работает `this`?

Зависит от того, как вызвана функция:

```js
const obj = {
  name: 'Анна',
  greet() {
    console.log(this.name)
  }
}

obj.greet()         // 'Анна' — this = obj

const fn = obj.greet
fn()                // undefined — this = window/undefined (strict mode)

const btn = document.querySelector('button')
btn.addEventListener('click', obj.greet) // undefined — this = button
```

### 9. Разница между `call`, `apply`, `bind`?

Все три явно задают `this`:

```js
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`)
}

const user = { name: 'Анна' }

greet.call(user, 'Привет')    // 'Привет, Анна'
greet.apply(user, ['Привет']) // 'Привет, Анна'

const bound = greet.bind(user)
bound('Привет')               // 'Привет, Анна'
```

`call` — аргументы через запятую. `apply` — массивом. `bind` — возвращает новую функцию.

### 10. Как `this` работает в стрелочных функциях?

Стрелочные функции не имеют свой `this`. Они берут его из окружения, где были созданы.

```js
const obj = {
  name: 'Анна',
  greet: () => console.log(this.name),
  hello() { console.log(this.name) }
}

obj.greet()  // undefined (this = window/undefined)
obj.hello()  // 'Анна'    (this = obj)
```

## Прототипы

### 11. Что такое прототип?

Каждый объект в JavaScript имеет скрытую ссылку `[[Prototype]]` на другой объект. Если свойство не найдено в самом объекте — поиск идёт по цепочке прототипов.

```js
const animal = { sound: 'generic' }
const cat = Object.create(animal)
cat.sound // 'generic' — найдено в прототипе
```

### 12. Как работает `class`?

`class` — синтаксический сахар над прототипами:

```js
class Animal {
  constructor(name) {
    this.name = name
  }
  speak() {
    console.log(this.name)
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name)
  }
}

// Под капотом:
// Dog.prototype.__proto__ === Animal.prototype
```

## Асинхронность

### 13. Что такое промис (Promise)?

Объект, представляющий результат асинхронной операции. Может быть в трёх состояниях: pending, fulfilled, rejected.

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('готово'), 1000)
})

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('всегда'))
```

### 14. Как работает `async/await`?

Синтаксический сахар над промисами:

```js
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    const user = await response.json()
    return user
  } catch (error) {
    console.error(error)
  }
}
```

`await` приостанавливает функцию до завершения промиса. Функция всегда возвращает промис.

### 15. В чём разница между `Promise.all`, `Promise.allSettled`, `Promise.race`?

```js
// Ждёт все. Если хоть один упал — весь результат падает
Promise.all([p1, p2, p3])

// Ждёт все. Возвращает статус каждого (fulfilled/rejected)
Promise.allSettled([p1, p2, p3])

// Возвращает первый завершённый (неважно, успех или ошибка)
Promise.race([p1, p2, p3])
```

### 16. Что такое Event Loop?

Механизм, который позволяет JavaScript выполнять асинхронный код в одном потоке:

1. Выполнить весь синхронный код
2. Выполнить все microtasks (Promises)
3. Выполнить одну macrotask (setTimeout)
4. Повторить

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// Порядок: 1, 4, 3, 2
```

## Массивы и объекты

### 17. Разница между `map` и `forEach`?

`map` возвращает новый массив. `forEach` — ничего (undefined).

```js
const doubled = [1, 2, 3].map(n => n * 2)  // [2, 4, 6]
[1, 2, 3].forEach(n => console.log(n))      // undefined
```

### 18. Как `reduce` работает?

Сворачивает массив в одно значение:

```js
const sum = [1, 2, 3].reduce((acc, n) => acc + n, 0) // 6
```

### 19. Как скопировать объект?

Поверхностная копия:

```js
const copy = { ...obj }
const copy = Object.assign({}, obj)
```

Глубокая копия:

```js
const deep = structuredClone(obj)
```

### 20. Что делает `Object.freeze`?

Делает объект неизменяемым — нельзя добавить, удалить или изменить свойства. Но только на первом уровне (shallow).

```js
const obj = Object.freeze({ a: 1, b: { c: 2 } })
obj.a = 3       // не изменится
obj.b.c = 3     // изменится! (вложенный объект не заморожен)
```

## Разное

### 21. Что такое деструктуризация?

```js
const { name, age } = { name: 'Анна', age: 25 }
const [first, , third] = [1, 2, 3]

function greet({ name, age = 18 }) {
  console.log(`${name}, ${age}`)
}
```

### 22. Что делает `spread` и `rest`?

```js
// Spread — «разворачивает»
const arr = [1, 2, 3]
const copy = [...arr]
const merged = { ...obj1, ...obj2 }

// Rest — «собирает»
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}
```

### 23. Разница между shallow copy и deep copy?

Shallow копирует только первый уровень. Вложенные объекты — по ссылке.

```js
const obj = { a: 1, b: { c: 2 } }
const shallow = { ...obj }
shallow.b.c = 3
obj.b.c // 3 — изменилось!

const deep = structuredClone(obj)
deep.b.c = 4
obj.b.c // 3 — не изменилось
```

### 24. Что такое Map и Set?

```js
// Map — ключи любого типа
const map = new Map()
map.set({ id: 1 }, 'значение')
map.set('ключ', 42)

// Set — только уникальные значения
const set = new Set([1, 2, 2, 3])
set.size // 3
```

### 25. Как проверить, является ли переменная массивом?

```js
Array.isArray([1, 2, 3]) // true
Array.isArray({})        // false
typeof []                // 'object' — не поможет
```

### 26. Что такое IIFE?

Immediately Invoked Function Expression — функция, которая вызывается сразу после объявления. Создаёт свою область видимости.

```js
;(function () {
  const private = 'скрыто'
  console.log(private)
})()
// console.log(private) — ReferenceError
```

### 27. Что такое генератор?

Функция, которую можно приостанавливать и возобновлять:

```js
function* idGenerator() {
  let id = 1
  while (true) yield id++
}

const gen = idGenerator()
gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
```

### 28. Как работает `debounce` и `throttle`?

```js
// Debounce — вызов после паузы (откладывает)
function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// Throttle — не чаще раза в ms (ограничивает)
function throttle(fn, ms) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    }
  }
}
```

### 29. Как работает `setTimeout` с нулевой задержкой?

`setTimeout(fn, 0)` не выполняет функцию сразу. Она попадает в macrotask queue и вызывается после синхронного кода и микрозадач.

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 1, 4, 3, 2
```

### 30. Что такое `WeakMap` и `WeakSet`?

Ключи — только объекты. Ссылки «слабые»: если на объект нет других ссылок — он удаляется garbage collector.

```js
const weakMap = new WeakMap()
let obj = { name: 'test' }
weakMap.set(obj, 'данные')
obj = null // объект будет удалён из WeakMap
```

Используется для хранения приватных данных, кэша, связывания данных с DOM-элементами.

### 31. Как клонировать массив?

```js
const original = [1, 2, 3]
const copy = [...original]
const copy2 = original.slice()
const copy3 = Array.from(original)
```

### 32. Что возвращает `typeof NaN`?

`'number'`. Это один из парадоксов JS: NaN (Not a Number) имеет тип number.

```js
typeof NaN       // 'number'
NaN === NaN      // false
Number.isNaN(NaN) // true
```

### 33. Как работает `?.` (optional chaining)?

```js
const user = { address: { city: 'Moscow' } }

user?.address?.city     // 'Moscow'
user?.phone?.number     // undefined (без ошибки)
user?.getName?.()       // undefined
```

Если часть цепочки `null` или `undefined` — возвращает `undefined` вместо ошибки.

### 34. Что делает `??` (nullish coalescing)?

Возвращает правый операнд, если левый `null` или `undefined`:

```js
null ?? 'default'    // 'default'
undefined ?? 'hello' // 'hello'
0 ?? 'default'       // 0
'' ?? 'default'      // ''
false ?? true        // false
```

Отличие от `||`: `||` срабатывает на все falsy-значения (0, '', false). `??` — только на null/undefined.

### 35. Как работает `structuredClone`?

Глубокое клонирование без сторонних библиотек:

```js
const obj = { a: 1, b: { c: [2, 3] }, date: new Date() }
const clone = structuredClone(obj)

clone.b.c.push(4)
obj.b.c // [2, 3] — не изменилось
clone.date instanceof Date // true
```

Не клонирует функции и DOM-элементы.

## Итог

- Типы данных, `===` vs `==`, хоистинг — самые базовые вопросы
- Замыкания, `this`, прототипы — проверка понимания механик языка
- Event Loop, промисы, `async/await` — асинхронность спрашивают почти всегда
- `map`/`filter`/`reduce`, деструктуризация, spread/rest — повседневные операции
- На собеседовании важно не только знать ответ, но и уметь объяснить своими словами
