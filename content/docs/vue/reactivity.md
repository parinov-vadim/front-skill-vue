---
title: Система реактивности Vue
description: Vue автоматически отслеживает зависимости и обновляет DOM при изменении данных. Понимание реактивности помогает писать эффективные компоненты.
section: vue
difficulty: intermediate
readTime: 9
order: 2
tags: [reactivity, ref, reactive, Proxy, Vue 3]
---

## Как работает реактивность в Vue 3

Vue 3 использует **ES Proxy** для отслеживания изменений. При доступе к реактивному свойству Vue «подписывается» на него, при изменении — обновляет все зависимые эффекты (рендер, computed, watch).

```js
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

// effect() запускается при каждом изменении зависимостей
effect(() => {
  console.log('count:', state.count) // → 0
})

state.count++ // эффект запустится снова → 'count: 1'
```

## ref под капотом

`ref()` создаёт объект-обёртку `{ value: T }`, где `value` является реактивным:

```js
import { ref } from 'vue'

const count = ref(0)
// По сути: { value: 0 } (объект отслеживается через Proxy)

// В шаблоне Vue автоматически разворачивает .value
// {{ count }} работает как {{ count.value }}
```

## Потеря реактивности

### Деструктуризация reactive

```js
import { reactive } from 'vue'

const state = reactive({ x: 0, y: 0 })

// ❌ Деструктуризация разрывает связь с Proxy
const { x, y } = state
x++ // state.x НЕ изменится, реактивность потеряна

// ✅ Используйте toRefs()
import { toRefs } from 'vue'
const { x, y } = toRefs(state)
x.value++ // state.x изменится, реактивность сохранена
```

### Переприсваивание reactive

```js
let state = reactive({ count: 0 })

// ❌ Переприсваивание уничтожает реактивную ссылку
state = reactive({ count: 1 }) // компонент не обновится!

// ✅ Изменяйте свойства, не саму переменную
state.count = 1
Object.assign(state, { count: 1 })
```

### ref в reactive

```js
const count = ref(0)
const state = reactive({ count })

// count автоматически разворачивается в reactive
state.count++ // увеличивает count.value
console.log(count.value) // 1
```

## toRef и toRefs

```js
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({ name: 'Иван', age: 25 })

// toRef — одно свойство
const name = toRef(user, 'name')
name.value = 'Пётр' // user.name изменится

// toRefs — все свойства
const { name, age } = toRefs(user)
name.value = 'Пётр'
age.value = 26
```

## shallowRef и shallowReactive

Для производительности — отслеживают только верхний уровень:

```js
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// Только .value отслеживается, не содержимое объекта
const state = shallowRef({ items: [], count: 0 })

state.value.count++ // ❌ не вызовет обновление
state.value = { ...state.value, count: state.value.count + 1 } // ✅

// Или принудительно запустить обновление
triggerRef(state)
```

## readonly

```js
import { reactive, readonly } from 'vue'

const state = reactive({ count: 0 })
const readonlyState = readonly(state)

readonlyState.count++ // ⚠️ Warning: Set operation on key "count" failed: target is readonly
```

## Вычисляемые свойства и ленивость

`computed()` — **ленивое** и **кэширующее**:

```js
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])

const expensiveFilter = computed(() => {
  console.log('Пересчёт!')
  return items.value.filter(n => n > 2)
})

// Первое обращение — вычисляется
console.log(expensiveFilter.value) // 'Пересчёт!' → [3, 4, 5]

// Повторное обращение без изменений — из кэша
console.log(expensiveFilter.value) // Без 'Пересчёт!'

// После изменения зависимости — пересчитывается
items.value.push(6) // отметит computed как «грязный»
console.log(expensiveFilter.value) // 'Пересчёт!' → [3, 4, 5, 6]
```

## Паттерн: реактивные данные из API

```vue
<script setup>
import { ref, watch } from 'vue'

const userId = ref(1)
const user = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchUser(id) {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`/api/users/${id}`)
    user.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(userId, fetchUser, { immediate: true })
</script>
```

## effectScope

Группировка эффектов для одновременной остановки:

```js
import { effectScope, ref, watchEffect } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  watchEffect(() => console.log(count.value))
  // Все watchEffect/watch/computed внутри привязаны к scope
})

// Остановить все эффекты разом
scope.stop()
```
