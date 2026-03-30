---
title: "Cookie: httpOnly, secure, SameSite, работа с куками в JS"
description: "HTTP Cookie для фронтендера: установка, чтение, флаги безопасности (httpOnly, Secure, SameSite), работа с document.cookie, куки vs localStorage и авторизация."
section: web-fundamentals
difficulty: beginner
readTime: 12
order: 6
tags: [cookies, httpOnly, secure, sameSite, auth, security]
---

## Что такое Cookie

Cookie (куки) — небольшой фрагмент данных, который сервер отправляет браузеру, а браузер сохраняет и отправляет обратно при каждом запросе к этому домену.

Куки используются для:
- **Авторизации** — session token
- **Пользовательских настроек** — тема, язык
- **Трекинга и аналитики** — Google Analytics, рекламные сети
- **A/B тестирования** — в какой группе пользователь

### Как работают куки

```
1. Первый запрос:
   Клиент → GET /login → Сервер

2. Ответ сервера:
   Set-Cookie: session_id=abc123; HttpOnly; Secure; Path=/

3. Следующие запросы:
   Клиент → GET /dashboard
   Cookie: session_id=abc123
   → Сервер (знает, кто пользователь)
```

Браузер автоматически добавляет заголовок `Cookie` к каждому HTTP-запросу на тот же домен.

## Установка куки

### Сервером (через HTTP-заголовок)

```
Set-Cookie: name=value; Expires=Wed, 15 Jan 2026 10:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=Lax
```

**Express:**
```ts
res.cookie('session_id', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 дней
  path: '/',
})
```

### Клиентом (через JavaScript)

```ts
document.cookie = 'theme=dark; path=/; max-age=31536000'
document.cookie = 'lang=ru; path=/; max-age=31536000'
```

## Чтение куки

### В JavaScript

```ts
function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1')}=([^;]*)`)
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

const theme = getCookie('theme')    // 'dark'
```

Все куки — одна строка:
```ts
document.cookie
// "theme=dark; lang=ru; session_id=abc123"
```

### Библиотека js-cookie

```bash
npm install js-cookie
```

```ts
import Cookies from 'js-cookie'

Cookies.set('theme', 'dark', { expires: 365, path: '/' })
Cookies.get('theme')                   // 'dark'
Cookies.remove('theme')
```

## Удаление куки

```ts
document.cookie = 'theme=; path=/; max-age=0'
```

Ключевое: указать тот же `path` и `domain`, что были при установке, и `max-age=0` или `expires` в прошлом.

## Атрибуты Cookie

### Expires / Max-Age — время жизни

```ts
// Через N секунд
document.cookie = 'theme=dark; max-age=3600'         // 1 час

// Конкретная дата
document.cookie = 'theme=dark; expires=Wed, 15 Jan 2026 10:00:00 GMT'

// Session cookie (живёт до закрытия вкладки)
document.cookie = 'temp=value'
```

Без `expires` и `max-age` кука живёт до закрытия браузера (session cookie).

### Domain — домен

```ts
// Только текущий поддомен
document.cookie = 'name=value; domain=app.example.com'

// Все поддомены
document.cookie = 'name=value; domain=.example.com'
```

`domain=.example.com` — кука доступна на `app.example.com`, `api.example.com`, `admin.example.com`.

### Path — путь

```ts
document.cookie = 'name=value; path=/'           // Все страницы
document.cookie = 'name=value; path=/admin'       // Только /admin/*
```

### HttpOnly — недоступна из JavaScript

```ts
// Сервер
Set-Cookie: session=abc123; HttpOnly
```

Кука с `HttpOnly` **нельзя** прочитать через `document.cookie`. Это защищает от XSS-атак — злоумышленник не может украсть сессионный токен через внедрённый скрипт.

```ts
document.cookie    // Не покажет HttpOnly-куки!
```

**Правило**: все токены авторизации должны быть `HttpOnly`.

### Secure — только по HTTPS

```ts
Set-Cookie: session=abc123; Secure
```

Кука отправляется только по HTTPS. В HTTP-запросах она не передаётся.

**Всегда используйте `Secure` в production.**

### SameSite — защита от CSRF

```ts
Set-Cookie: session=abc123; SameSite=Strict
```

Три значения:

| Значение | Когда отправляется | Описание |
|---|---|---|
| `Strict` | Только при навигации с того же сайта | Самый строгий. При переходе по ссылке с другого сайта кука не отправляется |
| `Lax` | Навигация + GET-запросы при переходе | **По умолчанию.** Баланс между безопасностью и удобством |
| `None` | Всегда (включая cross-site) | Нужен для SSO, OAuth. Обязательно с `Secure` |

Примеры:

```
SameSite=Strict:
  Пользователь переходит по ссылке email → mysite.com
  → Cookie НЕ отправляется → пользователь разлогинен

SameSite=Lax:
  Пользователь переходит по ссылке email → mysite.com
  → Cookie отправляется (безопасный GET) → пользователь залогинен

SameSite=None:
  Сайт A встраивает iframe сайта B
  → Cookie сайта B отправляется
```

## Куки для авторизации

### Session-based авторизация

1. Пользователь логинится (email + пароль)
2. Сервер создаёт сессию, генерирует `session_id`
3. Сервер отправляет: `Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax`
4. Браузер автоматически отправляет куку при каждом запросе
5. Сервер по `session_id` находит данные пользователя

```ts
// Сервер (Express)
app.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = authenticate(email, password)

  if (user) {
    const sessionId = generateSessionId()
    sessions.set(sessionId, { userId: user.id })
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.json({ success: true })
  }
})

app.get('/api/profile', (req, res) => {
  const sessionId = req.cookies.session_id
  const session = sessions.get(sessionId)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const user = getUser(session.userId)
  res.json(user)
})
```

```ts
// Фронтенд — куки отправляются автоматически
const response = await fetch('/api/profile', {
  credentials: 'same-origin',        // Куки для того же origin
})

// Для cross-origin:
const response = await fetch('https://api.other.com/data', {
  credentials: 'include',             // Отправлять куки на другой домен
})
```

### JWT в куках

JWT-токен можно хранить не в localStorage, а в HttpOnly-куке:

```ts
// Сервер
res.cookie('access_token', jwtToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,            // 15 минут
})
```

Плюсы: защита от XSS (HttpOnly). Минусы: нужна CSRF-защита.

## Cookie vs localStorage vs sessionStorage

| Критерий | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| Размер | 4 KB | 5 MB | 5 MB |
| Отправляется на сервер | Да (автоматически) | Нет | Нет |
| Доступ из JS | Да (кроме HttpOnly) | Да | Да |
| Срок жизни | Expires / Max-Age | Пока не удалить | До закрытия вкладки |
| Защита от XSS | HttpOnly | Нет | Нет |
| Защита от CSRF | SameSite | Есть (не отправляется) | Есть |
| Поддомены | domain=.site.com | Нет | Нет |

### Что где хранить

| Данные | Где |
|---|---|
| Токен авторизации | **Cookie (HttpOnly, Secure, SameSite=Lax)** |
| Тема оформления | **localStorage** или Cookie |
| Язык интерфейса | **localStorage** или Cookie |
| Временные данные формы | **sessionStorage** |
| JWT (если нет CSRF-защиты) | **localStorage** (с компромиссом по XSS) |
| Аналитика | Cookie (требуется согласие) |

## 第三方-cookie (Third-party cookies)

Сторонние куки — куки, установленные доменом, отличным от текущей страницы. Используются для:
- Рекламного таргетинга
- Кросс-доменной авторизации (SSO)
- Аналитики

Браузеры активно блокируют сторонние куки:
- **Safari** — блокирует по умолчанию (ITP)
- **Firefox** — блокирует по умолчанию (ETP)
- **Chrome** — в процессе отказа (Privacy Sandbox)

С 2025 года стоит считать, что third-party cookies не работают. Альтернативы: CHIPS (Storage Access API), Federated Credential Management.

## Законы и GDPR

В ЕС (GDPR) и многих других странах требуется:
- Получить согласие пользователя перед установкой не-необходимых куков
- Показывать баннер с выбором (принять / отклонить)
- Давать возможность отозвать согласие

## Итог

- Cookie — автоматически отправляются с каждым HTTP-запросом
- **HttpOnly** — защита от XSS (нельзя прочитать из JS)
- **Secure** — отправлять только по HTTPS
- **SameSite=Lax** — защита от CSRF (по умолчанию)
- Для авторизации используйте HttpOnly-куки, не localStorage
- `document.cookie` — неудобный API, используйте `js-cookie`
- Кука = 4 КБ максимум; localStorage = 5 МБ
- Third-party cookies умирают — не полагайтесь на них
