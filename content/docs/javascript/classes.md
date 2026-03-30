---
title: "Классы в JavaScript: constructor, extends, super, static, приватные поля"
description: "Классы ES6+ в JavaScript — синтаксис class, конструктор, наследование extends/super, статические методы, приватные поля #private, геттеры и сеттеры."
section: javascript
difficulty: intermediate
readTime: 10
order: 12
tags: [классы, class, extends, super, static, приватные поля, ООП, JavaScript, ES6]
---

## Что такое класс

Класс — это синтаксический сахар над прототипами. Он делает создание объектов и наследование удобнее, но под капотом работает всё та же прототипная модель.

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return `Привет, я ${this.name}, мне ${this.age} лет`
  }
}

const anna = new User('Анна', 25)
anna.greet() // 'Привет, я Анна, мне 25 лет'
```

`constructor` — специальный метод, вызывается при `new`. Если конструктор не написать — будет пустой.

## Выражение класса

Как и функции, классы можно записывать как выражение:

```js
const User = class {
  constructor(name) {
    this.name = name
  }
}
```

## Наследование: extends и super

`extends` создаёт класс-наследник. `super` вызывает конструктор и методы родителя:

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} издаёт звук`
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name) // обязательно до this
    this.breed = breed
  }

  speak() {
    return `${this.name} лает!`
  }

  info() {
    return `${super.speak()}, порода: ${this.breed}`
  }
}

const rex = new Dog('Рекс', 'Овчарка')
rex.speak() // 'Рекс лает!'
rex.info()  // 'Рекс издаёт звук, порода: Овчарка'
```

В конструкторе наследника `super()` нужно вызвать **до** использования `this`:

```js
class Child extends Parent {
  constructor(name) {
    this.name = name       // ReferenceError — super ещё не вызван
    super(name)
  }
}
```

## Статические методы и свойства

Принадлежат классу, а не экземпляру. Вызываются через имя класса:

```js
class MathHelper {
  static add(a, b) {
    return a + b
  }

  static multiply(a, b) {
    return a * b
  }
}

MathHelper.add(2, 3)       // 5
MathHelper.multiply(4, 5)  // 20

const helper = new MathHelper()
helper.add(2, 3) // TypeError — статический метод не доступен на экземпляре
```

Статические свойства:

```js
class Config {
  static version = '1.0.0'
  static defaultTimeout = 5000
}

console.log(Config.version) // '1.0.0'
```

Типичное использование — фабричные методы:

```js
class User {
  constructor(name, role) {
    this.name = name
    this.role = role
  }

  static createAdmin(name) {
    return new User(name, 'admin')
  }

  static createGuest() {
    return new User('Гость', 'guest')
  }
}

const admin = User.createAdmin('Анна')
const guest = User.createGuest()
```

## Приватные поля (#)

С префиксом `#` поля и методы доступны только внутри класса:

```js
class BankAccount {
  #balance = 0

  constructor(initialBalance) {
    this.#balance = initialBalance
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Сумма должна быть положительной')
    this.#balance += amount
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Недостаточно средств')
    this.#balance -= amount
  }

  get balance() {
    return this.#balance
  }
}

const account = new BankAccount(1000)
account.deposit(500)
account.withdraw(200)
console.log(account.balance) // 1300

console.log(account.#balance) // SyntaxError — приватное поле
account.#balance = 0          // SyntaxError
```

Приватные методы:

```js
class Validator {
  #isValidEmail(email) {
    return email.includes('@')
  }

  validate(user) {
    if (!this.#isValidEmail(user.email)) {
      throw new Error('Некорректный email')
    }
    return true
  }
}
```

## Геттеры и сеттеры

Выглядят как свойства, но выполняют функцию при чтении/записи:

```js
class User {
  #firstName = ''
  #lastName = ''

  constructor(firstName, lastName) {
    this.#firstName = firstName
    this.#lastName = lastName
  }

  get fullName() {
    return `${this.#firstName} ${this.#lastName}`
  }

  set fullName(value) {
    const [first, last] = value.split(' ')
    this.#firstName = first
    this.#lastName = last
  }
}

const user = new User('Анна', 'Иванова')
console.log(user.fullName)    // 'Анна Иванова'

user.fullName = 'Мария Петрова'
console.log(user.fullName)    // 'Мария Петрова'
```

## instanceof

Проверяет, является ли объект экземпляром класса (включая наследование):

```js
const rex = new Dog('Рекс', 'Овчарка')

rex instanceof Dog    // true
rex instanceof Animal // true
rex instanceof Object // true
rex instanceof User   // false
```

## Класс vs функция-конструктор

То же самое, написанное по-старому:

```js
// ES6 класс
class User {
  constructor(name) {
    this.name = name
  }
  greet() {
    return `Привет, ${this.name}`
  }
}

// То же через функцию-конструктор
function User(name) {
  this.name = name
}
User.prototype.greet = function () {
  return `Привет, ${this.name}`
}
```

Разница:
- Классы не всплывают (hoisting) — нельзя использовать до объявления
- Методы класса по умолчанию не перечислимы (`enumerable: false`)
- Класс всегда работает в строгом режиме
- Вызов класса без `new` — ошибка

## Практический пример

```js
class EventEmitter {
  #listeners = {}

  on(event, callback) {
    if (!this.#listeners[event]) this.#listeners[event] = []
    this.#listeners[event].push(callback)
  }

  off(event, callback) {
    this.#listeners[event] = this.#listeners[event].filter(cb => cb !== callback)
  }

  emit(event, ...args) {
    if (!this.#listeners[event]) return
    this.#listeners[event].forEach(cb => cb(...args))
  }
}

const emitter = new EventEmitter()

emitter.on('login', (user) => console.log(`${user} вошёл в систему`))
emitter.on('login', (user) => console.log(`Отправляем email для ${user}`))

emitter.emit('login', 'Анна')
// Анна вошёл в систему
// Отправляем email для Анна
```

## Итог

- Класс — удобная обёртка над прототипами
- `extends` — наследование, `super` — вызов родительского конструктора/метода
- Статические методы принадлежат классу, а не экземпляру
- Приватные поля через `#` — надёжная инкапсуляция
- Геттеры и сеттеры — контроль над чтением/записью свойств
