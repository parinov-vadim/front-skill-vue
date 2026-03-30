---
title: "Рекурсия: базовый случай, стек вызовов, хвостовая рекурсия"
description: "Что такое рекурсия, как работает стек вызовов, когда рекурсия полезна. Базовый случай, хвостовая рекурсия, типичные задачи: факториал, фибоначчи, обход дерева."
section: algorithms
difficulty: beginner
readTime: 12
order: 10
tags: [рекурсия, recursion, стек вызовов, базовый случай, хвостовая рекурсия, факториал, фибоначчи, алгоритмы]
---

## Что такое рекурсия

Функция вызывает сама себя, пока не дойдёт до условия остановки — **базового случая**. Без базового случая рекурсия будет бесконечной и уронит программу переполнением стека.

Два обязательных элемента:
1. **Базовый случай** — условие, при котором функция перестаёт вызывать себя
2. **Рекурсивный случай** — функция вызывает себя с изменёнными аргументами

```js
function countdown(n) {
  if (n <= 0) return    // базовый случай
  console.log(n)
  countdown(n - 1)      // рекурсивный случай
}

countdown(3) // 3, 2, 1
```

## Стек вызовов

Каждый вызов функции помещается в стек. Когда функция завершается — удаляется. При рекурсии стек растёт:

```
countdown(3)
  console.log(3)
  countdown(2)
    console.log(2)
    countdown(1)
      console.log(1)
      countdown(0)
        return (базовый случай)
```

В JavaScript стек ограничен (~10 000–25 000 вызовов в зависимости от браузера). Если превысить — `RangeError: Maximum call stack size exceeded`.

## Факториал

```js
function factorial(n) {
  if (n <= 1) return 1           // базовый случай
  return n * factorial(n - 1)    // рекурсивный случай
}

factorial(5) // 5 * 4 * 3 * 2 * 1 = 120
```

Разбор стека:

```
factorial(5)
  5 * factorial(4)
    4 * factorial(3)
      3 * factorial(2)
        2 * factorial(1)
          return 1        ← базовый случай
        return 2 * 1 = 2
      return 3 * 2 = 6
    return 4 * 6 = 24
  return 5 * 24 = 120
```

Вычисления происходят на обратном пути — когда рекурсия «сворачивается».

## Числа Фибоначчи

Классика, но с подвохом:

```js
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}
```

Для `fib(5)` дерево вызовов:

```
              fib(5)
            /        \
        fib(4)       fib(3)
       /     \       /    \
   fib(3)  fib(2)  fib(2) fib(1)
   /   \   /   \   /   \
fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
```

`fib(3)` вычисляется дважды, `fib(2)` — трижды. Экспоненциальная сложность O(2ⁿ). Для `fib(50)` это будет ~10¹⁵ вызовов.

### Оптимизация через мемоизацию

```js
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]
  if (n <= 1) return n

  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}

fibMemo(50) // 12586269025 — мгновенно
```

Каждое значение вычисляется один раз. Сложность O(n).

### Итеративный вариант

```js
function fibIterative(n) {
  if (n <= 1) return n

  let prev = 0
  let curr = 1

  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }

  return curr
}
```

O(n) время, O(1) память. Нет рекурсии — нет проблем со стеком.

## Сумма элементов массива

```js
function sum(arr, index = 0) {
  if (index >= arr.length) return 0
  return arr[index] + sum(arr, index + 1)
}

sum([1, 2, 3, 4, 5]) // 15
```

## Разворот строки

```js
function reverse(str) {
  if (str.length <= 1) return str
  return reverse(str.slice(1)) + str[0]
}

reverse('hello') // 'olleh'
```

Берём первый символ, ставим в конец. Рекурсивно обрабатываем остаток.

## Возведение в степень

```js
function power(base, exp) {
  if (exp === 0) return 1
  if (exp % 2 === 0) {
    const half = power(base, exp / 2)
    return half * half
  }
  return base * power(base, exp - 1)
}

power(2, 10) // 1024
power(3, 5)  // 243
```

O(log n) — каждый чётный шаг уменьшает степень вдвое. Вместо 10 умножений для 2¹⁰ — всего ~4.

## Плоский массив (flatten)

```js
function flatten(arr) {
  const result = []

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item))
    } else {
      result.push(item)
    }
  }

  return result
}

flatten([1, [2, [3, 4]], 5, [6]]) // [1, 2, 3, 4, 5, 6]
```

## Глубокое клонирование объекта

```js
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => deepClone(item))

  const clone = {}
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key])
  }
  return clone
}

const original = { a: 1, b: { c: [2, 3] } }
const copy = deepClone(original)
copy.b.c.push(4)
original.b.c // [2, 3] — не изменилось
```

## Хвостовая рекурсия

Хвостовая рекурсия — когда рекурсивный вызов является **последней операцией** в функции. В таком случае компилятор может не хранить предыдущие кадры стека — заменять их на месте.

```js
// НЕ хвостовая: после вызова нужно умножить
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)  // умножение после вызова
}

// Хвостовая: вызов — последняя операция
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc
  return factorialTail(n - 1, n * acc)  // вызов — последнее действие
}
```

Результат накапливается в `acc` (аккумуляторе). На обратном пути вычислять ничего не нужно.

**Но**: JavaScript (кроме Safari/WebKit) **не оптимизирует** хвостовую рекурсию. Способ описан в стандарте ES6, но V8 и SpiderMonkey его не реализовали. На практике для глубокой рекурсии используют итеративный подход.

## Когда использовать рекурсию

| Подходит | Не подходит |
|----------|-------------|
| Обход деревьев и графов | Простые циклы по массиву |
| Задачи «разделяй и властвуй» | Глубокая рекурсия (>10000) |
| Backtracking (перебор) | Когда итеративное решение проще |
| Комбинаторика | |

## Итог

- Рекурсия = функция вызывает сама себя + базовый случай
- Стек вызовов ограничен, глубокая рекурсия → `RangeError`
- Наивный Фибоначчи — O(2ⁿ), с мемоизацией — O(n)
- Хвостовая рекурсия — теоретически оптимизируема, но в JS почти нет
- Для деревьев и графов рекурсия — самый естественный подход
- Если можно написать итеративно — пиши итеративно
