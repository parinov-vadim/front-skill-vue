---
title: "Fetch API в JavaScript: GET, POST, PUT, DELETE и загрузка файлов"
description: "Fetch API в JavaScript — HTTP-запросы GET, POST, PUT, DELETE, работа с JSON, заголовки, обработка ошибок, загрузка файлов и FormData."
section: javascript
difficulty: intermediate
readTime: 11
order: 21
tags: [fetch, API, HTTP, GET, POST, PUT, DELETE, JSON, FormData, запрос, JavaScript]
---

## Базовый GET-запрос

```js
const response = await fetch('https://api.example.com/users')
const users = await response.json()
```

`fetch` возвращает Promise с объектом `Response`. Чтобы получить данные, нужно вызвать `.json()`, `.text()` или другой метод.

### Обработка ответа

```js
const response = await fetch('https://api.example.com/users')

// Проверить статус
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
}

const users = await response.json()
```

`response.ok` — `true` при статусах 200–299. `fetch` **не выбрасывает ошибку** при 404 или 500 — он считает это нормальным ответом. Ошибка будет только при проблеме сети.

### Методы чтения ответа

```js
response.json()       // → объект (из JSON)
response.text()       // → строка
response.blob()       // → Blob (файлы, изображения)
response.arrayBuffer() // → ArrayBuffer (бинарные данные)
response.formData()   // → FormData
```

## Полный синтаксис

```js
const response = await fetch(url, {
  method: 'GET',              // HTTP-метод
  headers: {                  // заголовки
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data), // тело запроса (не для GET/HEAD)
})
```

## POST — создать ресурс

```js
async function createUser(user) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status}`)
  }

  return response.json()
}

const newUser = await createUser({ name: 'Анна', age: 25 })
```

## PUT — обновить ресурс целиком

```js
async function updateUser(id, data) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  return response.json()
}

await updateUser(1, { name: 'Анна', age: 26 })
```

## PATCH — частичное обновление

```js
async function patchUser(id, changes) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })

  return response.json()
}

await patchUser(1, { age: 27 }) // меняется только age
```

## DELETE — удалить ресурс

```js
async function deleteUser(id) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Не удалось удалить: ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}
```

## Заголовки

### Отправка заголовков

```js
const response = await fetch('/api/users', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9...',
    'Accept': 'application/json',
  },
})
```

### Чтение заголовков ответа

```js
const response = await fetch('/api/users')

response.headers.get('content-type') // 'application/json; charset=utf-8'
response.headers.get('x-total-count') // '42'

for (const [key, value] of response.headers) {
  console.log(`${key}: ${value}`)
}
```

## Обработка ошибок

```js
async function fetchUsers() {
  try {
    const response = await fetch('/api/users')

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('Нет подключения к сети')
    }
    throw error
  }
}
```

## Загрузка файлов с FormData

`FormData` автоматически устанавливает заголовок `Content-Type: multipart/form-data`:

```js
async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('description', 'Фото профиля')

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // НЕ ставьте Content-Type вручную — браузер сам добавит с boundary
  })

  return response.json()
}

// Использование
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', async () => {
  const result = await uploadFile(input.files[0])
  console.log('Загружено:', result.url)
})
```

Несколько файлов:

```js
async function uploadFiles(files) {
  const formData = new FormData()

  for (const file of files) {
    formData.append('files', file)
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  return response.json()
}
```

## Скачивание файлов

```js
async function downloadFile(url, filename) {
  const response = await fetch(url)
  const blob = await response.blob()

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  URL.revokeObjectURL(link.href)
}
```

## Таймаут запроса

`fetch` не имеет встроенного таймаута. Используйте `AbortController`:

```js
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Таймаут: запрос длился дольше ${timeoutMs} мс`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
```

## Отмена запроса

```js
const controller = new AbortController()

fetch('/api/users', { signal: controller.signal })
  .then(r => r.json())
  .then(console.log)
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Запрос отменён')
    }
  })

// Отменить (например, при размонтировании компонента)
controller.abort()
```

## Отслеживание прогресса загрузки

`fetch` не поддерживает прогресс. Для этого используйте `XMLHttpRequest`:

```js
function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => resolve(JSON.parse(xhr.responseText)))
    xhr.addEventListener('error', () => reject(new Error('Ошибка загрузки')))
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
```

## Повторная попытка (retry)

```js
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      if (attempt === retries) throw error
      const delay = Math.min(1000 * 2 ** attempt, 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

## Полезная обёртка

```js
class ApiClient {
  constructor(baseURL, defaultHeaders = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = defaultHeaders
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (response.status === 204) return null
    return response.json()
  }

  get(endpoint) {
    return this.request(endpoint)
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

const api = new ApiClient('/api', {
  Authorization: `Bearer ${getToken()}`,
})

const users = await api.get('/users')
await api.post('/users', { name: 'Анна' })
await api.delete('/users/1')
```

## Итог

- `fetch(url, options)` — современный способ делать HTTP-запросы
- `response.ok` — проверка успешности (200–299), `fetch` не бросает ошибку при 404/500
- `JSON.stringify()` для отправки, `response.json()` для чтения
- `FormData` для загрузки файлов — не ставьте `Content-Type` вручную
- `AbortController` — для таймаута и отмены запросов
- Для прогресса загрузки — `XMLHttpRequest`
