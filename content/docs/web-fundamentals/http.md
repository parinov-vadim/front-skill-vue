---
title: "HTTP/HTTPS: методы, статус-коды, заголовки"
description: "Протокол HTTP для фронтендера: методы GET, POST, PUT, DELETE, PATCH, статус-коды, заголовки, HTTPS, HTTP/2 и HTTP/3, кэширование."
section: web-fundamentals
difficulty: beginner
readTime: 15
order: 1
tags: [http, https, rest, status-codes, headers, network]
---

## Что такое HTTP

HTTP (HyperText Transfer Protocol) — протокол передачи данных, на котором работает весь веб. Когда вы открываете сайт, браузер отправляет HTTP-запрос на сервер, а сервер возвращает HTTP-ответ.

Каждый HTTP-обмен состоит из двух частей:
1. **Запрос (Request)** — от клиента (браузера) к серверу
2. **Ответ (Response)** — от сервера к клиенту

```
Клиент (браузер)                    Сервер
    │                                  │
    │  GET /users HTTP/1.1             │
    │  Host: api.example.com           │
    │  ──────────────────────────────► │
    │                                  │
    │  HTTP/1.1 200 OK                 │
    │  Content-Type: application/json  │
    │  ◄────────────────────────────── │
    │                                  │
```

## Структура HTTP-запроса

```
GET /api/users?page=1&limit=10 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Content-Type: application/json
Accept: application/json
```

Части запроса:
- **Метод** — `GET`
- **URL** — `/api/users?page=1&limit=10`
- **Версия протокола** — `HTTP/1.1`
- **Заголовки** — метаданные (Host, Authorization, Content-Type)
- **Тело** — данные (у GET тела нет, у POST — JSON)

## HTTP-методы

Метод указывает, какое действие нужно выполнить с ресурсом.

### GET — получить данные

```js
const response = await fetch('/api/users?page=1')
const users = await response.json()
```

Особенности:
- Не имеет тела запроса
- Параметры передаются в URL (query string)
- Безопасный — не меняет данные на сервере
- Идемпотентный — повторный запрос даёт тот же результат
- Можно кэшировать

### POST — создать данные

```js
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Анна', email: 'anna@example.com' }),
})
const newUser = await response.json()
```

Особенности:
- Имеет тело запроса (JSON, form-data, plain text)
- Не идемпотентный — два POST создадут две записи
- Не кэшируется

### PUT — заменить данные целиком

```js
const response = await fetch('/api/users/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Анна Иванова', email: 'anna@new.com', age: 25 }),
})
```

Особенности:
- Заменяет ресурс целиком (все поля)
- Идемпотентный — повторный PUT с теми же данными не меняет состояние

### PATCH — частичное обновление

```js
const response = await fetch('/api/users/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'anna@new.com' }),
})
```

Особенности:
- Обновляет только переданные поля
- Часто используется вместо PUT

### DELETE — удалить данные

```js
await fetch('/api/users/1', { method: 'DELETE' })
```

Идемпотентный — удаление уже удалённого ресурса возвращает 404, но состояние не меняется.

### Сравнение методов

| Метод | Действие | Тело запроса | Идемпотентный | Безопасный |
|---|---|---|---|---|
| GET | Получить | Нет | Да | Да |
| POST | Создать | Да | Нет | Нет |
| PUT | Заменить | Да | Да | Нет |
| PATCH | Обновить частично | Да | Нет* | Нет |
| DELETE | Удалить | Нет/Да | Да | Нет |

\* PATCH теоретически не идемпотентный, но на практике часто реализуют как идемпотентный.

### Другие методы

- **HEAD** — как GET, но без тела ответа (только заголовки). Проверить существует ли ресурс
- **OPTIONS** — какие методы поддерживаются (используется в CORS preflight)
- **TRACE** — диагностический (обычно отключен на серверах)

## Статус-коды

Статус-код — трёхзначное число в ответе сервера. Показывает результат обработки запроса.

### 1xx — Informational

Редко встречаются. `100 Continue` — сервер готов принять тело запроса.

### 2xx — Success

| Код | Значение | Когда использовать |
|---|---|---|
| `200` | OK | Успешный GET, PUT, PATCH |
| `201` | Created | Успешный POST (ресурс создан) |
| `204` | No Content | Успешный DELETE (нет тела ответа) |
| `206` | Partial Content | Частичное содержимое (Range-запросы) |

### 3xx — Redirection

| Код | Значение | Когда использовать |
|---|---|---|
| `301` | Moved Permanently | Ресурс навсегда перемещён (SEO-редирект) |
| `302` | Found | Временный редирект |
| `304` | Not Modified | Кэш валиден, не нужно скачивать снова |
| `307` | Temporary Redirect | Временный редирект (сохраняет метод) |
| `308` | Permanent Redirect | Постоянный редирект (сохраняет метод) |

### 4xx — Client Error

| Код | Значение | Причина |
|---|---|---|
| `400` | Bad Request | Неверный формат запроса |
| `401` | Unauthorized | Не авторизован (нет токена) |
| `403` | Forbidden | Нет прав доступа |
| `404` | Not Found | Ресурс не найден |
| `405` | Method Not Allowed | Метод не поддерживается |
| `408` | Request Timeout | Таймаут запроса |
| `409` | Conflict | Конфликт (дубликат email) |
| `422` | Unprocessable Entity | Ошибка валидации данных |
| `429` | Too Many Requests | Превышен лимит запросов (rate limit) |

### 5xx — Server Error

| Код | Значение | Причина |
|---|---|---|
| `500` | Internal Server Error | Ошибка на сервере |
| `502` | Bad Gateway | Сервер-посредник получил неверный ответ |
| `503` | Service Unavailable | Сервер перегружен / на обслуживании |
| `504` | Gateway Timeout | Таймаут при обращении к другому серверу |

### Как обрабатывать статус-коды

```ts
async function fetchUsers() {
  const response = await fetch('/api/users')

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error('Необходима авторизация')
      case 403:
        throw new Error('Нет доступа')
      case 404:
        throw new Error('Пользователи не найдены')
      case 429:
        throw new Error('Слишком много запросов')
      default:
        throw new Error(`Ошибка сервера: ${response.status}`)
    }
  }

  return response.json()
}
```

## HTTP-заголовки

Заголовки — метаданные запроса и ответа. Формат: `Имя: Значение`.

### Заголовки запроса (Request Headers)

| Заголовок | Описание | Пример |
|---|---|---|
| `Host` | Домен сервера | `api.example.com` |
| `User-Agent` | Информация о клиенте | `Mozilla/5.0 (Macintosh; ...)` |
| `Accept` | Ожидаемый формат ответа | `application/json` |
| `Content-Type` | Формат тела запроса | `application/json` |
| `Authorization` | Данные авторизации | `Bearer eyJhbGci...` |
| `Cookie` | Куки для домена | `session_id=abc123` |
| `Referer` | URL предыдущей страницы | `https://example.com/page` |
| `Origin` | Источник запроса (для CORS) | `https://example.com` |
| `Cache-Control` | Настройки кэширования | `no-cache` |
| `If-None-Match` | Условный запрос (ETag) | `"abc123"` |

### Заголовки ответа (Response Headers)

| Заголовок | Описание | Пример |
|---|---|---|
| `Content-Type` | Формат тела ответа | `application/json; charset=utf-8` |
| `Content-Length` | Размер тела в байтах | `1234` |
| `Set-Cookie` | Установить куку | `session=abc; HttpOnly; Secure` |
| `Cache-Control` | Как кэшировать | `max-age=3600, public` |
| `ETag` | Идентификатор версии | `"abc123"` |
| `Location` | URL для редиректа | `https://example.com/new` |
| `Access-Control-Allow-Origin` | CORS | `https://example.com` |
| `X-Request-Id` | Идентификатор запроса | `req-abc-123` |
| `Content-Security-Policy` | CSP | `default-src 'self'` |
| `Strict-Transport-Security` | HSTS | `max-age=31536000` |

### Content-Type — типы содержимого

```
application/json                      → JSON
application/x-www-form-urlencoded     → Форма (default HTML form)
multipart/form-data                   → Загрузка файлов
text/html                             → HTML
text/css                              → CSS
text/plain                            → Простой текст
application/xml                       → XML
application/octet-stream              → Бинарные данные
```

## HTTPS

HTTPS = HTTP + TLS (шифрование). Данные между браузером и сервером зашифрованы — злоумышленник не может перехватить пароли и токены.

### Как работает TLS

1. Браузер подключается к серверу по порту 443
2. TLS-handshake: обмен ключами, проверка сертификата
3. Устанавливается зашифрованное соединение
4. Данные передаются в зашифрованном виде

### Сертификаты

SSL/TLS-сертификат подтверждает, что сервер — тот, за кого себя выдаёт. Выпускается Certificate Authority (CA):
- **Let's Encrypt** — бесплатный, автоматический
- **Cloudflare** — бесплатный с CDN
- Платные: DigiCert, Sectigo, GlobalSign

Сегодня все сайты должны использовать HTTPS. Google помечает HTTP-сайты как «Не защищено» и понижает их в поисковой выдаче.

## HTTP/2 и HTTP/3

### HTTP/1.1

- Один запрос за раз на одно TCP-соединение (или 6 параллельных)
- Заголовки передаются как текст (избыточно)
- Head-of-line blocking — медленный запрос блокирует последующие

### HTTP/2

- **Multiplexing** — множество запросов по одному соединению
- **Бинарный протокол** — эффективнее текстового
- **Сжатие заголовков** (HPACK)
- **Server Push** — сервер может отправить ресурсы проактивно
- **Приоритизация** — важные ресурсы загружаются первыми

Поддерживается всеми современными браузерами. Nginx и Cloudflare включают HTTP/2 по умолчанию.

### HTTP/3 (QUIC)

- На базе UDP вместо TCP
- Нет head-of-line blocking на уровне транспорта
- Быстрое установление соединения (0-RTT)
- Лучшая работа при потере пакетов

Google, Cloudflare и Facebook уже используют HTTP/3.

## Кэширование

### Cache-Control

```http
Cache-Control: max-age=3600, public          # Кэшировать на 1 час
Cache-Control: no-cache                       # Всегда проверять (revalidate)
Cache-Control: no-store                       # Не кэшировать вообще
Cache-Control: private                        # Только для одного пользователя
Cache-Control: public                         # Для всех (CDN тоже)
```

### ETag

Сервер возвращает `ETag: "abc123"`. При следующем запросе браузер отправляет `If-None-Match: "abc123"`. Если данные не изменились, сервер возвращает `304 Not Modified` без тела — экономит трафик.

### Last-Modified

Аналогично ETag, но по дате:
```http
Last-Modified: Mon, 15 Jan 2025 10:00:00 GMT
If-Modified-Since: Mon, 15 Jan 2025 10:00:00 GMT
```

### Паттерн кэширования фронтендера

```js
const response = await fetch('/api/users', {
  headers: {
    'If-None-Match': cachedETag,
  },
})

if (response.status === 304) {
  return cachedData
}

const etag = response.headers.get('ETag')
const data = await response.json()
cache.set('users', { data, etag })
return data
```

## Практические советы

### Всегда обрабатывайте ошибки

```ts
try {
  const response = await fetch('/api/users')
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return await response.json()
} catch (error) {
  if (error instanceof TypeError) {
    // Сеть недоступна
  }
  throw error
}
```

### Timeout для fetch

```ts
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

try {
  const response = await fetch('/api/users', { signal: controller.signal })
  const data = await response.json()
  return data
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('Запрос превысил таймаут 5 секунд')
  }
  throw error
} finally {
  clearTimeout(timeout)
}
```

## Итог

- **HTTP** — протокол запрос-ответ, основа веба
- **5 основных методов**: GET (получить), POST (создать), PUT (заменить), PATCH (обновить), DELETE (удалить)
- **Статус-коды**: 2xx — успех, 3xx — редирект, 4xx — ошибка клиента, 5xx — ошибка сервера
- **HTTPS обязателен** — шифрование данных через TLS
- **HTTP/2** — multiplexing, сжатие заголовков, быстрее HTTP/1.1
- **Кэширование** через `Cache-Control`, `ETag`, `Last-Modified` экономит трафик и ускоряет загрузку
