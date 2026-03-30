---
title: "CORS: что это, почему возникает, как исправить"
description: "CORS (Cross-Origin Resource Sharing) — механизм безопасности браузера. Почему возникают ошибки CORS, preflight-запросы, заголовки Access-Control-Allow-Origin и решения для фронтендера."
section: web-fundamentals
difficulty: intermediate
readTime: 12
order: 5
tags: [cors, cross-origin, security, http, headers, proxy]
---

## Что такое CORS

CORS (Cross-Origin Resource Sharing) — это механизм безопасности браузера, который контролирует, может ли веб-страница делать запросы к другому домену, порту или протоколу.

**Origin** — комбинация трёх элементов:
- **Протокол**: `http` / `https`
- **Домен**: `example.com`
- **Порт**: `3000` / `8080`

```
https://mysite.com:443     ← Origin A
https://api.mysite.com     ← Origin B (другой домен)
http://mysite.com:3000     ← Origin C (другой протокол и порт)
```

Если фронтенд на `https://mysite.com` пытается запросить `https://api.othersite.com/data` — это **cross-origin** запрос. Браузер блокирует его, если сервер явно не разрешил через CORS-заголовки.

### Важно: CORS — это ограничение браузера

CORS существует только в браузерах. `curl`, Postman, серверный код — не имеют CORS-ограничений. Если запрос работает в Postman, но не в браузере — это CORS.

## Same-Origin Policy

Same-Origin Policy (SOP) — базовое правило безопасности: скрипт на странице может читать данные только того же origin. Это предотвращает, что злой сайт `evil.com` не может прочитать ваши данные с `bank.com`.

CORS — способ **ослабить** SOP для разрешённых cross-origin запросов.

## Какие запросы подпадают под CORS

CORS проверяется для запросов, инициированных JavaScript (`fetch`, `XMLHttpRequest`).

НЕ подпадают под CORS:
- `<img src="...">`
- `<link href="...">`
- `<script src="...">`
- `<iframe src="...">` (доступ к содержимому — другой вопрос)

Подпадают:
- `fetch('https://api.other.com/data')`
- `XMLHttpRequest`
- Web Fonts (`@font-face` с другого домена)
- WebGL-текстуры
- `canvas.toDataURL()` после рисования cross-origin изображений

## Simple-запросы vs Preflight

### Simple-запросы

Запрос считается «простым», если соответствует всем условиям:
- Метод: `GET`, `HEAD`, `POST`
- Заголовки: только `Accept`, `Accept-Language`, `Content-Language`, `Content-Type` (с ограничениями)
- `Content-Type`: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`

Для простых запросов браузер добавляет заголовок `Origin` и проверяет ответ:

```
Запрос:
  GET /api/users HTTP/1.1
  Origin: https://mysite.com

Ответ (CORS OK):
  Access-Control-Allow-Origin: https://mysite.com

Ответ (CORS FAIL):
  (нет заголовка Access-Control-Allow-Origin)
```

### Preflight-запросы

Для «непростых» запросов (PUT, PATCH, DELETE, JSON Content-Type, кастомные заголовки) браузер сначала отправляет **OPTIONS**-запрос (preflight):

```
1. Preflight (браузер → сервер):
   OPTIONS /api/users HTTP/1.1
   Origin: https://mysite.com
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type, Authorization

2. Preflight ответ (сервер → браузер):
   Access-Control-Allow-Origin: https://mysite.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization
   Access-Control-Max-Age: 86400

3. Основной запрос (браузер → сервер):
   POST /api/users HTTP/1.1
   Origin: https://mysite.com
   Content-Type: application/json
   Authorization: Bearer token123
   { "name": "Анна" }

4. Основной ответ (сервер → браузер):
   Access-Control-Allow-Origin: https://mysite.com
   { "id": 1, "name": "Анна" }
```

Preflight кэшируется на время `Access-Control-Max-Age` (в секундах).

## CORS-заголовки

### Заголовки ответа сервера

| Заголовок | Описание | Пример |
|---|---|---|
| `Access-Control-Allow-Origin` | Какие origins разрешены | `https://mysite.com` или `*` |
| `Access-Control-Allow-Methods` | Разрешённые методы | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Разрешённые заголовки | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Разрешить cookies | `true` |
| `Access-Control-Max-Age` | Время кэша preflight (сек) | `86400` |
| `Access-Control-Expose-Headers` | Заголовки, доступные клиенту | `X-Total-Count` |

### Заголовки запроса клиента (preflight)

| Заголовок | Описание |
|---|---|
| `Origin` | Источник запроса |
| `Access-Control-Request-Method` | Метод основного запроса |
| `Access-Control-Request-Headers` | Заголовки основного запроса |

## Типичные ошибки CORS

### Ошибка 1: Нет заголовка Allow-Origin

```
Access to fetch at 'https://api.example.com/users' from origin 'https://mysite.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

**Причина**: сервер не вернул `Access-Control-Allow-Origin`.

**Решение**: добавить заголовок на сервере.

### Ошибка 2: Allow-Origin не совпадает

```
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header
in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

**Причина**: при `credentials: 'include'` (отправка cookies) нельзя использовать `*`.

**Решение**: указать конкретный origin вместо `*`.

### Ошибка 3: Заголовок не разрешён

```
has been blocked by CORS policy: Request header field authorization is not allowed by
Access-Control-Allow-Headers in preflight response.
```

**Причина**: сервер не разрешил заголовок `Authorization` в `Access-Control-Allow-Headers`.

**Решение**: добавить `Authorization` в список разрешённых заголовков.

### Ошибка 4: Метод не разрешён

```
has been blocked by CORS policy: Method PUT is not allowed by Access-Control-Allow-Methods
in preflight response.
```

**Причина**: сервер не разрешил метод PUT.

**Решение**: добавить PUT в `Access-Control-Allow-Methods`.

## Решения для фронтендера

### 1. Прокси в dev-режиме (Vite)

Самый частый случай: фронтенд на `localhost:5173`, API на `localhost:8080`. Используем Vite proxy:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

```ts
// Запрос идёт на тот же origin — нет CORS
fetch('/api/users')    // → http://localhost:8080/users (через прокси)
```

### 2. CORS на сервере (правильное решение)

**Express (Node.js):**
```ts
import cors from 'cors'

app.use(cors({
  origin: ['https://mysite.com', 'https://admin.mysite.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))
```

**Nginx:**
```nginx
location /api/ {
    add_header Access-Control-Allow-Origin "https://mysite.com";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    add_header Access-Control-Allow-Credentials "true";
    add_header Access-Control-Max-Age 86400;

    if ($request_method = OPTIONS) {
        return 204;
    }

    proxy_pass http://backend:8080/;
}
```

### 3. Credentials (cookies, auth)

Когда нужно отправить cookies или Authorization-заголовок:

```ts
// Фронтенд
fetch('https://api.example.com/users', {
  credentials: 'include',    // Отправлять cookies
})
```

Сервер должен вернуть:
```
Access-Control-Allow-Origin: https://mysite.com    (НЕ *!)
Access-Control-Allow-Credentials: true
```

### 4. Формат ответа сервера для preflight

Сервер должен обрабатывать OPTIONS-запрос и возвращать правильные заголовки:

```ts
app.options('*', cors())              // Обработать все OPTIONS-запросы
app.use(cors())                       // Добавить CORS ко всем ответам
```

## Credentials и поддомены

Для работы с cookies между поддоменами (`app.mysite.com` ↔ `api.mysite.com`):

Сервер устанавливает cookie:
```
Set-Cookie: session=abc123; Domain=.mysite.com; Path=/; HttpOnly; Secure; SameSite=None
```

- `Domain=.mysite.com` — cookie доступно на всех поддоменах
- `SameSite=None` — разрешает cross-origin запросы с cookie
- `Secure` — обязательно при `SameSite=None`

## CORS-ошибки на production

### Cloudflare / CDN

Если перед API стоит CDN, убедитесь, что CDN пробрасывает CORS-заголовки от бэкенда, а не заменяет их.

### Nginx дублирует заголовки

Если backend и nginx оба добавляют `Access-Control-Allow-Origin`, будет два заголовка — браузер это отвергнет. Решение: добавлять CORS только на одном уровне.

### Кэширование preflight

Для оптимизации: `Access-Control-Max-Age: 86400` — preflight кэшируется на 24 часа. Без этого браузер отправляет OPTIONS перед каждым запросом.

## Чеклист при CORS-ошибке

1. Откройте DevTools → Network → найдите failed-запрос
2. Посмотрите: есть ли OPTIONS-запрос (preflight)?
3. В ответе OPTIONS есть ли `Access-Control-Allow-Origin`?
4. Совпадает ли origin с вашим фронтендом?
5. Если используете `credentials: 'include'` — нет ли `*` в Allow-Origin?
6. Разрешены ли ваши заголовки (Authorization, Content-Type) в Allow-Headers?
7. Разрешён ли ваш метод в Allow-Methods?

## Итог

- CORS — ограничение браузера, не сервера. Сервер решает, что разрешить
- **Preflight** = OPTIONS-запрос перед «непростыми» запросами
- Ключевой заголовок: `Access-Control-Allow-Origin`
- Для dev: используйте **Vite proxy** — избегайте CORS
- Для production: настраивайте CORS на сервере (Express cors middleware, Nginx)
- `credentials: 'include'` + `Access-Control-Allow-Credentials: true` для cookies
- Никогда не используйте `Access-Control-Allow-Origin: *` с credentials
