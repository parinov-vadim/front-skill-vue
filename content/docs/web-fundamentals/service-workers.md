---
title: "Service Workers: кэширование, фоновая синхронизация, push-уведомления"
description: "Service Worker подробно: жизненный цикл, стратегии кэширования, Background Sync, Push API, уведомления и общение с главной страницей."
section: web-fundamentals
difficulty: intermediate
readTime: 13
order: 11
tags: [service-worker, caching, push-api, notifications, background-sync]
---

## Что такое Service Worker

Service Worker (SW) — JavaScript-скрипт, который выполняется в отдельном потоке, независимо от веб-страницы. У него нет доступа к DOM, но он может:
- Перехватывать и модифицировать сетевые запросы
- Управлять кэшем (Cache API)
- Получать push-уведомления
- Синхронизироваться в фоне (Background Sync)
- Работать когда вкладка закрыта

### Возможности и ограничения

| Может | Не может |
|---|---|
| Перехватывать fetch-запросы | Доступ к DOM |
| Управлять Cache API | `localStorage` (только `IndexedDB`) |
| Получать push-уведомления | `XMLHttpRequest` (только `fetch`) |
| Работать офлайн | `window`, `document` |
| Выполняться без открытой вкладки | Синхронный код |

## Жизненный цикл

```
                 ┌───────────┐
                 │  Parsed   │  (скачан, распарсен)
                 └─────┬─────┘
                       │ register()
                 ┌─────▼─────┐
                 │ Installing │  (выполнение install-обработчика)
                 └─────┬─────┘
                       │ success
                 ┌─────▼─────┐
                 │  Waiting   │  (ждёт, пока закроются старые вкладки)
                 └─────┬─────┘
                       │ активация
                 ┌─────▼─────┐
                 │  Active   │  (перехватывает fetch и другие события)
                 └─────┬─────┘
                       │ новая версия
                 ┌─────▼─────┐
                 │ Redundant │  (старый SW заменён)
                 └───────────┘
```

### Регистрация

```ts
// main.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('SW зарегистрирован, scope:', reg.scope)
      })
      .catch((err) => {
        console.error('Ошибка:', err)
      })
  })
}
```

`scope` — URL-префикс, который SW перехватывает. По умолчанию — папка, где лежит `sw.js`.

### События жизненного цикла

```ts
// sw.js
const CACHE = 'app-v2'

self.addEventListener('install', (event) => {
  console.log('SW устанавливается')
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/styles.css',
      '/app.js',
    ]))
  )
  self.skipWaiting()         // Активировать сразу, не ждать закрытия вкладок
})

self.addEventListener('activate', (event) => {
  console.log('SW активирован')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()       // Перехватывать запросы сразу, без перезагрузки
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
```

### Обновление Service Worker

Браузер проверяет обновление SW:
- При навигации на страницу
- При вызове `registration.update()`
- Каждые 24 часа

Если файл `sw.js` изменился (даже на 1 байт) — браузер скачивает новую версию. Новый SW проходит install → waiting (пока открыты вкладки со старым) → activate.

`skipWaiting()` — не ждать, активировать сразу.
`clients.claim()` — перехватывать страницы сразу без перезагрузки.

## Стратегии кэширования

### 1. Cache First

Сначала кэш, потом сеть. Для статики (CSS, JS, изображения, шрифты):

```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  )
})
```

### 2. Network First

Сначала сеть, при ошибке — кэш. Для API и часто обновляемых данных:

```ts
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open('api-cache').then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request))
    )
  }
})
```

### 3. Stale While Revalidate

Вернуть кэш (быстро), одновременно обновить его из сети:

```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic').then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
        return cached || fetchPromise
      })
    })
  )
})
```

### 4. Cache Only

Только кэш, без сети. Для precache-ресурсов:

```ts
event.respondWith(caches.match(event.request))
```

### 5. Network Only

Только сеть. Для не-GET запросов и аналитики:

```ts
if (event.request.method !== 'GET') {
  event.respondWith(fetch(event.request))
  return
}
```

### Выбор стратегии

| Ресурс | Стратегия |
|---|---|
| HTML | Network First (или Stale While Revalidate) |
| CSS, JS (с хешем) | Cache First |
| Изображения, шрифты | Cache First |
| API (GET) | Network First |
| API (POST/PUT/DELETE) | Network Only |
| Офлайн-страница | Cache Only |

## Workbox

Workbox (от Google) — библиотека, упрощающая написание Service Worker:

```bash
npm install workbox-cli -g
# или
npm install workbox-webpack-plugin -D
# или
npm install workbox-build -D
```

```ts
// sw.js с Workbox
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache (генерируется автоматически при сборке)
precacheAndRoute(self.__WB_MANIFEST)

// API — Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  })
)

// Изображения — Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

// Шрифты — Cache First
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
)
```

## Background Sync

Background Sync позволяет отложить действия до появления стабильного соединения:

```ts
// Главная страница — регистрация sync
async function saveOffline(data: unknown) {
  const db = await openDB('outbox', 1, {
    upgrade(db) {
      db.createObjectStore('messages', { autoIncrement: true })
    },
  })
  await db.add('messages', data)

  const registration = await navigator.serviceWorker.ready
  registration.sync.register('send-messages')
}
```

```ts
// sw.js — обработка sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-messages') {
    event.waitUntil(sendPendingMessages())
  }
})

async function sendPendingMessages() {
  const db = await openDB('outbox', 1)
  const messages = await db.getAll('messages')

  for (const msg of messages) {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
  }

  await db.clear('messages')
}
```

Пользователь отправляет сообщение офлайн → сохраняется в IndexedDB → когда появляется сеть → SW отправляет автоматически.

## Push API и уведомления

### Подписка на push

```ts
// Главная страница
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}
```

### Обработка push в SW

```ts
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Уведомление', body: 'Новое сообщение' }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/'
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      })
    )
  }
})
```

## Общение между страницей и SW

### Страница → SW

```ts
// Главная страница
navigator.serviceWorker.controller?.postMessage({
  type: 'CACHE_URL',
  url: '/api/users',
})
```

```ts
// sw.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URL') {
    caches.open('dynamic').then((cache) => cache.add(event.data.url))
  }
})
```

### SW → Страница

```ts
// sw.js
self.clients.matchAll().then((clients) => {
  clients.forEach((client) => {
    client.postMessage({ type: 'UPDATE_AVAILABLE', version: '2.0' })
  })
})
```

```ts
// Главная страница
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_AVAILABLE') {
    console.log('Новая версия:', event.data.version)
  }
})
```

## Итог

- Service Worker работает в фоне, без доступа к DOM
- **Жизненный цикл**: install → waiting → active
- Стратегии кэша: Cache First, Network First, Stale While Revalidate
- **Workbox** упрощает написание SW с готовыми стратегиями
- **Background Sync** — выполнить действия при появлении сети
- **Push API** — push-уведомления даже с закрытой вкладкой
- `postMessage` — общение между страницей и SW
- Обновляйте `CACHE_NAME` при изменении precache-списка
