---
title: "Proxy и Reflect в JavaScript: метапрограммирование"
description: "Proxy и Reflect в JavaScript — перехват операций с объектами, геттеры и сеттеры через Proxy, валидация, логирование, Reactivity и примеры использования."
section: javascript
difficulty: advanced
readTime: 9
order: 25
tags: [Proxy, Reflect, метапрограммирование, перехват, trap, handler, JavaScript]
---

## Что такое Proxy

`Proxy` — обёртка над объектом, которая перехватывает операции с ним (чтение, запись, удаление и другие). Позволяет добавить поведение, не меняя сам объект.

```js
const target = { name: 'Анна', age: 25 }

const proxy = new Proxy(target, {
  get(obj, prop) {
    console.log(`Чтение ${prop}`)
    return obj[prop]
  },

  set(obj, prop, value) {
    console.log(`Запись ${prop} = ${value}`)
    obj[prop] = value
    return true
  },
})

proxy.name       // console: 'Чтение name', возвращает 'Анна'
proxy.city = 'Москва' // console: 'Запись city = Москва'
```

Два аргумента: `new Proxy(целевой_объект, обработчик)`.

## Traps — перехватываемые операции

Обработчик (handler) — объект с методами-ловушками (traps):

| Trap | Перехватывает | Пример |
|------|--------------|--------|
| `get` | Чтение свойства | `proxy.name` |
| `set` | Запись свойства | `proxy.name = 'x'` |
| `has` | Проверка `in` | `'name' in proxy` |
| `deleteProperty` | Удаление | `delete proxy.name` |
| `ownKeys` | Перечисление ключей | `Object.keys(proxy)` |
| `getOwnPropertyDescriptor` | Дескриптор свойства | `Object.getOwnPropertyDescriptor()` |
| `apply` | Вызов функции | `proxy()` |
| `construct` | `new proxy()` | `new Proxy()` |

## Практические примеры

### Валидация свойств

```js
function createValidatedUser(initial) {
  return new Proxy(initial, {
    set(obj, prop, value) {
      if (prop === 'age' && (typeof value !== 'number' || value < 0 || value > 150)) {
        throw new Error('Возраст должен быть числом от 0 до 150')
      }
      if (prop === 'email' && !value.includes('@')) {
        throw new Error('Некорректный email')
      }
      obj[prop] = value
      return true
    },
  })
}

const user = createValidatedUser({ name: 'Анна' })
user.age = 25     // OK
user.age = -5     // Error: Возраст должен быть числом от 0 до 150
user.email = 'a@b' // OK
user.email = 'abc' // Error: Некорректный email
```

### Значения по умолчанию

```js
const config = new Proxy({ theme: 'light', lang: 'ru' }, {
  get(obj, prop) {
    return prop in obj ? obj[prop] : `DEFAULT_${prop.toUpperCase()}`
  },
})

config.theme     // 'light'
config.lang      // 'ru'
config.pageSize  // 'DEFAULT_PAGESIZE'
```

### Логирование доступа

```js
function withLog(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      console.log(`[GET] .${prop}`)
      return target[prop]
    },
    set(target, prop, value) {
      console.log(`[SET] .${prop} = ${JSON.stringify(value)}`)
      target[prop] = value
      return true
    },
  })
}

const api = withLog({ users: [] })
api.users        // [GET] .users
api.users = ['Анна'] // [SET] .users = ["Анна"]
```

### Защита от удаления

```js
const protected = new Proxy({ name: 'Анна', role: 'admin' }, {
  deleteProperty(target, prop) {
    if (prop === 'role') {
      throw new Error('Нельзя удалить роль')
    }
    delete target[prop]
    return true
  },
})

delete protected.name  // OK
delete protected.role  // Error: Нельзя удалить роль
```

### Readonly-объект

```js
function readonly(obj) {
  return new Proxy(obj, {
    set() { throw new Error('Объект только для чтения') },
    deleteProperty() { throw new Error('Объект только для чтения') },
  })
}

const settings = readonly({ apiUrl: '/api', timeout: 5000 })
settings.timeout = 3000 // Error: Объект только для чтения
delete settings.apiUrl  // Error: Объект только для чтения
```

### Перехват вызова функции (apply)

```js
function add(a, b) {
  return a + b
}

const loggedAdd = new Proxy(add, {
  apply(target, thisArg, args) {
    console.log(`Вызов ${target.name}(${args.join(', ')})`)
    const result = target.apply(thisArg, args)
    console.log(`Результат: ${result}`)
    return result
  },
})

loggedAdd(2, 3)
// Вызов add(2, 3)
// Результат: 5
```

### Отложенная инициализация (Lazy)

```js
function lazy(factory) {
  let instance = null

  return new Proxy({}, {
    get(target, prop) {
      if (!instance) {
        instance = factory()
      }
      return instance[prop]
    },
  })
}

const heavyService = lazy(() => {
  console.log('Инициализация...')
  return { getData() { return [1, 2, 3] } }
})

// factory ещё не вызвана
console.log('до')
heavyService.getData() // 'Инициализация...' — factory вызвана при первом обращении
console.log('после')
```

## Reflect

`Reflect` — набор статических методов, зеркально отражающих traps из Proxy. Каждому trap соответствует метод `Reflect`:

| Proxy trap | Reflect метод |
|-----------|---------------|
| `get(target, prop)` | `Reflect.get(target, prop)` |
| `set(target, prop, value)` | `Reflect.set(target, prop, value)` |
| `has(target, prop)` | `Reflect.has(target, prop)` |
| `deleteProperty(target, prop)` | `Reflect.deleteProperty(target, prop)` |

Зачем: `Reflect` возвращает корректные булевы значения и работает с getter/setter'ами:

```js
const parent = {
  get name() {
    return this._name
  },
}

const child = Object.create(parent)
child._name = 'Анна'

// Через Proxy с Reflect — корректно работает с getter'ами
const proxy = new Proxy(child, {
  get(target, prop, receiver) {
    console.log(`Чтение ${prop}`)
    return Reflect.get(target, prop, receiver) // правильно передаёт this
  },
})

proxy.name // 'Анна' — getter отработает корректно
```

Без `Reflect.get` getter может работать неправильно, потому что `this` не будет передан.

### Рекомендация

Всегда используйте `Reflect` внутри Proxy-обработчиков:

```js
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // Логика до
    const result = Reflect.get(target, prop, receiver)
    // Логика после
    return result
  },

  set(target, prop, value, receiver) {
    return Reflect.set(target, prop, value, receiver)
  },

  has(target, prop) {
    return Reflect.has(target, prop)
  },
})
```

## Revocable Proxy

Прокси можно «отозвать» — после этого любая операция с ним вызовет ошибку:

```js
const { proxy, revoke } = Proxy.revocable({ data: 'secret' }, {
  get(target, prop) {
    return target[prop]
  },
})

proxy.data // 'secret'
revoke()   // прокси больше не работает
proxy.data // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

Полезно для временного доступа к данным — например, передать объект в библиотеку и затем запретить ей доступ.

## Proxy и реактивность

Vue 3 использует Proxy для реактивной системы:

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      track(target, prop) // зарегистрировать зависимость
      return Reflect.get(target, prop)
    },
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value)
      trigger(target, prop) // уведомить об изменении
      return result
    },
  })
}
```

Когда вы читаете `data.name` — Vue запоминает, что текущий компонент зависит от `name`. Когда вы записываете `data.name = 'новое'` — Vue перерисовывает компонент.

## Итог

- `Proxy` перехватывает операции с объектом — чтение, запись, удаление, вызов
- Используйте для валидации, логирования, значений по умолчанию, readonly
- `Reflect` — зеркальные методы для корректной работы внутри Proxy
- `Proxy.revocable` — прокси с возможностью «отключения»
- Vue 3 и многие фреймворки используют Proxy для реактивности
