---
title: "Figma для разработчика: экспорт, Auto Layout, Dev Mode"
description: "Работа фронтенд-разработчика с Figma: экспорт ассетов, понимание Auto Layout, Dev Mode, CSS-инспектор, плагины и правила передачи макетов от дизайнера."
section: tools
difficulty: beginner
readTime: 13
order: 8
tags: [figma, design, export, auto-layout, dev-mode, css]
---

## Зачем Figma фронтендеру

Figma — основной инструмент дизайнеров интерфейсов. Если вы работаете в команде с дизайнером, макеты придут в Figma. Фронтендеру нужно уметь:
- Читать макеты и понимать структуру
- Извлекать CSS-свойства (цвета, шрифты, отступы)
- Экспортировать иконки и изображения
- Понимать Auto Layout (аналог Flexbox)
- Использовать Dev Mode для ускорения вёрстки

## Интерфейс Figma

### Основные панели

- **Layers** (слева) — дерево слоёв, как DOM-дерево. Группы, фреймы, компоненты
- **Canvas** (центр) — сам макет. Можно зумить (`Cmd +/-`), панорамировать (пробел + перетаскивание)
- **Properties** (справа) — свойства выбранного элемента: размеры, позиция, цвета, шрифты
- **Toolbar** (верх) — инструменты: Select (V), Frame (F), Rectangle (R), Text (T)

### Ключевые понятия

| Понятие | Описание | Аналог в CSS |
|---|---|---|
| **Frame** | Контейнер для элементов | `div`, `section` |
| **Auto Layout** | Автоматическое расположение | Flexbox |
| **Component** | Переиспользуемый элемент | Vue/React-компонент |
| **Variant** | Вариант компонента (hover, disabled) | CSS-состояния |
| **Constraint** | Как элемент ведёт себя при ресайзе | `position`, `flex` |
| **Grid** | CSS Grid внутри фрейма | CSS Grid |

## Чтение макета: что смотреть

### Размеры

Выберите элемент → Properties → ширина и высота. Если стоит `Hug` — размер по контенту (`fit-content`). Если `Fill` — заполняет контейнер (`width: 100%`).

### Отступы

Выберите Frame с Auto Layout → Properties → показаны padding и gap:
- **Padding**: top, right, bottom, left
- **Gap**: расстояние между дочерними элементами (аналог `gap` в CSS)

### Цвета

Выберите элемент → Fill → цвет в HEX, RGBA или HSLA.

Частые форматы:
- `#6366f1` — HEX (Indigo 500)
- `rgba(99, 102, 241, 0.8)` — с прозрачностью
- `hsla(239, 84%, 67%, 1)` — HSL

### Типографика

Выберите текст → Properties → Text:
- **Font family** (Inter, Roboto, Montserrat)
- **Font weight** (Regular 400, Medium 500, Semi-Bold 600, Bold 700)
- **Font size** (в px)
- **Line height** (120%, 140%, 150%)
- **Letter spacing** (0, -0.5%, 1%)

В CSS:
```css
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 16px;
line-height: 1.5;         /* 150% → 1.5 */
letter-spacing: -0.01em;  /* -1% → -0.01em */
```

### Тени и эффекты

Properties → Effects:
- **Drop shadow** → `box-shadow`
- **Inner shadow** → `box-shadow: inset ...`
- **Layer blur** → `filter: blur(8px)`
- **Background blur** → `backdrop-filter: blur(8px)`

Пример из Figma:
```
Drop shadow:
  X: 0, Y: 4, Blur: 12, Spread: 0, Color: rgba(0,0,0,0.1)
```

CSS:
```css
box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
```

### Border Radius

Properties → Corner radius. Можно задать разные для каждого угла:

```
Все углы: 8px → border-radius: 8px
TL: 8, TR: 8, BR: 0, BL: 0 → border-radius: 8px 8px 0 0
```

## Auto Layout — Flexbox в Figma

Auto Layout — самый важный инструмент для понимания макетов. Он работает как Flexbox.

### Направление

- **Horizontal** → `flex-direction: row`
- **Vertical** → `flex-direction: column`

### Выравнивание

- **Primary axis** (главная ось):
  - Start → `justify-content: flex-start`
  - Center → `justify-content: center`
  - End → `justify-content: flex-end`
  - Space between → `justify-content: space-between`

- **Counter axis** (поперечная ось):
  - Start → `align-items: flex-start`
  - Center → `align-items: center`
  - End → `align-items: flex-end`
  - Stretch → `align-items: stretch`

### Gap

Gap между элементами → `gap: 8px`

### Padding

Padding контейнера → `padding: 12px 16px`

### Wrap

Auto Layout → Wrap: Yes → `flex-wrap: wrap`

### Пример: кнопка

Figma:
- Frame с Auto Layout (Horizontal)
- Padding: 12px 24px
- Gap: 8px
- Background: #6366f1
- Corner radius: 8px
- Children: icon + text

CSS:
```css
.button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #6366f1;
  border-radius: 8px;
  color: white;
}
```

## Dev Mode

Dev Mode — режим Figma специально для разработчиков. Показывает CSS-свойства, токены и готовый код.

### Включение

Переключатель «Dev Mode» в правом верхнем углу (или `Shift+D`). Интерфейс меняется: меньше дизайна, больше кода.

### Что видно в Dev Mode

- **CSS-код** — готовые стили выбранного элемента
- **Token names** — имена токенов дизайн-системы (colors, spacing, typography)
- **Dimensions** — размеры и отступы относительно соседних элементов
- **Assets** — экспортируемые ресурсы

### Code-панель

Dev Mode показывает код в разных форматах:
- **CSS** — чистый CSS
- **Tailwind CSS** — классы Tailwind
- **iOS** — Swift
- **Android** — Kotlin/XML

Пример CSS:
```css
.card {
  width: 320px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

Пример Tailwind:
```html
<div class="w-80 p-4 bg-white rounded-xl shadow-sm flex flex-col gap-3">
```

### Inspect Mode

Нажмите `I` (Inspect) и кликните на элемент — увидите:
- Расстояние до соседних элементов (красные линии)
- Точные координаты
- Разницу между текущим состоянием и компонентом

## Экспорт ассетов

### Иконки (SVG)

1. Выберите иконку в макете
2. Properties → Export → + (добавить формат)
3. Формат: **SVG**
4. Нажмите **Export**

SVG — лучший формат для иконок. Масштабируется без потери качества, можно менять цвет через CSS.

### Изображения

1. Выберите изображение
2. Export → формат: **PNG** или **WebP**
3. Укажите множитель: `1x`, `2x` (для Retina), `3x`

Правила:
- Иконки и логотипы → **SVG**
- Фотографии и сложные изображения → **WebP** (или PNG)
- Для Retina-дисплеев всегда экспортируйте `2x`

### Массовый экспорт

Выберите несколько элементов → Export All. Или используйте плагин **Export All**.

### Экспорт через плагины

**Similayer** — находит все слои с одинаковыми свойствами (все кнопки одного цвета, например).

**Figma to Code** — генерирует HTML/CSS из макета. Полезно как отправная точка.

## Полезные плагины

### Для разработчика

| Плагин | Описание |
|---|---|
| **CSS Genie** | Генерация CSS из выбранного элемента |
| **Tailwind CSS** | Показывает Tailwind-классы для элемента |
| **Content Buddy** | Быстрая замена текста (для тестирования длинных строк) |
| **ImageTracer** | Конвертация растровых изображений в SVG |
| **Remove BG** | Удаление фона с фотографий |
| **Iconify** | Вставка иконок из огромной библиотеки |

Установка: Resources (Shift+I) → поиск → Install.

## Правила работы с дизайнером

### Что попросить у дизайнера

1. **Components** — все повторяющиеся элементы должны быть компонентами
2. **Variants** — кнопки в разных состояниях (default, hover, disabled, loading)
3. **Auto Layout** — все контейнеры должны использовать Auto Layout (не ручное позиционирование)
4. **Design Tokens** — цвета и типографика должны использовать стили (Local Styles)
5. **Responsive** — макеты для мобильных и десктопов (минимум 2 брейкпоинта)
6. **Spacing** — отступы должны быть кратны 4px или 8px

### Комментирование

В Figma можно оставлять комментарии прямо на макете (клавиша `C`). Фронтендер может отметить:
- «Какой тут шрифт?»
- «Этот отступ 12px или 16px?»
- «Как ведёт себя кнопка при hover?»

### Версионирование

Figma сохраняет историю изменений. Если дизайнер случайно удалил элемент: File → Version history → восстановить.

## Layout Grid

Дизайнеры часто включают Grid-наложение на макет (View → Layout Grid). Это помогает:
- Понять сетку (12 колонок, 8px gutter)
- Правильно задать `max-width` контейнера
- Считать отступы

## Практика: вёрстка по макету

1. Откройте макет в Dev Mode
2. Найдите корневой фрейм → определите `max-width`, `padding`, `gap`
3. Войдите в дочерние элементы → определите Flexbox/Grid
4. Извлеките цвета и шрифты из Design Tokens
5. Экспортируйте иконки как SVG
6. Экспортируйте изображения как WebP
7. Сверстайте компонент-за-компонентом
8. Проверьте в Dev Mode, что отступы и размеры совпадают

## Итог

- Figma — основной источник правды для вёрстки
- Auto Layout = Flexbox — понимание одного помогает с другим
- Dev Mode показывает CSS, Tailwind-классы и токены
- Экспортируйте иконки в SVG, изображения в WebP
- Просите дизайнера использовать Components, Variants и Auto Layout
- Комментируйте макеты — это быстрее, чем писать в чат
