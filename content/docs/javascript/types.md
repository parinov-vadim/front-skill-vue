---
title: "Типы данных в JavaScript: примитивы, объекты, typeof и приведение типов"
description: "Все типы данных JavaScript — string, number, boolean, null, undefined, object, symbol, bigint. Как работает typeof, неявное приведение типов и почему 1 + '1' равно '11'."
section: javascript
difficulty: beginner
readTime: 10
order: 7
tags: [типы данных, примитивы, typeof, приведение типов, type coercion, JavaScript, типы JS]
---

## Два вида типов

В JavaScript типы делятся на две группы:

**Примитивы** — immutable (неизменяемые). При присваивании копируется само значение:
- `string` — строка
- `number` — число
- `boolean` — логический тип
- `undefined` — «значение не задано»
- `null` — «значение пусто»
- `symbol` — уникальный идентификатор
- `bigint` — большие целые числа

**Объекты** — mutable (изменяемые). При присваивании копируется ссылка:
- `object` — объект, массив, функция, дата, регулярное выражение…

```js
// Примитив — копируется значение
let a = 5
let b = a
b = 10
console.log(a) // 5 — не изменилось

// Объект — копируется ссылка
let obj1 = { name: 'Анна' }
let obj2 = obj1
obj2.name = 'Олег'
console.log(obj1.name) // 'Олег' — изменилось, потому что та же ячейка памяти
```

## string

Строка — текст в одинарных, двойных или обратных кавычках:

```js
const single = 'Привет'
const double = "Привет"
const template = `Привет, ${single}` // шаблонная строка с интерполяцией
```

Строки неизменяемы. Методы возвращают новую строку, оригинал не трогают:

```js
const name = 'Анна'
console.log(name.toUpperCase()) // 'АННА'
console.log(name)               // 'Анна' — не изменилась
```

## number

В JavaScript все числа — 64-битные числа с плавающей точкой. Отдельного типа для целых чисел нет:

```js
const integer = 42
const float = 3.14
const negative = -7
const hex = 0xff       // 255
const binary = 0b1010  // 10
const octal = 0o755    // 493
const exp = 2.5e6      // 2500000
```

Специальные значения:

```js
Infinity              // результат деления на ноль (1 / 0)
-Infinity             // (-1 / 0)
NaN                   // Not a Number — результат некорректной математики
```

```js
console.log('привет' * 3) // NaN
console.log(0 / 0)        // NaN
console.log(NaN === NaN)  // false — единственное значение, не равное самому себе
```

Для проверки на NaN используйте `Number.isNaN()`, а не глобальный `isNaN()`:

```js
isNaN('привет')        // true (пытается преобразовать в число)
Number.isNaN('привет') // false (строго проверяет, является ли значение NaN)
Number.isNaN(NaN)      // true
```

## boolean

Два значения: `true` и `false`. Часто возникает как результат сравнения:

```js
const isAdult = age >= 18
const hasName = name !== ''
```

## null и undefined

Похожи, но смысл разный:

| Значение | Смысл | Кто создаёт |
|----------|-------|-------------|
| `undefined` | значение не было задано | JavaScript автоматически |
| `null` | значение намеренно пусто | разработчик вручную |

```js
let x                // объявили, но не присвоили
console.log(x)       // undefined

let y = null         // явно указали «пока ничего нет»
console.log(y)       // null

console.log(typeof undefined) // 'undefined'
console.log(typeof null)      // 'object' — исторический баг языка
```

Проверка на `null` и `undefined` одновременно — через `==`:

```js
if (value == null) {
  // сработает и для null, и для undefined
}
```

## symbol

Уникальный идентификатор. Каждый вызов `Symbol()` создаёт новое уникальное значение:

```js
const id1 = Symbol('id')
const id2 = Symbol('id')
console.log(id1 === id2) // false — всегда разные
```

Обычно применяется как ключ объекта, который не столкнётся с другими ключами:

```js
const secretKey = Symbol('secret')
const user = { name: 'Дима', [secretKey]: 123 }
console.log(user[secretKey]) // 123
```

## bigint

Для чисел больше `Number.MAX_SAFE_INTEGER` (2^53 − 1):

```js
const huge = 9007199254740991n   // суффикс n
const fromStr = BigInt('9007199254740991000')

console.log(10n + 20n)          // 30n
console.log(5n * 3n)            // 15n

// bigint и number нельзя смешивать
console.log(10n + 5) // TypeError
console.log(10n + BigInt(5)) // 15n
```

## typeof — проверка типа

Оператор `typeof` возвращает строку с именем типа:

```js
typeof 'привет'       // 'string'
typeof 42             // 'number'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof null           // 'object'    ← баг, но уже не починят
typeof {}             // 'object'
typeof []             // 'object'    ← массив — это объект
typeof function(){}   // 'function'
typeof Symbol('x')    // 'symbol'
typeof 10n            // 'bigint'
```

Надёжная проверка массива:

```js
Array.isArray([1, 2, 3]) // true
Array.isArray('строка')   // false
```

## Приведение типов (Type Coercion)

JavaScript автоматически преобразует типы, когда это «нужно». Это источник большинства багов.

### Строковое преобразование

Происходит при конкатенации через `+`:

```js
'5' + 3         // '53'  — число привелось к строке
'5' + null      // '5null'
'5' + undefined // '5undefined'
'5' + true      // '5true'
'' + 0          // '0'
```

### Числовое преобразование

Происходит в математических операциях (кроме `+`), сравнениях:

```js
'5' - 3       // 2
'5' * '2'     // 10
'10' / 2      // 5
'5' - 'привет' // NaN

true - false  // 1
null + 1      // 1
undefined + 1 // NaN
```

### Логическое преобразование

Происходит в `if`, `while`, `!`, `&&`, `||`:

**Ложные значения (falsy):** `false`, `0`, `''` (пустая строка), `null`, `undefined`, `NaN`.

Всё остальное — **истинное (truthy)**, включая `'0'`, `'false'`, `[]` (пустой массив), `{}` (пустой объект):

```js
if ('0') console.log('сработает')    // truthy
if ([]) console.log('сработает')     // truthy
if ('') console.log('не сработает')  // falsy
if (0) console.log('не сработает')   // falsy
```

### Явное преобразование

Лучше преобразовывать типы вручную, чем надеяться на автоматическое:

```js
// В строку
String(123)          // '123'
(123).toString()     // '123'
String(null)         // 'null'
String(undefined)    // 'undefined'

// В число
Number('42')         // 42
Number('')           // 0
Number(' ')          // 0
Number(null)         // 0
Number(undefined)    // NaN
Number(true)         // 1
Number(false)        // 0
parseInt('42px')     // 42
parseFloat('3.14em') // 3.14

// В логическое
Boolean(0)           // false
Boolean('')          // false
Boolean('hello')     // true
Boolean([])          // true
```

## == vs ===

Разница в одном предложении: `==` приводит типы, `===` нет.

```js
0 == false     // true
'' == false    // true
null == undefined // true

0 === false    // false
'' === false   // false
null === undefined // false
```

Используйте **всегда `===`**. `==` — источник трудноуловимых багов.

## Итог

- 7 примитивов: string, number, boolean, null, undefined, symbol, bigint
- Объекты — изменяемые, передаются по ссылке
- `typeof` — быстрый способ узнать тип (но `typeof null === 'object'` — баг)
- Неявное приведение типов — главная странность JavaScript. Используйте `===` и явные преобразования
