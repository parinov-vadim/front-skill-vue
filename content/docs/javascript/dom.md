---
title: Что такое DOM?
description: Document Object Model — программный интерфейс браузера для работы с HTML-документами в виде дерева объектов.
section: javascript
difficulty: beginner
readTime: 7
order: 1
tags: [DOM, browser, API]
---

## Что такое DOM?

**DOM (Document Object Model)** — это программный интерфейс, который браузер строит после загрузки HTML-страницы. Он представляет документ в виде **дерева объектов**, с которым можно взаимодействовать через JavaScript.

Когда браузер получает HTML, он парсит его и строит дерево узлов — каждый HTML-элемент становится **узлом (Node)** в этом дереве.

```html
<html>
  <body>
    <h1>Привет</h1>
    <p>Текст</p>
  </body>
</html>
```

Это превращается в дерево:

```
Document
└── html
    └── body
        ├── h1 → "Привет"
        └── p  → "Текст"
```

## Типы узлов

| Тип | Описание |
|-----|----------|
| `Element` | HTML-тег (`<div>`, `<p>`, `<a>`) |
| `Text` | Текстовое содержимое внутри тега |
| `Comment` | HTML-комментарий `<!-- ... -->` |
| `Document` | Корень дерева, объект `document` |

## Выбор элементов

```js
// По id
const header = document.getElementById('header')

// По CSS-селектору (первый)
const btn = document.querySelector('.btn-primary')

// По CSS-селектору (все)
const items = document.querySelectorAll('li')

// По классу
const cards = document.getElementsByClassName('card')
```

## Изменение элементов

```js
const el = document.querySelector('h1')

// Изменить текст
el.textContent = 'Новый заголовок'

// Изменить HTML внутри
el.innerHTML = '<span>Новый</span> заголовок'

// Изменить атрибут
el.setAttribute('class', 'title')

// Изменить стиль
el.style.color = 'red'
el.style.fontSize = '2rem'
```

## Создание и добавление элементов

```js
// Создать новый элемент
const div = document.createElement('div')
div.textContent = 'Новый блок'
div.classList.add('card')

// Добавить в конец родителя
document.body.appendChild(div)

// Вставить перед конкретным элементом
const list = document.querySelector('ul')
const newItem = document.createElement('li')
newItem.textContent = 'Новый пункт'
list.insertBefore(newItem, list.firstChild)

// Современный способ
list.prepend(newItem)
list.append(newItem)
```

## Удаление элементов

```js
const el = document.querySelector('.old-block')
el.remove()
```

## Навигация по дереву

```js
const parent = el.parentElement
const children = el.children          // HTMLCollection
const firstChild = el.firstElementChild
const lastChild = el.lastElementChild
const next = el.nextElementSibling
const prev = el.previousElementSibling
```

## DOM и CSSOM

DOM описывает структуру документа. Браузер также строит **CSSOM (CSS Object Model)** для стилей. Вместе они образуют **Render Tree** — основу для отрисовки страницы.

## Важно знать

- DOM **не является** частью JavaScript — это API браузера
- Частые операции с DOM **дорогостоящие** (вызывают reflow/repaint) — старайтесь группировать изменения
- `innerHTML` потенциально опасен: не вставляйте туда непроверенные пользовательские данные (XSS)
- `textContent` безопаснее `innerHTML` для вставки текста
