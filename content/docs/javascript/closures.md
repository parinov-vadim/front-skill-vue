---
title: Замыкания
description: Замыкание — функция, которая запоминает своё лексическое окружение и имеет доступ к переменным внешней области видимости.
section: javascript
difficulty: intermediate
readTime: 8
order: 3
tags: [closures, scope, lexical environment]
---

## Что такое замыкание?

**Замыкание (closure)** — это функция вместе с её лексическим окружением. Функция «запоминает» переменные из области видимости, в которой была создана, и имеет к ним доступ даже после того, как внешняя функция завершила работу.

```js
function makeCounter() {
  let count = 0  // переменная во внешней области видимости

  return function () {
    count++
    return count
  }
}

const counter = makeCounter()
console.log(counter()) // 1
console.log(counter()) // 2
console.log(counter()) // 3
```

`counter` — это замыкание: оно «помнит» переменную `count` из `makeCounter`, хотя функция `makeCounter` уже завершила выполнение.

## Лексическое окружение

Каждый раз, когда создаётся функция или блок, JavaScript создаёт **лексическое окружение** — объект с локальными переменными и ссылкой на внешнее окружение.

```js
function outer() {
  const x = 10

  function inner() {
    const y = 20
    console.log(x + y) // 30 — inner видит x из outer
  }

  inner()
}
```

## Практические применения

### 1. Инкапсуляция данных (приватные переменные)

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance  // "приватная" переменная

  return {
    deposit(amount) {
      balance += amount
    },
    withdraw(amount) {
      if (amount > balance) throw new Error('Недостаточно средств')
      balance -= amount
    },
    getBalance() {
      return balance
    },
  }
}

const account = createBankAccount(1000)
account.deposit(500)
account.withdraw(200)
console.log(account.getBalance()) // 1300
// account.balance → undefined (нет прямого доступа)
```

### 2. Фабрики функций

```js
function multiplier(factor) {
  return (number) => number * factor
}

const double = multiplier(2)
const triple = multiplier(3)

console.log(double(5))  // 10
console.log(triple(5))  // 15
```

### 3. Мемоизация

```js
function memoize(fn) {
  const cache = new Map()

  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

const expensiveCalc = memoize((n) => {
  console.log('Вычисляю...')
  return n * n
})

expensiveCalc(4) // "Вычисляю...", возвращает 16
expensiveCalc(4) // из кэша, возвращает 16
```

### 4. Частичное применение (partial application)

```js
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn(...presetArgs, ...laterArgs)
  }
}

function add(a, b, c) {
  return a + b + c
}

const add10 = partial(add, 10)
console.log(add10(3, 2)) // 15
```

## Классическая ошибка с циклом

```js
// Проблема: все callback-и ссылаются на одну переменную i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Вывод: 3, 3, 3

// Решение 1: let (блочная область видимости)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Вывод: 0, 1, 2

// Решение 2: IIFE (немедленно вызываемая функция)
for (var i = 0; i < 3; i++) {
  ;(function (j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}
// Вывод: 0, 1, 2
```

## Утечки памяти

Замыкания удерживают ссылки на внешние переменные — это может привести к утечкам:

```js
function createHeavyClosure() {
  const largeData = new Array(1_000_000).fill('data')

  return function () {
    console.log(largeData.length) // largeData остаётся в памяти
  }
}

let fn = createHeavyClosure()
fn()

// Освободить память:
fn = null  // теперь замыкание и largeData могут быть удалены GC
```

## Итог

- Замыкание создаётся автоматически при создании функции
- Функция «помнит» переменные из своей области видимости
- Используется для инкапсуляции, фабрик функций, мемоизации
- Следите за утечками памяти при работе с большими данными
