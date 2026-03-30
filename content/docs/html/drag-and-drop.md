---
title: "Drag and Drop API: перетаскивание элементов в браузере"
description: "HTML Drag and Drop API — перетаскивание элементов мышью, dragstart, dragover, drop события, DataTransfer, сортируемые списки и загрузка файлов."
section: html
difficulty: intermediate
readTime: 8
order: 11
tags: [drag and drop, перетаскивание, dnd, drag, drop, сортировка, загрузка файлов, HTML5]
---

## Что такое Drag and Drop API

Нативный API браузера для перетаскивания элементов мышью. Без библиотек — работает на десктопе. Для мобильных устройств нужна дополнительная обработка touch-событий.

## Базовый пример

```html
<div id="source" draggable="true">Перетащи меня</div>
<div id="target">Сюда</div>
```

```js
const source = document.getElementById('source')
const target = document.getElementById('target')

source.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', 'source')
})

target.addEventListener('dragover', (e) => {
  e.preventDefault()
})

target.addEventListener('drop', (e) => {
  e.preventDefault()
  const id = e.dataTransfer.getData('text/plain')
  target.appendChild(document.getElementById(id))
})
```

Три обязательных шага:
1. `draggable="true"` — элемент можно перетаскивать
2. `dragover` + `preventDefault()` — разрешить сброс в цель
3. `drop` — обработать сброс

Без `preventDefault()` в `dragover` элемент **не примет** перетаскивание.

## События

### Перетаскиваемый элемент

| Событие | Когда |
|---------|-------|
| `dragstart` | Пользователь начал перетаскивание |
| `drag` | Непрерывно во время перетаскивания |
| `dragend` | Перетаскивание закончено (отпускание мыши или Esc) |

### Цель (drop target)

| Событие | Когда |
|---------|-------|
| `dragenter` | Перетаскиваемый элемент вошёл в цель |
| `dragover` | Элемент находится над целью (срабатывает постоянно) |
| `dragleave` | Элемент покинул цель |
| `drop` | Пользователь отпустил элемент над целью |

## DataTransfer

Объект `e.dataTransfer` — хранилище данных, передаваемых между элементами:

```js
source.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', 'hello')
  e.dataTransfer.setData('application/json', JSON.stringify({ id: 42 }))
  e.dataTransfer.effectAllowed = 'move'
})

target.addEventListener('drop', (e) => {
  const text = e.dataTransfer.getData('text/plain')
  const json = JSON.parse(e.dataTransfer.getData('application/json'))
})
```

### effectAllowed и dropEffect

Визуальная подсказка — какой тип операции произойдёт:

```js
source.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move'
})

target.addEventListener('dragover', (e) => {
  e.dataTransfer.dropEffect = 'move'
  e.preventDefault()
})
```

Значения: `none`, `copy`, `move`, `link`, `copyMove`, `copyLink`, `linkMove`, `all`.

### Картинка при перетаскивании

```js
source.addEventListener('dragstart', (e) => {
  const img = new Image()
  img.src = 'drag-preview.png'
  e.dataTransfer.setDragImage(img, 0, 0)
})
```

## Сортируемый список

```html
<ul id="sortable">
  <li draggable="true">Элемент 1</li>
  <li draggable="true">Элемент 2</li>
  <li draggable="true">Элемент 3</li>
  <li draggable="true">Элемент 4</li>
</ul>
```

```js
const list = document.getElementById('sortable')
let draggedItem = null

list.addEventListener('dragstart', (e) => {
  draggedItem = e.target
  e.target.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
})

list.addEventListener('dragend', (e) => {
  e.target.classList.remove('dragging')
  document.querySelectorAll('.drag-over').forEach((el) => {
    el.classList.remove('drag-over')
  })
})

list.addEventListener('dragover', (e) => {
  e.preventDefault()
  const target = e.target.closest('li')
  if (!target || target === draggedItem) return

  const rect = target.getBoundingClientRect()
  const midY = rect.top + rect.height / 2

  if (e.clientY < midY) {
    list.insertBefore(draggedItem, target)
  } else {
    list.insertBefore(draggedItem, target.nextSibling)
  }
})
```

```css
li {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 4px;
  border-radius: 8px;
  background: white;
  cursor: grab;
}

li.dragging {
  opacity: 0.5;
  background: #f3f4f6;
}
```

## Загрузка файлов перетаскиванием

```html
<div id="drop-zone">
  Перетащите файлы сюда или нажмите для выбора
  <input type="file" id="file-input" multiple hidden>
</div>
```

```js
const dropZone = document.getElementById('drop-zone')
const fileInput = document.getElementById('file-input')

dropZone.addEventListener('click', () => fileInput.click())

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('active')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('active')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('active')

  const files = e.dataTransfer.files
  handleFiles(files)
})

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files)
})

function handleFiles(files) {
  Array.from(files).forEach((file) => {
    console.log(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
  })
}
```

```css
#drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  color: #6b7280;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

#drop-zone.active {
  border-color: #6366f1;
  background: #f0f0ff;
}
```

### Фильтрация типов файлов

```js
dropZone.addEventListener('drop', (e) => {
  e.preventDefault()

  const files = Array.from(e.dataTransfer.files).filter((file) => {
    return file.type.startsWith('image/')
  })

  if (files.length === 0) {
    console.log('Только изображения')
    return
  }

  handleFiles(files)
})
```

### Предпросмотр изображений

```js
function handleFiles(files) {
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.maxWidth = '200px'
      img.style.borderRadius = '8px'
      dropZone.after(img)
    }
    reader.readAsDataURL(file)
  })
}
```

## Kanban-доска

```html
<div class="board">
  <div class="column" data-status="todo">
    <h3>To Do</h3>
    <div class="card-list">
      <div class="card" draggable="true" data-id="1">Задача 1</div>
      <div class="card" draggable="true" data-id="2">Задача 2</div>
    </div>
  </div>
  <div class="column" data-status="progress">
    <h3>In Progress</h3>
    <div class="card-list"></div>
  </div>
  <div class="column" data-status="done">
    <h3>Done</h3>
    <div class="card-list"></div>
  </div>
</div>
```

```js
let draggedCard = null

document.addEventListener('dragstart', (e) => {
  if (!e.target.classList.contains('card')) return
  draggedCard = e.target
  e.dataTransfer.setData('text/plain', e.target.dataset.id)
  e.target.classList.add('dragging')
})

document.addEventListener('dragend', (e) => {
  e.target.classList.remove('dragging')
})

document.querySelectorAll('.card-list').forEach((list) => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  list.addEventListener('drop', (e) => {
    e.preventDefault()
    if (!draggedCard) return

    const target = e.target.closest('.card')
    if (target) {
      list.insertBefore(draggedCard, target)
    } else {
      list.appendChild(draggedCard)
    }

    const newStatus = list.closest('.column').dataset.status
    console.log(`Карточка ${draggedCard.dataset.id} → ${newStatus}`)
  })
})
```

## Поддержка мобильных устройств

Нативный Drag and Drop API **не работает** на тач-экранах. Решения:

1. Полифил: `mobile-drag-drop` на npm
2. Touch-события: `touchstart`, `touchmove`, `touchend`
3. Библиотеки: SortableJS, dnd-kit (React), vue-draggable

## Итог

- `draggable="true"` — разрешить перетаскивание
- `dragover` + `preventDefault()` — обязательно для приёма drop
- `dataTransfer.setData()` / `getData()` — передача данных
- `effectAllowed` / `dropEffect` — визуальная подсказка операции
- Для сортировки — переставляйте DOM-элементы в `dragover`
- Загрузка файлов — `e.dataTransfer.files`
- На мобильных — используйте полифил или touch-события
