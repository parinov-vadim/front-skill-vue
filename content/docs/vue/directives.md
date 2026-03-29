---
title: Директивы Vue
description: Директивы — специальные атрибуты с префиксом v-, добавляющие реактивное поведение к DOM-элементам.
section: vue
difficulty: beginner
readTime: 8
order: 3
tags: [directives, v-if, v-for, v-bind, v-model, Vue]
---

## Условный рендеринг

### v-if / v-else-if / v-else

Полное добавление/удаление элемента из DOM:

```vue
<div v-if="user.role === 'admin'">Панель администратора</div>
<div v-else-if="user.role === 'moderator'">Панель модератора</div>
<div v-else>Обычный пользователь</div>
```

### v-show

Скрытие через `display: none` — элемент остаётся в DOM:

```vue
<div v-show="isVisible">Контент</div>
```

**Когда что использовать:**
- `v-if` — если условие меняется редко (избегает лишнего DOM)
- `v-show` — если условие меняется часто (избегает пересоздания)

### v-if + \<template\>

```vue
<template v-if="isLoggedIn">
  <header>...</header>
  <main>...</main>
  <!-- template не создаёт DOM-элемент -->
</template>
```

## Рендеринг списков — v-for

```vue
<!-- Массив -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>

<!-- Массив с индексом -->
<li v-for="(item, index) in items" :key="item.id">
  {{ index + 1 }}. {{ item.name }}
</li>

<!-- Объект -->
<li v-for="(value, key, index) in user" :key="key">
  {{ key }}: {{ value }}
</li>

<!-- Диапазон -->
<span v-for="n in 5" :key="n">{{ n }}</span>
<!-- 1 2 3 4 5 -->
```

### Ключ `:key`

`:key` обязателен — помогает Vue эффективно обновлять список:

```vue
<!-- ❌ Плохо — нестабильный ключ -->
<li v-for="(item, i) in items" :key="i">

<!-- ✅ Хорошо — уникальный стабильный ID -->
<li v-for="item in items" :key="item.id">
```

## Привязка атрибутов — v-bind

```vue
<img :src="imageUrl" :alt="imageAlt">
<a :href="link.url" :target="link.external ? '_blank' : undefined">

<!-- Объект атрибутов -->
<div v-bind="{ id: 'box', class: 'card', 'data-value': 42 }"></div>

<!-- Динамическое имя атрибута -->
<div :[dynamicAttr]="value"></div>
```

### Привязка классов

```vue
<!-- Строка -->
<div :class="activeClass"></div>

<!-- Объект -->
<div :class="{ active: isActive, error: hasError }"></div>

<!-- Массив -->
<div :class="['base-class', isActive && 'active', errorClass]"></div>

<!-- Комбинированно -->
<div
  class="static-class"
  :class="{ active: isActive }"
></div>
```

### Привязка стилей

```vue
<div :style="{ color: textColor, fontSize: `${size}px` }"></div>

<div :style="[baseStyles, overrideStyles]"></div>
```

## Обработка событий — v-on

```vue
<!-- Полная запись -->
<button v-on:click="handleClick">Клик</button>

<!-- Сокращение -->
<button @click="handleClick">Клик</button>

<!-- Инлайн-обработчик -->
<button @click="count++">+</button>

<!-- С передачей события -->
<button @click="handleClick($event)">Клик</button>

<!-- Несколько событий -->
<input @focus="onFocus" @blur="onBlur">
```

### Модификаторы событий

```vue
<!-- Предотвратить поведение по умолчанию -->
<form @submit.prevent="handleSubmit">

<!-- Остановить всплытие -->
<div @click.stop="handleClick">

<!-- Только один раз -->
<button @click.once="handleOnce">

<!-- Только на самом элементе, не на дочерних -->
<div @click.self="handleDivClick">

<!-- Клавиши -->
<input @keydown.enter="submit">
<input @keydown.esc="cancel">
<input @keydown.ctrl.enter="submitAndClose">
```

## Двусторонняя привязка — v-model

```vue
<input v-model="text" placeholder="Введите текст">
<textarea v-model="message"></textarea>
<input type="checkbox" v-model="checked">
<input type="radio" v-model="picked" value="a">
<select v-model="selected">
  <option value="a">A</option>
</select>
```

`v-model` — это сокращение для `:value` + `@input`:

```vue
<!-- Эквивалентно -->
<input :value="text" @input="text = $event.target.value">
```

### Модификаторы v-model

```vue
<input v-model.trim="name">    <!-- Обрезать пробелы -->
<input v-model.number="age">   <!-- Преобразовать в число -->
<input v-model.lazy="email">   <!-- Обновлять при blur, не при каждом вводе -->
```

### v-model в компонентах

```vue
<!-- Использование -->
<MyInput v-model="value" />

<!-- Эквивалентно -->
<MyInput :modelValue="value" @update:modelValue="value = $event" />

<!-- Компонент MyInput -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
```

## v-once, v-memo, v-pre

```vue
<!-- Рендер один раз, игнорировать обновления -->
<span v-once>{{ staticText }}</span>

<!-- Обновлять только если зависимости изменились -->
<div v-memo="[item.id, item.name]">
  <!-- Пропустит ре-рендер если id и name не изменились -->
</div>

<!-- Не обрабатывать как шаблон Vue -->
<pre v-pre>{{ это не будет вычислено }}</pre>
```
