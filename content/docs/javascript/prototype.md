---
title: Прототипы и наследование
description: JavaScript использует прототипное наследование — объекты наследуют свойства и методы через цепочку прототипов.
section: javascript
difficulty: intermediate
readTime: 9
order: 6
tags: [prototype, inheritance, class, OOP]
---

## Прототипная цепочка

В JavaScript каждый объект имеет скрытое свойство `[[Prototype]]` — ссылку на другой объект (прототип). При обращении к свойству JavaScript сначала ищет его в самом объекте, затем поднимается по цепочке прототипов.

```js
const animal = {
  greet() {
    return `Я ${this.name}`
  },
}

const dog = {
  name: 'Рекс',
  bark() {
    return 'Гав!'
  },
}

// Устанавливаем прототип
Object.setPrototypeOf(dog, animal)

console.log(dog.bark())   // 'Гав!' — собственный метод
console.log(dog.greet())  // 'Я Рекс' — из прототипа
```

## `__proto__` и `Object.getPrototypeOf`

```js
console.log(Object.getPrototypeOf(dog) === animal) // true

// __proto__ — устаревший способ, лучше не использовать
console.log(dog.__proto__ === animal) // true (но __proto__ deprecated)
```

## Функции-конструкторы

До ES6 объекты создавались через функции-конструкторы:

```js
function Person(name, age) {
  this.name = name
  this.age = age
}

// Методы добавляются в prototype, не в каждый экземпляр
Person.prototype.greet = function () {
  return `Привет, я ${this.name}`
}

const ivan = new Person('Иван', 25)
const maria = new Person('Мария', 30)

console.log(ivan.greet())   // 'Привет, я Иван'
console.log(maria.greet())  // 'Привет, я Мария'

// Оба используют один и тот же метод greet из прототипа
console.log(ivan.greet === maria.greet) // true
```

## Классы (ES6+)

Классы — синтаксический сахар над прототипным наследованием:

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} издаёт звук`
  }

  toString() {
    return `Animal(${this.name})`
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)  // вызов конструктора родителя
    this.breed = breed
  }

  speak() {
    return `${this.name} лает: Гав!`
  }
}

const rex = new Dog('Рекс', 'Немецкая овчарка')
console.log(rex.speak())    // 'Рекс лает: Гав!'
console.log(rex.toString()) // 'Animal(Рекс)' — из родителя
```

## Проверка наследования

```js
console.log(rex instanceof Dog)    // true
console.log(rex instanceof Animal) // true

// Проверить наличие собственного свойства
console.log(rex.hasOwnProperty('name'))  // true
console.log(rex.hasOwnProperty('speak')) // false — метод в прототипе

// Получить только собственные свойства
const ownProps = Object.keys(rex) // ['name', 'breed']
```

## Статические методы и свойства

```js
class MathUtils {
  static PI = 3.14159

  static circle(r) {
    return MathUtils.PI * r * r
  }
}

// Вызываются на классе, не на экземпляре
console.log(MathUtils.PI)          // 3.14159
console.log(MathUtils.circle(5))   // 78.539...
```

## Приватные поля (ES2022)

```js
class BankAccount {
  #balance  // приватное поле

  constructor(initial) {
    this.#balance = initial
  }

  deposit(amount) {
    this.#balance += amount
  }

  get balance() {
    return this.#balance
  }
}

const acc = new BankAccount(1000)
acc.deposit(500)
console.log(acc.balance)   // 1500
// acc.#balance → SyntaxError
```

## Миксины

JavaScript не поддерживает множественное наследование, но можно использовать миксины:

```js
const Serializable = (Base) =>
  class extends Base {
    serialize() {
      return JSON.stringify(this)
    }

    static deserialize(json) {
      return Object.assign(new this(), JSON.parse(json))
    }
  }

const Validatable = (Base) =>
  class extends Base {
    validate() {
      return Object.values(this).every(Boolean)
    }
  }

class User extends Serializable(Validatable(class {})) {
  constructor(name, email) {
    super()
    this.name = name
    this.email = email
  }
}

const user = new User('Иван', 'ivan@example.com')
console.log(user.validate())  // true
console.log(user.serialize()) // '{"name":"Иван","email":"ivan@example.com"}'
```

## Итог

- JavaScript использует **прототипное** наследование
- `class` — синтаксический сахар, под капотом те же прототипы
- Методы лучше хранить в `prototype`, а не в конструкторе (экономия памяти)
- `instanceof` проверяет всю цепочку прототипов
- Приватные поля `#field` — настоящая инкапсуляция (ES2022)
