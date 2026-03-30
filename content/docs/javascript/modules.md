---
title: "Модули в JavaScript: import, export, CommonJS vs ESM, tree shaking"
description: "Модули JavaScript — ES Modules (import/export) и CommonJS (require/module.exports). Именованный и дефолтный экспорт, реэкспорт, динамический import и tree shaking."
section: javascript
difficulty: intermediate
readTime: 9
order: 13
tags: [модули, import, export, ES Modules, CommonJS, require, tree shaking, JavaScript]
---

## Зачем нужны модули

Без модулей весь код в одном файле. С модулями — каждый файл это отдельная область видимости. Вы явно указываете, что экспортируете и что импортируете.

## ES Modules (ESM) — современный стандарт

Работает в браузере и Node.js. Использует `import` и `export`.

### Именованный экспорт

Можно несколько из одного файла:

```js
// math.js
export const PI = 3.14

export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}
```

Или сгруппировать в конце:

```js
const PI = 3.14
function add(a, b) { return a + b }
function subtract(a, b) { return a - b }

export { PI, add, subtract }
```

### Именованный импорт

```js
// main.js
import { PI, add } from './math.js'

console.log(PI)      // 3.14
console.log(add(2, 3)) // 5
```

Импорт с переименованием:

```js
import { add as sum, PI as pi } from './math.js'

sum(2, 3) // 5
```

Импорт всего:

```js
import * as math from './math.js'

math.PI           // 3.14
math.add(2, 3)    // 5
```

### Дефолтный экспорт

Один на файл. Без фигурных скобок при импорте:

```js
// User.js
export default class User {
  constructor(name) {
    this.name = name
  }
}
```

```js
// main.js
import User from './User.js'

const anna = new User('Анна')
```

Можно дать любое имя при импорте дефолтного экспорта:

```js
import MyUser from './User.js' // работает
```

### Смешанный экспорт

```js
// api.js
export function getUsers() { /* ... */ }
export function getPosts() { /* ... */ }

export default class ApiClient {
  // ...
}
```

```js
import ApiClient, { getUsers, getPosts } from './api.js'
```

### Реэкспорт

Собрать экспорты из нескольких файлов в один:

```js
// utils/index.js
export { add, subtract } from './math.js'
export { capitalize } from './string.js'
export { default as User } from './User.js'
```

Теперь можно импортировать всё из одной точки:

```js
import { add, capitalize, User } from './utils/index.js'
```

Реэкспорт всего:

```js
export * from './math.js'
```

## Динамический import()

Загружает модуль по требованию. Возвращает Promise:

```js
async function loadChart() {
  const { Chart } = await import('./chart.js')
  const chart = new Chart('#canvas')
  chart.render()
}

button.addEventListener('click', loadChart)
```

Это основа code splitting — тяжёлые модули загружаются только когда нужны.

## CommonJS — формат Node.js

До ES Modules в Node.js использовался CommonJS:

```js
// Экспорт
module.exports = {
  add(a, b) { return a + b },
  PI: 3.14,
}

// Или по одному
exports.subtract = (a, b) => a - b
```

```js
// Импорт
const math = require('./math')
const { add, PI } = require('./math')
```

### Ключевые отличия от ESM

| Свойство | ESM (`import`) | CommonJS (`require`) |
|----------|----------------|---------------------|
| Синхронность | асинхронный (парсинг до выполнения) | синхронный |
| Когда загружается | на этапе парсинга | в момент вызова |
| Можно ли условно импортировать | только через `import()` | да, `if (cond) require(...)` |
| Кэширование | да | да |
| Работает в браузере | да (native) | нет (только через bundler) |
| `this` на верхнем уровне | `undefined` | `module.exports` |

### Почему не стоит смешивать

```js
// НЕ делайте так
import { foo } from './bar.js'  // ESM
const baz = require('./qux')    // CommonJS
```

Сборщики могут это обработать, но поведение нестабильно. Выберите один формат.

## Как подключить ESM

### В браузере

```html
<script type="module" src="main.js"></script>
```

Без `type="module"` браузер не поймёт `import/export`.

### В Node.js

В `package.json`:
```json
{ "type": "module" }
```

Или использовать расширение `.mjs` для ES Modules и `.cjs` для CommonJS.

## Tree shaking

Сборщики (Vite, Webpack, Rollup) удаляют неиспользуемые экспорты. Это работает только с ESM:

```js
// utils.js
export function used() { console.log('используется') }
export function unused() { console.log('никто не вызывает') }
```

```js
import { used } from './utils.js'
```

В итоговом бандле `unused` не попадёт — сборщик увидит, что она не импортируется.

CommonJS tree shaking **не поддерживает**, потому что `require` динамический — невозможно статически определить, что используется.

Поэтому используйте ESM — бандл будет меньше.

## Паттерны организации модулей

### Баррель-файл (index.js)

Собирает экспорты из папки в одну точку входа:

```js
// components/index.js
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Modal } from './Modal.vue'
```

```js
import { Button, Input } from './components'
```

### Модуль с конфигурацией

```js
// config.js
export const API_URL = process.env.API_URL || 'http://localhost:3000'
export const TIMEOUT = 5000
export const MAX_RETRIES = 3
```

### Модуль-утилита

```js
// format.js
export function formatPrice(amount, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(date))
}
```

## Итог

- ESM (`import/export`) — современный стандарт, работает в браузере и Node.js
- CommonJS (`require/module.exports`) — формат Node.js, устаревает
- Дефолтный экспорт — один на файл, именованных — сколько угодно
- `import()` — для ленивой загрузки и code splitting
- Tree shaking работает только с ESM — используйте `import/export`, а не `require`
