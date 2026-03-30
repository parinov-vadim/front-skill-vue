---
title: "Итераторы и генераторы в JavaScript: function*, yield, for...of"
description: "Итераторы и генераторы JavaScript — интерфейс Iterable, Symbol.iterator, function* и yield, бесконечные последовательности, ленивые вычисления и async генераторы."
section: javascript
difficulty: intermediate
readTime: 9
order: 18
tags: [итераторы, генераторы, iterator, generator, function*, yield, for of, Symbol.iterator, JavaScript]
---

## Что такое итератор

Итератор — объект, у которого есть метод `next()`. Каждый вызов `next()` возвращает `{ value, done }`:

```js
function createCounter(max) {
  let count = 0

  return {
    next() {
      if (count >= max) return { value: undefined, done: true }
      count++
      return { value: count, done: false }
    },
  }
}

const counter = createCounter(3)
counter.next() // { value: 1, done: false }
counter.next() // { value: 2, done: false }
counter.next() // { value: 3, done: false }
counter.next() // { value: undefined, done: true }
```

## Итерируемые объекты (Iterable)

Объект итерируемый, если у него есть метод `Symbol.iterator`. Этот метод возвращает итератор. Тогда по объекту можно ходить через `for...of` и spread:

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from
    const last = this.to

    return {
      next: () => {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  },
}

for (const num of range) {
  console.log(num) // 1, 2, 3, 4, 5
}

[...range] // [1, 2, 3, 4, 5]
```

Встроенные итерируемые объекты: массивы, строки, Map, Set, `arguments`, NodeList.

## Генераторы

Генератор — функция, которая может приостановить выполнение и вернуть промежуточный результат. Объявляется через `function*`. Вместо `return` используется `yield`:

```js
function* generateNumbers() {
  yield 1
  yield 2
  yield 3
}

const gen = generateNumbers()

gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
gen.next() // { value: 3, done: false }
gen.next() // { value: undefined, done: true }
```

Генератор автоматически реализует `Symbol.iterator`, поэтому работает с `for...of`:

```js
function* generateNumbers() {
  yield 1
  yield 2
  yield 3
}

for (const num of generateNumbers()) {
  console.log(num) // 1, 2, 3
}

[...generateNumbers()] // [1, 2, 3]
```

## yield — приостановка и возобновление

При `yield` функция «засыпает». При следующем `next()` — просыпается и продолжает:

```js
function* conversation() {
  console.log('Начало')
  yield 'Как дела?'
  console.log('После первого yield')
  yield 'Что нового?'
  console.log('Конец')
}

const gen = conversation()
gen.next() // console: 'Начало', возвращает { value: 'Как дела?', done: false }
gen.next() // console: 'После первого yield', возвращает { value: 'Что нового?', done: false }
gen.next() // console: 'Конец', возвращает { value: undefined, done: true }
```

## Передача значения в генератор

`next(значение)` передаёт значение обратно в генератор — оно становится результатом `yield`:

```js
function* askQuestions() {
  const name = yield 'Как тебя зовут?'
  const age = yield `Привет, ${name}. Сколько тебе лет?`
  return `${name}, ${age} лет — отличный возраст!`
}

const gen = askQuestions()

gen.next()               // { value: 'Как тебя зовут?', done: false }
gen.next('Анна')         // { value: 'Привет, Анна. Сколько тебе лет?', done: false }
gen.next(25)             // { value: 'Анна, 25 лет — отличный возраст!', done: true }
```

## Бесконечные последовательности

Генераторы ленивые — они вычисляют значения по одному, когда просят:

```js
function* naturalNumbers() {
  let n = 1
  while (true) {
    yield n++
  }
}

const numbers = naturalNumbers()

numbers.next().value // 1
numbers.next().value // 2
numbers.next().value // 3
// и так до бесконечности — но память не расходуется
```

### Числа Фибоначчи

```js
function* fibonacci() {
  let a = 0, b = 1
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}

const fib = fibonacci()
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value) // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
}
```

## yield* — делегирование другому генератору

`yield*` передаёт управление другому итерируемому объекту:

```js
function* letters() {
  yield* ['a', 'b', 'c']
}

[...letters()] // ['a', 'b', 'c']

// Вложенные генераторы
function* team1() {
  yield 'Анна'
  yield 'Иван'
}

function* team2() {
  yield 'Мария'
  yield 'Олег'
}

function* allTeams() {
  yield* team1()
  yield* team2()
}

[...allTeams()] // ['Анна', 'Иван', 'Мария', 'Олег']
```

## Генератор как источник данных

```js
function* paginate(apiCall) {
  let page = 1
  while (true) {
    const data = apiCall(page)
    if (data.length === 0) return
    yield* data
    page++
  }
}

// Использование
function fetchPage(page) {
  const all = ['a', 'b', 'c', 'd', 'e']
  return all.slice((page - 1) * 2, page * 2)
}

for (const item of paginate(fetchPage)) {
  console.log(item) // a, b, c, d, e
}
```

## Async генераторы

`async function*` позволяет использовать `await` внутри генератора:

```js
async function* fetchUsers(urls) {
  for (const url of urls) {
    const response = await fetch(url)
    const user = await response.json()
    yield user
  }
}

// Использование
const urls = ['/api/users/1', '/api/users/2', '/api/users/3']

for await (const user of fetchUsers(urls)) {
  console.log(user.name)
}
```

## Практическое применение генераторов

Генераторы не используются каждый день. Вот где они реально полезны:

**1. Ленивая обработка больших данных:**
```js
function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) yield item
  }
}

function* map(iterable, transform) {
  for (const item of iterable) {
    yield transform(item)
  }
}

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const result = [...filter(map(numbers, n => n * 2), n => n > 10)]
// [12, 14, 16, 18, 20]
```

**2. Уникальные ID:**
```js
function* idGenerator() {
  let id = 1
  while (true) yield id++
}

const nextId = idGenerator()
nextId.next().value // 1
nextId.next().value // 2
```

**3. Lazy loading данных по мере необходимости.**

## Итог

- Итератор — объект с методом `next()`, возвращающим `{ value, done }`
- `Symbol.iterator` — делает объект перебираемым через `for...of`
- Генератор `function*` — удобный способ создать итератор
- `yield` приостанавливает функцию, `next()` возобновляет
- `yield*` — делегирует другому генератору или итерируемому объекту
- `async function*` + `for await...of` — асинхронная обработка потоков данных
