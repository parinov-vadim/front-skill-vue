---
title: "Chrome DevTools: Elements, Console, Network, Performance, Lighthouse"
description: "Chrome DevTools — встроенный инструмент разработчика в Chrome. Отладка HTML/CSS, консоль, анализ сети, профилирование производительности, аудит Lighthouse."
section: tools
difficulty: beginner
readTime: 16
order: 5
tags: [chrome, devtools, debugging, performance, lighthouse, network]
---

## Что такое Chrome DevTools

Chrome DevTools — набор инструментов для отладки, анализа и оптимизации веб-страниц, встроенный прямо в Google Chrome. Открыть: `F12`, `Cmd+Option+I` (Mac) или правый клик → «Посмотреть код».

DevTools состоит из панелей, каждая решает свою задачу:

| Панель | Задача |
|---|---|
| **Elements** | HTML и CSS: правка, инспектирование, Box Model |
| **Console** | Выполнение JS, логи, ошибки |
| **Sources** | Отладчик: брейкпоинты, пошаговое выполнение |
| **Network** | HTTP-запросы: время, размер, статус |
| **Performance** | Профилирование: что тормозит |
| **Memory** | Утечки памяти, heap snapshots |
| **Application** | Storage: localStorage, cookies, Service Workers |
| **Lighthouse** | Аудит: производительность, SEO, a11y |

## Elements — HTML и CSS

### Инспектирование элементов

Нажмите иконку с курсором (или `Cmd+Shift+C`) и кликните на любой элемент страницы. В панели Elements увидите:

1. **DOM-дерево** — HTML-структура с подсветкой
2. **Styles** — CSS-правила с возможностью редактирования
3. **Computed** — финальные вычисленные стили
4. **Layout** — CSS Grid и Flexbox визуализация
5. **Event Listeners** — подписки на события

### Редактирование CSS в реальном времени

В панели Styles можно:
- Менять значения свойств кликом
- Добавлять новые свойства
- Включать/выключать правила (чекбокс)
- Переключать цвета через палитру
- Менять размеры перетаскиванием в Box Model

### Box Model

Справа от Styles — визуальная модель блока. Показывает:
- **Content** — размеры контента
- **Padding** — внутренний отступ
- **Border** — граница
- **Margin** — внешний отступ

Можно кликнуть на любое значение и изменить прямо там.

### Редактирование HTML

- Двойной клик на теге — редактирование
- Правый клик → «Edit as HTML» — полный доступ
- `H` — скрыть элемент (visibility: hidden)
- `Delete` — удалить элемент
- Перетаскивание — переместить элемент в дереве

### Копирование стилей

Правый клик на элементе:
- **Copy → Copy selector** — CSS-селектор (`#header .nav-item`)
- **Copy → Copy styles** — все применённые стили
- **Copy → Copy JS path** — `document.querySelector('...')`
- **Copy → Copy XPath** — XPath-путь

## Console — консоль

### Основные методы

```js
console.log('Обычный лог')
console.warn('Предупреждение')
console.error('Ошибка')
console.info('Информация')
console.debug('Отладка')
```

### Удобные методы

```js
console.table([
  { name: 'Анна', age: 25 },
  { name: 'Иван', age: 30 },
])
// Выводит в виде таблицы с колонками

console.group('Загрузка данных')
console.log('Загрузка пользователей...')
console.log('Загрузка постов...')
console.groupEnd()

console.time('fetch')
await fetch('/api/users')
console.timeEnd('fetch')                        // fetch: 145ms

console.count('рендер')                         // рендер: 1, рендер: 2...
console.countReset('рендер')

console.dir(document.body)                      // DOM-дерево как объект

console.log('%c Красный текст', 'color: red; font-size: 20px')  // Стилизация
```

### $ — удобные переменные

```js
$('h1')                         // document.querySelector('h1')
$$('.card')                     // document.querySelectorAll('.card')
$0                              // Последний выбранный в Elements элемент
$1                              // Предпоследний выбранный
copy($0)                        // Скопировать в буфер обмена
clear()                         // Очистить консоль
```

### Фильтрация

Вверху консоли — фильтры по уровню (Errors, Warnings, Info, Verbose) и текстовый поиск. Также можно фильтровать:
- `/regex/` — регулярное выражение
- `-text` — исключить текст
- `url:example.com` — только из определённого источника

### Live Expressions

Кликните на иконку глаза 👁️ — добавьте выражение, которое будет обновляться в реальном времени:

```js
document.querySelectorAll('.todo-item').length
```

## Sources — отладчик

### Брейкпоинты

Кликните на номер строки в Sources — синяя точка означает брейкпоинт. Код остановится на этой строке.

Типы брейкпоинтов:

| Тип | Как поставить | Когда срабатывает |
|---|---|---|
| Строка | Клик на номер | При достижении строки |
| Условный | Правый клик → «Add conditional breakpoint» | Если условие истинно |
| Logpoint | Правый клик → «Add logpoint» | Логирует без остановки |
| DOM | Elements → правый клик → «Break on» | При изменении DOM |
| XHR/Fetch | Sources → XHR/fetch Breakpoints | При определённом URL |
| Event Listener | Sources → Event Listener Breakpoints | При событии (click, keydown) |

### Управление выполнением

Когда код остановлен на брейкпоинте:

- **Resume** (`F8`) — продолжить выполнение
- **Step Over** (`F10`) — выполнить текущую строку, не заходя в функции
- **Step Into** (`F11`) — зайти внутрь функции
- **Step Out** (`Shift+F11`) — выйти из текущей функции
- **Step** (`F9`) — выполнить один шаг

### Watch Expressions

В правой панели — Watch. Добавьте выражения, значения которых хотите отслеживать:

```js
this.count
user.name
response.status
```

### Call Stack и Scope

- **Call Stack** — стек вызовов (какой код привёл сюда)
- **Scope** — локальные и глобальные переменные с текущими значениями

### Source Maps

Если код минифицирован или скомпилирован (TypeScript, Vue SFC), Source Maps позволяют видеть исходный код. Vite и Webpack генерируют их автоматически в dev-режиме.

## Network — анализ запросов

### Основная панель

Откройте Network и перезагрузите страницу. Вы увидите все HTTP-запросы:

| Колонка | Описание |
|---|---|
| Name | URL и метод |
| Status | HTTP-статус (200, 404, 500) |
| Type | MIME-тип (document, script, stylesheet, xhr) |
| Initiator | Что вызвало запрос |
| Size | Размер (реальный и transfer) |
| Time | Время загрузки |
| Waterfall | Визуальная шкала времени |

### Фильтрация

- **All** — все запросы
- **Fetch/XHR** — AJAX-запросы
- **JS** — JavaScript-файлы
- **CSS** — стили
- **Img** — изображения
- **Font** — шрифты
- **Doc** — HTML-документы

Текстовый фильтр и RegExp поддерживаются.

### Анализ конкретного запроса

Кликните на запрос → вкладки:
- **Headers** — URL, метод, статус, заголовки запроса и ответа
- **Payload** — тело запроса (form data, JSON)
- **Preview** — отформатированный ответ (JSON, HTML)
- **Response** — сырой ответ
- **Timing** — тайминг в миллисекундах:
  - Queueing — ожидание в очереди
  - DNS Lookup — DNS-запрос
  - Initial connection — установка соединения
  - SSL — TLS-хэндшейк
  - Waiting (TTFB) — время до первого байта
  - Content Download — загрузка контента

### Throttling — эмуляция медленного соединения

В выпадающем списке «No throttling» выберите:
- **Fast 3G** — 1.6 Мбит/с
- **Slow 3G** — 0.4 Мбит/с
- **Offline** — нет сети

Или создайте свой профиль. Полезно проверять, как приложение работает на медленном мобильном интернете.

### Disable cache

Чекбокс «Disable cache» (доступен при открытых DevTools) — браузер не использует кэш. Обязательно включать при отладке.

### Copy as fetch / cURL

Правый клик на запросе → Copy:
- **Copy as fetch** — готовый JS-код с `fetch()`
- **Copy as cURL** — команда для терминала
- **Copy as Node.js fetch** — для Node.js

## Performance — профилирование

### Запись производительности

1. Откройте Performance
2. Нажмите **Record** (или `Cmd+E`)
3. Выполните действие на странице (скролл, клики)
4. Нажмите **Stop**

Появится таймлайн с четырьмя секциями:

1. **FPS** — кадры в секунду (зелёная = хорошо, красная = проблемы)
2. **CPU** — загрузка процессора (цвета: синий = HTML, жёлтый = JS, фиолетовый = стиль, серый = система)
3. **NET** — сетевые запросы
4. **Main** — основной поток (Flame Chart)

### Анализ Flame Chart

Flame Chart показывает, что происходило на основном потоке:
- Широкие блоки = длительные задачи (> 50 мс — проблема)
- Жёлтые блоки = JavaScript
- Фиолетовые = стиль и расчёт layout
- Зелёные = рисование (paint)

Клик на блоке покажет Detail panel с информацией о функции, файле и времени.

### Long Tasks

Если задача занимает более 50 мс, она блокирует основной поток и вызывает jank (подтормаживание). Ищите блоки с красной полоской сверху.

### Rendering — визуализация перерисовок

В меню (⋮) → More tools → Rendering:
- **Paint flashing** — подсвечивает перерисованные области зелёным
- **Layout Shift Regions** — подсвечивает сдвиги макета синим
- **FPS Meter** — счётчик кадров в углу экрана

## Application — хранилище

### Storage

- **Local Storage** — `localStorage` (постоянное)
- **Session Storage** — `sessionStorage` (до закрытия вкладки)
- **Cookies** — все куки с домена, можно редактировать и удалять
- **IndexedDB** — структурированное хранилище
- **Cache Storage** — кэш Service Worker

Для каждого хранилища можно:
- Просмотреть данные
- Отредактировать значения
- Удалить отдельные записи
- Очистить всё (кнопка Clear site data)

### Service Workers

В Application → Service Workers:
- Статус (running, stopped)
- Обновление (Update)
- Отклонение (Unregister)
- Offline-режим (чекбокс)

## Lighthouse — аудит

Lighthouse автоматически анализирует страницу по пяти категориям:

| Категория | Что проверяет |
|---|---|
| Performance | Скорость загрузки и отклика |
| Accessibility | Доступность для людей с ограничениями |
| Best Practices | Современные веб-практики |
| SEO | Поисковая оптимизация |
| Progressive Web App | PWA-совместимость |

### Запуск

1. Откройте Lighthouse
2. Выберите категории
3. Device: Mobile или Desktop
4. Нажмите «Analyze page load»

Через 10–30 секунд получите отчёт с оценками 0–100.

### Основные метрики Performance

- **FCP** (First Contentful Paint) — первый контент появился (текст, изображение)
- **LCP** (Largest Contentful Paint) — основной контент загрузился (цель < 2.5 сек)
- **TBT** (Total Blocking Time) — общее время блокировки (цель < 200 мс)
- **CLS** (Cumulative Layout Shift) — сдвиги макета (цель < 0.1)
- **SI** (Speed Index) — скорость отображения контента

### Работа с отчётом

Каждая проблема имеет:
- Описание
- Почему это важно
- Конкретную рекомендацию
- Ссылку на документацию

Lighthouse сохраняет историю отчётов. Можно сравнить до и после оптимизации.

## Мобильная отладка

### Device Mode

Иконка телефона 📱 в левом верхнем углу DevTools включает режим устройства:
- Выбор устройства (iPhone, Pixel, Galaxy)
- Настраиваемый размер viewport
- Масштабирование (75%, 100%, 150%)
- Throttling сети
- Эмуляция touch-событий

### Удалённая отладка (реальное устройство)

1. Подключите телефон к компьютеру по USB
2. На телефоне: Настройки → Для разработчиков → USB-отладка
3. Chrome на компьютере: `chrome://inspect`
4. Увидите вкладки с телефона — можно inspect

## Быстрые клавиши

| Комбинация | Действие |
|---|---|
| `F12` / `Cmd+Option+I` | Открыть DevTools |
| `Cmd+Shift+C` | Режим инспектирования |
| `Cmd+Shift+M` | Device Mode |
| `Cmd+[` / `Cmd+]` | Переключение панелей |
| `Esc` | Показать/скрыть Drawer |
| `Cmd+K` (в Console) | Очистить консоль |
| `Cmd+F` (в Sources) | Поиск в файлах |
| `Cmd+Option+F` | Глобальный поиск |
| `Cmd+Shift+O` | Переход к файлу/функции |
| `Cmd+E` | Start/Stop запись в Performance |

## Сниппеты (Snippets)

Sources → Snippets — можно сохранить JS-код и запускать в любой момент:

```js
// Сниппет: показать все обработчики событий
Array.from(document.querySelectorAll('*'))
  .filter(el => el.onclick || getEventListeners(el).click)
  .map(el => ({
    tag: el.tagName,
    class: el.className,
    listeners: Object.keys(getEventListeners(el)),
  }))
```

## Итог

- **Elements** — правка HTML/CSS в реальном времени, Box Model
- **Console** — выполнение JS, логирование, `$()` для быстрого доступа
- **Sources** — брейкпоинты, пошаговая отладка, Watch-выражения
- **Network** — анализ HTTP-запросов, throttling, copy as fetch
- **Performance** — профилирование, поиск долгих задач, flame chart
- **Lighthouse** — автоматический аудит с оценками
- **Application** — localStorage, cookies, Service Workers
- Учитесь использовать DevTools каждый день — это самый мощный инструмент фронтендера
