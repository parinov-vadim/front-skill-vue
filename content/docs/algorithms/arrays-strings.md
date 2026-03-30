---
title: "Алгоритмы с массивами и строками: разворот, палиндром, анаграмма, скользящее окно"
description: "Разбор популярных алгоритмических задач с массивами и строками на JavaScript: разворот строки, проверка на палиндром, анаграммы, метод скользящего окна (sliding window)."
section: algorithms
difficulty: beginner
readTime: 14
order: 2
tags: [массивы, строки, алгоритмы, палиндром, анаграмма, скользящее окно, sliding window, разворот, reverse, задачи]
---

## Разворот строки

### Классический способ — два указателя

```js
function reverse(str) {
  const chars = str.split('')
  let left = 0
  let right = chars.length - 1

  while (left < right) {
    const temp = chars[left]
    chars[left] = chars[right]
    chars[right] = temp
    left++
    right--
  }

  return chars.join('')
}

reverse('привет') // 'тевирп'
```

Меняем символы с краёв, двигаясь к центру. Сложность O(n) по времени, O(n) по памяти (массив символов).

### Встроенные методы

```js
const reversed = 'привет'.split('').reverse().join('') // 'тевирп'
```

Короче, но на собеседовании обычно просят написать логику руками.

### Разворот без extra memory (для массива)

```js
function reverseInPlace(arr) {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    ;[arr[left], arr[right]] = [arr[right], arr[left]]
    left++
    right--
  }

  return arr
}

reverseInPlace([1, 2, 3, 4, 5]) // [5, 4, 3, 2, 1]
```

O(1) по памяти — меняем на месте.

## Палиндром

Строка, которая читается одинаково слева направо и справа налево.

```js
function isPalindrome(str) {
  const normalized = str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '')
  let left = 0
  let right = normalized.length - 1

  while (left < right) {
    if (normalized[left] !== normalized[right]) return false
    left++
    right--
  }

  return true
}

isPalindrome('А роза упала на лапу Азора') // true
isPalindrome('привет') // false
isPalindrome('topot') // true
```

Убираем всё, кроме букв и цифр, затем идём с двух концов. Сложность O(n).

Короткий вариант:

```js
function isPalindrome(str) {
  const s = str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '')
  return s === s.split('').reverse().join('')
}
```

Работает, но тратит O(n) дополнительной памяти на перевёрнутую строку.

## Анаграмма

Два слова — анаграммы, если состоят из одних и тех же букв в любом порядке.

### Через подсчёт символов

```js
function isAnagram(a, b) {
  if (a.length !== b.length) return false

  const count = {}

  for (const char of a) {
    count[char] = (count[char] || 0) + 1
  }

  for (const char of b) {
    if (!count[char]) return false
    count[char]--
  }

  return true
}

isAnagram('слушай', 'шусалй') // true
isAnagram('привет', 'пока') // false
```

Считаем символы первого слова, затем вычитаем по второму. Если где-то ушли в минус или символ не найден — не анаграмма. O(n) по времени, O(k) по памяти (k — размер алфавита).

### Через сортировку

```js
function isAnagram(a, b) {
  const sort = str => str.split('').sort().join('')
  return sort(a) === sort(b)
}
```

Проще, но O(n log n) из-за сортировки.

## Два указателя (Two Pointers)

Подход с двумя указателями — один из самых частых в задачах на массивы.

### Сумма двух чисел в отсортированном массиве

```js
function twoSumSorted(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    const sum = arr[left] + arr[right]
    if (sum === target) return [left, right]
    if (sum < target) left++
    else right--
  }

  return []
}

twoSumSorted([1, 2, 4, 7, 11, 15], 9) // [1, 3] → arr[1]=2 + arr[3]=7 = 9
```

Если сумма маленькая — двигаем левый указатель (берём больше). Если большая — правый (берём меньше). O(n) вместо O(n²) с двумя вложенными циклами.

### Удаление дубликатов из отсортированного массива

```js
function removeDuplicates(arr) {
  if (arr.length === 0) return 0

  let write = 1

  for (let read = 1; read < arr.length; read++) {
    if (arr[read] !== arr[read - 1]) {
      arr[write] = arr[read]
      write++
    }
  }

  return write
}

const arr = [1, 1, 2, 2, 2, 3, 4, 4]
const len = removeDuplicates(arr)
arr.slice(0, len) // [1, 2, 3, 4]
```

Один указатель читает, другой пишет уникальные элементы. O(n) по времени, O(1) по памяти.

## Скользящее окно (Sliding Window)

Окно — это подмассив фиксированного или переменного размера, который «скользит» по массиву. Вместо того чтобы пересчитывать всё заново для каждой позиции, обновляем результат при сдвиге окна.

### Максимальная сумма подмассива длины k

```js
function maxSubarraySum(arr, k) {
  if (arr.length < k) return null

  let sum = 0
  for (let i = 0; i < k; i++) sum += arr[i]

  let max = sum

  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i]
    max = Math.max(max, sum)
  }

  return max
}

maxSubarraySum([1, 4, 2, 10, 23, 3, 1, 0, 20], 4) // 39 (подмассив [4, 2, 10, 23])
```

Вычитаем элемент, который ушёл из окна, и прибавляем новый. O(n) вместо O(n × k) с наивным подходом.

### Самая длинная подстрока без повторяющихся символов

Окно переменного размера:

```js
function longestUniqueSubstring(str) {
  const seen = new Map()
  let maxLen = 0
  let left = 0

  for (let right = 0; right < str.length; right++) {
    const char = str[right]
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1
    }
    seen.set(char, right)
    maxLen = Math.max(maxLen, right - left + 1)
  }

  return maxLen
}

longestUniqueSubstring('abcabcbb') // 3 ('abc')
longestUniqueSubstring('bbbbb') // 1 ('b')
```

Если встретили повтор — сдвигаем левую границу. Map хранит последнюю позицию каждого символа. O(n) по времени.

### Минимальный подмассив с суммой ≥ target

```js
function minSubarrayLen(arr, target) {
  let sum = 0
  let left = 0
  let minLen = Infinity

  for (let right = 0; right < arr.length; right++) {
    sum += arr[right]

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1)
      sum -= arr[left]
      left++
    }
  }

  return minLen === Infinity ? 0 : minLen
}

minSubarrayLen([2, 3, 1, 2, 4, 3], 7) // 2 ([4, 3])
```

Расширяем окно, пока сумма < target. Как только >= — пытаемся сжать слева.

## Префиксные суммы

Если нужно много раз считать сумму на отрезке, префиксные суммы дают O(1) на запрос:

```js
function prefixSum(arr) {
  const prefix = [0]
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i]
  }
  return prefix
}

function rangeSum(prefix, from, to) {
  return prefix[to + 1] - prefix[from]
}

const p = prefixSum([3, 1, 4, 1, 5, 9])
rangeSum(p, 1, 4) // 1 + 4 + 1 + 5 = 11
```

Предподсчёт O(n), каждый запрос O(1).

## Итог

- Два указателя — для отсортированных массивов и палиндромов
- Скользящее окно — для подмассивов и подстрок, O(n) вместо O(n²)
- Подсчёт через Map/Object — для анаграмм и частот символов
- Префиксные суммы — для суммы на отрезке за O(1)
- Разворот — два указателя с обменом, O(n) по времени
