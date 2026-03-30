---
title: Промисы и async/await
description: Promise — объект для работы с асинхронными операциями. async/await — синтаксический сахар для удобной работы с промисами.
section: javascript
difficulty: intermediate
readTime: 12
order: 5
tags: [Promise, async, await, asynchronous]
---

## Проблема callback-ов

До появления промисов асинхронный код писался через callback-и, что приводило к «callback hell»:

```js
getData(function (data) {
  processData(data, function (result) {
    saveResult(result, function (saved) {
      notifyUser(saved, function (notification) {
        // Ещё глубже...
      })
    })
  })
})
```

## Что такое Promise?

**Promise** — объект, представляющий результат асинхронной операции. Он может находиться в одном из трёх состояний:

| Состояние | Описание |
|-----------|----------|
| `pending` | Ожидание — операция ещё выполняется |
| `fulfilled` | Выполнен успешно — есть результат |
| `rejected` | Отклонён — есть ошибка |

```js
const promise = new Promise((resolve, reject) => {
  // Асинхронная операция
  setTimeout(() => {
    const success = true
    if (success) {
      resolve('Данные получены')
    } else {
      reject(new Error('Что-то пошло не так'))
    }
  }, 1000)
})

promise
  .then((data) => console.log(data))    // 'Данные получены'
  .catch((err) => console.error(err))
  .finally(() => console.log('Готово')) // выполняется всегда
```

## Цепочки промисов

`.then()` возвращает новый промис, что позволяет строить цепочки:

```js
fetch('/api/user/1')
  .then((response) => response.json())
  .then((user) => fetch(`/api/posts?userId=${user.id}`))
  .then((response) => response.json())
  .then((posts) => console.log(posts))
  .catch((err) => console.error('Ошибка:', err))
```

## async/await

`async/await` — синтаксический сахар над промисами. Позволяет писать асинхронный код в синхронном стиле.

```js
// Функция с async всегда возвращает Promise
async function fetchUserPosts(userId) {
  try {
    const response = await fetch(`/api/user/${userId}`)
    const user = await response.json()

    const postsResponse = await fetch(`/api/posts?userId=${user.id}`)
    const posts = await postsResponse.json()

    return posts
  } catch (err) {
    console.error('Ошибка:', err)
    throw err
  }
}

// Вызов
fetchUserPosts(1).then((posts) => console.log(posts))

// Или внутри другой async функции:
const posts = await fetchUserPosts(1)
```

## Параллельное выполнение

### Promise.all — все или ничего

```js
const [users, products, orders] = await Promise.all([
  fetch('/api/users').then((r) => r.json()),
  fetch('/api/products').then((r) => r.json()),
  fetch('/api/orders').then((r) => r.json()),
])
// Отклоняется если хотя бы один промис отклонён
```

### Promise.allSettled — все результаты

```js
const results = await Promise.allSettled([
  fetch('/api/users').then((r) => r.json()),
  fetch('/api/broken-endpoint'),
])

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('Успех:', result.value)
  } else {
    console.log('Ошибка:', result.reason)
  }
})
```

### Promise.race — первый выигрывает

```js
// Таймаут для запроса
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), 5000)
)

const data = await Promise.race([
  fetch('/api/data').then((r) => r.json()),
  timeout,
])
```

### Promise.any — первый успешный

```js
// Попробовать несколько зеркал
const data = await Promise.any([
  fetch('https://mirror1.com/data'),
  fetch('https://mirror2.com/data'),
  fetch('https://mirror3.com/data'),
])
// Разрешается первым успешным, игнорирует ошибки
```

## Обработка ошибок

```js
// Вариант 1: try/catch
async function loadData() {
  try {
    const data = await riskyOperation()
    return data
  } catch (err) {
    if (err instanceof NetworkError) {
      // Специфичная обработка
    }
    throw err // Пробросить дальше
  }
}

// Вариант 2: .catch() в цепочке
const data = await riskyOperation().catch(() => defaultValue)
```

## Типичные ошибки

```js
// ❌ Забыть await — промис не ждётся
async function bad() {
  const data = fetchData()  // data — Promise, не данные!
  console.log(data)
}

// ✅ Правильно
async function good() {
  const data = await fetchData()
  console.log(data)
}

// ❌ Последовательно там, где можно параллельно
async function slow() {
  const users = await fetchUsers()     // ждём...
  const posts = await fetchPosts()     // потом ждём...
}

// ✅ Параллельно
async function fast() {
  const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()])
}
```

## Создание промисов из callback-API

```js
// Оборачиваем Node.js readFile в промис
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

// Или используем util.promisify
const readFile = util.promisify(fs.readFile)
const content = await readFile('file.txt', 'utf8')
```
