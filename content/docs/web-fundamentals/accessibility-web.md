---
title: "Web Accessibility (WCAG 2.1): стандарты и чеклист"
description: "Доступность веб-приложений: WCAG 2.1, принципы доступности, ARIA-атрибуты, семантическая разметка, клавиатурная навигация и чеклист для фронтендера."
section: web-fundamentals
difficulty: intermediate
readTime: 14
order: 14
tags: [accessibility, a11y, wcag, aria, screen-reader, keyboard]
---

## Что такое Web Accessibility

Web Accessibility (a11y) — практика создания сайтов, которыми могут пользоваться все люди, включая тех, с ограниченными возможностями:
- Слабовидящие и слепые (скринридеры)
- Люди с моторными нарушениями (клавиатурная навигация)
- Люди с когнитивными особенностями
- Люди с временными ограничениями (сломанная рука, яркий свет)

Доступность — не только этика, но и закон. В США — ADA, в ЕС — European Accessibility Act (с 2025 года).

## WCAG 2.1

WCAG (Web Content Accessibility Guidelines) — стандарт W3C. WCAG 2.1 — актуальная версия.

### Четыре принципа (POUR)

| Принцип | Описание | Пример |
|---|---|---|
| **Perceivable** | Информация должна быть воспринимаема | alt для изображений, субтитры |
| **Operable** | Интерфейс должен быть управляем | Клавиатурная навигация |
| **Understandable** | Контент должен быть понятен | Чёткие инструкции, язык страницы |
| **Robust** | Совместимость с разными инструментами | Правильный HTML, ARIA |

### Три уровня соответствия

- **A** — минимальный (обязательный)
- **AA** — стандартный (рекомендуемый для большинства)
- **AAA** — максимальный (не всегда достижим)

## Семантическая разметка

Правильный HTML — основа доступности. Скринридеры используют теги для навигации.

### Страница

```html
<header>
  <nav aria-label="Основная навигация">
    <ul>
      <li><a href="/">Главная</a></li>
      <li><a href="/tasks">Задачи</a></li>
      <li><a href="/docs">Документация</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Замыкания в JavaScript</h1>
    <p>Замыкание — это...</p>

    <section aria-labelledby="examples-heading">
      <h2 id="examples-heading">Примеры</h2>
      <pre><code>...</code></pre>
    </section>
  </article>

  <aside aria-label="Содержание">
    <nav>
      <ul>
        <li><a href="#examples-heading">Примеры</a></li>
      </ul>
    </nav>
  </aside>
</main>

<footer>
  <p>&copy; 2025 FrontSkill</p>
</footer>
```

### Заголовки

```html
<h1>Заголовок страницы</h1>          <!-- Один h1 на страницу -->
  <h2>Раздел</h2>
    <h3>Подраздел</h3>
  <h2>Другой раздел</h2>
```

Скринридер может вывести список всех заголовков для навигации. Пропуск уровней (`h1` → `h4`) — ошибка.

### Списки

```html
<ul>
  <li>Элемент 1</li>
  <li>Элемент 2</li>
</ul>

<ol>
  <li>Шаг 1</li>
  <li>Шаг 2</li>
</ol>
```

Скринридер объявляет: «Список, 2 элемента».

## Альтернативный текст

```html
<img src="logo.svg" alt="FrontSkill — платформа для фронтенд-задач">

<img src="chart.png" alt="График: 75% разработчиков используют TypeScript в 2025 году">

<img src="decorative-line.svg" alt="" role="presentation">
```

- **Информативные изображения** — описательный alt
- **Декоративные изображения** — `alt=""` и `role="presentation"`
- Никогда не убирайте `alt` совсем — скринридер прочитает имя файла

## Клавиатурная навигация

Многие пользователи не используют мышь. Все интерактивные элементы должны быть доступны через Tab.

### Фокус

```css
:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;       /* Убрать outline при клике мышью */
}
```

Никогда не убирайте outline глобально:
```css
*:focus { outline: none; }    /* ПЛОХО! */
```

### tabindex

```html
<button>Кликабелен по умолчанию</button>           <!-- tabindex 0 (не нужен) -->
<div tabindex="0" role="button">Кастомная кнопка</div>  <!-- Добавляет в Tab-порядок -->
<div tabindex="-1">Программный фокус</div>           <!-- Только через JS -->
```

- `tabindex="0"` — добавить в Tab-порядок
- `tabindex="-1"` — программный фокус (не через Tab)
- `tabindex="1+"` — **не используйте** — ломает естественный порядок

### Кастомные виджеты

Если создаёте кастомную кнопку из `<div>`, нужно вручную добавить:

```html
<div
  role="button"
  tabindex="0"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space="handleClick"
>
  Нажми меня
</div>
```

Или просто используйте `<button>` — всё из коробки:
```html
<button @click="handleClick">Нажми меня</button>
```

## ARIA-атрибуты

ARIA (Accessible Rich Internet Applications) — атрибуты, которые добавляют семантику для скринридеров.

### Правило №1: не используйте ARIA, если можно использовать правильный HTML

```html
<!-- Плохо -->
<div role="button" tabindex="0">Кнопка</div>

<!-- Хорошо -->
<button>Кнопка</button>
```

### Роли (role)

| Роль | HTML-эквивалент | Описание |
|---|---|---|
| `button` | `<button>` | Кнопка |
| `link` | `<a>` | Ссылка |
| `navigation` | `<nav>` | Навигация |
| `main` | `<main>` | Основной контент |
| `banner` | `<header>` | Шапка |
| `contentinfo` | `<footer>` | Подвал |
| `alert` | — | Предупреждение |
| `dialog` | `<dialog>` | Модальное окно |
| `tablist` | — | Список вкладок |
| `tab` | — | Вкладка |
| `tabpanel` | — | Панель вкладки |

### aria-label

Текстовая подпись для элемента без видимого текста:

```html
<button aria-label="Закрыть модальное окно">
  <svg><!-- X иконка --></svg>
</button>

<nav aria-label="Основная навигация">...</nav>
<nav aria-label="Пагинация">...</nav>
```

### aria-labelledby

Ссылка на элемент, который является подписью:

```html
<section aria-labelledby="section-title">
  <h2 id="section-title">JavaScript задачи</h2>
  <p>Содержимое...</p>
</section>
```

### aria-describedby

Описание элемента (подсказка, инструкция):

```html
<label for="password">Пароль</label>
<input type="password" id="password" aria-describedby="password-hint">
<p id="password-hint">Минимум 8 символов, одна цифра</p>
```

### aria-hidden

Скрыть от скринридера:

```html
<span aria-hidden="true">★</span>         <!-- Декоративная звезда -->
<button>
  <span aria-hidden="true">✕</span>       <!-- Декоративная иконка -->
  <span class="sr-only">Закрыть</span>     <!-- Текст для скринридера -->
</button>
```

### aria-live

Для динамического контента — скринридер объявит изменения:

```html
<div aria-live="polite">Успешно сохранено</div>
<div aria-live="assertive">Ошибка валидации!</div>
```

- `polite` — дождётся паузы, потом прочитает
- `assertive` — прервёт текущее чтение

### aria-expanded, aria-selected, aria-checked

```html
<button aria-expanded="false" aria-controls="menu">
  Меню
</button>
<ul id="menu" role="menu" hidden>
  <li role="menuitem">Пункт 1</li>
</ul>

<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Вкладка 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Вкладка 2</button>
</div>
```

## Формы

```html
<form>
  <label for="name">Имя</label>
  <input type="text" id="name" required aria-required="true">

  <label for="email">Email</label>
  <input type="email" id="email" required aria-required="true"
         aria-describedby="email-error">

  <p id="email-error" role="alert" aria-live="polite">
    <!-- Текст ошибки появится динамически -->
  </p>

  <fieldset>
    <legend>Уровень сложности</legend>
    <label><input type="radio" name="difficulty" value="easy"> Лёгкий</label>
    <label><input type="radio" name="difficulty" value="medium"> Средний</label>
    <label><input type="radio" name="difficulty" value="hard"> Сложный</label>
  </fieldset>

  <button type="submit">Отправить</button>
</form>
```

Правила:
- Каждый `<input>` имеет `<label>` (через `for` + `id`)
- `<fieldset>` + `<legend>` для группировки
- `aria-required="true"` для обязательных полей
- Ошибки валидации с `role="alert"`

## Цветовой контраст

WCAG AA требования:

| Элемент | Минимальный контраст |
|---|---|
| Обычный текст (< 18px) | 4.5:1 |
| Крупный текст (≥ 18px bold, ≥ 24px) | 3:1 |
| UI-компоненты и иконки | 3:1 |

Проверка: Chrome DevTools → выбрать цвет → click на контрастность → увидеть ratio.

Инструменты:
- **WebAIM Contrast Checker** (webaim.org/resources/contrastchecker)
- **axe DevTools** (расширение Chrome)

## Скринридеры

### VoiceOver (macOS, встроен)

- `Cmd+F5` — включить/выключить
- `Ctrl+Option+→/←` — навигация по элементам
- `Ctrl+Option+H` — перейти к следующему заголовку
- `Ctrl+Option+U` — открыть rotor (список элементов)

### NVDA (Windows, бесплатный)

- `CapsLock+Space` — включить
- `H` — следующий заголовок
- `Tab` — следующий интерактивный элемент
- `B` — следующая кнопка

### Тестирование

1. Попробуйте пользоваться сайтом только клавиатурой (Tab, Enter, Space, Escape)
2. Включите VoiceOver / NVDA и пройдите основной сценарий
3. Используйте axe DevTools для автоматической проверки

## Автоматизированная проверка

### axe DevTools

Расширение Chrome — одна кнопка для сканирования страницы. Находит ~30–50% проблем (остальное — ручное тестирование).

### eslint-plugin-jsx-a11y (React)

```bash
npm install -D eslint-plugin-jsx-a11y
```

Правила:
- `img-has-alt` — у `<img>` должен быть `alt`
- `anchor-has-content` — `<a>` должен иметь текст
- `label-has-associated-control` — `<label>` привязан к элементу
- `no-static-element-interactions` — не вешать `onClick` на `<div>`

### vue-axe (Vue)

```bash
npm install vue-axe
```

```ts
// main.ts
if (import.meta.env.DEV) {
  const VueAxe = await import('vue-axe')
  app.use(VueAxe.default, {
    clearConsoleOnUpdate: false,
  })
}
```

### Lighthouse

Chrome DevTools → Lighthouse → Accessibility — оценка 0–100 с конкретными рекомендациями.

## Чеклист доступности

### Контент
- [ ] Все `<img>` имеют `alt` (описательный или пустой для декоративных)
- [ ] `<html lang="ru">` — язык страницы
- [ ] Один `<h1>` на страницу, правильная иерархия заголовков
- [ ] Достаточный цветовой контраст (4.5:1 для текста)

### Клавиатура
- [ ] Все интерактивные элементы доступны через Tab
- [ ] Видимый индикатор фокуса (`:focus-visible`)
- [ ] Логичный порядок Tab (слева направо, сверху вниз)
- [ ] Escape закрывает модальные окна
- [ ] Нет клавиатурных ловушек (можно выйти Tab)

### Формы
- [ ] Каждый `<input>` привязан к `<label>`
- [ ] Обязательные поля отмечены `aria-required`
- [ ] Ошибки валидации с `role="alert"`

### ARIA
- [ ] Использованы семантические теги (`<nav>`, `<main>`, `<button>`)
- [ ] `aria-label` для элементов без текста
- [ ] `aria-live` для динамических обновлений
- [ ] Кастомные виджеты имеют правильные роли

### Медиа
- [ ] Видео имеют субтитры
- [ ] Аудио есть текстовая расшифровка
- [ ] Автовоспроизведение отключено (или можно остановить)

## Итог

- **WCAG 2.1** — стандарт доступности с тремя уровнями (A, AA, AAA)
- Четыре принципа: Perceivable, Operable, Understandable, Robust
- **Семантический HTML** — основа доступности (используйте `<button>`, не `<div>`)
- **ARIA** — для сложных виджетов, когда HTML не хватает
- **Клавиатурная навигация** — Tab, Enter, Space, Escape должны работать
- **Контраст** — минимум 4.5:1 для текста
- Тестируйте клавиатурой, VoiceOver/NVDA, axe DevTools, Lighthouse
- Доступность выгодна всем — не только людям с ограничениями
