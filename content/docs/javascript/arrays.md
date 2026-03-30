---
title: "Методы массивов в JavaScript: map, filter, reduce, find, some, every"
description: "Полный справочник по методам массивов JavaScript — forEach, map, filter, reduce, find, findIndex, some, every, includes, sort, flat. Примеры и частые задачи."
section: javascript
difficulty: beginner
readTime: 12
order: 9
tags: [массивы, array, map, filter, reduce, find, sort, JavaScript, методы массива]
---

## Создание массивов

```js
const nums = [1, 2, 3]
const empty = []
const mixed = [1, 'два', true, null]

const fromRange = Array.from({ length: 5 }, (_, i) => i + 1) // [1, 2, 3, 4, 5]
const filled = new Array(3).fill(0) // [0, 0, 0]
```

Массив — это объект. `typeof []` возвращает `'object'`. Для проверки:

```js
Array.isArray([1, 2])   // true
Array.isArray('строка') // false
Array.isArray({})       // false
```

## Добавление и удаление элементов

```js
const fruits = ['яблоко', 'банан']

// В конец
fruits.push('груша')       // ['яблоко', 'банан', 'груша']

// В начало
fruits.unshift('ананас')   // ['ананас', 'яблоко', 'банан', 'груша']

// С конца — удаляет и возвращает
const last = fruits.pop()  // 'груша'

// С начала — удаляет и возвращает
const first = fruits.shift() // 'ананас'

// В любом месте — splice(индекс, сколько_удалить, ...что_добавить)
fruits.splice(1, 0, 'киви') // вставить 'киви' по индексу 1
fruits.splice(0, 1)         // удалить 1 элемент по индексу 0
```

## Перебор: forEach

Выполняет функцию для каждого элемента. Ничего не возвращает:

```js
const users = ['Анна', 'Иван', 'Мария']

users.forEach((name, index) => {
  console.log(`${index}: ${name}`)
})
// 0: Анна
// 1: Иван
// 2: Мария
```

Если нужно вернуть новый массив — используйте `map`.

## map — преобразовать каждый элемент

Создаёт новый массив, применяя функцию к каждому элементу. Исходный массив не меняется.

```js
const prices = [100, 200, 300]
const withDiscount = prices.map(price => price * 0.9)
// [90, 180, 270]

const users = [
  { name: 'Анна', age: 25 },
  { name: 'Иван', age: 30 },
]
const names = users.map(user => user.name)
// ['Анна', 'Иван']

// Индекс доступен вторым аргументом
const indexed = ['a', 'b', 'c'].map((item, i) => `${i}-${item}`)
// ['0-a', '1-b', '2-c']
```

## filter — отфильтровать элементы

Возвращает новый массив с элементами, для которых функция вернула `true`:

```js
const numbers = [1, 2, 3, 4, 5, 6]

const even = numbers.filter(n => n % 2 === 0) // [2, 4, 6]
const big = numbers.filter(n => n > 3)         // [4, 5, 6]

const users = [
  { name: 'Анна', age: 17 },
  { name: 'Иван', age: 25 },
  { name: 'Мария', age: 16 },
]
const adults = users.filter(user => user.age >= 18)
// [{ name: 'Иван', age: 25 }]

// Удалить falsy значения
const mixed = [0, 1, '', 'привет', null, undefined, false, true]
const truthy = mixed.filter(Boolean) // [1, 'привет', true]
```

## find и findIndex — найти элемент

`find` возвращает первый подходящий элемент (или `undefined`). `findIndex` — его индекс (или `-1`):

```js
const users = [
  { id: 1, name: 'Анна' },
  { id: 2, name: 'Иван' },
  { id: 3, name: 'Мария' },
]

users.find(user => user.id === 2)      // { id: 2, name: 'Иван' }
users.find(user => user.id === 99)     // undefined
users.findIndex(user => user.name === 'Мария') // 2
```

## some и every — проверить условие

`some` — хотя бы один элемент удовлетворяет условию. `every` — все:

```js
const ages = [18, 25, 30, 16]

ages.some(age => age < 18)   // true (есть 16)
ages.every(age => age >= 18) // false (не все совершеннолетние)

const scores = [85, 90, 92]
scores.every(s => s >= 80)   // true (все выше 80)
```

## includes — содержит ли элемент

```js
const fruits = ['яблоко', 'банан', 'груша']

fruits.includes('банан')  // true
fruits.includes('мандарин') // false

// С позиции (второй аргумент)
[1, 2, 3, 2].includes(2, 2) // true (ищет начиная с индекса 2)
```

Для поиска объектов используйте `some`:

```js
const users = [{ name: 'Анна' }, { name: 'Иван' }]
users.some(u => u.name === 'Иван') // true
```

## reduce — свернуть массив в одно значение

Принимает аккумулятор и текущий элемент, возвращает одно итоговое значение:

```js
const numbers = [1, 2, 3, 4, 5]

const sum = numbers.reduce((acc, num) => acc + num, 0) // 15
```

Разбор аргументов: `(аккумулятор, текущий_элемент, индекс, массив) => новое_значение_аккумулятора`. Второй аргумент `reduce` — начальное значение аккумулятора (0 в примере выше).

### Подсчёт количества

```js
const fruits = ['яблоко', 'банан', 'яблоко', 'груша', 'банан', 'яблоко']

const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1
  return acc
}, {})
// { яблоко: 3, банан: 2, груша: 1 }
```

### Группировка

```js
const users = [
  { name: 'Анна', role: 'admin' },
  { name: 'Иван', role: 'user' },
  { name: 'Мария', role: 'admin' },
]

const grouped = users.reduce((acc, user) => {
  if (!acc[user.role]) acc[user.role] = []
  acc[user.role].push(user)
  return acc
}, {})
// { admin: [{ name: 'Анна' }, { name: 'Мария' }], user: [{ name: 'Иван' }] }
```

### Свёртка в объект

```js
const users = [
  { id: 1, name: 'Анна' },
  { id: 2, name: 'Иван' },
]

const byId = users.reduce((acc, user) => {
  acc[user.id] = user
  return acc
}, {})
// { 1: { id: 1, name: 'Анна' }, 2: { id: 2, name: 'Иван' } }
```

## sort — сортировка

Сортирует массив **на месте** (мутирует). Без аргумента — как строки:

```js
[10, 2, 30, 1].sort() // [1, 10, 2, 30] — лексикографически!
```

Для чисел нужна функция сравнения:

```js
const nums = [10, 2, 30, 1]

nums.sort((a, b) => a - b)  // [1, 2, 10, 30] — по возрастанию
nums.sort((a, b) => b - a)  // [30, 10, 2, 1] — по убыванию
```

Сортировка объектов:

```js
const users = [
  { name: 'Анна', age: 25 },
  { name: 'Иван', age: 20 },
  { name: 'Мария', age: 30 },
]

users.sort((a, b) => a.age - b.age) // по возрасту
```

Если нужно сохранить оригинал — создайте копию:

```js
const sorted = [...nums].sort((a, b) => a - b)
```

## flat и flatMap

`flat` раскрывает вложенные массивы:

```js
[1, [2, 3], [4, [5]]].flat()     // [1, 2, 3, 4, [5]] — глубина 1
[1, [2, 3], [4, [5]]].flat(2)    // [1, 2, 3, 4, 5] — глубина 2
[1, [2, 3], [4, [5]]].flat(Infinity) // [1, 2, 3, 4, 5]
```

`flatMap` — `map` + `flat(1)` за один проход:

```js
const sentences = ['Привет мир', 'Как дела']

sentences.flatMap(s => s.split(' '))
// ['Привет', 'мир', 'Как', 'дела']
```

## join — объединить в строку

```js
['2025', '01', '15'].join('-') // '2025-01-15'
[1, 2, 3].join()               // '1,2,3' (разделитель по умолчанию — запятая)
['a', 'b', 'c'].join('')       // 'abc'
```

## slice — извлечь часть

Не мутирует. Возвращает новый массив:

```js
const arr = [1, 2, 3, 4, 5]

arr.slice(1, 3)   // [2, 3] — с индекса 1 по 3 (не включая 3)
arr.slice(2)      // [3, 4, 5] — с индекса 2 до конца
arr.slice(-2)     // [4, 5] — последние 2
```

## reverse — перевернуть

Мутирует исходный массив:

```js
const arr = [1, 2, 3]
arr.reverse() // [3, 2, 1]
console.log(arr) // [3, 2, 1] — изменён!
```

Без мутации:

```js
const reversed = [...arr].reverse()
```

## Цепочка методов

Методы, возвращающие массивы, можно вызывать цепочкой:

```js
const users = [
  { name: 'Анна', age: 17, active: true },
  { name: 'Иван', age: 25, active: true },
  { name: 'Мария', age: 30, active: false },
  { name: 'Олег', age: 22, active: true },
]

const result = users
  .filter(user => user.active)
  .filter(user => user.age >= 18)
  .map(user => user.name)
  .sort()
// ['Иван', 'Олег']
```

## Шпаргалка: мутирующие vs немутирующие

**Не мутируют** (возвращают новый массив/значение):
`map`, `filter`, `find`, `findIndex`, `some`, `every`, `includes`, `reduce`, `slice`, `flatMap`, `flat`, `concat`, `join`

**Мутируют** (изменяют исходный массив):
`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`

Всегда проверяйте — если метод мутирует, и оригинал нужен — создайте копию через `[...arr]`.

## Итог

- `map` — преобразовать, `filter` — отфильтровать, `reduce` — свернуть в одно значение
- `find` — найти первый элемент, `some`/`every` — проверить условие
- `sort`, `reverse`, `splice` — мутируют массив, остальные — нет
- Цепочка методов — мощный инструмент, пишите читаемый код
