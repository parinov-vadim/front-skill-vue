---
title: Flexbox
description: Flexbox — одномерная система раскладки для распределения пространства и выравнивания элементов в строке или столбце.
section: css
difficulty: beginner
readTime: 10
order: 2
tags: [flexbox, layout, alignment, flex]
---

## Основы Flexbox

Flexbox включается на **контейнере**. Все прямые дочерние элементы становятся **flex-элементами**.

```css
.container {
  display: flex;
}
```

По умолчанию элементы выстраиваются в **ряд** слева направо.

## Ось и направление

```css
.container {
  flex-direction: row;            /* → строка (по умолчанию) */
  flex-direction: row-reverse;    /* ← строка в обратном порядке */
  flex-direction: column;         /* ↓ столбец */
  flex-direction: column-reverse; /* ↑ столбец в обратном порядке */
}
```

Основная ось (main axis) определяется `flex-direction`. Поперечная ось (cross axis) — перпендикулярно основной.

## Перенос строк

```css
.container {
  flex-wrap: nowrap;       /* Без переноса (по умолчанию) */
  flex-wrap: wrap;         /* Перенос вниз */
  flex-wrap: wrap-reverse; /* Перенос вверх */
}

/* Сокращение direction + wrap */
.container {
  flex-flow: row wrap;
}
```

## Выравнивание по основной оси — justify-content

```css
.container {
  justify-content: flex-start;    /* ←  в начало */
  justify-content: flex-end;      /*  → в конец */
  justify-content: center;        /* •  по центру */
  justify-content: space-between; /* |• • •| равные пробелы между */
  justify-content: space-around;  /*  •  •  •  пробелы вокруг */
  justify-content: space-evenly;  /* | • • • | равные пробелы везде */
}
```

## Выравнивание по поперечной оси — align-items

```css
.container {
  align-items: stretch;     /* Растянуть по высоте (по умолчанию) */
  align-items: flex-start;  /* По верху */
  align-items: flex-end;    /* По низу */
  align-items: center;      /* По центру */
  align-items: baseline;    /* По базовой линии текста */
}
```

## Выравнивание нескольких строк — align-content

Работает только при `flex-wrap: wrap`:

```css
.container {
  align-content: flex-start;
  align-content: center;
  align-content: space-between;
  /* Аналогично justify-content, но для строк */
}
```

## Свойства flex-элементов

### flex-grow — как растягиваться

```css
.item-a { flex-grow: 1; } /* Занимает 1 долю свободного пространства */
.item-b { flex-grow: 2; } /* Занимает 2 доли — в 2 раза больше item-a */
```

### flex-shrink — как сжиматься

```css
.item {
  flex-shrink: 1; /* Сжимается (по умолчанию) */
  flex-shrink: 0; /* Не сжимается */
}
```

### flex-basis — начальный размер

```css
.item {
  flex-basis: auto;   /* Размер по содержимому (по умолчанию) */
  flex-basis: 200px;  /* Фиксированная начальная ширина */
  flex-basis: 33.33%; /* Процент от контейнера */
  flex-basis: 0;      /* Игнорировать содержимое при расчёте */
}
```

### Сокращение flex

```css
.item {
  flex: 1;         /* flex: 1 1 0  — растёт и сжимается */
  flex: auto;      /* flex: 1 1 auto */
  flex: none;      /* flex: 0 0 auto — не гибкий */
  flex: 0 0 200px; /* grow shrink basis */
}
```

### align-self — выравнивание отдельного элемента

```css
.special-item {
  align-self: flex-end; /* Переопределяет align-items контейнера */
}
```

### order — порядок отображения

```css
.first  { order: -1; } /* Стоит первым */
.normal { order: 0; }  /* По умолчанию */
.last   { order: 1; }  /* Стоит последним */
```

## Частые паттерны

### Горизонтальное и вертикальное центрирование

```css
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Навигационная панель

```css
.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar .logo { margin-right: auto; } /* Логотип слева, ссылки справа */
```

### Карточки одинаковой высоты

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 280px; /* Минимум 280px, растягивается */
  display: flex;
  flex-direction: column;
}

.card .footer {
  margin-top: auto; /* Footer прижат к низу карточки */
}
```

### Фиксированный sidebar + гибкий контент

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex: 0 0 260px; /* Фиксированная ширина, не сжимается */
}

.main {
  flex: 1; /* Занимает всё оставшееся пространство */
  min-width: 0; /* Предотвращает переполнение */
}
```

## gap

```css
.container {
  display: flex;
  gap: 16px;          /* Между всеми элементами */
  gap: 8px 16px;      /* Строки | Колонки */
  row-gap: 8px;
  column-gap: 16px;
}
```
