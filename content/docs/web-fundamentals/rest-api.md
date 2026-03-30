---
title: "REST API: принципы, проектирование, лучшие практики"
description: "REST API для фронтенд-разработчика: принципы REST, проектирование эндпоинтов, CRUD-операции, пагинация, фильтрация, версионирование и работа с API."
section: web-fundamentals
difficulty: intermediate
readTime: 15
order: 2
tags: [rest, api, http, crud, backend, endpoints]
---

## Что такое REST API

REST (Representational State Transfer) — это стиль архитектуры для создания веб-API. RESTful API — это API, которое следует принципам REST. Важно: REST — это не протокол и не стандарт, а набор рекомендаций.

RESTful API использует HTTP как есть:
- Ресурсы идентифицируются URL (`/users`, `/posts/1`)
- Действия — HTTP-методами (`GET`, `POST`, `PUT`, `DELETE`)
- Данные — в формате JSON

Пример REST API для блога:
```
GET    /posts              → Получить все посты
GET    /posts/1            → Получить пост с ID 1
POST   /posts              → Создать новый пост
PUT    /posts/1            → Заменить пост с ID 1
PATCH  /posts/1            → Обновить пост с ID 1 частично
DELETE /posts/1            → Удалить пост с ID 1
GET    /posts/1/comments   → Комментарии к посту 1
```

## Принципы REST

### 1. Ресурсы, а не действия

URL должен обозначать ресурс (существительное), а не действие (глагол). Действие определяется HTTP-методом.

Плохо:
```
POST /createUser
POST /deleteUser
GET  /getUsers
POST /updateUserEmail
```

Хорошо:
```
POST   /users
DELETE /users/1
GET    /users
PATCH  /users/1
```

### 2. Единообразный интерфейс

Одни и те же HTTP-методы означают одно и то же для всех ресурсов:
- `GET` — чтение
- `POST` — создание
- `PUT` / `PATCH` — обновление
- `DELETE` — удаление

### 3. Stateless

Каждый запрос содержит всю информацию для обработки. Сервер не хранит состояние между запросами (сессии — вне REST, но обычно используются).

### 4. Иерархия ресурсов

Вложенные ресурсы через путь:
```
/users/1/posts                    → Посты пользователя 1
/users/1/posts/5                  → Пост 5 пользователя 1
/users/1/posts/5/comments         → Комментарии к посту 5
```

Не больше 2–3 уровней вложенности. Если глубже — лучше использовать query-параметры:
```
/comments?user_id=1&post_id=5
```

## CRUD-операции

CRUD (Create, Read, Update, Delete) — четыре базовых операции.

### Create — POST

```ts
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Анна',
    email: 'anna@example.com',
    role: 'developer',
  }),
})

const user = await response.json()
// { id: 42, name: 'Анна', email: 'anna@example.com', role: 'developer', created_at: '...' }
```

Статус-код: `201 Created`
Ответ: созданный ресурс с `id`

### Read — GET

```ts
const response = await fetch('/api/users/42', {
  headers: { 'Authorization': `Bearer ${token}` },
})

const user = await response.json()
// { id: 42, name: 'Анна', email: 'anna@example.com' }
```

Статус-код: `200 OK`
Статус-код (не найден): `404 Not Found`

### Update — PUT / PATCH

**PUT** (полная замена):
```ts
const response = await fetch('/api/users/42', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Анна Иванова',
    email: 'anna@new.com',
    role: 'senior',
  }),
})
```

**PATCH** (частичное обновление):
```ts
const response = await fetch('/api/users/42', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'senior' }),
})
```

Статус-код: `200 OK` (обновлённый ресурс) или `204 No Content` (без тела)

### Delete — DELETE

```ts
await fetch('/api/users/42', { method: 'DELETE' })
```

Статус-код: `204 No Content` или `200 OK` (с подтверждением)

## Пагинация

Когда ресурсов тысячи, нельзя отдавать всё одним запросом.

### Offset-пагинация

```
GET /api/users?page=2&limit=20
```

Ответ:
```json
{
  "data": [
    { "id": 21, "name": "..." },
    { "id": 22, "name": "..." }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

Проблема: при добавлении новых записей между запросами offset может сдвинуться (дубли или пропуски).

### Cursor-пагинация

```
GET /api/users?cursor=eyJpZCI6MjB9&limit=20
```

Ответ:
```json
{
  "data": [...],
  "next_cursor": "eyJpZCI6NDB9",
  "has_more": true
}
```

Cursor = идентификатор последнего элемента. Нет проблем с дублированием. Используется в Twitter, Facebook, Slack API.

## Фильтрация и сортировка

### Фильтрация через query-параметры

```
GET /api/users?role=developer&status=active
GET /api/posts?created_after=2025-01-01&author_id=5
GET /api/products?price_min=100&price_max=500&category=electronics
```

### Сортировка

```
GET /api/users?sort=created_at&order=desc
GET /api/posts?sort=-created_at,title
```

Конвенция с `-` для desc: `sort=-created_at` = по дате убывания.

### Поиск

```
GET /api/users?search=anna
GET /api/posts?q=vue+typescript
```

### Поля (sparse fieldsets)

```
GET /api/users?fields=id,name,email
```

Возвращает только указанные поля — экономит трафик.

## Версионирование API

API меняется со временем. Версионирование позволяет не ломать существующих клиентов.

### URL-версионирование (самое простое)

```
GET /api/v1/users
GET /api/v2/users
```

### Header-версионирование

```
GET /api/users
Accept: application/vnd.myapi.v2+json
```

### Query-параметр

```
GET /api/users?version=2
```

Рекомендация: **URL-версионирование** (`/v1/`, `/v2/`) — самое понятное.

## Формат ответа

### Успешный ответ ( единообразная обёртка)

```json
{
  "data": { ... },
  "message": "User created successfully"
}
```

Для списков:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

### Ошибка

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "email", "message": "Email is required" },
      { "field": "name", "message": "Name must be at least 2 characters" }
    ]
  }
}
```

## Авторизация

### Bearer Token (JWT)

```ts
const token = localStorage.getItem('token')

const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

### API Key

```ts
const response = await fetch('/api/data', {
  headers: {
    'X-API-Key': 'abc123def456',
  },
})
```

## Обработка ошибок на фронтенде

```ts
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Array<{ field: string; message: string }>,
  ) {
    super(message)
  }
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json()
    throw new ApiError(
      response.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? 'Unknown error',
      body.error?.details,
    )
  }

  return response.json()
}

// Использование
try {
  const users = await api<User[]>('/users')
  const user = await api<User>('/users/1')
  const newUser = await api<User>('/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'Анна' }),
  })
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      error.details?.forEach((d) => {
        console.error(`${d.field}: ${d.message}`)
      })
    }
  }
}
```

## Пример: полноценный API-клиент

```ts
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(),
        ...options?.headers,
      },
    })

    if (response.status === 204) return undefined as T

    if (!response.ok) {
      const error = await response.json()
      throw new ApiError(response.status, error.code, error.message)
    }

    return response.json()
  }

  private authHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  get<T>(url: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<T>(url + query)
  }

  post<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'POST', body: JSON.stringify(body) })
  }

  put<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'PUT', body: JSON.stringify(body) })
  }

  patch<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'PATCH', body: JSON.stringify(body) })
  }

  delete(url: string) {
    return this.request<void>(url, { method: 'DELETE' })
  }
}

const api = new ApiClient('/api')

// Использование
const users = await api.get<User[]>('/users', { page: '1', limit: '20' })
const user = await api.post<User>('/users', { name: 'Анна', email: 'anna@test.com' })
await api.patch(`/users/${user.id}`, { name: 'Анна Иванова' })
await api.delete(`/users/${user.id}`)
```

## Best Practices

### URL
- Существительные во множественном числе: `/users`, `/posts`
- Строчные буквы, дефисы: `/user-profiles`, не `/userProfiles`
- Вложенность до 2 уровней: `/users/1/posts`
- ID в пути: `/users/42`

### Ответы
- `200` для GET, PUT, PATCH
- `201` для POST (создание)
- `204` для DELETE
- `422` для ошибок валидации
- Единообразная структура JSON-ответа

### Безопасность
- HTTPS обязательно
- Авторизация через Bearer Token
- Rate limiting для защиты от DDoS
- Валидация на сервере (не только на клиенте)

### Документация
- Swagger/OpenAPI — стандарт описания REST API
- Примеры запросов и ответов
- Описание всех статус-кодов

## Итог

- **REST API** использует HTTP-методы для CRUD-операций над ресурсами
- URL = ресурс (существительное), метод = действие
- **GET** — читать, **POST** — создавать, **PUT/PATCH** — обновлять, **DELETE** — удалять
- Пагинация, фильтрация и сортировка через query-параметры
- Версионирование через `/v1/`, `/v2/` в URL
- Создайте API-клиент с единообразной обработкой ошибок
- Документируйте API через Swagger/OpenAPI
