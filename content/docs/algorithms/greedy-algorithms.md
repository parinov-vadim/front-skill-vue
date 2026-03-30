---
title: "Жадные алгоритмы и задача о рюкзаке"
description: "Что такое жадные алгоритмы, когда они дают оптимальное решение. Разбор задач: размен монет, задача о рюкзаке, интервалы, Huffman coding, Huffman, оптимизация."
section: algorithms
difficulty: intermediate
readTime: 12
order: 12
tags: [жадные алгоритмы, greedy, рюкзак, интервалы, размен монет, алгоритмы, оптимизация]
---

## Что такое жадный алгоритм

Жадный алгоритм на каждом шаге делает **локально оптимальный** выбор — берёт то, что выглядит лучше прямо сейчас. Не оглядывается назад, не заглядывает вперёд.

Иногда это даёт глобально оптимальное решение. Иногда — нет. Разница между «жадный работает» и «жадный не работает» — ключевой момент.

## Когда жадный алгоритм оптимален

Жадный подход даёт правильный ответ, если задача обладает двумя свойствами:

1. **Жадный выбор** — локально оптимальный выбор приводит к глобально оптимальному решению
2. **Оптимальная подструктура** — оптимальное решение содержит оптимальные решения подзадач

Доказать, что жадный алгоритм работает — сложнее, чем написать его. На практике: если не уверены — сравните с DP-решением на тестах.

## Задача: размен монет (жадная версия)

Даны номиналы монет. Набрать сумму минимальным количеством монет.

```js
function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a)
  let remaining = amount
  const result = {}

  for (const coin of sorted) {
    const count = Math.floor(remaining / coin)
    if (count > 0) {
      result[coin] = count
      remaining -= coin * count
    }
  }

  return remaining === 0 ? result : null
}

greedyCoins([25, 10, 5, 1], 63) // { 25: 2, 10: 1, 1: 3 } → 6 монет
```

Берём самую большую монету, сколько влезет. Потом следующую. И так до нуля.

### Когда жадный подход ломается

```js
greedyCoins([1, 3, 4], 6)
// Жадный: 4 + 1 + 1 = 3 монеты
// Оптимально: 3 + 3 = 2 монеты
```

Жадный алгоритм не всегда даёт минимум. Для надёжного решения нужна DP (см. статью про динамическое программирование).

## Задача: рюкзак (дробный)

Отличие от классического рюкзака: предметы можно брать **частично**. Разрезать — можно.

```js
function fractionalKnapsack(items, capacity) {
  const sorted = [...items].sort(
    (a, b) => (b.value / b.weight) - (a.value / a.weight)
  )

  let totalValue = 0
  let remaining = capacity

  for (const item of sorted) {
    if (remaining <= 0) break

    const take = Math.min(item.weight, remaining)
    totalValue += (item.value / item.weight) * take
    remaining -= take
  }

  return totalValue
}

const items = [
  { value: 60, weight: 10 },
  { value: 100, weight: 20 },
  { value: 120, weight: 30 },
]

fractionalKnapsack(items, 50) // 240
```

Сортируем по удельной стоимости (value/weight) и берём начиная с самой выгодной. Для **дробного** рюкзака жадный подход оптимален. Для 0/1 рюкзака — нет (нужна DP).

## Задача: непересекающиеся интервалы

Выбрать максимальное количество непересекающихся интервалов:

```js
function maxIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1])

  let count = 0
  let end = -Infinity

  for (const [start, finish] of sorted) {
    if (start >= end) {
      count++
      end = finish
    }
  }

  return count
}

maxIntervals([[1, 3], [2, 4], [3, 5], [0, 6], [5, 7], [8, 9]])
// 4 интервала: [1,3], [3,5], [5,7], [8,9]
```

Сортируем по правому краю, берём интервалы которые начинаются после окончания предыдущего. Жадный выбор — брать интервал, который заканчивается раньше.

## Задача: минимальное количество платформ

Поезда приезжают и уезжают. Сколько нужно платформ, чтобы все поместились:

```js
function minPlatforms(arrivals, departures) {
  arrivals.sort((a, b) => a - b)
  departures.sort((a, b) => a - b)

  let platforms = 0
  let maxPlatforms = 0
  let i = 0
  let j = 0

  while (i < arrivals.length) {
    if (arrivals[i] <= departures[j]) {
      platforms++
      maxPlatforms = Math.max(maxPlatforms, platforms)
      i++
    } else {
      platforms--
      j++
    }
  }

  return maxPlatforms
}

minPlatforms([900, 940, 950, 1100], [910, 1200, 1120, 1130]) // 3
```

Два указателя по прибытиям и отправлениям. Прибыл раньше отправления — нужна ещё платформа.

## Задача: прыжки (Jump Game)

Можно ли добраться до конца массива, где каждый элемент — максимальная длина прыжка:

```js
function canJump(nums) {
  let maxReach = 0

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false
    maxReach = Math.max(maxReach, i + nums[i])
  }

  return true
}

canJump([2, 3, 1, 1, 4]) // true
canJump([3, 2, 1, 0, 4]) // false (застреваем на индексе 3)
```

Храним максимальную достижимую позицию. Если текущий индекс недостижим — нельзя дойти.

### Минимальное количество прыжков

```js
function minJumps(nums) {
  let jumps = 0
  let currentEnd = 0
  let farthest = 0

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])

    if (i === currentEnd) {
      jumps++
      currentEnd = farthest
    }
  }

  return jumps
}

minJumps([2, 3, 1, 1, 4]) // 2 (прыжок на индекс 1, потом на 4)
```

## Задача: Huffman coding

Сжатие данных: частые символы — короткие коды, редкие — длинные.

```js
class HuffmanNode {
  constructor(char, freq) {
    this.char = char
    this.freq = freq
    this.left = null
    this.right = null
  }
}

function huffmanBuild(freqMap) {
  let nodes = Object.entries(freqMap).map(
    ([char, freq]) => new HuffmanNode(char, freq)
  )

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq)

    const left = nodes.shift()
    const right = nodes.shift()

    const parent = new HuffmanNode(null, left.freq + right.freq)
    parent.left = left
    parent.right = right

    nodes.push(parent)
  }

  return nodes[0]
}

function huffmanCodes(node, prefix = '', codes = {}) {
  if (node.char !== null) {
    codes[node.char] = prefix
    return codes
  }
  huffmanCodes(node.left, prefix + '0', codes)
  huffmanCodes(node.right, prefix + '1', codes)
  return codes
}

const tree = huffmanBuild({ a: 5, b: 9, c: 12, d: 13, e: 16, f: 45 })
huffmanCodes(tree)
// { f: '0', c: '100', d: '101', a: '1100', b: '1101', e: '111' }
```

На каждом шаге берём два узла с наименьшей частотой, объединяем. Жадный выбор — всегда брать два самых редких.

## Жадный vs DP

| Критерий | Жадный | DP |
|----------|--------|-----|
| Сложность | Обычно O(n log n) | O(n × W) или O(n²) |
| Оптимальность | Не всегда | Всегда |
| Простота | Проще | Сложнее |
| Когда использовать | Когда можно доказать корректность | Когда жадный не работает |

## Итог

- Жадный алгоритм — берём лучшее на каждом шаге, не оглядываясь
- Работает не всегда: размен монет с [1,3,4] и суммой 6 — пример ошибки
- Для дробного рюкзака — оптимален. Для 0/1 рюкзака — нужен DP
- Интервалы: сортировка по правому краю + жадный выбор
- Если сомневаетесь — проверяйте жадное решение на контрпримерах
- Jump Game — жадный подход «максимальная достижимая позиция»
