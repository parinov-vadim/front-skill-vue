---
title: "События в JavaScript: addEventListener, всплытие, делегирование, throttle и debounce"
description: "Обработка событий в JavaScript — addEventListener, объект event, всплытие и погружение, stopPropagation, делегирование событий, throttle и debounce."
section: javascript
difficulty: intermediate
readTime: 11
order: 23
tags: [события, addEventListener, event, всплытие, делегирование, throttle, debounce, JavaScript, DOM события]
---

## addEventListener

Основной способ подписаться на событие:

```js
const button = document.querySelector('.btn')

button.addEventListener('click', (event) => {
  console.log('Клик!', event.target)
})
```

Три аргумента: `addEventListener(событие, обработчик, опции)`.

```js
element.addEventListener('click', handler, {
  once: true,      // сработает один раз и отпишется
  capture: false,  // фаза погружения (объяснение ниже)
  passive: true,   // обработчик не вызовет preventDefault (оптимизация скролла)
})
```

### Удаление обработчика

Для `removeEventListener` нужна ссылка на ту же функцию:

```js
function handleClick(event) {
  console.log('Клик')
}

button.addEventListener('click', handleClick)
button.removeEventListener('click', handleClick) // работает

// Анонимную функцию удалить нельзя
button.addEventListener('click', () => console.log('клик'))
button.removeEventListener('click', () => console.log('клик')) // НЕ работает — другая функция
```

## Объект Event

Обработчик получает объект `Event` с информацией о событии:

```js
element.addEventListener('click', (event) => {
  event.type          // 'click'
  event.target        // элемент, на котором произошло событие
  event.currentTarget // элемент, на котором висит обработчик
  event.timeStamp     // время события (мс с загрузки страницы)
})
```

### MouseEvent — свойства клика

```js
element.addEventListener('click', (event) => {
  event.clientX  // X относительно окна
  event.clientY  // Y относительно окна
  event.pageX    // X относительно документа
  event.pageY    // Y относительно документа
  event.button   // 0 = левая, 1 = средняя, 2 = правая
})
```

### KeyboardEvent — свойства клавиатуры

```js
document.addEventListener('keydown', (event) => {
  event.key      // 'a', 'Enter', 'Escape', 'ArrowUp'
  event.code     // 'KeyA', 'Enter', 'Escape', 'ArrowUp'
  event.ctrlKey  // Ctrl нажат?
  event.shiftKey // Shift нажат?
  event.altKey   // Alt нажат?
  event.metaKey  // Meta (Cmd на Mac) нажат?
})
```

Горячие клавиши:

```js
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault() // не даём браузеру сохранить страницу
    saveDocument()
  }
})
```

## Всплытие (Bubbling)

Когда событие происходит на вложенном элементе, оно «всплывает» вверх по DOM-дереву:

```html
<div class="card">
  <button class="btn">Кликни</button>
</div>
```

```js
document.querySelector('.card').addEventListener('click', () => {
  console.log('Клик на card')
})

document.querySelector('.btn').addEventListener('click', () => {
  console.log('Клик на button')
})
```

Клик на кнопку выведет: «Клик на button», затем «Клик на card». Событие всплыло от кнопки к карточке.

### event.target vs event.currentTarget

```js
document.querySelector('.card').addEventListener('click', (event) => {
  event.target         // элемент, по которому реально кликнули (кнопка)
  event.currentTarget  // элемент, на котором висит обработчик (card)
})
```

### stopPropagation — остановить всплытие

```js
document.querySelector('.btn').addEventListener('click', (event) => {
  event.stopPropagation() // card не получит событие
  console.log('Только button')
})
```

Используйте `stopPropagation` осторожно — обычно лучше проверять `event.target`.

## Погружение (Capturing)

Перед всплытием событие проходит фазу погружения — от `document` вниз к целевому элементу:

```
Погружение:  document → html → body → div.card → button
Цель:        button (событие сработало)
Всплытие:    button → div.card → body → html → document
```

Обработчики по умолчанию работают на фазе всплытия. Чтобы поймать на погружении:

```js
element.addEventListener('click', handler, true)
// или
element.addEventListener('click', handler, { capture: true })
```

## Делегирование событий

Вместо того чтобы вешать обработчик на каждый элемент, вешаем один на родителя:

```html
<ul class="menu">
  <li data-action="home">Главная</li>
  <li data-action="tasks">Задачи</li>
  <li data-action="profile">Профиль</li>
  <li data-action="logout">Выход</li>
</ul>
```

```js
document.querySelector('.menu').addEventListener('click', (event) => {
  const item = event.target.closest('li')
  if (!item) return

  const action = item.dataset.action
  if (!action) return

  switch (action) {
    case 'home': showHome(); break
    case 'tasks': showTasks(); break
    case 'profile': showProfile(); break
    case 'logout': logout(); break
  }
})
```

Плюсы:
- Один обработчик вместо N — меньше памяти
- Работает для динамически добавленных элементов
- Проще управлять

`closest()` ищет ближайшего предшественника (или сам элемент), подходящего под селектор. Это защищает от кликов по вложенным элементам внутри `li`.

## preventDefault

Отменяет действие браузера по умолчанию:

```js
// Не переходить по ссылке
document.querySelector('a').addEventListener('click', (event) => {
  event.preventDefault()
  console.log('Переход отменён')
})

// Не отправлять форму
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(event.target)
  sendData(formData)
})

// Кастомное контекстное меню
element.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  showCustomMenu(event.pageX, event.pageY)
})
```

## throttle — не чаще чем раз в N мс

Ограничивает частоту вызова функции. Полезно для `scroll`, `resize`, `mousemove`:

```js
function throttle(fn, delay) {
  let lastCall = 0

  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

window.addEventListener('scroll', throttle(() => {
  console.log('Scroll position:', window.scrollY)
}, 200))
```

Без throttle обработчик scroll может вызываться 60+ раз в секунду.

## debounce — вызвать после паузы

Вызывает функцию только если прошло N мс с последнего вызова. Полезно для поиска при вводе:

```js
function debounce(fn, delay) {
  let timeoutId

  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const searchInput = document.querySelector('#search')
searchInput.addEventListener('input', debounce((event) => {
  searchUsers(event.target.value)
}, 300))
```

Каждый новый ввод сбрасывает таймер. Запрос уйдёт только когда пользователь перестанет печатать на 300 мс.

### Разница

| Функция | Поведение | Применение |
|---------|-----------|-----------|
| `throttle` | не чаще чем раз в N мс | scroll, resize, mousemove |
| `debounce` | вызов после паузы в N мс | поиск, валидация при вводе |

## Основные события

| Категория | События |
|-----------|---------|
| Мышь | `click`, `dblclick`, `mousedown`, `mouseup`, `mouseenter`, `mouseleave`, `mousemove` |
| Клавиатура | `keydown`, `keyup` |
| Форма | `submit`, `input`, `change`, `focus`, `blur` |
| Скролл | `scroll`, `wheel` |
| Drag & Drop | `dragstart`, `drag`, `dragend`, `dragover`, `drop` |
| Touch | `touchstart`, `touchmove`, `touchend` |
| Окно | `load`, `DOMContentLoaded`, `resize`, `beforeunload` |

DOMContentLoaded — DOM готов, можно работать с элементами (картинки могут ещё грузиться):

```js
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен')
})
```

## Итог

- `addEventListener` — основной способ подписки на события
- Событие сначала погружается от `document` вниз, затем всплывает обратно
- Делегирование — один обработчик на родителя вместо N на потомков
- `preventDefault` — отменить действие браузера, `stopPropagation` — остановить всплытие
- `throttle` — ограничить частоту, `debounce` — дождаться паузы
