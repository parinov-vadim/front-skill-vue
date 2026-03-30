---
title: "Canvas API: рисование графики в браузере"
description: "Canvas API — рисование 2D-графики на HTML5 canvas. Линии, прямоугольники, круги, градиенты, текст, изображения, анимации и практические примеры."
section: html
difficulty: intermediate
readTime: 10
order: 9
tags: [Canvas, Canvas API, 2D графика, рисование, canvas анимации, JavaScript, HTML5]
---

## Что такое Canvas

Canvas — HTML-элемент для рисования графики через JavaScript. Пиксельная (растровая) графика — в отличие от SVG, которая векторная. Подходит для игр, графиков, обработки изображений, анимаций.

```html
<canvas id="canvas" width="600" height="400"></canvas>
```

Атрибуты `width` и `height` задают **размер холста в пикселях**. CSS-размер и размер холста — разные вещи. Если не указать — будет 300x150.

```js
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
```

`getContext('2d')` — возвращает контекст для 2D-рисования. Вся дальнейшая работа через `ctx`.

## Прямоугольники

Единственная фигура, которую canvas рисует напрямую:

```js
ctx.fillStyle = '#6366f1'
ctx.fillRect(50, 50, 200, 100)

ctx.strokeStyle = '#ef4444'
ctx.lineWidth = 2
ctx.strokeRect(300, 50, 200, 100)

ctx.clearRect(100, 75, 100, 50)
```

- `fillRect(x, y, width, height)` — закрашенный прямоугольник
- `strokeRect(x, y, width, height)` — обводка
- `clearRect(x, y, width, height)` — очистить область (прозрачно)

## Пути (Paths)

Все остальные фигуры — через пути:

### Линия

```js
ctx.beginPath()
ctx.moveTo(50, 50)
ctx.lineTo(200, 100)
ctx.lineTo(350, 50)
ctx.stroke()
```

### Треугольник

```js
ctx.beginPath()
ctx.moveTo(100, 100)
ctx.lineTo(200, 50)
ctx.lineTo(300, 100)
ctx.closePath()
ctx.fillStyle = '#6366f1'
ctx.fill()
```

### Круг / дуга

```js
ctx.beginPath()
ctx.arc(150, 150, 80, 0, Math.PI * 2)
ctx.fillStyle = '#6366f1'
ctx.fill()
```

`arc(x, y, radius, startAngle, endAngle)` — углы в радианах. Полный круг — от `0` до `Math.PI * 2`.

Дуга:

```js
ctx.beginPath()
ctx.arc(150, 150, 80, 0, Math.PI)
ctx.stroke()
```

### Кривые Безье

```js
ctx.beginPath()
ctx.moveTo(50, 200)
ctx.quadraticCurveTo(150, 50, 250, 200)
ctx.stroke()

ctx.beginPath()
ctx.moveTo(300, 200)
ctx.bezierCurveTo(350, 50, 400, 350, 450, 200)
ctx.stroke()
```

## Стили

### Цвета

```js
ctx.fillStyle = '#6366f1'
ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'
ctx.fillStyle = 'hsl(239, 84%, 67%)'
ctx.strokeStyle = '#ef4444'
```

### Линии

```js
ctx.lineWidth = 3
ctx.lineCap = 'round'      // round | butt | square
ctx.lineJoin = 'round'     // round | bevel | miter
ctx.setLineDash([10, 5])   // пунктир: 10px линия, 5px пропуск
```

### Градиенты

```js
const gradient = ctx.createLinearGradient(0, 0, 200, 0)
gradient.addColorStop(0, '#6366f1')
gradient.addColorStop(1, '#ec4899')

ctx.fillStyle = gradient
ctx.fillRect(50, 50, 200, 100)
```

Радиальный градиент:

```js
const gradient = ctx.createRadialGradient(150, 150, 10, 150, 150, 100)
gradient.addColorStop(0, '#6366f1')
gradient.addColorStop(1, 'transparent')

ctx.fillStyle = gradient
ctx.fillRect(0, 0, 300, 300)
```

### Тени

```js
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
ctx.shadowBlur = 10
ctx.shadowOffsetX = 4
ctx.shadowOffsetY = 4
```

### Прозрачность

```js
ctx.globalAlpha = 0.5
```

## Текст

```js
ctx.font = '24px Inter, sans-serif'
ctx.fillStyle = '#374151'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('Привет, Canvas!', 300, 200)
ctx.strokeText('Обводка текста', 300, 250)
```

Измерение ширины текста:

```js
const width = ctx.measureText('Привет').width
```

## Изображения

```js
const img = new Image()
img.src = 'photo.jpg'
img.onload = () => {
  ctx.drawImage(img, 50, 50, 200, 150)
}
```

Обрезка изображения:

```js
ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```

## Трансформации

```js
ctx.translate(150, 150)
ctx.rotate(Math.PI / 4)
ctx.scale(1.5, 1.5)

ctx.fillRect(-50, -50, 100, 100)
```

Сохранение и восстановление состояния:

```js
ctx.save()
ctx.translate(100, 100)
ctx.rotate(0.5)
ctx.fillRect(0, 0, 50, 50)
ctx.restore()

ctx.fillRect(200, 200, 50, 50)
```

`save()` / `restore()` — как стек. Между ними можно менять трансформации, стили, обрезку — после restore всё вернётся.

## Обрезка (Clipping)

```js
ctx.beginPath()
ctx.arc(150, 150, 80, 0, Math.PI * 2)
ctx.clip()

ctx.drawImage(img, 0, 0, 300, 300)
```

Изображение будет видно только внутри круга.

## Анимации

Canvas не хранит объекты — он рисует пиксели. Для анимации очищаем и рисуем заново каждый кадр:

```js
let x = 0

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#6366f1'
  ctx.fillRect(x, 150, 50, 50)

  x += 2
  if (x > canvas.width) x = -50

  requestAnimationFrame(animate)
}

animate()
```

`requestAnimationFrame` — синхронизация с частотой обновления экрана (обычно 60fps). Не используйте `setInterval` для анимаций.

### Плавная анимация с deltaTime

```js
let lastTime = 0
let x = 0

function animate(currentTime) {
  const delta = (currentTime - lastTime) / 1000
  lastTime = currentTime

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#6366f1'
  ctx.fillRect(x, 150, 50, 50)

  x += 200 * delta

  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
```

Скорость 200 пикселей в секунду — одинаковая на любом устройстве.

## Практические примеры

### График

```js
const data = [30, 80, 45, 120, 90, 60, 110]
const barWidth = 40
const gap = 20
const maxVal = Math.max(...data)

ctx.fillStyle = '#6366f1'
data.forEach((val, i) => {
  const height = (val / maxVal) * 300
  const x = i * (barWidth + gap) + 50
  const y = 350 - height
  ctx.fillRect(x, y, barWidth, height)
})
```

### Частицы

```js
const particles = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  r: Math.random() * 3 + 1,
}))

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)'
    ctx.fill()
  })

  requestAnimationFrame(animate)
}

animate()
```

### Рисование мышью

```js
let drawing = false

canvas.addEventListener('mousedown', () => { drawing = true })
canvas.addEventListener('mouseup', () => { drawing = false })
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.beginPath()
  ctx.arc(x, y, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#6366f1'
  ctx.fill()
})
```

### Адаптивный Canvas

```js
function resize() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

window.addEventListener('resize', resize)
resize()
```

## SVG vs Canvas

| | SVG | Canvas |
|---|-----|--------|
| Тип | Вектор | Растровый (пиксели) |
| Масштабирование | Без потерь | Пикселизация |
| DOM-элементы | Да, каждый элемент | Нет, один элемент |
| События | На каждый элемент | Координатная математика |
| Производительность | Падает при >1000 элементов | Стабильная при миллионах пикселей |
| Когда | Иконки, диаграммы, карты | Игры, графики реального времени, обработка фото |

## Итог

- `getContext('2d')` — контекст для рисования
- Прямоугольники — напрямую, остальные фигуры — через пути (`beginPath`, `moveTo`, `lineTo`, `arc`)
- `fillStyle`, `strokeStyle` — цвета и градиенты
- `save()` / `restore()` — управление состоянием трансформаций
- Анимации через `requestAnimationFrame` + `clearRect`
- Canvas — для растровой графики, игр, частиц. SVG — для вектора, иконок, диаграмм
