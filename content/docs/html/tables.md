---
title: "Таблицы в HTML: table, thead, tbody, адаптивные таблицы"
description: "HTML таблицы — table, thead, tbody, tfoot, th, colspan, rowspan, адаптивные таблицы, стилизация CSS, доступность и caption для подписей."
section: html
difficulty: beginner
readTime: 7
order: 7
tags: [таблицы, table, thead, tbody, адаптивные таблицы, HTML, colspan, rowspan]
---

## Базовая таблица

```html
<table>
  <tr>
    <th>Имя</th>
    <th>Возраст</th>
    <th>Город</th>
  </tr>
  <tr>
    <td>Анна</td>
    <td>25</td>
    <td>Москва</td>
  </tr>
  <tr>
    <td>Иван</td>
    <td>30</td>
    <td>Санкт-Петербург</td>
  </tr>
</table>
```

- `<table>` — контейнер таблицы
- `<tr>` — строка (table row)
- `<th>` — заголовок столбца (table header), жирный и по центру по умолчанию
- `<td>` — ячейка с данными (table data)

## Полная структура

```html
<table>
  <caption>Список сотрудников</caption>
  <thead>
    <tr>
      <th>Имя</th>
      <th>Должность</th>
      <th>Зарплата</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Анна</td>
      <td>Разработчик</td>
      <td>150 000</td>
    </tr>
    <tr>
      <td>Иван</td>
      <td>Дизайнер</td>
      <td>130 000</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">Итого:</td>
      <td>280 000</td>
    </tr>
  </tfoot>
</table>
```

- `<caption>` — заголовок таблицы, идёт сразу после `<table>`
- `<thead>` — шапка с заголовками столбцов
- `<tbody>` — основное содержимое
- `<tfoot>` — подвал с итогами

Эти теги не обязательны, но помогают: стилизовать части таблицы отдельно, печатать шапку на каждой странице, скринридерам ориентироваться.

## colspan и rowspan

### colspan — объединение столбцов

```html
<table>
  <tr>
    <th colspan="3">Первый квартал</th>
    <th colspan="3">Второй квартал</th>
  </tr>
  <tr>
    <th>Янв</th>
    <th>Фев</th>
    <th>Мар</th>
    <th>Апр</th>
    <th>Май</th>
    <th>Июн</th>
  </tr>
</table>
```

### rowspan — объединение строк

```html
<table>
  <tr>
    <td rowspan="3">Фронтенд</td>
    <td>HTML</td>
  </tr>
  <tr>
    <td>CSS</td>
  </tr>
  <tr>
    <td>JavaScript</td>
  </tr>
</table>
```

## Стилизация таблиц

### Базовые стили

```css
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}

tfoot td {
  font-weight: 700;
  border-top: 2px solid #d1d5db;
  border-bottom: none;
}
```

`border-collapse: collapse` — убирает двойные границы между ячейками.

### Чередование строк (зебра)

```css
tbody tr:nth-child(even) {
  background: #f9fafb;
}
```

### Hover-эффект

```css
tbody tr:hover {
  background: #f0f0ff;
}
```

### Выравнивание чисел

Числа в столбцах выравнивайте по правому краю:

```css
td:is(:nth-child(3)) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

`font-variant-numeric: tabular-nums` — все цифры одной ширины, столбец не «пляшет».

## Адаптивные таблицы

Таблицы широкие — на мобильных вылезают за экран. Три подхода.

### 1. Горизонтальная прокрутка

Самый простой — обернуть в `overflow-x: auto`:

```html
<div class="table-wrapper">
  <table>...</table>
</div>
```

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### 2. Sticky-столбец

Первый столбец фиксирован, остальное прокручивается:

```css
.table-wrapper {
  overflow-x: auto;
}

table {
  min-width: 600px;
}

th:first-child,
td:first-child {
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}
```

### 3. Перестройка в карточки

На мобильных каждая строка превращается в карточку:

```css
@media (max-width: 640px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead {
    display: none;
  }

  tbody tr {
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
  }

  td {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border: none;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #374151;
  }
}
```

```html
<tr>
  <td data-label="Имя">Анна</td>
  <td data-label="Должность">Разработчик</td>
  <td data-label="Зарплата">150 000</td>
</tr>
```

## Доступность

### scope — связь заголовков с данными

```html
<table>
  <tr>
    <th scope="col">Имя</th>
    <th scope="col">Возраст</th>
  </tr>
  <tr>
    <th scope="row">Анна</th>
    <td>25</td>
  </tr>
</table>
```

`scope="col"` — заголовок столбца. `scope="row"` — заголовок строки. Скринридер прочитает: «Анна, Возраст 25».

### headers — явная связь

Для сложных таблиц с colspan/rowspan:

```html
<table>
  <tr>
    <th id="q1" colspan="3">Первый квартал</th>
  </tr>
  <tr>
    <th id="jan" headers="q1">Янв</th>
    <th id="feb" headers="q1">Фев</th>
    <th id="mar" headers="q1">Мар</th>
  </tr>
  <tr>
    <td headers="q1 jan">100</td>
    <td headers="q1 feb">120</td>
    <td headers="q1 mar">110</td>
  </tr>
</table>
```

### summary (устаревший)

Раньше использовали атрибут `summary` на `<table>`. Теперь — `<caption>` или `aria-describedby`:

```html
<p id="table-desc">Таблица показывает продажи по месяцам за 2024 год.</p>
<table aria-describedby="table-desc">
  <caption>Продажи 2024</caption>
  ...
</table>
```

## Сортировка на JavaScript

```js
function sortTable(table, colIndex, asc = true) {
  const tbody = table.querySelector('tbody')
  const rows = Array.from(tbody.querySelectorAll('tr'))

  rows.sort((a, b) => {
    const aVal = a.cells[colIndex].textContent.trim()
    const bVal = b.cells[colIndex].textContent.trim()

    const aNum = parseFloat(aVal.replace(/\s/g, ''))
    const bNum = parseFloat(bVal.replace(/\s/g, ''))

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return asc ? aNum - bNum : bNum - aNum
    }

    return asc
      ? aVal.localeCompare(bVal, 'ru')
      : bVal.localeCompare(aVal, 'ru')
  })

  rows.forEach((row) => tbody.appendChild(row))
}
```

## Практический пример

```html
<div class="table-wrapper">
  <table>
    <caption>Рейтинг участников</caption>
    <thead>
      <tr>
        <th>#</th>
        <th>Участник</th>
        <th>Задачи</th>
        <th>Баллы</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="#">1</td>
        <td data-label="Участник">Алексей</td>
        <td data-label="Задачи">42</td>
        <td data-label="Баллы">1 250</td>
      </tr>
      <tr>
        <td data-label="#">2</td>
        <td data-label="Участник">Мария</td>
        <td data-label="Задачи">38</td>
        <td data-label="Баллы">1 100</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Итог

- `<thead>`, `<tbody>`, `<tfoot>` — структурируют таблицу
- `<caption>` — заголовок таблицы для доступности
- `colspan` и `rowspan` — объединение ячеек
- `border-collapse: collapse` — обязательное правило для нормальных таблиц
- Адаптивность: `overflow-x: auto`, sticky-столбец или карточки
- `scope` и `headers` — для доступности сложных таблиц
- `font-variant-numeric: tabular-nums` — ровные числовые столбцы
