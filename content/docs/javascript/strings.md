---
title: "Строки в JavaScript: шаблонные литералы, методы строк, Unicode"
description: "Работа со строками в JavaScript — создание, шаблонные строки, методы (slice, split, replace, trim, includes), Unicode и частые задачи."
section: javascript
difficulty: beginner
readTime: 9
order: 8
tags: [строки, string, шаблонные строки, template literals, методы строк, Unicode, JavaScript]
---

## Создание строк

Три способа записать строку:

```js
const single = 'Привет'
const double = "Привет"
const backtick = `Привет`
```

Одинарные и двойные кавычки — одно и то же. Выберите один стиль и придерживайтесь. В проектах чаще используют одинарные.

Обратные кавычки (шаблонные строки) дают две дополнительные возможности: интерполяцию и многострочность.

## Шаблонные строки (template literals)

Интерполяция — подстановка значений внутрь строки через `${}`:

```js
const name = 'Мария'
const age = 25

console.log(`Меня зовут ${name}, мне ${age} лет`)
// 'Меня зовут Мария, мне 25 лет'
```

Внутри `${}` можно писать любые выражения:

```js
const price = 1500
console.log(`Скидка 20%: ${price * 0.8} руб`) // 'Скидка 20%: 1200 руб'
console.log(`Совершеннолетний: ${age >= 18 ? 'да' : 'нет'}`)
```

Многострочный текст — без склеивания через `+` и `\n`:

```js
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>Возраст: ${age}</p>
  </div>
`
```

## Длина строки

Свойство `.length` — количество символов:

```js
'Привет'.length     // 6
''.length           // 0
' '.length          // 1
```

## Доступ к символам

По индексу — как в массиве. Нумерация с нуля:

```js
const word = 'Кот'
word[0]            // 'К'
word[word.length - 1] // 'т'
```

Строки неизменяемы — перезаписать символ нельзя:

```js
word[0] = 'Б' // не выбросит ошибку, но и не изменит строку
console.log(word) // 'Кот'
```

## Основные методы

### Поиск и проверка

```js
const text = 'JavaScript — лучший язык'

text.includes('лучший')     // true — содержит ли подстроку
text.startsWith('Java')     // true — начинается с
text.endsWith('язык')       // true — заканчивается на

text.indexOf('Script')      // 4 — индекс первого вхождения
text.indexOf('Python')      // -1 — не найдено

text.lastIndexOf('a')       // 3 — последнее вхождение
```

### Извлечение подстроки

```js
const str = 'Привет, мир!'

str.slice(0, 6)     // 'Привет' — с 0 по 6 (не включая 6)
str.slice(8)        // 'мир!' — с 8 до конца
str.slice(-5)       // ' мир!' — 5 символов с конца

str.substring(0, 6) // 'Привет' — как slice, но без отрицательных индексов
```

`slice` — предпочтительный метод, поддерживает отрицательные индексы.

### Изменение регистра

```js
'hello'.toUpperCase()     // 'HELLO'
'WORLD'.toLowerCase()     // 'world'
```

Частый приём — приведение к нижнему регистру перед сравнением:

```js
const input = 'JavaScript'
console.log(input.toLowerCase() === 'javascript') // true
```

### Удаление пробелов

```js
'  привет  '.trim()       // 'привет' — оба края
'  привет  '.trimStart()  // 'привет  ' — только слева
'  привет  '.trimEnd()    // '  привет' — только справа
```

### Повторение и дополнение

```js
'ha'.repeat(3)            // 'hahaha'

'42'.padStart(5, '0')     // '00042' — дополнить слева до длины 5
'42'.padEnd(5, '-')       // '42---' — дополнить справа
```

Полезно для форматирования:

```js
const minutes = 5
const seconds = 3
const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
// '05:03'
```

### Разделение и объединение

```js
const fruits = 'яблоко, банан, груша'
fruits.split(', ')         // ['яблоко', 'банан', 'груша']

'hello'.split('')          // ['h', 'e', 'l', 'l', 'o'] — по символам

const words = ['JavaScript', 'это', 'круто']
words.join(' ')            // 'JavaScript это круто'
```

### Замена

```js
const msg = 'Я люблю Python'

msg.replace('Python', 'JavaScript') // 'Я люблю JavaScript'

// replace заменяет только первое вхождение
'a-b-a'.replace('a', 'x')  // 'x-b-a'

//replaceAll — все вхождения
'a-b-a'.replaceAll('a', 'x') // 'x-b-x'

// С регулярным выражением — все вхождения (без replaceAll)
'a-b-a'.replace(/a/g, 'x') // 'x-b-x'
```

## Преобразование в строку и обратно

```js
String(123)          // '123'
String(true)         // 'true'
String(null)         // 'null'
String(undefined)    // 'undefined'
(3.14).toString()    // '3.14'

// Строка → число
Number('42')         // 42
parseInt('42px')     // 42
parseFloat('3.14')   // 3.14
+'42'                // 42 (унарный плюс)
```

## Unicode

JavaScript использует UTF-16. Большинство символов занимают одну ячейку (16 бит), но эмодзи и редкие символы — две (суррогатная пара):

```js
'😊'.length          // 2 — один символ, но .length считает 2
'😊'[0]              // '\uD83D' — половинка эмодзи
```

Корректная работа с Unicode-символами:

```js
[...'😊😊'].length        // 2 — spread раскрывает правильно
Array.from('привет').length // 6 — корректно

'👩🏽‍💻'.length   // 7 — составной эмодзи (женщина + тон кожи + ноутбук)
```

Для работы с «настоящими» Unicode-символами:

```js
const emoji = '👨‍👩‍👧‍👦'
console.log([...emoji]) // ['👨', '‍', '👩', '‍', '👧', '‍', '👦']
```

### Сравнение и сортировка строк с Unicode

```js
const words = ['étoile', 'apple', 'zéro']

words.sort()                    // ['apple', 'zéro', 'étoile'] — некорректно
words.sort((a, b) => a.localeCompare(b, 'fr')) // правильно с учётом языка
```

## Частые задачи

### Перевернуть строку

```js
const reversed = [...'привет'].reverse().join('') // 'тевирп'
```

### Капитализация первого символа

```js
const capitalize = str => str[0].toUpperCase() + str.slice(1)
capitalize('hello') // 'Hello'
```

### Проверить, является ли палиндромом

```js
function isPalindrome(str) {
  const normalized = str.toLowerCase().replace(/[^a-zа-яё]/g, '')
  return normalized === [...normalized].reverse().join('')
}

isPalindrome('А роза упала на лапу Азора') // true
```

### Сгенерировать случайную строку

```js
const id = Math.random().toString(36).slice(2, 10) // 'k5j2x9ab'
```

## Итог

- Шаблонные строки через обратные кавычки — для интерполяции и многострочного текста
- Строки неизменяемы — методы возвращают новые строки
- `slice`, `split`, `includes`, `replace`, `trim` — методы, которые используются каждый день
- С эмодзи и редкими символами будьте осторожны — используйте `[...str]` вместо `str[i]`
