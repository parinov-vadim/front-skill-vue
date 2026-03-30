---
title: "WebSocket: real-time коммуникации, чаты, уведомления"
description: "WebSocket — протокол для двусторонней связи в реальном времени. Чаты, уведомления, live-обновления, Socket.IO, подключение из фронтенд-приложений."
section: web-fundamentals
difficulty: intermediate
readTime: 13
order: 4
tags: [websocket, real-time, socket-io, chat, notifications]
---

## Что такое WebSocket

WebSocket — протокол для постоянного двустороннего соединения между клиентом и сервером. В отличие от HTTP (запрос → ответ), WebSocket остаётся открытым, и обе стороны могут отправлять сообщения в любой момент.

Зачем нужен:
- **Чаты** — мгновенная доставка сообщений
- **Уведомления** — push-уведомления без поллинга
- **Live-обновления** — курсы валют, счёт матча, статусы заказов
- **Совместное редактирование** — Google Docs, Figma
- **Онлайн-игры** — синхронизация состояния

### HTTP vs WebSocket

```
HTTP:
  Клиент → запрос → Сервер
  Клиент ← ответ ← Сервер
  (соединение закрывается)

WebSocket:
  Клиент ←→ Сервер (постоянное соединение)
  Клиент ←→ Сервер
  Клиент ←→ Сервер
  (до закрытия одной из сторон)
```

### HTTP Polling (альтернатива, хуже)

Без WebSocket обновления получают поллингом — периодическими HTTP-запросами:

```ts
setInterval(async () => {
  const messages = await fetch('/api/messages?after=' + lastId)
  // ...
}, 3000)
```

Минусы: лишние запросы, задержка до 3 секунд, нагрузка на сервер.

WebSocket: соединение открыто постоянно, данные приходят мгновенно.

## Нативный WebSocket API

### Подключение

```ts
const ws = new WebSocket('wss://example.com/chat')

ws.addEventListener('open', () => {
  console.log('Соединение установлено')
  ws.send(JSON.stringify({ type: 'join', room: 'general' }))
})

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  console.log('Сообщение:', data)
})

ws.addEventListener('error', (event) => {
  console.error('Ошибка WebSocket:', event)
})

ws.addEventListener('close', (event) => {
  console.log('Соединение закрыто:', event.code, event.reason)
})
```

### Отправка сообщений

```ts
ws.send('Привет!')                                    // Строка
ws.send(JSON.stringify({ type: 'message', text: 'Привет!' }))  // JSON
```

### Закрытие соединения

```ts
ws.close(1000, 'Пользователь вышел')
```

Коды закрытия:
- `1000` — нормальное закрытие
- `1001` — уход (закрыта вкладка)
- `1006` — аномальное закрытие (без close-фрейма)
- `1011` — ошибка сервера

### Состояния

```ts
ws.readyState
// WebSocket.CONNECTING = 0  (подключение)
// WebSocket.OPEN = 1        (открыто)
// WebSocket.CLOSING = 2     (закрывается)
// WebSocket.CLOSED = 3      (закрыто)
```

### Протокол: ws:// и wss://

- `ws://` — без шифрования (как HTTP)
- `wss://` — с шифрованием TLS (как HTTPS) — **всегда используйте в production**

## Практика: чат на WebSocket

### Фронтенд

```vue
<script setup lang="ts">
interface ChatMessage {
  id: string
  user: string
  text: string
  timestamp: number
}

const messages = ref<ChatMessage[]>([])
const input = ref('')
const ws = ref<WebSocket | null>(null)
const username = 'User' + Math.floor(Math.random() * 1000)

onMounted(() => {
  ws.value = new WebSocket('ws://localhost:8080/chat')

  ws.value.addEventListener('message', (event) => {
    const msg: ChatMessage = JSON.parse(event.data)
    messages.value.push(msg)
    nextTick(() => {
      const container = document.querySelector('.messages')
      container?.scrollTo({ top: container.scrollHeight })
    })
  })

  ws.value.addEventListener('close', () => {
    console.log('Переподключение через 3 секунды...')
    setTimeout(connect, 3000)
  })
})

function send() {
  if (!input.value.trim() || !ws.value) return

  ws.value.send(JSON.stringify({
    type: 'message',
    user: username,
    text: input.value.trim(),
  }))

  input.value = ''
}

onUnmounted(() => {
  ws.value?.close()
})
</script>

<template>
  <div class="chat">
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <strong>{{ msg.user }}:</strong> {{ msg.text }}
      </div>
    </div>
    <form @submit.prevent="send">
      <input v-model="input" placeholder="Введите сообщение..." />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>
```

## Переподключение

Соединение может разорваться (сеть, перезапуск сервера). Нужна автоматическая переподключение:

```ts
function createReconnectingWebSocket(url: string) {
  let ws: WebSocket | null = null
  let retryCount = 0
  const maxRetries = 10
  const baseDelay = 1000

  function connect() {
    ws = new WebSocket(url)

    ws.addEventListener('open', () => {
      retryCount = 0
      console.log('WebSocket подключён')
    })

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    })

    ws.addEventListener('close', () => {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount)
        retryCount++
        console.log(`Переподключение через ${delay}мс (попытка ${retryCount})`)
        setTimeout(connect, delay)
      }
    })

    ws.addEventListener('error', () => {
      ws?.close()
    })
  }

  function send(data: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  function close() {
    retryCount = maxRetries
    ws?.close()
  }

  connect()

  return { send, close }
}
```

Экспоненциальная задержка: 1с → 2с → 4с → 8с → 16с. Не перегружает сервер.

## Heartbeat (Ping/Pong)

Чтобы обнаружить «мёртвое» соединение, используют heartbeat:

```ts
let pingInterval: ReturnType<typeof setInterval>

ws.addEventListener('open', () => {
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
    }
  }, 30000) // Каждые 30 секунд
})

ws.addEventListener('close', () => {
  clearInterval(pingInterval)
})
```

Сервер отвечает `{ type: 'pong' }`. Если ответа нет — соединение «мёртвое».

## Socket.IO

Socket.IO — библиотека поверх WebSocket с дополнительными фичами:
- Автоматическое переподключение
- Fallback на HTTP long-polling (если WebSocket недоступен)
- Rooms и namespaces
- Acknowledgements (подтверждение доставки)
- Broadcasting

### Установка

```bash
npm install socket.io-client
```

### Клиент

```ts
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: { token: 'my-auth-token' },
  transports: ['websocket'],
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})

socket.on('message', (data) => {
  console.log('Message:', data)
})

socket.emit('join-room', 'general')

socket.emit('send-message', { text: 'Привет!' })

socket.emit('send-message', { text: 'Привет!' }, (ack) => {
  console.log('Сообщение доставлено:', ack)
})

socket.disconnect()
```

### Rooms

```ts
// Клиент
socket.emit('join', 'room-123')
socket.emit('leave', 'room-123')

// Сервер отправляет в комнату
socket.on('room-message', (data) => {
  console.log(`${data.room}: ${data.text}`)
})
```

### Vue Composable для Socket.IO

```ts
import { io, Socket } from 'socket.io-client'

export function useSocket(url: string) {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  function connect(auth?: Record<string, string>) {
    socket.value = io(url, {
      auth,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => { isConnected.value = true })
    socket.value.on('disconnect', () => { isConnected.value = false })
  }

  function emit(event: string, ...args: unknown[]) {
    socket.value?.emit(event, ...args)
  }

  function on(event: string, callback: (...args: unknown[]) => void) {
    socket.value?.on(event, callback)
  }

  function off(event: string, callback?: (...args: unknown[]) => void) {
    socket.value?.off(event, callback)
  }

  function disconnect() {
    socket.value?.disconnect()
  }

  return { socket, isConnected, connect, emit, on, off, disconnect }
}
```

```vue
<script setup lang="ts">
const { isConnected, connect, emit, on, off } = useSocket('http://localhost:3000')

const messages = ref<string[]>([])

onMounted(() => {
  connect({ token: getToken() })
  on('message', (msg: any) => messages.value.push(msg.text))
})

onUnmounted(() => {
  off('message')
})
</script>
```

## Альтернативы WebSocket

### Server-Sent Events (SSE)

Односторонний стриминг (сервер → клиент). Проще WebSocket, если клиент только получает данные:

```ts
const eventSource = new EventSource('/api/notifications')

eventSource.addEventListener('notification', (event) => {
  const data = JSON.parse(event.data)
  console.log('Уведомление:', data)
})

eventSource.addEventListener('error', () => {
  eventSource.close()
})
```

Плюсы: проще, автоматически переподключается, работает через HTTP.
Минусы: только сервер → клиент, нет бинарных данных.

### WebTransport

Новый API (HTTP/3) для двусторонней связи, быстрее WebSocket. Пока экспериментальный.

## Когда использовать WebSocket

| Сценарий | Рекомендация |
|---|---|
| Чат, real-time | **WebSocket** (или Socket.IO) |
| Уведомления (односторонние) | **SSE** (проще) |
| Live-обновления данных | **WebSocket** |
| Совместное редактирование | **WebSocket** + CRDT |
| Обычный CRUD | **HTTP** (не нужен WebSocket) |
| File upload | **HTTP** (multipart/form-data) |

## Итог

- WebSocket — постоянное двустороннее соединение для real-time
- `wss://` обязателен в production (шифрование)
- Нужны: переподключение (exponential backoff) и heartbeat (ping/pong)
- **Socket.IO** добавляет удобства: auto-reconnect, rooms, acknowledgements
- **SSE** проще для одностороннего стриминга (уведомления, логи)
- Не используйте WebSocket для обычных CRUD-операций — HTTP достаточно
