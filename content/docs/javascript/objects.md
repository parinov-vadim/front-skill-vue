---
title: "Объекты в JavaScript: деструктуризация, spread/rest, Object.keys/values/entries"
description: "Работа с объектами в JavaScript — создание, деструктуризация, spread-оператор, методы Object.keys, Object.values, Object.entries, Object.assign, shallow copy."
section: javascript
difficulty: beginner
readTime: 10
order: 10
tags: [объекты, object, деструктуризация, деструктуризация объектов, spread, rest, Object.keys, JavaScript]
---

## Создание объектов

Объект — коллекция пар «ключ-значение». Ключ — строка или Symbol, значение — что угодно:

```js
const user = {
  name: 'Анна',
  age: 25,
  isAdmin: false,
  hobbies: ['чтение', 'плавание'],
  address: {
    city: 'Москва',
    street: 'Тверская',
  },
}
```

Ключи можно использовать как вычисляемые:

```js
const field = 'name'
const obj = { [field]: 'Анна' } // { name: 'Анна' }
```

Если имя ключа совпадает с переменной — короткая запись:

```js
const name = 'Анна'
const age = 25
const user = { name, age } // { name: 'Анна', age: 25 }
```

## Доступ к свойствам

Два способа — через точку и через квадратные скобки:

```js
user.name          // 'Анна'
user['age']        // 25

const key = 'name'
user[key]          // 'Ання'

// Для ключей с нестандартными символами — только скобки
const config = { 'api-key': 'abc123' }
config['api-key']  // 'abc123'
```

## Добавление и изменение свойств

```js
user.email = 'anna@mail.ru'      // добавить
user.age = 26                     // изменить
user['phone'] = '+7-999-123-4567' // через скобки

delete user.isAdmin               // удалить
```

## Проверка наличия свойства

```js
'name' in user           // true
'phone' in user          // false
user.address !== undefined // true — но если значение может быть undefined, лучше 'in'
user.hasOwnProperty('name') // true
```

## Деструктуризация объекта

Извлечение свойств в отдельные переменные:

```js
const user = { name: 'Анна', age: 25, city: 'Москва' }

const { name, age } = user
console.log(name) // 'Ання'
console.log(age)  // 25
```

Переименование переменной при деструктуризации:

```js
const { name: userName, age: userAge } = user
console.log(userName) // 'Ання'
```

Значение по умолчанию, если свойства нет:

```js
const { name, role = 'user' } = user
console.log(role) // 'user' — потому что role не было в объекте
```

Переименование + значение по умолчанию:

```js
const { name: userName = 'Гость' } = { name: 'Анна' }
```

Вложенная деструктуризация:

```js
const user = {
  name: 'Анна',
  address: { city: 'Москва', street: 'Тверская' },
}

const { address: { city, street } } = user
console.log(city) // 'Москва'
```

Деструктуризация в параметрах функции:

```js
function greet({ name, age }) {
  console.log(`Привет, ${name}! Тебе ${age} лет.`)
}

greet({ name: 'Анна', age: 25 })
```

## Spread-оператор (...)

### Копирование объекта (поверхностное)

```js
const original = { a: 1, b: 2 }
const copy = { ...original }
copy.a = 99
console.log(original.a) // 1 — не изменилось
```

### Объединение объектов

```js
const defaults = { theme: 'light', lang: 'ru', perPage: 10 }
const userPrefs = { theme: 'dark', perPage: 20 }

const settings = { ...defaults, ...userPrefs }
// { theme: 'dark', lang: 'ru', perPage: 20 }
```

Порядок важен — поздние свойства перезаписывают ранние.

### Добавление свойств

```js
const user = { name: 'Анна', age: 25 }
const withRole = { ...user, role: 'admin' }
// { name: 'Анна', age: 25, role: 'admin' }
```

### Удаление свойства (без мутации)

```js
const { isAdmin, ...rest } = { name: 'Анна', age: 25, isAdmin: true }
console.log(rest) // { name: 'Анна', age: 25 }
```

### Поверхностная копия — ловушка

Spread копирует только первый уровень. Вложенные объекты — по ссылке:

```js
const original = { name: 'Анна', address: { city: 'Москва' } }
const copy = { ...original }

copy.address.city = 'Санкт-Петербург'
console.log(original.address.city) // 'Санкт-Петербург' — изменилось!
```

Для глубокой копии:

```js
const deepCopy = structuredClone(original)
```

## Object.keys / values / entries

```js
const user = { name: 'Анна', age: 25, city: 'Москва' }

Object.keys(user)    // ['name', 'age', 'city'] — массив ключей
Object.values(user)  // ['Анна', 25, 'Москва'] — массив значений
Object.entries(user)  // [['name', 'Анна'], ['age', 25], ['city', 'Москва']]
```

Перебор через `entries`:

```js
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`)
}
// name: Анна
// age: 25
// city: Москва
```

## Object.assign

Копирует свойства из одного или нескольких объектов в целевой:

```js
const target = { a: 1 }
const source = { b: 2, c: 3 }

Object.assign(target, source)
console.log(target) // { a: 1, b: 2, c: 3 }

// Для создания копии — передайте пустой объект первым аргументом
const copy = Object.assign({}, target)
```

`Object.assign` мутирует первый аргумент. Spread-оператор предпочтительнее — он не мутирует.

## Object.freeze и Object.seal

```js
// freeze — полностью заморозить объект
const config = Object.freeze({ apiUrl: '/api', timeout: 5000 })
config.timeout = 3000  // молча не сработает (или TypeError в строгом режиме)
config.newField = true // молча не сработает

// seal — нельзя добавлять/удалять, но можно менять существующие
const user = Object.seal({ name: 'Анна', age: 25 })
user.age = 26         // OK
user.city = 'Мск'     // не добавится
delete user.name      // не удалится
```

Обе функции — поверхностные. Вложенные объекты не защищены.

## Методы объекта

Короткий синтаксис метода:

```js
const user = {
  name: 'Анна',
  greet() {
    return `Привет, я ${this.name}`
  },
}

user.greet() // 'Привет, я Анна'
```

## Object.hasOwn

Современная замена `hasOwnProperty`:

```js
const user = { name: 'Анна' }

Object.hasOwn(user, 'name')    // true
Object.hasOwn(user, 'age')     // false
Object.hasOwn(user, 'toString') // false — это из прототипа
```

## Частые задачи

### Преобразовать массив объектов в объект по ключу

```js
const users = [
  { id: 1, name: 'Анна' },
  { id: 2, name: 'Иван' },
]

const byId = Object.fromEntries(users.map(u => [u.id, u]))
// { 1: { id: 1, name: 'Анна' }, 2: { id: 2, name: 'Иван' } }
```

### Объединить два объекта, отдав приоритет второму

```js
const merged = { ...defaults, ...overrides }
```

### Глубокое сравнение двух объектов

```js
function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a === null || b === null) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => deepEqual(a[key], b[key]))
}
```

## Итог

- Деструктуризация — удобный способ извлечь свойства: `const { name, age } = user`
- Spread `{ ...obj }` — поверхностная копия, `structuredClone()` — глубокая
- `Object.keys/values/entries` — для перебора и трансформации
- `Object.freeze` — если объект менять не должны
- Все методы копирования поверхностные — вложенные объекты копируются по ссылке
