---
title: "Числа в JavaScript: Number, Math, BigInt, parseFloat, parseInt"
description: "Работа с числами в JavaScript — Number, Math, округление, BigInt для больших чисел, parseFloat/parseInt, проблема 0.1 + 0.2, форматирование чисел."
section: javascript
difficulty: beginner
readTime: 9
order: 20
tags: [числа, Number, Math, BigInt, parseFloat, parseInt, округление, JavaScript, математика]
---

## Числа в JavaScript

Все числа в JavaScript — 64-битные с плавающей точкой (IEEE 754). Нет отдельного типа для целых чисел:

```js
const integer = 42
const float = 3.14
const negative = -7
const exp = 2.5e6      // 2500000
const hex = 0xff       // 255
const binary = 0b1010  // 10
const octal = 0o755    // 493
```

## Специальные значения

```js
Infinity              // бесконечность (1 / 0)
-Infinity             // минус бесконечность
NaN                   // Not a Number — результат ошибочной операции

typeof NaN            // 'number' (да, NaN это число)
NaN === NaN           // false — единственное значение, не равное себе
```

Проверки:

```js
Number.isNaN(NaN)           // true — строгая проверка
Number.isFinite(42)         // true — не NaN и не Infinity
Number.isFinite(Infinity)   // false
Number.isInteger(5)         // true
Number.isInteger(5.0)       // true (5.0 === 5)
Number.isInteger(5.5)       // false
```

## Проблема 0.1 + 0.2

Плавающая точка неточна. Это не баг JavaScript — так работает IEEE 754:

```js
0.1 + 0.2              // 0.30000000000000004
0.1 + 0.2 === 0.3      // false
```

### Решения

```js
// Умножить/разделить на степень 10
const result = Math.round((0.1 + 0.2) * 100) / 100 // 0.3

// toFixed — возвращает строку
(0.1 + 0.2).toFixed(2)  // '0.30'
+(0.1 + 0.2).toFixed(2) // 0.3 (обратно в число)

// EPSILON — минимальная разница между числами
function isEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON
}
isEqual(0.1 + 0.2, 0.3) // true
```

## parseInt и parseFloat

Конвертируют строку в число. Читают символы слева пока могут:

```js
parseInt('42')         // 42
parseInt('42px')       // 42 (остановился на 'p')
parseInt('3.14')       // 3 (целая часть)
parseInt('')           // NaN

parseFloat('3.14')     // 3.14
parseFloat('3.14abc')  // 3.14
parseFloat('0.001')    // 0.001
```

Система счисления (второй аргумент):

```js
parseInt('ff', 16)     // 255 (hex)
parseInt('1010', 2)    // 10 (binary)
parseInt('77', 8)      // 63 (octal)
```

Всегда указывайте основание — `parseInt('08')` может удивить в старых браузерах.

### Number() vs parseInt()

```js
Number('42')     // 42
Number('42px')   // NaN — строгий, не терпит мусор
Number('')       // 0
Number(' ')      // 0
Number(null)     // 0
Number(true)     // 1
Number(false)    // 0

parseInt('42px') // 42 — читает пока может
parseInt('')     // NaN
```

## Math — математические функции

### Округление

```js
Math.round(4.5)    // 5 — математическое (к ближайшему целому)
Math.round(4.4)    // 4

Math.ceil(4.1)     // 5 — всегда вверх
Math.ceil(4.9)     // 5

Math.floor(4.9)    // 4 — всегда вниз
Math.floor(4.1)    // 4

Math.trunc(4.9)    // 4 — отбрасывает дробную часть
Math.trunc(-4.9)   // -4 (в отличие от floor, который дал бы -5)
```

### Минимум, максимум, степень, корень

```js
Math.max(1, 5, 3)         // 5
Math.min(1, 5, 3)         // 1
Math.max(...[10, 20, 30]) // 30 — с массивом через spread

Math.pow(2, 10)           // 1024 — 2^10
2 ** 10                   // 1024 — оператор степени

Math.sqrt(16)             // 4 — квадратный корень
Math.cbrt(27)             // 3 — кубический корень
Math.abs(-5)              // 5  — модуль
Math.sign(-42)            // -1 — знак числа (-1, 0, 1)
```

### Случайные числа

```js
Math.random() // от 0 до 1 (не включая 1)

// Случайное целое от min до max (включительно)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

randomInt(1, 6)  // бросок кубика
randomInt(10, 50) // от 10 до 50
```

### Логарифмы и тригонометрия

```js
Math.log(10)      // натуральный логарифм
Math.log2(8)      // 3
Math.log10(1000)  // 3

Math.sin(Math.PI / 2)  // 1
Math.cos(0)            // 1
Math.tan(0)            // 0

Math.PI               // 3.141592653589793
Math.E                // 2.718281828459045
```

## BigInt

Для чисел больше `Number.MAX_SAFE_INTEGER` (2^53 − 1 = 9007199254740991). Добавляется суффикс `n`:

```js
const big = 9007199254740993n
const fromStr = BigInt('9007199254740993')
const fromNum = BigInt(9007199254740993)

typeof big // 'bigint'
```

Арифметика:

```js
100n + 200n       // 300n
10n * 3n          // 30n
7n / 2n           // 3n — дробная часть отбрасывается
7n % 2n           // 1n
2n ** 100n        // 1267650600228229401496703205376n
```

Смешивать `BigInt` и `Number` нельзя:

```js
10n + 5            // TypeError
10n + BigInt(5)    // 15n
Number(10n) + 5    // 15
```

Сравнения работают:

```js
10n === 10   // false (разные типы)
10n == 10    // true
10n > 5      // true
```

## Форматирование чисел

### toFixed

```js
const price = 199.992
price.toFixed(2)    // '200.00' — строка!
price.toFixed(0)    // '200'
(+price.toFixed(2)) // 200 (обратно в число)
```

### Intl.NumberFormat

```js
const price = 1999.5

new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
}).format(price)
// '1 999,50 ₽'

new Intl.NumberFormat('ru-RU').format(1000000)
// '1 000 000'

// Проценты
new Intl.NumberFormat('ru-RU', {
  style: 'percent',
}).format(0.156)
// '16 %' (округляет)

// Единицы измерения
new Intl.NumberFormat('ru-RU', {
  style: 'unit',
  unit: 'kilometer',
}).format(42)
// '42 км'
```

## Ограничения Number

```js
Number.MAX_SAFE_INTEGER  // 9007199254740991
Number.MIN_SAFE_INTEGER  // -9007199254740991
Number.MAX_VALUE         // 1.7976931348623157e+308
Number.MIN_VALUE         // 5e-324
Number.EPSILON           // 2.220446049250313e-16
```

За `MAX_SAFE_INTEGER` начинаются неточности:

```js
9007199254740992 === 9007199254740993 // true (!)
```

Если нужны точные большие числа — используйте `BigInt`.

## Итог

- Все числа — 64-битный float. `0.1 + 0.2 !== 0.3` — норма
- `parseInt`/`parseFloat` — для извлечения чисел из строк, `Number()` — для строгой конвертации
- `Math.round`/`ceil`/`floor`/`trunc` — разные виды округления
- `BigInt` — для чисел больше 2^53, нельзя смешивать с `Number`
- `Intl.NumberFormat` — форматирование валют, процентов, разделителей разрядов
