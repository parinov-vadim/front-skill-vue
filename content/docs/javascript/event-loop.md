---
title: Event Loop
description: Как JavaScript выполняет код и обрабатывает асинхронные операции через Event Loop, стек вызовов и очереди задач.
section: javascript
difficulty: intermediate
readTime: 10
order: 2
tags: [event loop, async, microtasks, macrotasks]
---

## Почему JavaScript однопоточный?

JavaScript выполняется в **одном потоке** — это означает, что в любой момент времени выполняется только одна операция. Несмотря на это, браузер остаётся отзывчивым благодаря **Event Loop**.

## Стек вызовов (Call Stack)

Когда вызывается функция, она помещается на **стек**. Когда функция завершает работу — удаляется со стека.

```js
function greet(name) {
  return `Привет, ${name}!`
}

function main() {
  const msg = greet('Иван')
  console.log(msg)
}

main()
```

Порядок стека:
```
1. main()  → добавляется
2. greet() → добавляется поверх
3. greet() → возвращает результат, удаляется
4. console.log() → добавляется и удаляется
5. main()  → удаляется
```

## Web APIs

Браузер предоставляет **Web APIs** — отдельные потоки для асинхронных операций:

- `setTimeout` / `setInterval`
- `fetch` (HTTP-запросы)
- `addEventListener` (события DOM)
- `requestAnimationFrame`

Когда вы вызываете `setTimeout`, браузер **передаёт задачу Web API** и продолжает выполнение кода.

## Очереди задач

### Macrotask Queue (Task Queue)

Содержит: `setTimeout`, `setInterval`, события DOM, `setImmediate`.

### Microtask Queue

Содержит: `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`.

**Microtasks имеют приоритет** — они выполняются **полностью** перед следующей macrotask.

## Как работает Event Loop

```
Шаг 1: Выполнить весь синхронный код (опустошить стек)
Шаг 2: Выполнить все microtasks (promise callbacks)
Шаг 3: Выполнить одну macrotask (setTimeout, событие)
Шаг 4: Снова выполнить все microtasks
Шаг 5: Повторить с шага 3
```

## Практический пример

```js
console.log('1')

setTimeout(() => console.log('2'), 0)

Promise.resolve().then(() => console.log('3'))

console.log('4')

// Вывод: 1, 4, 3, 2
```

**Почему именно такой порядок?**

1. `console.log('1')` — синхронно → **1**
2. `setTimeout` — передаётся в Web API, callback идёт в macrotask queue
3. `Promise.resolve().then(...)` — callback идёт в microtask queue
4. `console.log('4')` — синхронно → **4**
5. Стек пуст → выполняем microtasks → **3**
6. Берём macrotask → **2**

## Пример с вложенными промисами

```js
Promise.resolve()
  .then(() => {
    console.log('A')
    return Promise.resolve()
  })
  .then(() => console.log('B'))

Promise.resolve()
  .then(() => console.log('C'))
  .then(() => console.log('D'))

// Вывод: A, C, B, D
```

## async/await и Event Loop

`async/await` — это синтаксический сахар над Promises:

```js
async function fetchData() {
  console.log('Начало')           // синхронно
  const data = await getData()    // приостанавливает функцию
  console.log('После await')      // в microtask queue
  return data
}

console.log('До вызова')
fetchData()
console.log('После вызова')

// Вывод:
// До вызова
// Начало
// После вызова
// После await
```

## Блокировка Event Loop

Тяжёлые синхронные операции **блокируют** UI:

```js
// Плохо — блокирует браузер
function heavyTask() {
  for (let i = 0; i < 1_000_000_000; i++) { /* ... */ }
}

// Лучше — разбить на части через setTimeout
function heavyTaskChunked(data, index = 0) {
  const chunk = data.slice(index, index + 1000)
  processChunk(chunk)
  if (index + 1000 < data.length) {
    setTimeout(() => heavyTaskChunked(data, index + 1000), 0)
  }
}

// Или использовать Web Worker для вычислений
```

## Итог

| Очередь | Источники | Приоритет |
|---------|-----------|-----------|
| Call Stack | Синхронный код | Наивысший |
| Microtask Queue | Promises, queueMicrotask | Высокий |
| Macrotask Queue | setTimeout, события | Обычный |
