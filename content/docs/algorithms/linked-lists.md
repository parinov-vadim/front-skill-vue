---
title: "Связные списки: односвязный, двусвязный, reverse, cycle detection"
description: "Реализация связных списков на JavaScript: односвязный и двусвязный. Разворот списка, обнаружение цикла (алгоритм Флойда), удаление n-го элемента с конца."
section: algorithms
difficulty: intermediate
readTime: 14
order: 5
tags: [связный список, linked list, односвязный, двусвязный, reverse, цикл, Флойд, алгоритмы]
---

## Что такое связный список

Связный список — это цепочка узлов. Каждый узел хранит значение и ссылку на следующий узел. В отличие от массива, элементы не лежат рядом в памяти — каждый указывает на следующий.

```
[1] → [2] → [3] → [4] → null
```

Массив: доступ по индексу O(1), вставка/удаление в начале O(n).
Список: доступ по индексу O(n), вставка/удаление O(1) (если есть ссылка на узел).

## Односвязный список

### Реализация

```js
class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  prepend(val) {
    this.head = new ListNode(val, this.head)
    this.size++
  }

  append(val) {
    const node = new ListNode(val)
    if (!this.head) {
      this.head = node
    } else {
      let current = this.head
      while (current.next) current = current.next
      current.next = node
    }
    this.size++
  }

  toArray() {
    const result = []
    let current = this.head
    while (current) {
      result.push(current.val)
      current = current.next
    }
    return result
  }
}

const list = new LinkedList()
list.append(1)
list.append(2)
list.append(3)
list.prepend(0)
list.toArray() // [0, 1, 2, 3]
```

На собеседованиях чаще всего дают уже готовый узел `ListNode` и работают с головой списка напрямую.

## Разворот связного списка

Классическая задача. Нужно поменять направления всех стрелок:

```
1 → 2 → 3 → null
null ← 1 ← 2 ← 3
```

### Итеративный подход

```js
function reverseList(head) {
  let prev = null
  let current = head

  while (current) {
    const next = current.next
    current.next = prev
    prev = current
    current = next
  }

  return prev
}
```

Три переменные: `prev` (предыдущий), `current` (текущий), `next` (следующий). Переворачиваем стрелку, сдвигаемся вперёд. O(n) время, O(1) память.

Разбор по шагам для списка 1 → 2 → 3:

```
Шаг 0: prev=null, cur=1
Шаг 1: next=2, 1→null, prev=1, cur=2
Шаг 2: next=3, 2→1,   prev=2, cur=3
Шаг 3: next=null, 3→2, prev=3, cur=null
Итог: 3 → 2 → 1 → null
```

### Рекурсивный подход

```js
function reverseList(head) {
  if (!head || !head.next) return head

  const newHead = reverseList(head.next)
  head.next.next = head
  head.next = null

  return newHead
}
```

Доходим до конца списка, потом разворачиваем стрелки на обратном пути. O(n) время, O(n) память (стек вызовов).

## Обнаружение цикла (алгоритм Флойда)

Определить, есть ли в списке цикл. Два указателя: медленный (1 шаг) и быстрый (2 шага). Если есть цикл — они встретятся.

```js
function hasCycle(head) {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }

  return false
}
```

```js
function detectCycle(head) {
  let slow = head
  let fast = head
  let hasCycle = false

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) {
      hasCycle = true
      break
    }
  }

  if (!hasCycle) return null

  slow = head
  while (slow !== fast) {
    slow = slow.next
    fast = fast.next
  }

  return slow
}
```

После встречи ставим один указатель в начало. Оба идут по одному шагу — точка встречи и есть начало цикла.

## Средний элемент списка

Найти середину за один проход:

```js
function middleNode(head) {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }

  return slow
}
```

Быстрый доходит до конца, медленный — до середины. Тот же приём с двумя указателями.

## Удаление n-го элемента с конца

```js
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head)
  let fast = dummy
  let slow = dummy

  for (let i = 0; i <= n; i++) {
    fast = fast.next
  }

  while (fast) {
    slow = slow.next
    fast = fast.next
  }

  slow.next = slow.next.next

  return dummy.next
}
```

`dummy` нужен для случая, когда удаляем первый элемент. Быстрый указатель уходит на n шагов вперёд, потом оба идут до конца. Когда быстрый упирается — медленный стоит перед удаляемым.

## Слияние двух отсортированных списков

```js
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0)
  let tail = dummy

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1
      l1 = l1.next
    } else {
      tail.next = l2
      l2 = l2.next
    }
    tail = tail.next
  }

  tail.next = l1 || l2

  return dummy.next
}
```

Сравниваем головы, меньшую цепляем к результату. O(n + m) время, O(1) память.

## Двусвязный список

Каждый узел хранит ссылки на следующий и предыдущий:

```js
class DoublyNode {
  constructor(val, prev = null, next = null) {
    this.val = val
    this.prev = prev
    this.next = next
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null
    this.tail = null
  }

  append(val) {
    const node = new DoublyNode(val, this.tail)
    if (!this.head) {
      this.head = node
    } else {
      this.tail.next = node
    }
    this.tail = node
  }

  prepend(val) {
    const node = new DoublyNode(val, null, this.head)
    if (!this.head) {
      this.tail = node
    } else {
      this.head.prev = node
    }
    this.head = node
  }

  toArray() {
    const result = []
    let current = this.head
    while (current) {
      result.push(current.val)
      current = current.next
    }
    return result
  }
}
```

Преимущество: обход в обе стороны, удаление за O(1) при наличии ссылки на узел.

## Итог

- Односвязный список: узел хранит `val` и `next`
- Разворот: три переменные (`prev`, `current`, `next`), O(1) память
- Цикл: быстрый и медленный указатель, O(n) время
- Средний элемент и удаление n-го с конца — тот же приём с двумя указателями
- Двусвязный список: `prev` + `next`, удобнее для удаления
- `dummy`-узел упрощает работу с граничными случаями (удаление первого элемента)
