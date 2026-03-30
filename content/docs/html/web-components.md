---
title: "Web Components: Custom Elements, Shadow DOM, Templates"
description: "Web Components — нативные компоненты браузера. Custom Elements, Shadow DOM для инкапсуляции, HTML Templates и Slots, подключение стилей и атрибуты."
section: html
difficulty: intermediate
readTime: 9
order: 10
tags: [Web Components, Custom Elements, Shadow DOM, templates, slots, веб-компоненты, HTML]
---

## Что такое Web Components

Web Components — нативная технология браузера для создания переиспользуемых компонентов. Не нужен React, Vue или Angular — компоненты работают в любом проекте, с любым фреймворком или без него.

Три технологии:
- **Custom Elements** — свои HTML-теги
- **Shadow DOM** — изолированные стили и разметка
- **HTML Templates** — шаблоны, которые не рендерятся до использования

## Custom Elements

### Создание элемента

```js
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Нажми</button>`
  }
}

customElements.define('my-button', MyButton)
```

Использование:

```html
<my-button></my-button>
```

Имя тега обязательно с дефисом (`my-button`, `user-card`, `app-header`). Без дефиса — ошибка, чтобы не конфликтовать со стандартными тегами.

### Жизненный цикл

```js
class UserCard extends HTMLElement {
  constructor() {
    super()
    console.log('Создан')
  }

  connectedCallback() {
    console.log('Добавлен в DOM')
    this.render()
  }

  disconnectedCallback() {
    console.log('Удалён из DOM')
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.log(`Атрибут ${name} изменён: ${oldVal} → ${newVal}`)
    this.render()
  }

  static get observedAttributes() {
    return ['name', 'role']
  }

  render() {
    this.innerHTML = `
      <div class="card">
        <h3>${this.getAttribute('name') || 'Без имени'}</h3>
        <p>${this.getAttribute('role') || ''}</p>
      </div>
    `
  }
}

customElements.define('user-card', UserCard)
```

```html
<user-card name="Анна" role="Разработчик"></user-card>
```

### observedAttributes

Чтобы реагировать на изменения атрибутов — укажите их в `observedAttributes`. Тогда `attributeChangedCallback` вызовется при каждом изменении:

```js
document.querySelector('user-card').setAttribute('name', 'Иван')
```

## Shadow DOM

Shadow DOM создаёт изолированное дерево DOM внутри элемента. Стили внутри не утекают наружу, внешние стили не ломают компонент.

### Подключение Shadow DOM

```js
class MyTooltip extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .tooltip {
          position: relative;
          display: inline-block;
          cursor: help;
        }
        .tooltip-text {
          visibility: hidden;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
        }
        .tooltip:hover .tooltip-text {
          visibility: visible;
        }
      </style>
      <div class="tooltip">
        <slot></slot>
        <span class="tooltip-text">${this.getAttribute('text')}</span>
      </div>
    `
  }
}

customElements.define('my-tooltip', MyTooltip)
```

```html
<my-tooltip text="Подсказка">Наведи курсор</my-tooltip>
```

### open и closed

- `mode: 'open'` — `element.shadowRoot` доступен из JavaScript
- `mode: 'closed'` — `element.shadowRoot` возвращает `null`, доступ только внутри класса

Используйте `open` — `closed` почти не нужен на практике.

### Инкапсуляция стилей

Стили внутри Shadow DOM не влияют на внешнюю страницу, и наоборот:

```html
<style>
  p { color: red; }
</style>

<my-component></my-component>

<script>
  class MyComponent extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          p { color: blue; }
        </style>
        <p>Этот текст синий, не красный</p>
      `
    }
  }
  customElements.define('my-component', MyComponent)
</script>
```

## Templates и Slots

### template

`<template>` — HTML, который не рендерится, но доступен через JS:

```html
<template id="card-template">
  <style>
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    .card h3 { margin: 0 0 8px; }
  </style>
  <div class="card">
    <h3><slot name="title">Заголовок</slot></h3>
    <div><slot>Контент по умолчанию</slot></div>
  </div>
</template>
```

```js
class CardTemplate extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const template = document.getElementById('card-template')
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

customElements.define('card-tpl', CardTemplate)
```

### slot

`<slot>` — место, куда вставляется дочерний контент:

```html
<card-tpl>
  <span slot="title">Моя карточка</span>
  <p>Содержимое карточки</p>
</card-tpl>
```

Именованные слоты — `slot="title"` попадает в `<slot name="title">`. Контент без `slot` — в `<slot>` без имени (default slot).

## Взаимодействие снаружи

### CSS Custom Properties — «прокол» Shadow DOM

CSS-переменные проходят через Shadow DOM:

```js
this.shadowRoot.innerHTML = `
  <style>
    .btn {
      background: var(--btn-bg, #6366f1);
      color: var(--btn-color, white);
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
  <button class="btn"><slot></slot></button>
`
```

```html
<style>
  my-button {
    --btn-bg: #ef4444;
  }
</style>

<my-button>Красная кнопка</my-button>
```

### ::part() — стилизация изнутри снаружи

```js
this.shadowRoot.innerHTML = `
  <style>.header { padding: 16px; }</style>
  <div class="header" part="header"><slot></slot></div>
`
```

```css
my-card::part(header) {
  background: #f9fafb;
}
```

### События

События из Shadow DOM по умолчанию **retarget**'ятся — `event.target` указывает на host-элемент, не на внутренний:

```js
this.shadowRoot.querySelector('button').addEventListener('click', () => {
  this.dispatchEvent(new CustomEvent('my-click', {
    bubbles: true,
    composed: true,
    detail: { value: 42 }
  }))
})
```

`composed: true` — событие проходит через Shadow DOM-границу.

```js
document.querySelector('my-button').addEventListener('my-click', (e) => {
  console.log(e.detail.value)
})
```

## Практический пример — Modal

```js
class ModalDialog extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.close = this.close.bind(this)
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host([open]) .backdrop { display: grid; }
        .backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          place-items: center;
          z-index: 1000;
        }
        .dialog {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
        }
        .close {
          float: right;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      </style>
      <div class="backdrop">
        <div class="dialog">
          <button class="close" aria-label="Закрыть">&times;</button>
          <slot></slot>
        </div>
      </div>
    `

    this.shadowRoot.querySelector('.close').addEventListener('click', this.close)
    this.shadowRoot.querySelector('.backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('backdrop')) this.close()
    })
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('.close').removeEventListener('click', this.close)
  }

  close() {
    this.removeAttribute('open')
  }
}

customElements.define('modal-dialog', ModalDialog)
```

```html
<modal-dialog open>
  <h2>Подтверждение</h2>
  <p>Вы уверены?</p>
</modal-dialog>
```

## Web Components и фреймворки

- **Vue** — `app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')`
- **React** — работает, но свойства передаются как атрибуты. Пакет `@lit-labs/react` для удобной обёртки
- **Nuxt** — в `nuxt.config.ts`: `vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('my-') } }`

## Когда использовать

Подходит:
- Дизайн-системы, используемые в разных проектах и фреймворках
- Виджеты для встраивания (виджет комментариев, оплаты)
- Изолированные компоненты (расширения браузера, email)

Не подходит:
- Как замена фреймворку для целого приложения
- Нужна реактивность данных (Web Components её не дают — DIY)

## Итог

- `customElements.define('my-tag', class)` — создание своего HTML-тега
- Имя тега с дефисом обязательно
- `attachShadow({ mode: 'open' })` — изолированные стили
- `<template>` + `<slot>` — шаблоны с контентом извне
- CSS-переменные и `::part()` — стилизация Shadow DOM снаружи
- `CustomEvent` с `composed: true` — проброс событий
