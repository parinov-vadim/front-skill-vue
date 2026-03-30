---
title: "Web Workers: параллельные вычисления в браузере"
description: "Web Workers в JavaScript — выполнение тяжёлых вычислений в фоновом потоке, создание Worker, обмен сообщениями, SharedWorker и ограничения."
section: javascript
difficulty: advanced
readTime: 8
order: 24
tags: [Web Workers, Worker, потоки, многопоточность, параллельные вычисления, JavaScript]
---

## Зачем нужны Web Workers

JavaScript однопоточный. Тяжёлые вычисления блокируют интерфейс — страница «зависает». Web Worker выполняет код в отдельном потоке, не трогая основной.

```js
// Без Worker — страница зависает на 5 секунд
function heavyTask() {
  let result = 0
  for (let i = 0; i < 1_000_000_000; i++) result += i
  return result
}

heavyTask() // интерфейс не отвечает
```

Worker решает эту проблему — тяжёлая задача идёт в фон, а основной поток продолжает обрабатывать клики и анимации.

## Создание Worker

### Файл Worker'а

```js
// worker.js
self.onmessage = (event) => {
  const { data } = event

  // Тяжёлые вычисления
  let result = 0
  for (let i = 0; i < data.iterations; i++) {
    result += i
  }

  // Отправить результат обратно
  self.postMessage({ result })
}
```

### Основной поток

```js
// main.js
const worker = new Worker('/worker.js')

worker.onmessage = (event) => {
  console.log('Результат:', event.data.result)
}

worker.onerror = (error) => {
  console.error('Ошибка в Worker:', error.message)
}

// Отправить данные в Worker
worker.postMessage({ iterations: 1_000_000_000 })

// Завершить Worker
worker.terminate()
```

## Обмен сообщениями

Данные передаются через `postMessage`. Используется **структурированное клонирование** — данные копируются, а не передаются по ссылке:

```js
// Основной поток
const data = { numbers: [1, 2, 3] }
worker.postMessage(data)

// Worker
self.onmessage = (event) => {
  const data = event.data // копия оригинального объекта
  data.numbers.push(4)    // не влияет на оригинал
}
```

### Передача больших данных через Transferable

Чтобы не копировать большие данные (ArrayBuffer, ImageBitmap), передайте их через второй аргумент `postMessage` — право владения перейдёт к получателю:

```js
const buffer = new ArrayBuffer(1024 * 1024 * 10) // 10 МБ

worker.postMessage({ buffer }, [buffer])
// buffer теперь «пустой» в основном потоке — владение передано Worker'у
```

## Примеры использования

### Обработка изображений

```js
// image-worker.js
self.onmessage = (event) => {
  const { imageData, filter } = event.data
  const pixels = imageData.data

  for (let i = 0; i < pixels.length; i += 4) {
    if (filter === 'grayscale') {
      const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
      pixels[i] = pixels[i + 1] = pixels[i + 2] = avg
    }
    if (filter === 'invert') {
      pixels[i] = 255 - pixels[i]
      pixels[i + 1] = 255 - pixels[i + 1]
      pixels[i + 2] = 255 - pixels[i + 2]
    }
  }

  self.postMessage({ imageData })
}
```

```js
// main.js
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

const worker = new Worker('/image-worker.js')

worker.onmessage = (event) => {
  ctx.putImageData(event.data.imageData, 0, 0)
  worker.terminate()
}

worker.postMessage({ imageData, filter: 'grayscale' })
```

### Фильтрация больших списков

```js
// filter-worker.js
self.onmessage = (event) => {
  const { items, query } = event.data
  const lower = query.toLowerCase()

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(lower) ||
    item.description.toLowerCase().includes(lower)
  )

  self.postMessage({ filtered })
}
```

```js
// main.js
let filterWorker

function searchItems(items, query) {
  if (filterWorker) filterWorker.terminate()

  filterWorker = new Worker('/filter-worker.js')

  filterWorker.onmessage = (event) => {
    renderResults(event.data.filtered)
  }

  filterWorker.postMessage({ items, query })
}
```

## Inline Worker (без отдельного файла)

```js
const code = `
  self.onmessage = (event) => {
    let result = 0
    for (let i = 0; i < event.data; i++) result += i
    self.postMessage(result)
  }
`

const blob = new Blob([code], { type: 'application/javascript' })
const url = URL.createObjectURL(blob)
const worker = new Worker(url)

worker.onmessage = (event) => {
  console.log('Результат:', event.data)
  URL.revokeObjectURL(url) // очистить URL
}

worker.postMessage(1_000_000)
```

## Ограничения Worker'а

Worker **не имеет доступа** к:
- DOM (`document`, `window` — нет)
- UI (нельзя показать alert)
- `localStorage` / `sessionStorage`

Worker **имеет доступ** к:
- `fetch` / `XMLHttpRequest`
- `WebSocket`
- `IndexedDB`
- `setTimeout` / `setInterval`
- `importScripts()` — подключение других скриптов

```js
// worker.js
importScripts('/utils.js', '/helpers.js')
```

## SharedWorker

Общий Worker для нескольких вкладок. Все вкладки подключаются к одному экземпляру:

```js
// shared-worker.js
const connections = []

self.onconnect = (event) => {
  const port = event.ports[0]
  connections.push(port)

  port.onmessage = (msg) => {
    // Отправить всем подключённым вкладкам
    connections.forEach(p => p.postMessage(msg.data))
  }
}
```

```js
// main.js
const worker = new SharedWorker('/shared-worker.js')

worker.port.onmessage = (event) => {
  console.log('Сообщение:', event.data)
}

worker.port.start()
worker.port.postMessage('Привет от вкладки')
```

## Когда использовать Worker

| Да | Нет |
|----|-----|
| Обработка изображений | Простые вычисления |
| Фильтрация 100 000+ элементов | Фильтрация 100 элементов |
| Парсинг больших JSON | Парсинг маленьких объектов |
| Шифрование / хеширование | DOM-манипуляции |
| Сложные математические расчёты | Простые анимации |

Worker не бесплатный — создание потока занимает время. Не создавайте Worker для мелких задач.

## Итог

- Worker выполняет код в отдельном потоке — интерфейс не блокируется
- Обмен данными через `postMessage` — данные копируются
- `Transferable` (ArrayBuffer) — для передачи больших данных без копирования
- Worker не имеет доступа к DOM и localStorage
- Используйте для тяжёлых вычислений, обработки изображений, фильтрации больших данных
- `SharedWorker` — один Worker на все вкладки
