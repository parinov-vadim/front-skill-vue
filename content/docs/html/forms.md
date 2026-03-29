---
title: Работа с формами
description: HTML-формы — основной способ сбора данных от пользователя. Правильная разметка улучшает UX, доступность и валидацию.
section: html
difficulty: beginner
readTime: 9
order: 2
tags: [forms, input, validation, UX]
---

## Базовая структура формы

```html
<form action="/submit" method="post" novalidate>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <button type="submit">Отправить</button>
</form>
```

- `action` — URL для отправки данных
- `method` — `get` (данные в URL) или `post` (в теле запроса)
- `novalidate` — отключить браузерную валидацию (для кастомной)

## Типы input

```html
<!-- Текст -->
<input type="text" placeholder="Ваше имя">
<input type="email" placeholder="email@example.com">
<input type="password" autocomplete="current-password">
<input type="url" placeholder="https://...">
<input type="search" placeholder="Поиск...">

<!-- Числа -->
<input type="number" min="1" max="100" step="1">
<input type="range" min="0" max="100" value="50">

<!-- Дата и время -->
<input type="date" min="2024-01-01">
<input type="time">
<input type="datetime-local">

<!-- Файлы -->
<input type="file" accept=".pdf,.doc" multiple>
<input type="file" accept="image/*" capture="camera">

<!-- Выборы -->
<input type="checkbox" id="agree" name="agree">
<input type="radio" name="gender" value="male">

<!-- Скрытые данные -->
<input type="hidden" name="csrf" value="abc123">

<!-- Цвет -->
<input type="color" value="#7c3aed">
```

## Label

`<label>` **обязателен** для каждого поля — это критично для доступности:

```html
<!-- Способ 1: for + id (рекомендуется) -->
<label for="name">Имя</label>
<input type="text" id="name" name="name">

<!-- Способ 2: оборачивающий label -->
<label>
  Имя
  <input type="text" name="name">
</label>

<!-- Скрытый label (видим скринридерам) -->
<label for="search" class="sr-only">Поиск</label>
<input type="search" id="search">
```

## Textarea и Select

```html
<!-- Многострочный текст -->
<textarea
  name="message"
  rows="5"
  cols="40"
  maxlength="500"
  placeholder="Ваше сообщение..."
></textarea>

<!-- Выпадающий список -->
<select name="country">
  <option value="">Выберите страну</option>
  <optgroup label="СНГ">
    <option value="ru">Россия</option>
    <option value="by">Беларусь</option>
  </optgroup>
  <option value="de">Германия</option>
</select>

<!-- Множественный выбор -->
<select name="skills" multiple size="4">
  <option value="html">HTML</option>
  <option value="css" selected>CSS</option>
  <option value="js">JavaScript</option>
</select>
```

## Атрибуты валидации

```html
<input
  type="email"
  required                      <!-- Обязательное поле -->
  minlength="5"                 <!-- Минимальная длина -->
  maxlength="100"               <!-- Максимальная длина -->
  min="1"                       <!-- Минимальное значение (числа) -->
  max="99"                      <!-- Максимальное значение -->
  pattern="[A-Za-z]{3,}"       <!-- Регулярное выражение -->
>

<!-- Кастомная подсказка об ошибке -->
<input type="text" title="Введите только буквы (минимум 3)">
```

## Группировка полей

```html
<form>
  <fieldset>
    <legend>Личные данные</legend>
    <label for="name">Имя</label>
    <input type="text" id="name" name="name">

    <label for="age">Возраст</label>
    <input type="number" id="age" name="age">
  </fieldset>

  <fieldset>
    <legend>Адрес</legend>
    <label for="city">Город</label>
    <input type="text" id="city" name="city">
  </fieldset>
</form>
```

## Кнопки

```html
<!-- Отправка формы -->
<button type="submit">Отправить</button>

<!-- Сброс формы к начальным значениям -->
<button type="reset">Очистить</button>

<!-- Просто кнопка (без поведения по умолчанию) -->
<button type="button" onclick="handleClick()">Действие</button>

<!-- В форме input type="submit" — устаревший способ -->
<input type="submit" value="Отправить">
```

## Атрибуты автозаполнения

```html
<input type="text"     autocomplete="name">
<input type="email"    autocomplete="email">
<input type="password" autocomplete="new-password">
<input type="tel"      autocomplete="tel">
<input type="text"     autocomplete="street-address">
<input type="text"     autocomplete="postal-code">
```

## Доступность форм

```html
<!-- Описание поля для скринридера -->
<input
  type="text"
  id="username"
  aria-describedby="username-hint"
>
<p id="username-hint">3-20 символов, только буквы и цифры</p>

<!-- Обязательное поле -->
<input type="text" required aria-required="true">

<!-- Состояние ошибки -->
<input
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">Введите корректный email</p>
```
