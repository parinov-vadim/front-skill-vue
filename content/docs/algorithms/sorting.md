---
title: "Сортировки: bubble sort, quick sort, merge sort — когда что использовать"
description: "Алгоритмы сортировки на JavaScript: пузырьком, быстрая сортировка, сортировка слиянием. Сложность, стабильность, когда выбирать каждый алгоритм."
section: algorithms
difficulty: intermediate
readTime: 12
order: 8
tags: [сортировка, bubble sort, quick sort, merge sort, алгоритмы сортировки, сложность, стабильность]
---

## Зачем знать алгоритмы сортировки

В JavaScript есть встроенный `Array.prototype.sort()`. Но на собеседованиях спрашивают, как сортировки работают внутри. Понимание алгоритмов помогает выбрать подходящий под задачу и объяснить, почему `sort()` без аргумента сортирует числа как строки.

## Обозначения

- **n** — количество элементов
- **Стабильная** — сохраняет порядок равных элементов
- **На месте (in-place)** — не требует доп. памяти

## Пузырьковая сортировка (Bubble Sort)

Сравниваем пары соседних элементов и меняем местами, если порядок неверный. После каждого прохода самый большой элемент «всплывает» в конец.

```js
function bubbleSort(arr) {
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let swapped = false

    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }

    if (!swapped) break
  }

  return arr
}

bubbleSort([5, 3, 8, 4, 2]) // [2, 3, 4, 5, 8]
```

`swapped` — оптимизация: если за проход не было обменов, массив уже отсортирован.

| Свойство | Значение |
|----------|----------|
| Лучший случай | O(n) |
| Средний | O(n²) |
| Худший | O(n²) |
| Память | O(1) |
| Стабильная | Да |

На практике почти не используется — слишком медленная. Но её часто просят написать на собеседовании, потому что она простая.

## Сортировка выбором (Selection Sort)

На каждой итерации ищем минимальный элемент и ставим на текущую позицию:

```js
function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i

    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }

    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }
  }

  return arr
}
```

Всегда O(n²), даже если массив уже отсортирован. Не стабильная (обмен может нарушить порядок равных элементов).

## Сортировка вставками (Insertion Sort)

Вставляем каждый элемент в правильную позицию уже отсортированной части:

```js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }

    arr[j + 1] = key
  }

  return arr
}

insertionSort([5, 3, 8, 4, 2]) // [2, 3, 4, 5, 8]
```

Хорошо работает на почти отсортированных данных — O(n) в лучшем случае. Стабильная, O(1) памяти.

## Быстрая сортировка (Quick Sort)

Выбираем **опорный** элемент (pivot). Все, кто меньше — влево, больше — вправо. Рекурсивно сортируем обе части.

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr

  const pivot = arr[arr.length - 1]
  const left = []
  const right = []

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= pivot) left.push(arr[i])
    else right.push(arr[i])
  }

  return [...quickSort(left), pivot, ...quickSort(right)]
}

quickSort([5, 3, 8, 4, 2, 7, 1, 6]) // [1, 2, 3, 4, 5, 6, 7, 8]
```

Эта реализация создаёт новые массивы — O(n) памяти. Классический quick sort работает на месте через разбиение Хоара (Lomuto), но код сложнее.

### In-place вариант

```js
function quickSortInPlace(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high)
    quickSortInPlace(arr, low, pivotIndex - 1)
    quickSortInPlace(arr, pivotIndex + 1, high)
  }
  return arr
}

function partition(arr, low, high) {
  const pivot = arr[high]
  let i = low - 1

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }

  ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
  return i + 1
}
```

| Свойство | Значение |
|----------|----------|
| Лучший случай | O(n log n) |
| Средний | O(n log n) |
| Худший | O(n²) — если pivot всегда минимальный/максимальный |
| Память | O(log n) стек вызовов |
| Стабильная | Нет |

Худший случай — массив уже отсортирован и pivot берётся с края. Решение: выбирать pivot случайно или медиану из трёх.

## Сортировка слиянием (Merge Sort)

Делим массив пополам, сортируем каждую половину, сливаем обратно.

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let i = 0
  let j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i])
      i++
    } else {
      result.push(right[j])
      j++
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)]
}

mergeSort([5, 3, 8, 4, 2, 7, 1, 6]) // [1, 2, 3, 4, 5, 6, 7, 8]
```

| Свойство | Значение |
|----------|----------|
| Лучший случай | O(n log n) |
| Средний | O(n log n) |
| Худший | O(n log n) |
| Память | O(n) |
| Стабильная | Да |

Гарантированное O(n log n) в любом случае. Платишь дополнительной памятью.

## Сравнение алгоритмов

| Алгоритм | Среднее | Худший | Память | Стабильный |
|----------|---------|--------|--------|------------|
| Bubble | O(n²) | O(n²) | O(1) | Да |
| Selection | O(n²) | O(n²) | O(1) | Нет |
| Insertion | O(n²) | O(n²) | O(1) | Да |
| Quick | O(n log n) | O(n²) | O(log n) | Нет |
| Merge | O(n log n) | O(n log n) | O(n) | Да |

## Что использует JavaScript

V8 (Chrome, Node.js) использует **TimSort** — гибрид merge sort и insertion sort. Это стабильная сортировка с O(n log n) в худшем случае.

```js
const arr = [10, 2, 30, 1]
arr.sort((a, b) => a - b) // [1, 2, 10, 30]
```

Всегда передавайте функцию сравнения для чисел. Без неё `'10' < '2'` — true (строковое сравнение).

## Когда что использовать

- **Почти отсортированные данные** — insertion sort, O(n)
- **Нужна стабильность** — merge sort
- **Мало памяти** — quick sort in-place
- **Маленькие массивы (< 20)** — insertion sort быстрее из-за меньших накладных расходов
- **В production** — встроенный `.sort()`

## Итог

- Bubble sort — учебный, O(n²). Почти не используется в реальном коде
- Quick sort — быстрый в среднем O(n log n), но O(n²) в худшем
- Merge sort — стабильный O(n log n), но требует O(n) памяти
- В JavaScript `.sort()` уже реализует эффективный алгоритм (TimSort)
- Для чисел всегда передавайте `(a, b) => a - b`
