---
title: "Хэш-таблицы в JavaScript: Map, Object, Set — подсчёт, группировка, Two Sum"
description: "Как работают хэш-таблицы, когда использовать Map, Object и Set. Разбор задач: подсчёт элементов, группировка, Two Sum, первый неповторяющийся символ."
section: algorithms
difficulty: beginner
readTime: 12
order: 3
tags: [хэш-таблицы, hash table, Map, Set, Object, Two Sum, подсчёт, группировка, алгоритмы]
---

## Что такое хэш-таблица

Хэш-таблица — структура данных, которая связывает **ключ** со **значением**. Благодаря хэш-функции поиск, вставка и удаление работают за O(1) в среднем.

В JavaScript хэш-таблицами являются:
- `Object` — ключи только строки и символы
- `Map` — ключи любого типа, сохраняет порядок вставки
- `Set` — хранит только уникальные значения

```js
const obj = { name: 'Анна' }
const map = new Map([['name', 'Анна']])
const set = new Set([1, 2, 3])

obj.name          // 'Анна'
map.get('name')   // 'Анна'
set.has(2)        // true
```

## Object vs Map

| Свойство | Object | Map |
|----------|--------|-----|
| Типы ключей | string, Symbol | любые |
| Порядок | не гарантирован (для числовых) | по порядку добавления |
| Размер | Object.keys(obj).length | map.size |
| Итерация | for...in, Object.entries | for...of, forEach |
| Производительность | чуть медленнее при частых добавлениях/удалениях | оптимизирована для этого |

Для алгоритмических задач **Map** удобнее — есть `.size`, ключи любого типа, не нужно заботиться о prototype.

## Задача: Two Sum

Дан массив и число target. Найти два элемента, сумма которых равна target. Вернуть их индексы.

### Наивный подход — O(n²)

```js
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j]
    }
  }
}
```

Каждый элемент сравниваем с каждым. Работает, но медленно.

### Через Map — O(n)

```js
function twoSum(nums, target) {
  const seen = new Map()

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (seen.has(complement)) return [seen.get(complement), i]
    seen.set(nums[i], i)
  }

  return []
}

twoSum([2, 7, 11, 15], 9) // [0, 1]
twoSum([3, 2, 4], 6)      // [1, 2]
```

Для каждого элемента проверяем: видели ли мы уже число, которое дополнит его до target? Если да — ответ найден. Если нет — запоминаем текущий.

## Подсчёт элементов

### Количество каждого элемента

```js
function countItems(arr) {
  const count = new Map()
  for (const item of arr) {
    count.set(item, (count.get(item) || 0) + 1)
  }
  return count
}

const fruits = ['яблоко', 'банан', 'яблоко', 'груша', 'банан', 'яблоко']
countItems(fruits)
// Map { 'яблоко' => 3, 'банан' => 2, 'груша' => 1 }
```

Через Object:

```js
function countItems(arr) {
  return arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {})
}
```

### Первый неповторяющийся символ

```js
function firstUniqueChar(str) {
  const count = new Map()

  for (const char of str) {
    count.set(char, (count.get(char) || 0) + 1)
  }

  for (const char of str) {
    if (count.get(char) === 1) return char
  }

  return null
}

firstUniqueChar('leetcode')      // 'l'
firstUniqueChar('loveleetcode')  // 'v'
firstUniqueChar('aabb')          // null
```

Два прохода: первый считает, второй ищет первый с count = 1. O(n).

## Группировка

### Сгруппировать слова по анаграммам

```js
function groupAnagrams(words) {
  const groups = new Map()

  for (const word of words) {
    const key = word.split('').sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(word)
  }

  return [...groups.values()]
}

groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])
// [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

Ключ — отсортированное слово. Все анаграммы дают одинаковый ключ.

### Сгруппировать по свойству

```js
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key]
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}

const users = [
  { name: 'Анна', role: 'admin' },
  { name: 'Иван', role: 'user' },
  { name: 'Мария', role: 'admin' },
]

groupBy(users, 'role')
// { admin: [{ name: 'Анна', role: 'admin' }, { name: 'Мария', role: 'admin' }],
//   user: [{ name: 'Иван', role: 'user' }] }
```

## Set для уникальности

### Найти пересечение двух массивов

```js
function intersection(arr1, arr2) {
  const set2 = new Set(arr2)
  return [...new Set(arr1.filter(item => set2.has(item)))]
}

intersection([1, 2, 2, 3], [2, 2, 3, 4]) // [2, 3]
```

Второй Set убирает дубликаты из результата.

### Найти первый повторяющийся элемент

```js
function firstDuplicate(arr) {
  const seen = new Set()
  for (const item of arr) {
    if (seen.has(item)) return item
    seen.add(item)
  }
  return null
}

firstDuplicate([2, 5, 1, 2, 3, 5]) // 2
```

## Подсчёт пар

### Количество пар с заданной разностью

```js
function countPairsWithDiff(arr, k) {
  const set = new Set(arr)
  let count = 0

  for (const num of arr) {
    if (set.has(num + k)) count++
  }

  return count
}

countPairsWithDiff([1, 7, 5, 9, 2, 12, 3], 2) // 4
// Пары: (1,3), (5,7), (7,9), (3,5)
```

Для каждого числа проверяем, есть ли число на k больше. Set даёт O(1) проверку.

## Коллизии

Хэш-функция может дать одинаковый хэш для разных ключей — это **коллизия**. В JavaScript движок (V8) сам разбирается с коллизиями, но понимать механику полезно.

Два основных подхода:
- **Chaining** — в каждой ячейке массива хранится список пар ключ-значение
- **Open addressing** — при коллизии ищем следующую свободную ячейку

В худшем случае (все ключи дали один хэш) операции деградируют до O(n). Но при хорошей хэш-функции — O(1) в среднем.

## Когда использовать

| Задача | Структура |
|--------|-----------|
| Подсчитать частоты | Map или Object |
| Убрать дубликаты | Set |
| Быстрый поиск по ключу | Map |
| Кэшировать результаты | Map |
| Группировка данных | Map, ключ — признак группы |
| Проверка принадлежности | Set.has() вместо arr.includes() |

## Итог

- Map/Set дают O(1) на поиск, вставку и удаление
- Object работает как хэш-таблица для строковых ключей
- Two Sum — классическая задача на хэш-таблицу, O(n)
- Подсчёт через Map — O(n), вместо O(n²) с вложенными циклами
- Set.has() вместо arr.includes() — разница между O(1) и O(n)
