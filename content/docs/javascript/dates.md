---
title: "Дата и время в JavaScript: Date, toLocaleDateString, Intl.DateTimeFormat"
description: "Работа с датами в JavaScript — создание Date, форматирование, разница между датами, toLocaleDateString, Intl.DateTimeFormat и частые задачи с датами."
section: javascript
difficulty: beginner
readTime: 9
order: 19
tags: [дата, время, Date, форматирование дат, toLocaleDateString, Intl, JavaScript]
---

## Создание Date

```js
const now = new Date()                         // текущая дата и время
const fromTimestamp = new Date(1700000000000)  // из миллисекунд (Unix timestamp)
const fromString = new Date('2025-01-15')      // из строки ISO
const fromParts = new Date(2025, 0, 15, 12, 30) // год, месяц (0-11!), день, часы, минуты
```

Важно: месяцы нумеруются с 0. Январь = 0, декабрь = 11.

```js
const jan = new Date(2025, 0, 1)  // 1 января 2025
const dec = new Date(2025, 11, 31) // 31 декабря 2025
```

## Получение компонентов

```js
const date = new Date(2025, 5, 15, 14, 30, 45) // 15 июня 2025, 14:30:45

date.getFullYear()    // 2025
date.getMonth()       // 5 (июнь, 0-11!)
date.getDate()        // 15
date.getDay()         // 0 (воскресенье, 0-6, 0 = воскресенье)
date.getHours()       // 14
date.getMinutes()     // 30
date.getSeconds()     // 45
date.getMilliseconds() // 0
date.getTime()        // 1750000000000 (миллисекунды с 1 января 1970)

// UTC-варианты
date.getUTCFullYear()
date.getUTCMonth()
date.getUTCDate()
date.getUTCHours()
```

## Установка компонентов

```js
const date = new Date()

date.setFullYear(2026)
date.setMonth(11)    // декабрь
date.setDate(25)
date.setHours(0)
date.setMinutes(0)
date.setSeconds(0)
```

## Форматирование

### toString / toISOString

```js
const date = new Date(2025, 0, 15, 14, 30)

date.toString()     // 'Wed Jan 15 2025 14:30:00 GMT+0300 (...)'
date.toISOString()  // '2025-01-15T11:30:00.000Z' (UTC)
date.toDateString() // 'Wed Jan 15 2025'
date.toTimeString() // '14:30:00 GMT+0300 (...)'
```

`toISOString` всегда в UTC — удобно для отправки на сервер.

### toLocaleDateString

Форматирование с учётом языка пользователя:

```js
const date = new Date(2025, 0, 15)

date.toLocaleDateString('ru-RU') // '15.01.2025'
date.toLocaleDateString('en-US') // '1/15/2025'
date.toLocaleDateString('de-DE') // '15.1.2025'
```

С опциями:

```js
const date = new Date(2025, 5, 15, 14, 30)

date.toLocaleDateString('ru-RU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
// '15 июня 2025 г.' или 'воскресенье, 15 июня 2025 г.'

date.toLocaleTimeString('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})
// '14:30'

date.toLocaleString('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
// '15 июн. 2025, 14:30'
```

### Intl.DateTimeFormat

Тот же результат, но создаёт переиспользуемый форматтер — эффективнее при многократном использовании:

```js
const formatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dates = [new Date(2025, 0, 1), new Date(2025, 5, 15), new Date(2025, 11, 31)]

const formatted = dates.map(d => formatter.format(d))
// ['1 января 2025 г.', '15 июня 2025 г.', '31 декабря 2025 г.']
```

### Intl.RelativeTimeFormat

Относительное время — «5 минут назад», «через 3 дня»:

```js
const rtf = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

rtf.format(-1, 'minute')  // 'минуту назад'
rtf.format(-5, 'minutes') // '5 минут назад'
rtf.format(-1, 'hour')    // 'час назад'
rtf.format(-2, 'days')    // '2 дня назад'
rtf.format(3, 'days')     // 'через 3 дня'
rtf.format(1, 'week')     // 'через неделю'
```

Функция-хелпер:

```js
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

  if (seconds < 60) return rtf.format(-seconds, 'second')
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour')
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day')
  return rtf.format(-Math.floor(seconds / 2592000), 'month')
}

timeAgo(new Date(Date.now() - 5000))  // '5 секунд назад'
timeAgo(new Date(Date.now() - 7200000)) // '2 часа назад'
```

## Разница между датами

```js
const start = new Date(2025, 0, 1)
const end = new Date(2025, 0, 15)

const diffMs = end - start                    // 1209600000 (миллисекунды)
const diffDays = Math.floor(diffMs / 86400000) // 14
const diffHours = Math.floor(diffMs / 3600000) // 336
```

### Сколько дней осталось до даты

```js
function daysUntil(targetDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  return Math.ceil((target - now) / 86400000)
}

daysUntil('2025-12-31') // сколько-то дней
```

## Частые задачи

### Получить начало дня

```js
function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}
```

### Получить конец дня

```js
function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}
```

### Последний день месяца

```js
function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate() // month 0-11
}

lastDayOfMonth(2025, 1) // 28 (февраль 2025)
lastDayOfMonth(2024, 1) // 29 (високосный год)
```

### Форматировать дату как DD.MM.YYYY

```js
function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

formatDate(new Date(2025, 0, 5)) // '05.01.2025'
```

### Проверить, является ли строка датой

```js
function isValidDate(dateStr) {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

isValidDate('2025-01-15')    // true
isValidDate('не дата')       // false
isValidDate('2025-13-01')    // false (13-й месяц)
```

## Date.now()

Возвращает текущий timestamp в миллисекундах — быстрее, чем `new Date().getTime()`:

```js
const start = Date.now()

heavyOperation()

const elapsed = Date.now() - start
console.log(`Заняло ${elapsed} мс`)
```

## подводные камни

- Месяцы 0-11 — самая частая ошибка
- `new Date('2025-01-15')` парсится как UTC, а `new Date(2025, 0, 15)` — как локальное время
- Парсинг строк через `new Date()` ненадёжен — зависит от браузера. Используйте ISO формат (`YYYY-MM-DD`) или `Date.parse()`
- `Date` мутируемый — методы `set*` меняют исходный объект

## Итог

- `new Date()` — текущая дата, `Date.now()` — текущий timestamp
- Месяцы начинаются с 0 — частый источник багов
- `toLocaleDateString('ru-RU', опции)` — форматирование для пользователя
- `Intl.DateTimeFormat` — переиспользуемый форматтер
- `Intl.RelativeTimeFormat` — «5 минут назад» из коробки
- Для сложной работы с датами рассмотрите библиотеку `date-fns` или `dayjs`
