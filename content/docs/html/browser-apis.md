---
title: "Fullscreen API, Notification API, Clipboard API: браузерные API"
description: "Браузерные API — Fullscreen API для полноэкранного режима, Notification API для уведомлений, Clipboard API для копирования и вставки."
section: html
difficulty: intermediate
readTime: 7
order: 12
tags: [Fullscreen API, Notification API, Clipboard API, полноэкранный режим, уведомления, буфер обмена, браузерные API]
---

## Fullscreen API

Открывает элемент на весь экран. Полезно для видео, презентаций, редакторов, игр.

### Включение

```js
const element = document.querySelector('.presentation')

element.requestFullscreen()
```

Для видео — тоже работает:

```js
document.querySelector('video').requestFullscreen()
```

### Выключение

```js
document.exitFullscreen()
```

### Проверка

```js
if (document.fullscreenElement) {
  console.log('Полный экран активен')
}
```

### События

```js
element.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Вошли в полный экран')
  } else {
    console.log('Вышли из полного экрана')
  }
})

element.addEventListener('fullscreenerror', () => {
  console.log('Ошибка перехода в полный экран')
})
```

### Практический пример — кнопка полного экрана

```html
<div class="editor-wrapper">
  <div class="toolbar">
    <button id="fullscreen-btn">На весь экран</button>
  </div>
  <div id="editor" class="editor">Контент редактора</div>
</div>
```

```js
const btn = document.getElementById('fullscreen-btn')
const editor = document.getElementById('editor')

btn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    editor.requestFullscreen()
    btn.textContent = 'Выйти'
  } else {
    document.exitFullscreen()
    btn.textContent = 'На весь экран'
  }
})

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    btn.textContent = 'На весь экран'
  }
})
```

### CSS для полноэкранного режима

```css
#editor:fullscreen {
  background: white;
  padding: 24px;
  overflow: auto;
}

#editor:fullscreen .toolbar {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
}
```

Псевдокласс `:fullscreen` стилизует элемент в полноэкранном режиме.

### Предупреждения

- `requestFullscreen()` работает только по действию пользователя (клик, нажатие клавиши)
- На iOS Safari — только `<video>` поддерживает fullscreen
- Safari требует префикс: `webkitRequestFullscreen()`, `webkitExitFullscreen()`

```js
function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
}
```

## Notification API

Показывает системные уведомления — как у мессенджеров. Появляются в области уведомлений ОС.

### Запрос разрешения

```js
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Разрешение получено')
  }
})
```

Разрешение запрашивается **один раз** — браузер запомнит выбор. Значения: `granted`, `denied`, `default`.

### Отправка уведомления

```js
if (Notification.permission === 'granted') {
  new Notification('Новое сообщение', {
    body: 'Анна написала вам сообщение',
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'message-1',
  })
}
```

### Параметры

```js
new Notification('Напоминание', {
  body: 'Встреча через 15 минут',
  icon: '/icon-192.png',
  image: '/preview.jpg',
  badge: '/badge.png',
  tag: 'reminder-1',
  requireInteraction: true,
  silent: false,
  vibrate: [200, 100, 200],
  actions: [
    { action: 'open', title: 'Открыть' },
    { action: 'dismiss', title: 'Отклонить' },
  ],
})
```

| Параметр | Описание |
|----------|----------|
| `body` | Текст уведомления |
| `icon` | Иконка |
| `image` | Большое изображение |
| `tag` | Идентификатор. Заменяет предыдущее с тем же tag |
| `requireInteraction` | Не исчезает пока пользователь не нажмёт |
| `silent` | Без звука |
| `vibrate` | Вибрация на мобильных |
| `actions` | Кнопки действий (только в Service Worker) |

### Обработка клика

```js
const notification = new Notification('Сообщение', {
  body: 'Нажмите чтобы перейти',
  icon: '/icon.png',
})

notification.onclick = () => {
  window.focus()
  window.location.href = '/messages'
  notification.close()
}
```

### Отложенные уведомления

```js
function scheduleNotification(title, body, delayMs) {
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }, delayMs)
}

scheduleNotification('Перерыв', 'Пора отдохнуть!', 30 * 60 * 1000)
```

### Совместимость с Service Worker

Для push-уведомлений (даже когда вкладка закрыта) нужен Service Worker:

```js
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification('Push-уведомление', {
    body: 'Пришло с сервера',
    icon: '/icon.png',
  })
})
```

## Clipboard API

Копирование и вставка — программно и через события.

### Копирование текста

```js
navigator.clipboard.writeText('Скопированный текст').then(() => {
  console.log('Скопировано')
}).catch(() => {
  console.log('Ошибка копирования')
})
```

### Вставка текста

```js
navigator.clipboard.readText().then((text) => {
  console.log('Вставлено:', text)
}).catch(() => {
  console.log('Нет доступа к буферу')
})
```

### Практический пример — кнопка «Скопировать»

```html
<div class="copy-group">
  <code id="code-text">npm install vue</code>
  <button id="copy-btn">Скопировать</button>
</div>
```

```js
const btn = document.getElementById('copy-btn')
const code = document.getElementById('code-text')

btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(code.textContent)
    btn.textContent = 'Скопировано!'
    setTimeout(() => { btn.textContent = 'Скопировать' }, 2000)
  } catch {
    fallbackCopy(code.textContent)
  }
})

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
```

Фоллбэк через `execCommand('copy')` — для старых браузеров и ситуаций, где Clipboard API не доступен.

### Копирование произвольных данных

```js
const blob = new Blob([JSON.stringify({ name: 'Анна' })], { type: 'application/json' })
const item = new ClipboardItem({ 'application/json': blob })

navigator.clipboard.write([item]).then(() => {
  console.log('JSON скопирован')
})
```

### Вставка изображений

```js
document.addEventListener('paste', async (e) => {
  const items = e.clipboardData.items

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      const url = URL.createObjectURL(file)
      document.querySelector('img').src = url
    }
  }
})
```

### События copy, cut, paste

```js
document.addEventListener('copy', (e) => {
  e.preventDefault()
  e.clipboardData.setData('text/plain', 'Кастомный текст')
})

document.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain')
  console.log('Вставлено:', text)
})
```

### Разрешения

Clipboard API требует:
- `writeText` — работает по действию пользователя (клик)
- `readText` — требует разрешение `clipboard-read` в некоторых браузерах

```js
navigator.permissions.query({ name: 'clipboard-read' }).then((result) => {
  if (result.state === 'granted' || result.state === 'prompt') {
    navigator.clipboard.readText().then(console.log)
  }
})
```

## Итог

**Fullscreen API:**
- `element.requestFullscreen()` / `document.exitFullscreen()`
- Работает по действию пользователя, iOS — только для video
- `:fullscreen` — CSS-псевдокласс для стилизации

**Notification API:**
- `Notification.requestPermission()` — запрос один раз
- `new Notification(title, options)` — показать уведомление
- Push-уведомления — через Service Worker

**Clipboard API:**
- `navigator.clipboard.writeText()` / `readText()` — копирование и вставка
- Фоллбэк через `execCommand('copy')` для старых браузеров
- События `copy`, `paste` — кастомизация поведения
