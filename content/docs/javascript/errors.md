---
title: "Обработка ошибок в JavaScript: try/catch/finally, Error, кастомные ошибки"
description: "Обработка ошибок в JavaScript — try...catch...finally, объект Error, создание кастомных ошибок, Promise.catch, unhandledrejection и лучшие практики."
section: javascript
difficulty: intermediate
readTime: 8
order: 14
tags: [try catch, Error, ошибка, исключение, error handling, throw, finally, JavaScript]
---

## try...catch

Оборачивает код, который может выбросить ошибку. Если в `try` что-то пошло не так — управление переходит в `catch`:

```js
try {
  const data = JSON.parse('не json')
} catch (error) {
  console.log('Ошибка парсинга:', error.message) // 'Ошибка парсинга: Unexpected token...'
}
```

Без `try/catch` скрипт остановился бы на строке с `JSON.parse`.

### Блок finally

Выполняется всегда — была ошибка или нет:

```js
try {
  const response = await fetch('/api/users')
  const data = await response.json()
} catch (error) {
  console.log('Запрос не удался:', error.message)
} finally {
  hideLoadingSpinner() // выполнится в любом случае
}
```

Типичный сценарий — очистка ресурсов (спиннер, индикатор загрузки, закрытие соединения).

```js
function readConfig() {
  let file

  try {
    file = openFile('config.json')
    return file.read()
  } catch (error) {
    return { default: true }
  } finally {
    if (file) file.close() // закроется при любом исходе
  }
}
```

## Объект Error

У ошибки есть свойства:

```js
try {
  undefinedFunction()
} catch (error) {
  console.log(error.name)    // 'ReferenceError'
  console.log(error.message) // 'undefinedFunction is not defined'
  console.log(error.stack)   // стек вызовов (строка за строкой)
}
```

### Типы встроенных ошибок

| Тип | Когда возникает |
|-----|----------------|
| `ReferenceError` | обращение к несуществующей переменной |
| `TypeError` | операция с неверным типом (`null.x`) |
| `SyntaxError` | некорректный синтаксис (обычно при парсинге) |
| `RangeError` | значение вне допустимого диапазона |
| `URIError` | некорректный `encodeURI` / `decodeURI` |

```js
null.property   // TypeError: Cannot read properties of null
x               // ReferenceError: x is not defined (в строгом режиме)
new Array(-1)   // RangeError: Invalid array length
```

## throw — выбросить ошибку вручную

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error('Деление на ноль')
  }
  return a / b
}

try {
  divide(10, 0)
} catch (e) {
  console.log(e.message) // 'Деление на ноль'
}
```

`throw` работает с чем угодно, но принято выбрасывать объекты `Error`:

```js
throw new Error('Что-то пошло не так')
throw new TypeError('Ожидалось число')
throw new RangeError('Значение от 1 до 10')

// Можно, но не нужно
throw 'строка'    // работает, но нет stack trace
throw { code: 404 } // работает, но теряете информацию
```

## Кастомные ошибки

Создайте свой класс, наследуясь от `Error`:

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} не найден`)
    this.name = 'NotFoundError'
    this.resource = resource
  }
}
```

Использование:

```js
function validateAge(age) {
  if (typeof age !== 'number') {
    throw new ValidationError('age', 'Возраст должен быть числом')
  }
  if (age < 0 || age > 150) {
    throw new ValidationError('age', 'Возраст от 0 до 150')
  }
}

try {
  validateAge('двадцать')
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Поле "${error.field}": ${error.message}`)
    // Поле "age": Возраст должен быть числом
  } else {
    throw error // неизвестная ошибка — пробрасываем дальше
  }
}
```

`instanceof` — правильный способ проверить тип ошибки. Не проверяйте через `error.name` — имя может не совпасть после минификации.

## Ошибки в асинхронном коде

### try/catch не ловит ошибки внутри колбэков

```js
try {
  setTimeout(() => {
    throw new Error('Ошибка в таймере') // try/catch её не поймает
  }, 100)
} catch (e) {
  // Сюда не попадём — try уже завершился
}
```

### Promise: .catch()

```js
fetch('/api/users')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  })
  .then(data => console.log(data))
  .catch(error => console.log('Ошибка:', error.message))
```

### async/await: try/catch

```js
async function loadUsers() {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const users = await response.json()
    return users
  } catch (error) {
    console.log('Не удалось загрузить пользователей:', error.message)
    return []
  }
}
```

## Глобальная обработка ошибок

### В браузере

```js
// Синхронные ошибки
window.addEventListener('error', (event) => {
  console.log('Глобальная ошибка:', event.message)
})

// Неперехваченные Promise-ошибки
window.addEventListener('unhandledrejection', (event) => {
  console.log('Unhandled rejection:', event.reason)
  event.preventDefault() // предотвратить вывод в консоль
})
```

### В Node.js

```js
process.on('uncaughtException', (error) => {
  console.error('Uncaught:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})
```

## Лучшие практики

**Ловите конкретные ошибки, а не все подряд:**

```js
// Плохо — глотает любые ошибки
try {
  saveUser(user)
  sendEmail(user.email)
} catch (e) {}

// Лучше — обрабатываем только то, что ожидаем
try {
  saveUser(user)
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldError(error.field, error.message)
  } else {
    throw error // пробрасываем неизвестную ошибку
  }
}
```

**Не глотайте ошибки молча:**

```js
// Плохо
try {
  doSomething()
} catch (e) {
  // тишина
}

// Лучше — хотя бы логируйте
try {
  doSomething()
} catch (e) {
  console.error('doSomething failed:', e)
}
```

**Используйте finally для очистки:**

```js
showLoading()
try {
  await fetchData()
} catch (e) {
  showError(e.message)
} finally {
  hideLoading() // гарантирует, что спиннер исчезнет
}
```

## Итог

- `try/catch/finally` — основной механизм обработки ошибок
- В `catch` проверяйте тип ошибки через `instanceof`
- Выбрасывайте `new Error()` или свои классы-наследники — не строки
- В async/await используйте `try/catch`, в промисах — `.catch()`
- Не глотайте ошибки молча — хотя бы логируйте
