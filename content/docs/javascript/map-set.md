---
title: "Map, Set, WeakMap, WeakSet в JavaScript — когда использовать"
description: "Коллекции Map и Set в JavaScript — отличие от объектов и массивов, когда использовать Map вместо Object, Set для уникальных значений, WeakMap и WeakSet для памяти."
section: javascript
difficulty: intermediate
readTime: 8
order: 15
tags: [Map, Set, WeakMap, WeakSet, коллекции, Set JS, Map JavaScript, уникальные значения]
---

## Map

`Map` — коллекция пар «ключ-значение». В отличие от объекта, ключом может быть что угодно: объект, функция, примитив.

### Создание и базовые операции

```js
const map = new Map()

// Добавить
map.set('name', 'Анна')
map.set('age', 25)
map.set({ id: 1 }, 'объект как ключ')

// Получить
map.get('name')  // 'Анна'
map.get('age')   // 25

// Проверить наличие
map.has('name')  // true

// Размер
map.size         // 3

// Удалить
map.delete('age')

// Очистить всё
map.clear()
```

`set` возвращает сам map, поэтому можно chaining:

```js
const config = new Map()
  .set('api', '/api/v1')
  .set('timeout', 5000)
  .set('retries', 3)
```

### Инициализация из массива

```js
const users = new Map([
  ['anna', { age: 25 }],
  ['ivan', { age: 30 }],
])

users.get('anna') // { age: 25 }
```

### Перебор

```js
const map = new Map([['a', 1], ['b', 2], ['c', 3]])

for (const [key, value] of map) {
  console.log(`${key} = ${value}`)
}

// Через методы
map.forEach((value, key) => {
  console.log(`${key} = ${value}`)
})

// Отдельно ключи и значения
[...map.keys()]    // ['a', 'b', 'c']
[...map.values()]  // [1, 2, 3]
[...map.entries()]  // [['a', 1], ['b', 2], ['c', 3]]
```

### Когда Map лучше объекта

| Свойство | `Object` | `Map` |
|----------|----------|-------|
| Ключи | только строки и Symbol | любые типы |
| Порядок ключей | не гарантирован (до ES6) | в порядке добавления |
| Размер | вручную `Object.keys().length` | `map.size` |
| Производительность | лучше для малого числа ключей | лучше для частого добавления/удаления |
| Прототип | есть (`toString`, `hasOwnProperty`) | нет лишних свойств |

```js
// Map с объектами как ключами — объект так не может
const clicks = new Map()

document.querySelectorAll('.btn').forEach(btn => {
  clicks.set(btn, 0)
  btn.addEventListener('click', () => {
    clicks.set(btn, clicks.get(btn) + 1)
  })
})
```

## Set

`Set` — коллекция уникальных значений. Дубликаты игнорируются.

```js
const set = new Set()

set.add(1)
set.add(2)
set.add(3)
set.add(1) // дубль — проигнорирован

set.size // 3

set.has(2)  // true
set.has(99) // false

set.delete(3)
```

### Создание из массива

```js
const unique = new Set([1, 2, 2, 3, 3, 3])
console.log(unique) // Set { 1, 2, 3 }

// Обратно в массив
const arr = [...unique] // [1, 2, 3]
```

### Удаление дубликатов из массива

Это главная повседневная задача для Set:

```js
const tags = ['js', 'css', 'js', 'html', 'css', 'vue']
const uniqueTags = [...new Set(tags)]
// ['js', 'css', 'html', 'vue']
```

### Перебор

```js
const set = new Set(['яблоко', 'банан', 'груша'])

for (const item of set) {
  console.log(item)
}

set.forEach(item => console.log(item))
```

### Операции над множествами

```js
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

// Объединение
const union = new Set([...a, ...b]) // { 1, 2, 3, 4 }

// Пересечение
const intersection = new Set([...a].filter(x => b.has(x))) // { 2, 3 }

// Разность
const difference = new Set([...a].filter(x => !b.has(x))) // { 1 }
```

## WeakMap

То же что `Map`, но:
- Ключи — **только объекты**
- Ключи — слабые ссылки: если на объект больше никто не ссылается, он удаляется сборщиком мусора
- Нельзя перебрать (`forEach`, `keys()`, `size` — отсутствуют)

```js
const cache = new WeakMap()

function process(obj) {
  if (cache.has(obj)) return cache.get(obj)

  const result = heavyComputation(obj)
  cache.set(obj, result)
  return result
}

let element = document.querySelector('.card')
process(element)

// Когда element удаляется из DOM и на него нет ссылок:
element = null // WeakMap автоматически удалит запись — утечки памяти не будет
```

### Типичное использование — приватные данные

```js
const privateData = new WeakMap()

class User {
  constructor(name, secret) {
    this.name = name
    privateData.set(this, { secret })
  }

  getSecret() {
    return privateData.get(this).secret
  }
}

const anna = new User('Анна', 'пароль123')
anna.getSecret() // 'пароль123'
console.log(anna.secret) // undefined — нет прямого доступа
```

## WeakSet

То же что `Set`, но:
- Только объекты
- Слабые ссылки — объекты удаляются, если больше нигде не используются
- Нельзя перебрать

```js
const visited = new WeakSet()

function trackVisit(user) {
  if (visited.has(user)) {
    console.log('Уже был')
    return
  }
  visited.add(user)
  console.log('Первый визит')
}

let user = { name: 'Анна' }
trackVisit(user) // 'Первый визит'
trackVisit(user) // 'Уже был'

user = null // запись в WeakSet удалится автоматически
```

## Что когда использовать

| Задача | Инструмент |
|--------|-----------|
| Хранить пары «строка → значение» | `Object` |
| Ключи не строки (объекты, функции) | `Map` |
| Часто добавляете/удаляете пары | `Map` |
| Нужно сохранить порядок | `Map` |
| Уникальные значения | `Set` |
| Удалить дубликаты из массива | `Set` |
| Кэш, привязанный к объекту | `WeakMap` |
| Отметить обработанные объекты | `WeakSet` |
| Простая конфигурация | `Object` |

## Итог

- `Map` — когда нужны нестроковые ключи или частое добавление/удаление
- `Set` — для уникальных значений и удаления дубликатов
- `WeakMap` / `WeakSet` — когда нужно привязать данные к объекту без утечек памяти
- Для простых случаев (`{ key: value }`) обычный объект по-прежнему норма
