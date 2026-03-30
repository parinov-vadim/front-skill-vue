---
title: "Позиционирование в CSS: static, relative, absolute, fixed, sticky"
description: "CSS позиционирование — static, relative, absolute, fixed и sticky. Как работает position, контекст наложения, z-index и позиционирование относительно родителя."
section: css
difficulty: beginner
readTime: 10
order: 8
tags: [позиционирование, position, absolute, relative, fixed, sticky, z-index, CSS]
---

## position: static (по умолчанию)

Элементы идут в нормальном потоке — один за другим. Свойства `top`, `right`, `bottom`, `left` не работают:

```css
.box {
  position: static; /* по умолчанию */
  top: 50px;  /* не сработает */
}
```

## position: relative

Элемент остаётся в потоке, но его можно сдвинуть относительно его **исходной позиции**:

```css
.box {
  position: relative;
  top: 20px;   /* сдвинуть вниз на 20px */
  left: 30px;  /* сдвинуть вправо на 30px */
}
```

Два главных применения:

1. Сдвиг элемента, не влияя на соседей (пространство за ним сохраняется)
2. Создание контекста позиционирования для `absolute`-потомков

```css
.card {
  position: relative; /* стал «родителем отсчёта» */
}

.card .badge {
  position: absolute;
  top: -8px;
  right: -8px;
}
```

## position: absolute

Элемент **выпадает из потока** — соседи его не видят. Позиционируется относительно **ближайшего позиционированного предка** (не static):

```css
.parent {
  position: relative; /* без этого absolute будет считать от viewport */
}

.child {
  position: absolute;
  top: 10px;
  right: 10px;
}
```

Если ни у одного предка нет `position` — элемент позиционируется от `html` (страницы).

### Частые паттерны

**Бейдж в углу карточки:**
```css
.card {
  position: relative;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
}
```

**Центрирование:**
```css
.container {
  position: relative;
  height: 300px;
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**Оверлей:**
```css
.overlay {
  position: absolute;
  inset: 0; /* top: 0; right: 0; bottom: 0; left: 0; */
  background: rgba(0, 0, 0, 0.5);
}
```

**Растянуть на весь родитель:**
```css
.full-size {
  position: absolute;
  inset: 0;
}
```

## position: fixed

Элемент фиксируется относительно **viewport** — не двигается при прокрутке:

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  z-index: 100;
}

body {
  padding-top: 64px; /* компенсировать высоту header */
}
```

Предупреждение: `fixed` позиционируется от viewport, **если ни у одного предка нет `transform`, `perspective` или `filter`**. Если у родителя есть `transform` — fixed начнёт позиционироваться от этого родителя.

## position: sticky

Комбинация `relative` и `fixed`. Элемент ведёт себя как `relative`, пока не достигнет порога прокрутки — тогда «прилипает»:

```css
.table-header {
  position: sticky;
  top: 64px; /* прилипнет, когда до верха останется 64px */
  background: white;
  z-index: 10;
}

.sidebar-section {
  position: sticky;
  top: 80px;
}
```

Важно: sticky работает только если **родитель имеет достаточную высоту** для прокрутки. Не сработает, если у родителя `overflow: hidden`.

## z-index и контекст наложения

`z-index` определяет порядок перекрытия — кто выше, тот и виден:

```css
.header   { position: fixed;   z-index: 100; }
.modal    { position: fixed;   z-index: 200; }
.tooltip  { position: absolute; z-index: 300; }
```

**z-index работает только для позиционированных элементов** (не `static`).

### Контекст наложения (Stacking Context)

z-index не глобальный — он работает внутри контекста наложения. Новый контекст создаётся когда:

- `position` не `static` + `z-index` задан
- `opacity` меньше 1
- `transform` задан
- `filter` задан
- `isolation: isolate`
- `will-change` на определённые свойства

```html
<div class="parent" style="position: relative; z-index: 1;">
  <div class="child" style="position: absolute; z-index: 9999;"></div>
</div>
<div class="other" style="position: relative; z-index: 2;"></div>
```

`child` с `z-index: 9999` будет **ниже** `other` с `z-index: 2`, потому что родитель `parent` имеет `z-index: 1` < `2`. Внутри своего контекста child может быть сколь угодно высоким — это не выйдет за границы родителя.

## Сводная таблица

| Значение | В потоке? | Относительно чего | При прокрутке |
|----------|-----------|-------------------|---------------|
| `static` | да | — | — |
| `relative` | да | своя исходная позиция | прокручивается |
| `absolute` | нет | ближайший позиционированный предок | прокручивается с предком |
| `fixed` | нет | viewport | остаётся на месте |
| `sticky` | да | переключается: relative → viewport | прилипает к порогу |

## Практический пример: модальное окно

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: grid;
  place-items: center;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  padding: 24px;
  z-index: 1001;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
}
```

## Итог

- `static` — по умолчанию, свойства смещения не работают
- `relative` — сдвиг от своей позиции + создаёт контекст для `absolute`-детей
- `absolute` — выпадает из потока, позиционируется от ближайшего `relative`/`absolute`/`fixed` предка
- `fixed` — от viewport, не прокручивается
- `sticky` — прилипает при прокрутке
- `z-index` работает только внутри своего контекста наложения
