---
title: "Динамическое программирование: memoization и tabulation"
description: "Что такое динамическое программирование (DP), подходы memoization (сверху вниз) и tabulation (снизу вверх). Задачи: числа Фибоначчи, прыжки по лестнице, рюкзак, подпоследовательности."
section: algorithms
difficulty: intermediate
readTime: 15
order: 11
tags: [динамическое программирование, DP, memoization, tabulation, рюкзак, фибоначчи, подпоследовательность, алгоритмы]
---

## Что такое динамическое программирование

Динамическое программирование (DP) — способ решать задачи, разбивая их на подзадачи и **запоминая** результаты, чтобы не считать дважды.

Ключевой признак задачи на DP: **пересекающиеся подзадачи**. Если наивная рекурсия считает одно и то же по многу раз — значит, можно закэшировать.

Два подхода:
- **Memoization** (сверху вниз) — рекурсия + кэш
- **Tabulation** (снизу вверх) — заполняем таблицу от простых к сложным

## Memoization — сверху вниз

Рекурсивный подход с кэшированием. При первом вычислении результат сохраняется, при повторном — берётся из кэша.

### Фибоначчи с мемоизацией

```js
function fib(n, memo = {}) {
  if (n in memo) return memo[n]
  if (n <= 1) return n

  memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
  return memo[n]
}

fib(10) // 55
fib(50) // 12586269025
```

Без мемоизации `fib(50)` — миллиарды вызовов. С мемоизацией — ровно 50.

## Tabulation — снизу вверх

Заполняем массив от 0 до n. Не нужна рекурсия, не нужен кэш — просто таблица.

```js
function fib(n) {
  if (n <= 1) return n

  const dp = [0, 1]

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }

  return dp[n]
}
```

И с оптимизацией памяти — храним только два последних значения:

```js
function fib(n) {
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

O(n) время, O(1) память.

## Задача: прыжки по лестнице

Можно прыгнуть на 1 или 2 ступеньки. Сколькими способами добраться до n-й ступеньки?

```js
function climbStairs(n) {
  if (n <= 2) return n

  let prev = 1
  let curr = 2

  for (let i = 3; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }

  return curr
}

climbStairs(2) // 2 (1+1, 2)
climbStairs(3) // 3 (1+1+1, 1+2, 2+1)
climbStairs(5) // 8
```

Количество способов до n = способы до (n-1) + способы до (n-2). Та же формула, что у Фибоначчи.

## Задача: минимальная стоимость пути

Каждая ступенька стоит `cost[i]`. Можно начать с 0 или 1 ступеньки. Найти минимальную стоимость, чтобы дойти до верха.

```js
function minCostClimbingStairs(cost) {
  const n = cost.length
  const dp = [cost[0], cost[1]]

  for (let i = 2; i < n; i++) {
    dp[i] = cost[i] + Math.min(dp[i - 1], dp[i - 2])
  }

  return Math.min(dp[n - 1], dp[n - 2])
}

minCostClimbingStairs([10, 15, 20])    // 15 (10 → 15 → вверх)
minCostClimbingStairs([1, 100, 1, 1])  // 2 (1 → 1 → 1)
```

На каждом шаге выбираем: прийти с предыдущей или через одну — что дешевле.

## Задача: максимальная сумма подмассива (Kadane)

```js
function maxSubArray(nums) {
  let maxSum = nums[0]
  let currentSum = nums[0]

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i])
    maxSum = Math.max(maxSum, currentSum)
  }

  return maxSum
}

maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) // 6 (подмассив [4, -1, 2, 1])
```

На каждом шаге решаем: продолжить текущий подмассив или начать новый с текущего элемента.

## Задача: рюкзак (0/1 Knapsack)

Даны предметы с весом и стоимостью. Нужно набрать максимальную стоимость, не превысив вместимость.

```js
function knapsack(weights, values, capacity) {
  const n = weights.length
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        )
      }
    }
  }

  return dp[n][capacity]
}

knapsack([2, 3, 4, 5], [3, 4, 5, 6], 5) // 7 (вещи с весом 2+3, стоимость 3+4)
```

`dp[i][w]` — максимальная стоимость, используя первые i предметов с вместимостью w. Для каждого предмета: берём его или пропускаем — выбираем максимум.

## Задача: количество монет для сдачи

Даны номиналы монет. Минимальное количество монет, чтобы набрать сумму:

```js
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity)
  dp[0] = 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1)
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount]
}

coinChange([1, 2, 5], 11)  // 3 (5 + 5 + 1)
coinChange([2], 3)          // -1 (невозможно)
coinChange([1], 0)          // 0
```

`dp[i]` — минимальное количество монет для суммы i. Для каждой суммы пробуем все монеты.

## Задача: наибольшая общая подпоследовательность (LCS)

```js
function longestCommonSubsequence(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}

longestCommonSubsequence('abcde', 'ace') // 3 ('ace')
longestCommonSubsequence('abc', 'def')   // 0
```

Символы совпали — +1 к диагонали. Не совпали — максимум сверху или слева.

## Как распознать задачу на DP

1. **Оптимизация** — найти максимум/минимум/количество способов
2. **Пересекающиеся подзадачи** — наивная рекурсия считает одно и то же
3. **Выбор** — на каждом шаге берём или не берём, идём или не идём

## План решения

1. Решить рекурсивно (наивно)
2. Добавить мемоизацию (сверху вниз)
3. Переписать через tabulation (снизу вверх)
4. Оптимизировать память (если нужны только предыдущие значения)

## Итог

- DP = рекурсия + кэширование результатов
- Memoization — сверху вниз, рекурсия + Map/Object
- Tabulation — снизу вверх, итеративное заполнение массива/таблицы
- Фибоначчи, лестница, рюкзак — типичные задачи на DP
- Сначала напишите рекурсию, потом добавьте кэш, потом уберите рекурсию
- Оптимизация памяти: если `dp[i]` зависит только от `dp[i-1]`, храните только два значения
