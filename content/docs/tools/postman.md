---
title: "Postman / Insomnia: тестирование REST API"
description: "Инструменты для тестирования REST API: Postman и Insomnia. Создание запросов, коллекции, переменные окружения, авторизация, автотесты и моки."
section: tools
difficulty: beginner
readTime: 12
order: 7
tags: [postman, insomnia, api, rest, testing, http]
---

## Зачем нужны API-клиенты

Когда вы пишете фронтенд, вам нужно работать с API бэкенда: получать пользователей, создавать посты, загружать файлы. Прежде чем писать код, полезно проверить API вручную — убедиться, что эндпоинт работает, понять формат ответа, протестировать ошибки.

API-клиенты позволяют:
- Отправлять HTTP-запросы без написания кода
- Сохранять запросы в коллекции
- Автоматизировать тестирование
- Делиться коллекциями с командой

Два самых популярных: **Postman** и **Insomnia**.

## HTTP-запрос: что нужно знать

Любой HTTP-запрос состоит из:
- **Метод** — GET, POST, PUT, PATCH, DELETE
- **URL** — адрес эндпоинта
- **Headers** — заголовки (Content-Type, Authorization)
- **Body** — тело запроса (JSON, form-data)
- **Query params** — параметры запроса (`?page=1&limit=10`)

Ответ сервера:
- **Status** — 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404, 500
- **Headers** — Content-Type, Set-Cookie
- **Body** — данные (обычно JSON)

## Postman

Postman — самый популярный API-клиент. Бесплатный для небольших команд (до 3 человек).

### Создание запроса

1. Нажмите **New** → **HTTP Request**
2. Выберите метод (GET, POST...)
3. Введите URL
4. При необходимости добавьте Headers, Body, Params
5. Нажмите **Send**

### GET-запрос

```
GET https://jsonplaceholder.typicode.com/users
```

Ответ:
```json
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "email": "Sincere@april.biz",
    "company": { "name": "Romaguera-Crona" }
  }
]
```

### POST-запрос

**Body → raw → JSON:**
```json
{
  "title": "Мой пост",
  "body": "Текст поста",
  "userId": 1
}
```

**Headers:**
```
Content-Type: application/json
```

### Query Parameters

Вкладка **Params**:

| Key | Value |
|---|---|
| page | 1 |
| limit | 10 |
| sort | created_at |

Результат: `GET /posts?page=1&limit=10&sort=created_at`

### Headers

Вкладка **Headers**:

| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer eyJhbGciOiJIUzI1NiJ9... |
| Accept | application/json |

### Авторизация

Вкладка **Authorization**:

**Bearer Token:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Basic Auth:**
```
Username: admin
Password: secret123
```

**API Key:**
```
Key: X-API-Key
Value: abc123def456
Add to: Header
```

**OAuth 2.0** — Postman сам получает токен по flow (Authorization Code, Client Credentials).

### Переменные окружения

Чтобы не менять URL при переключении между dev и production:

1. Создайте Environment: `Dev` и `Prod`
2. Добавьте переменные:

| Variable | Dev | Prod |
|---|---|---|
| `base_url` | `http://localhost:8080` | `https://api.myapp.com` |
| `token` | `dev-token-123` | `prod-token-456` |

3. В запросе используйте: `{{base_url}}/users`
4. Переключайте окружение в выпадающем списке

### Коллекции

Коллекция — группа связанных запросов. Пример структуры:

```
API проекта
  ├── Auth
  │   ├── POST Login
  │   ├── POST Register
  │   └── POST Refresh Token
  ├── Users
  │   ├── GET List Users
  │   ├── GET User by ID
  │   ├── PUT Update User
  │   └── DELETE User
  ├── Posts
  │   ├── GET List Posts
  │   ├── POST Create Post
  │   └── POST Upload Image
  └── Comments
      ├── GET List Comments
      └── POST Create Comment
```

### Скрипты (Tests)

Postman позволяет писать JS-скрипты для автоматизации.

**Pre-request Script** (выполняется до запроса):

```js
const timestamp = Date.now()
pm.environment.set('timestamp', timestamp)
```

**Tests** (выполняется после запроса):

```js
pm.test('Status is 200', () => {
  pm.response.to.have.status(200)
})

pm.test('Response has users array', () => {
  const json = pm.response.json()
  pm.expect(json).to.be.an('array')
  pm.expect(json.length).to.be.above(0)
})

pm.test('User has required fields', () => {
  const json = pm.response.json()
  const user = json[0]
  pm.expect(user).to.have.property('id')
  pm.expect(user).to.have.property('name')
  pm.expect(user).to.have.property('email')
})

// Автосохранение токена
if (pm.response.code === 200) {
  const json = pm.response.json()
  pm.environment.set('token', json.token)
}
```

### Runner —批量-запуск

Collection Runner запускает все запросы коллекции по порядку, выполняя скрипты. Полезно для:
- Проверки всех эндпоинтов после деплоя
- Регрессионного тестирования
- Данных для демонстрации

### Работа с файлами

**Upload file** (POST):

Body → form-data:
| Key | Type | Value |
|---|---|---|
| file | File | (выбрать файл) |
| title | Text | Мое изображение |

**Download file:**

Send and Download вместо Send — сохраняет ответ как файл.

### Mock Server

Postman умеет создавать Mock API — возвращает заданные ответы без реального бэкенда. Полезно, когда бэкенд ещё не готов.

1. Создайте Mock Server
2. Добавьте эндпоинты с ответами
3. Используйте URL Mock Server в фронтенд-коде

### Генерация кода

Любой запрос можно превратить в код: `</>` (Code) справа:

```js
// fetch
const response = await fetch('https://api.example.com/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json',
  },
})
const data = await response.json()
```

Поддерживаемые языки: fetch, axios, XMLHttpRequest, cURL, Python, Java, Go.

## Insomnia

Insomnia — альтернатива Postman, более лёгкая и простая. Open-source (базовая версия).

### Преимущества перед Postman

| Критерий | Postman | Insomnia |
|---|---|---|
| Вес | Тяжёлый (Electron) | Легче |
| Интерфейс | Сложный, много функций | Простой и чистый |
| Git-синхронизация | Через облачный аккаунт | Можно хранить файлы в Git |
| Open source | Нет | Да (базовая версия) |
| GraphQL | Поддерживает | Отличная поддержка |
| gRPC | Плагин | Встроено |

### Создание запроса

1. Нажмите **+** → **New Request**
2. Выберите метод и введите URL
3. Вкладки: Params, Headers, Body, Auth
4. Нажмите **Send**

### Body

**JSON:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Form URL Encoded:**
| Key | Value |
|---|---|
| grant_type | password |
| username | admin |
| password | secret |

### Переменные

В Insomnia переменные хранятся в «Environments»:

```json
{
  "base_url": "http://localhost:8080",
  "token": ""
}
```

Использование: `{{ base_url }}/api/users`

### Document Format (Git-friendly)

Insomnia сохраняет коллекции в формате `.yaml` или `.json` — можно коммитить в Git:

```yaml
# insomnia.yaml
type: collection.insomnia.rest/5.0
name: My API
requests:
  - name: Get Users
    method: GET
    url: "{{ base_url }}/users"
    headers:
      - name: Authorization
        value: "Bearer {{ token }}"
```

### GraphQL

Insomnia имеет отличную поддержку GraphQL:
- Автодополнение на основе схемы (schema)
- Explorer для построения запросов кликами
- Подписки (subscriptions) через WebSocket

```graphql
query GetUsers {
  users(limit: 10) {
    id
    name
    email
    posts {
      title
    }
  }
}
```

## Пример: полный флоу авторизации

### Postman

1. **POST {{base_url}}/auth/register**
   ```json
   { "email": "test@example.com", "password": "password123", "name": "Тест" }
   ```

2. **POST {{base_url}}/auth/login** → Tests:
   ```js
   const json = pm.response.json()
   pm.environment.set('token', json.access_token)
   pm.environment.set('refresh_token', json.refresh_token)
   ```

3. **GET {{base_url}}/users/me**
   Headers: `Authorization: Bearer {{token}}`

4. **POST {{base_url}}/auth/refresh**
   ```json
   { "refreshToken": "{{refresh_token}}" }
   ```

### Insomnia

Аналогичный флоу, но переменная `token` обновляется через «Response Tag» — автоматически извлекается из ответа.

## Сравнение: что выбрать

| Ситуация | Выбор |
|---|---|
| Большая команда, Sharing | **Postman** — работаspaces, синхронизация |
| Личная разработка | **Insomnia** — проще, легче |
| GraphQL-проект | **Insomnia** — лучше UX |
| Автоматизация тестов | **Postman** — мощнее Runner |
| Нужно хранить в Git | **Insomnia** — YAML-формат |
| Mock Server | **Postman** — встроен |

Также существуют альтернативы:
- **VS Code Thunder Client** — API-клиент прямо в редакторе
- **HTTPie** — CLI-клиент с простым синтаксисом
- **curl** — стандартная утилита командной строки

## curl — для терминала

Когда нет GUI под рукой:

```bash
# GET
curl https://api.example.com/users

# POST с JSON
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name": "Иван", "email": "ivan@example.com"}'

# Скрасивым выводом (jq)
curl -s https://api.example.com/users | jq '.[0].name'

# Скачать файл
curl -O https://example.com/file.zip

# Только заголовки
curl -I https://example.com
```

## Итог

- API-клиенты нужны для ручной проверки эндпоинтов перед написанием кода
- **Postman** — мощный, с коллекциями, автотестами, Mock Server
- **Insomnia** — лёгкий, с отличной поддержкой GraphQL, Git-friendly
- Обязательно используйте environments для переключения между dev и production
- Сохраняйте запросы в коллекции — это документация вашего API
- Для быстрых проверок в терминале используйте `curl`
