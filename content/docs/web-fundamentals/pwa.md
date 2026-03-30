---
title: "Progressive Web Apps (PWA): manifest, service worker, offline"
description: "PWA — прогрессивные веб-приложения: Web App Manifest, Service Worker, офлайн-режим, установка на устройство, push-уведомления и критерии PWA."
section: web-fundamentals
difficulty: intermediate
readTime: 14
order: 10
tags: [pwa, service-worker, offline, manifest, push-notifications, install]
---

## Что такое PWA

PWA (Progressive Web App) — веб-приложение, которое выглядит и работает как нативное:
- Устанавливается на домашний экран (как приложение)
- Работает офлайн
- Отправляет push-уведомления
- Имеет доступ к камере, геолокации и другим API
- Обновляется без обновления через App Store

PWA — это не отдельная технология, а набор веб-стандартов, которые вместе дают «нативный» опыт.

Примеры PWA: Twitter Lite, Starbucks, Pinterest, Uber.

## Три критерия PWA

1. **HTTPS** — обязательное требование (Service Worker работает только по HTTPS)
2. **Web App Manifest** — JSON-файл с метаданными приложения
3. **Service Worker** — скрипт для кэширования и офлайн-режима

Если все три выполнены — браузер предлагает «Установить приложение».

## Web App Manifest

`manifest.json` (или `manifest.webmanifest`) — файл с информацией о приложении:

```json
{
  "name": "Мое приложение",
  "short_name": "МоеApp",
  "description": "Описание моего приложения",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "ru",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["productivity", "utilities"]
}
```

Подключение в HTML:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6366f1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

### display — режим отображения

| Значение | Описание |
|---|---|
| `fullscreen` | Без браузерного UI (как игра) |
| `standalone` | Без адресной строки (как приложение) — **рекомендуется** |
| `minimal-ui` | Минимальный набор кнопок |
| `browser` | Обычная вкладка браузера |

### Иконки

Минимум: 192x192 и 512x512. Рекомендуется: 72, 96, 128, 144, 152, 192, 384, 512.

`purpose: "maskable"` — адаптивная иконка (safe zone, обрезается на разных устройствах).

## Service Worker

Service Worker — JavaScript-файл, который работает в фоне, отдельно от страницы. Перехватывает сетевые запросы и управляет кэшем.

### Жизненный цикл

```
1. Register    → Регистрация SW (с главной страницы)
2. Install     → Установка (precache файлов)
3. Activate    → Активация (очистка старого кэша)
4. Fetch       → Перехват запросов (работает в фоне)
```

### Регистрация

```ts
// main.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW зарегистрирован:', registration.scope)
    } catch (error) {
      console.error('Ошибка регистрации SW:', error)
    }
  })
}
```

### Базовый Service Worker

```ts
// public/sw.js
const CACHE_NAME = 'my-app-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css',
  '/icons/icon-192x192.png',
]

// Install — предварительное кэширование
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate — очистка старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch — стратегия кэширования
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
          return response
        })
      })
  )
})
```

### Стратегии кэширования

**Cache First** (статика):
```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
```

**Network First** (API, часто обновляемые данные):
```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
```

**Stale While Revalidate** (баланс скорости и свежести):
```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone())
          return response
        })
        return cached || fetchPromise
      })
    })
  )
})
```

## Офлайн-страница

```ts
// precache offline.html при установке
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/offline.html'])
    })
  )
})

// Если нет сети и нет кэша — показать offline.html
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => {
        return cached || caches.match('/offline.html')
      })
    )
  )
})
```

## Установка приложения

### Обнаружение и промпт

```ts
let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})

async function installApp() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  console.log('Результат установки:', outcome)  // 'accepted' | 'dismissed'
  deferredPrompt = null
}

window.addEventListener('appinstalled', () => {
  console.log('Приложение установлено')
  hideInstallButton()
})
```

### Проверка: установлено ли приложение

```ts
// Display mode
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
const isIOSStandalone = (navigator as any).standalone === true

if (isStandalone || isIOSStandalone) {
  // Запущено как установленное приложение
}
```

## PWA с Nuxt

Nuxt 3/4 имеет встроенную поддержку PWA через модуль:

```bash
npm install @vite-pwa/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'FrontSkill',
      short_name: 'FrontSkill',
      theme_color: '#6366f1',
      background_color: '#ffffff',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
    },
  },
})
```

## PWA с Vite

```bash
npm install -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Мое приложение',
        short_name: 'МоеApp',
        theme_color: '#6366f1',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

## Проверка PWA

### Chrome DevTools → Application

- **Manifest** — проверка manifest.json
- **Service Workers** — статус, обновление, удаление
- **Cache Storage** — содержимое кэша
- **Storage** — все хранилища приложения

### Lighthouse

Вкладка Lighthouse → отметьте PWA → Run. Lighthouse проверит все критерии PWA и покажет, что нужно исправить.

### PWA Builder

https://pwabuilder.com — загружаете URL, инструмент анализирует PWA и помогает упаковать для Microsoft Store.

## Итог

- PWA = HTTPS + Manifest + Service Worker
- **Manifest** — иконки, название, тема, режим отображения
- **Service Worker** — кэширование, офлайн, фоновые задачи
- Стратегии кэша: Cache First (статика), Network First (API), Stale While Revalidate
- `beforeinstallprompt` — перехватить и показать свой баннер установки
- Nuxt/Vite плагины упрощают настройку PWA
- Lighthouse проверяет соответствие критериям PWA
