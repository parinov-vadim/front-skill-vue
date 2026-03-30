---
title: "localStorage и sessionStorage: сохранение данных в браузере"
description: "localStorage и sessionStorage в JavaScript — сохранение данных в браузере, отличия, методы setItem/getItem/removeItem, хранение объектов, сроки жизни и ограничения."
section: javascript
difficulty: beginner
readTime: 8
order: 22
tags: [localStorage, sessionStorage, Web Storage, сохранение данных, браузер, JavaScript]
---

## Что такое Web Storage

`localStorage` и `sessionStorage` — механизмы браузера для хранения данных в виде пар «ключ-значение». Оба хранят **только строки**. Доступны через объект `window`.

## localStorage vs sessionStorage

| Свойство | `localStorage` | `sessionStorage` |
|----------|---------------|-----------------|
| Срок жизни | бессрочно (пока не удалить) | до закрытия вкладки |
| Область видимости | все вкладки одного источника | только текущая вкладка |
| Объём | ~5-10 МБ | ~5-10 МБ |
| Тип данных | только строки | только строки |

«Источник» — это комбинация протокол + домен + порт. `http://example.com` и `https://example.com` — разные источники.

## Базовые методы

Оба хранилища имеют одинаковый API:

```js
// Сохранить
localStorage.setItem('theme', 'dark')
localStorage.setItem('lang', 'ru')

// Прочитать
localStorage.getItem('theme') // 'dark'
localStorage.getItem('unknown') // null

// Удалить один ключ
localStorage.removeItem('theme')

// Очистить всё
localStorage.clear()

// Количество записей
localStorage.length // 1

// Получить ключ по индексу
localStorage.key(0) // 'lang'
```

### Краткая запись

Можно обращаться как к свойствам объекта:

```js
localStorage.theme = 'dark'        // set
console.log(localStorage.theme)    // 'dark'
delete localStorage.theme          // remove
```

Но `setItem`/`getItem` предпочтительнее — безопаснее и нагляднее.

## Хранение объектов

Хранилище работает только со строками. Объекты и массивы нужно сериализовать:

```js
const settings = { theme: 'dark', fontSize: 16, lang: 'ru' }

// Сохранить
localStorage.setItem('settings', JSON.stringify(settings))

// Прочитать
const saved = JSON.parse(localStorage.getItem('settings'))
console.log(saved.theme) // 'dark'
```

Если данных нет — `getItem` вернёт `null`, и `JSON.parse(null)` вернёт `null`. Безопасное чтение:

```js
function loadSettings() {
  const raw = localStorage.getItem('settings')
  return raw ? JSON.parse(raw) : { theme: 'light', fontSize: 14, lang: 'ru' }
}
```

## sessionStorage — данные на время сессии

```js
// Сохранить данные формы, чтобы не потерять при обновлении
sessionStorage.setItem('draft-title', 'Моя статья')
sessionStorage.setItem('draft-content', 'Текст статьи...')

// При загрузке страницы — восстановить
const title = sessionStorage.getItem('draft-title')
if (title) {
  document.querySelector('input').value = title
}
```

При закрытии вкладки данные `sessionStorage` исчезнут. Дублирование вкладки копирует `sessionStorage`, но новая вкладка получает собственную копию.

## Практические примеры

### Сохранение темы

```js
function applyTheme() {
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function toggleTheme() {
  const current = localStorage.getItem('theme') || 'light'
  const next = current === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', next)
  applyTheme()
}

applyTheme()
```

### Сохранение токена авторизации

```js
function saveToken(token) {
  localStorage.setItem('auth_token', token)
}

function getToken() {
  return localStorage.getItem('auth_token')
}

function logout() {
  localStorage.removeItem('auth_token')
}
```

Для безопасности токенов лучше использовать `sessionStorage` (исчезнет при закрытии) или httpOnly cookies.

### Корзина покупок

```js
function getCart() {
  const raw = localStorage.getItem('cart')
  return raw ? JSON.parse(raw) : []
}

function addToCart(item) {
  const cart = getCart()
  const existing = cart.find(i => i.id === item.id)

  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ ...item, qty: 1 })
  }

  localStorage.setItem('cart', JSON.stringify(cart))
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id)
  localStorage.setItem('cart', JSON.stringify(cart))
}
```

### Недавно просмотренные

```js
function addToRecent(item, max = 10) {
  const recent = JSON.parse(localStorage.getItem('recent') || '[]')
  const filtered = recent.filter(i => i.id !== item.id)
  filtered.unshift(item)
  localStorage.setItem('recent', JSON.stringify(filtered.slice(0, max)))
}

function getRecent() {
  return JSON.parse(localStorage.getItem('recent') || '[]')
}
```

## Событие storage

Когда данные меняются в одной вкладке, другие вкладки того же источника получают событие `storage`:

```js
window.addEventListener('storage', (event) => {
  console.log('Ключ:', event.key)
  console.log('Старое значение:', event.oldValue)
  console.log('Новое значение:', event.newValue)
  console.log('URL:', event.url)
})
```

Это работает **только между вкладками**. Вкладка, которая сделала изменение, событие не получит.

## Полезная обёртка

```js
const storage = {
  get(key, defaultValue = null) {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  clear() {
    localStorage.clear()
  },
}

storage.set('user', { name: 'Анна', age: 25 })
storage.get('user')           // { name: 'Анна', age: 25 }
storage.get('unknown', {})   // {} — значение по умолчанию
```

## Ограничения

- **Только строки** — объекты через `JSON.stringify`/`JSON.parse`
- **~5-10 МБ** — точный лимит зависит от браузера
- **Синхронный API** — блокирует основной поток. Для больших объёмов используйте IndexedDB
- **Доступен из любого кода** — XSS-атака может прочитать все данные. Не храните пароли, токены (лучше httpOnly cookies), персональные данные без шифрования
- **Не работает в приватном режиме** в некоторых браузерах — может выбросить исключение

Безопасная запись:

```js
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn('localStorage недоступен:', error)
  }
}
```

## Итог

- `localStorage` — бессрочное хранение, `sessionStorage` — до закрытия вкладки
- Только строки — объекты через `JSON.stringify`/`JSON.parse`
- Событие `storage` — для синхронизации между вкладками
- Не храните чувствительные данные — localStorage доступен из JavaScript
- Для больших объёмов и структурированных данных используйте IndexedDB
