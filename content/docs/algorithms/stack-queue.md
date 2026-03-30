---
title: "Стек и очередь: реализация и задачи на JavaScript"
description: "Что такое стек (LIFO) и очередь (FIFO), как реализовать на JavaScript. Разбор задач: правильные скобки, обход в ширину (BFS), минимальный элемент в стеке."
section: algorithms
difficulty: beginner
readTime: 12
order: 4
tags: [стек, очередь, stack, queue, LIFO, FIFO, скобки, BFS, алгоритмы, структуры данных]
---

## Стек (Stack)

Стек работает по принципу **LIFO** — Last In, First Out. Последним пришёл — первым ушёл. Представьте стопку тарелок: берёшь ту, что сверху.

Две основные операции:
- `push` — положить на верх стека
- `pop` — снять с верха

### Реализация на массиве

```js
class Stack {
  constructor() {
    this.items = []
  }

  push(value) {
    this.items.push(value)
  }

  pop() {
    return this.items.pop()
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  isEmpty() {
    return this.items.length === 0
  }

  size() {
    return this.items.length
  }
}

const stack = new Stack()
stack.push(1)
stack.push(2)
stack.push(3)
stack.pop()  // 3
stack.peek() // 2
```

### На встроенном массиве

Чаще всего достаточно обычного массива — `push` и `pop` работают за O(1):

```js
const stack = []
stack.push('a')
stack.push('b')
stack.pop() // 'b'
```

## Задача: правильные скобки

Проверить, все ли скобки закрыты и в правильном порядке.

```js
function isValid(s) {
  const stack = []
  const pairs = { ')': '(', ']': '[', '}': '{' }

  for (const char of s) {
    if ('([{'.includes(char)) {
      stack.push(char)
    } else {
      if (stack.pop() !== pairs[char]) return false
    }
  }

  return stack.length === 0
}

isValid('()[]{}')  // true
isValid('([)]')    // false
isValid('{[]}')    // true
isValid('(((')     // false
isValid(')(')      // false
```

Логика: открывающую скобку кладём в стек. Встретив закрывающую — проверяем, что на верху стека лежит соответствующая открывающая. Если стек в конце не пуст — не все скобки закрыты.

## Задача: минимальный элемент в стеке

Нужен стек, который возвращает минимум за O(1):

```js
class MinStack {
  constructor() {
    this.stack = []
    this.mins = []
  }

  push(val) {
    this.stack.push(val)
    this.mins.push(
      this.mins.length === 0
        ? val
        : Math.min(val, this.mins[this.mins.length - 1])
    )
  }

  pop() {
    this.mins.pop()
    return this.stack.pop()
  }

  top() {
    return this.stack[this.stack.length - 1]
  }

  getMin() {
    return this.mins[this.mins.length - 1]
  }
}

const ms = new MinStack()
ms.push(5)
ms.push(3)
ms.push(7)
ms.getMin() // 3
ms.push(1)
ms.getMin() // 1
ms.pop()
ms.getMin() // 3
```

Два стека: основной и параллельный с минимумами. При каждом push записываем текущий минимум.

## Задача: обратная польская запись

Вычисление выражения в постфиксной записи:

```js
function evalRPN(tokens) {
  const stack = []

  for (const token of tokens) {
    if ('+-*/'.includes(token)) {
      const b = stack.pop()
      const a = stack.pop()
      switch (token) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(Math.trunc(a / b)); break
      }
    } else {
      stack.push(Number(token))
    }
  }

  return stack[0]
}

evalRPN(['2', '1', '+', '3', '*']) // (2 + 1) * 3 = 9
evalRPN(['4', '13', '5', '/', '+']) // 4 + (13 / 5) = 6
```

Числа кладём в стек. Оператор — снимаем два числа, вычисляем, результат обратно.

## Очередь (Queue)

Очередь работает по принципу **FIFO** — First In, First Out. Первым пришёл — первым ушёл. Как очередь в магазине.

Две основные операции:
- `enqueue` — добавить в конец
- `dequeue` — забрать из начала

### Реализация

На массиве это неэффективно — `shift()` работает за O(n). Лучше использовать связный список или объект:

```js
class Queue {
  constructor() {
    this.items = {}
    this.head = 0
    this.tail = 0
  }

  enqueue(value) {
    this.items[this.tail] = value
    this.tail++
  }

  dequeue() {
    if (this.isEmpty()) return undefined
    const value = this.items[this.head]
    delete this.items[this.head]
    this.head++
    return value
  }

  peek() {
    return this.items[this.head]
  }

  isEmpty() {
    return this.tail - this.head === 0
  }

  size() {
    return this.tail - this.head
  }
}

const q = new Queue()
q.enqueue('первый')
q.enqueue('второй')
q.enqueue('третий')
q.dequeue() // 'первый'
q.peek()    // 'второй'
```

Обе операции — O(1).

## Обход в ширину (BFS)

BFS — основной алгоритм, где нужна очередь. Обходит граф «по слоям»: сначала ближайшие вершины, потом следующие.

### BFS по дереву

```js
function bfs(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node.val)

    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }

  return result
}
```

### BFS по графу

```js
function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []

  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  return order
}

const graph = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D'],
  D: ['B', 'C'],
}

bfs(graph, 'A') // ['A', 'B', 'C', 'D']
```

`queue.shift()` — O(n). Для оптимизации используют очередь на связном списке. Но для учебных задач и небольших графов массива достаточно.

## Двусторонняя очередь (Deque)

```js
class Deque {
  constructor() {
    this.items = {}
    this.head = 0
    this.tail = 0
  }

  pushFront(val) {
    this.head--
    this.items[this.head] = val
  }

  pushBack(val) {
    this.items[this.tail] = val
    this.tail++
  }

  popFront() {
    if (this.isEmpty()) return undefined
    const val = this.items[this.head]
    delete this.items[this.head]
    this.head++
    return val
  }

  popBack() {
    if (this.isEmpty()) return undefined
    this.tail--
    const val = this.items[this.tail]
    delete this.items[this.tail]
    return val
  }

  isEmpty() {
    return this.tail - this.head === 0
  }
}
```

Используется в задачах на скользящее окно, где нужно быстро удалять и добавлять с обоих концов.

## Где встречаются стек и очередь

| Структура | Примеры |
|-----------|---------|
| Стек | Call stack, undo/redo, навигация «назад», парсинг выражений |
| Очередь | BFS, очередь задач, обработка событий, буфер сообщений |
| Deque | Скользящее окно максимум/минимум, палиндром |

## Итог

- Стек — LIFO: `push`/`pop` с одного конца. Скобки, обратная польская запись, undo
- Очередь — FIFO: добавляем в конец, забираем из начала. BFS, обработка задач
- Правильные скобки — кладём открывающие в стек, при закрывающей — проверяем вершину
- BFS — единственный алгоритм обхода, где нужна очередь вместо стека
- Для production вместо `shift()` используйте очередь на объекте или связном списке
