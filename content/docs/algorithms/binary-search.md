---
title: "Бинарный поиск: алгоритм и вариации"
description: "Бинарный поиск в отсортированном массиве на JavaScript: классический алгоритм, поиск первого/последнего вхождения, поиск позиции для вставки, поиск в rotated array."
section: algorithms
difficulty: beginner
readTime: 10
order: 9
tags: [бинарный поиск, binary search, поиск, алгоритмы, отсортированный массив, левый边界, вставка]
---

## Как работает бинарный поиск

Делим отсортированный массив пополам. Сравниваем средний элемент с искомым. Если совпал — готово. Если искомое меньше — ищем в левой половине. Если больше — в правой. И так делим пополам, пока не найдём.

Для массива из 1 000 000 элементов — максимум 20 проверок (log₂ 1 000 000 ≈ 20).

**Важно**: массив должен быть отсортирован.

## Классическая реализация

```js
function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) return mid
    if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }

  return -1
}

binarySearch([1, 3, 5, 7, 9, 11, 13], 7)  // 3
binarySearch([1, 3, 5, 7, 9, 11, 13], 2)   // -1
```

### Почему `left + Math.floor((right - left) / 2)`, а не `(left + right) / 2`?

При больших left и right их сумма может превысить `Number.MAX_SAFE_INTEGER`. Формула с вычитанием — безопасная альтернатива. В JavaScript это менее критично (числа до 2⁵³), но в других языках — частый баг.

### Рекурсивный вариант

```js
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1

  const mid = left + Math.floor((right - left) / 2)

  if (arr[mid] === target) return mid
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right)
  return binarySearchRecursive(arr, target, left, mid - 1)
}
```

## Поиск первого вхождения

Если в массиве есть дубликаты и нужно найти **первый** индекс:

```js
function findFirst(arr, target) {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      result = mid
      right = mid - 1
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}

findFirst([1, 2, 2, 2, 3, 4, 4, 5], 2) // 1
findFirst([1, 2, 2, 2, 3, 4, 4, 5], 4) // 5
```

Нашли элемент — не возвращаем сразу, а запоминаем и ищем левее.

## Поиск последнего вхождения

```js
function findLast(arr, target) {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      result = mid
      left = mid + 1
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}

findLast([1, 2, 2, 2, 3, 4, 4, 5], 2) // 3
```

Аналогично, но ищем правее.

## Позиция для вставки

Найти индекс, куда вставить элемент, чтобы массив остался отсортированным:

```js
function searchInsert(arr, target) {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] < target) left = mid + 1
    else right = mid
  }

  return left
}

searchInsert([1, 3, 5, 7], 4)  // 2 (между 3 и 5)
searchInsert([1, 3, 5, 7], 0)  // 0 (в начало)
searchInsert([1, 3, 5, 7], 8)  // 4 (в конец)
```

Обратите внимание: `right = arr.length` (не `arr.length - 1`) и условие `left < right` (не `<=`). Это позволяет вернуть позицию за пределами массива.

## Поиск в повёрнутом отсортированном массиве

Массив `[4, 5, 6, 7, 0, 1, 2]` — это отсортированный массив, сдвинутый на 4 позиции:

```js
function searchRotated(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) return mid

    if (arr[left] <= arr[mid]) {
      if (target >= arr[left] && target < arr[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    } else {
      if (target > arr[mid] && target <= arr[right]) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
  }

  return -1
}

searchRotated([4, 5, 6, 7, 0, 1, 2], 0) // 4
searchRotated([4, 5, 6, 7, 0, 1, 2], 3) // -1
```

Определяем, какая половина отсортирована. Если искомый элемент в отсортированной половине — ищем там. Иначе — в другой.

## Найти квадратный корень (целочисленный)

Без `Math.sqrt` — через бинарный поиск:

```js
function mySqrt(x) {
  if (x < 2) return x

  let left = 1
  let right = Math.floor(x / 2)

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const square = mid * mid

    if (square === x) return mid
    if (square < x) left = mid + 1
    else right = mid - 1
  }

  return right
}

mySqrt(8)   // 2
mySqrt(16)  // 4
mySqrt(25)  // 5
```

Ищем число, квадрат которого ближе всего к x, не превосходя его.

## Шаблоны бинарного поиска

### Точный поиск (найти конкретное значение)

```
while (left <= right)
  найдено → return mid
  меньше → left = mid + 1
  больше → right = mid - 1
```

### Нижняя граница (первый элемент >= target)

```
while (left < right)
  mid = left + floor((right - left) / 2)
  arr[mid] >= target → right = mid
  иначе → left = mid + 1
```

### Верхняя граница (первый элемент > target)

```
while (left < right)
  mid = left + floor((right - left) / 2)
  arr[mid] > target → right = mid
  иначе → left = mid + 1
```

## Итог

- Бинарный поиск — O(log n) в отсортированном массиве
- `left + Math.floor((right - left) / 2)` — безопасный способ найти mid
- Для дубликатов: найдя элемент, продолжаем искать в нужную сторону
- Позиция вставки — `right = arr.length`, условие `left < right`
- Повёрнутый массив: определяем отсортированную половину и ищем в ней
