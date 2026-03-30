---
title: Angular Signals: реактивность нового поколения
description: Signals — новая система реактивности в Angular (v17+). signal(), computed(), effect() — проще чем RxJS для большинства задач, синхронная реактивность без подписок.
section: angular
difficulty: intermediate
readTime: 11
order: 7
tags: [Angular, Signals, reactivity, computed, effect, v17]
---

## Что такое Signals

Signals — это реактивные примитивы, появившиеся в Angular 16 (developer preview) и ставшие стабильными в Angular 17. Это альтернатива RxJS для управления состоянием в компонентах. В отличие от Observable, Signals синхронны, проще в освоении и не требуют отписки.

Сигнал — это обёртка вокруг значения, которая уведомляет подписчиков при изменении:

```typescript
import { signal } from '@angular/core'

const count = signal(0)

// Чтение — вызываем как функцию
console.log(count())  // 0

// Запись
count.set(5)
console.log(count())  // 5

// Обновление на основе предыдущего значения
count.update(n => n + 1)
console.log(count())  // 6
```

## Создание сигналов

###Writable signal

```typescript
import { Component, signal } from '@angular/core'

@Component({
  standalone: true,
  template: `
    <p>Счётчик: {{ count() }}</p>
    <button (click)="increment()">+1</button>
    <button (click)="reset()">Сброс</button>
  `
})
export class CounterComponent {
  count = signal(0)

  increment() {
    this.count.update(n => n + 1)
  }

  reset() {
    this.count.set(0)
  }
}
```

Три метода изменения writable-сигнала:

| Метод | Описание |
|---|---|
| `set(value)` | Установить новое значение |
| `update(fn)` | Обновить на основе предыдущего: `prev => newValue` |
| `mutate(fn)` | Мутировать объект/массив напрямую (устарело в Angular 19+, используйте `update`) |

### Объекты и массивы

```typescript
interface Task {
  id: number
  title: string
  done: boolean
}

@Component({ ... })
export class TaskListComponent {
  tasks = signal<Task[]>([])

  addTask(title: string) {
    this.tasks.update(tasks => [
      ...tasks,
      { id: Date.now(), title, done: false }
    ])
  }

  toggleTask(id: number) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    )
  }

  removeTask(id: number) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id))
  }
}
```

Важно: `update` нужно возвращать **новый** объект/массив. Прямая мутация `this.tasks().push(...)` не вызовет обновление шаблона.

## Computed — вычисляемые сигналы

`computed` создаёт сигнал, который автоматически пересчитывается при изменении зависимостей:

```typescript
import { Component, signal, computed } from '@angular/core'

@Component({
  standalone: true,
  template: `
    <p>Всего: {{ tasks().length }}</p>
    <p>Выполнено: {{ doneCount() }}</p>
    <p>Осталось: {{ pendingCount() }}</p>
    <p>Прогресс: {{ progress() }}%</p>
  `
})
export class TaskStatsComponent {
  tasks = signal<Task[]>([])

  doneCount = computed(() =>
    this.tasks().filter(t => t.done).length
  )

  pendingCount = computed(() =>
    this.tasks().filter(t => !t.done).length
  )

  progress = computed(() => {
    const total = this.tasks().length
    if (total === 0) return 0
    return Math.round((this.doneCount() / total) * 100)
  })
}
```

Ключевые особенности `computed`:
- **Только для чтения** — у него нет методов `set` и `update`
- **Ленивый** — пересчитывается только когда кто-то читает значение
- **Кэширует** — не пересчитывается, если зависимости не изменились
- **Отслеживает зависимости автоматически** — любой сигнал, вызванный внутри `computed`, становится зависимостью

### Computed от computed

Computed-сигналы могут зависеть от других computed-сигналов — Angular автоматически строит граф зависимостей:

```typescript
const price = signal(1000)
const quantity = signal(2)
const discount = signal(0.1)

const subtotal = computed(() => price() * quantity())
const total = computed(() => subtotal() * (1 - discount()))

console.log(total()) // 1800
```

## Effect — побочные эффекты

`effect` запускает функцию каждый раз, когда меняется один из сигналов, используемых внутри:

```typescript
import { Component, signal, effect, inject } from '@angular/core'
import { localStorage } from '../utils/storage'

@Component({ ... })
export class ThemeComponent {
  theme = signal<'light' | 'dark'>('light')

  constructor() {
    // Сохранять тему в localStorage при каждом изменении
    effect(() => {
      document.body.classList.toggle('dark', this.theme() === 'dark')
      localStorage.setItem('theme', this.theme())
    })

    // Восстановить из localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark'
    if (saved) this.theme.set(saved)
  }
}
```

### Когда использовать effect

```typescript
// Логирование
effect(() => {
  console.log('Счётчик изменился:', this.count())
})

// Синхронизация с API
effect(() => {
  const query = this.searchQuery()
  if (query.length >= 3) {
    this.searchService.search(query)
  }
})

// Синхронизация с внешней библиотекой
effect(() => {
  const data = this.chartData()
  this.chart.update(data)
})
```

### Ограничения effect

- Нельзя менять сигнал внутри effect (возникнет бесконечный цикл)
- Effect не предназначен для вычисления новых значений — для этого используйте `computed`
- Effect запускается хотя бы один раз при создании

### Cleanup в effect

```typescript
effect((onCleanup) => {
  const controller = new AbortController()

  const query = this.searchQuery()
  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(r => r.json())
    .then(data => this.results.set(data))

  onCleanup(() => controller.abort())
})
```

`onCleanup` вызывается перед следующим запуском effect или при уничтожении компонента.

## Signals в сервисах

Signals отлично подходят для управления состоянием в сервисах:

```typescript
// services/cart.service.ts
import { Injectable, signal, computed } from '@angular/core'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([])

  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  )

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  readonly isEmpty = computed(() => this.items().length === 0)

  add(item: Omit<CartItem, 'quantity'>) {
    this.items.update(items => {
      const existing = items.find(i => i.id === item.id)
      if (existing) {
        return items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...items, { ...item, quantity: 1 }]
    })
  }

  remove(id: number) {
    this.items.update(items => items.filter(i => i.id !== id))
  }

  updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(id)
      return
    }
    this.items.update(items =>
      items.map(i => i.id === id ? { ...i, quantity } : i)
    )
  }

  clear() {
    this.items.set([])
  }
}
```

```typescript
// В компоненте — просто используем сигналы сервиса
@Component({
  template: `
    <span>{{ cart.count() }} товаров</span>
    <span>{{ cart.total() | currency:'RUB' }}</span>
  `
})
export class CartBadgeComponent {
  protected cart = inject(CartService)
}
```

## Input Signals

Angular 17.3+ ввёл signal-based Inputs — входные параметры как сигналы:

```typescript
import { Component, input, output } from '@angular/core'

@Component({
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      @if (tags().length) {
        <div>
          @for (tag of tags(); track tag) {
            <span class="badge">{{ tag }}</span>
          }
        </div>
      }
      <button (click)="clicked.emit(id())">Открыть</button>
    </div>
  `
})
export class TaskCardComponent {
  // Signal-based inputs (Angular 17.3+)
  id = input.required<number>()
  title = input.required<string>()
  description = input('')
  tags = input<string[]>([])

  // Signal-based output
  clicked = output<number>()
}
```

```typescript
// Родительский компонент
@Component({
  template: `
    @for (task of tasks; track task.id) {
      <app-task-card
        [id]="task.id"
        [title]="task.title"
        [description]="task.description"
        (clicked)="onTaskClick($event)"
      />
    }
  `
})
export class TaskPageComponent {
  tasks = signal<Task[]>([])
}
```

### Model inputs — двусторонняя привязка

```typescript
import { Component, model } from '@angular/core'

@Component({
  standalone: true,
  template: `
    <input [value]="value()" (input)="onInput($event)">
  `
})
export class SearchInputComponent {
  value = model('')  // Input + Output одновременно

  onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value)
  }
}

// Родитель
// <app-search-input [(value)]="searchQuery" />
// или
// <app-search-input [value]="searchQuery()" (valueChange)="searchQuery.set($event)" />
```

## Signals и RxJS — когда что

Signals не заменяют RxJS полностью. Вот когда использовать каждое:

| Ситуация | Использовать |
|---|---|
| Локальное состояние компонента | Signals |
| Состояние сервиса (store) | Signals |
| HTTP-запросы (одиночные) | Signals + `toSignal` |
| Потоки событий (WebSocket, timer) | RxJS |
| Комбинации потоков (debounce, switchMap) | RxJS |
| Передача данных между компонентами | Signals (input/output) |
| Сложные трансформации асинхронных данных | RxJS, затем `toSignal` |

### toSignal — Observable в Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop'
import { HttpClient } from '@angular/common/http'

@Component({ ... })
export class UserListComponent {
  private http = inject(HttpClient)

  // Превратить Observable в Signal
  users = toSignal(
    this.http.get<User[]>('/api/users'),
    { initialValue: [] }
  )
}

// В шаблоне — просто users(), без async pipe
```

### toObservable — Signal в Observable

```typescript
import { toObservable } from '@angular/core/rxjs-interop'

@Component({ ... })
export class SearchComponent {
  query = signal('')

  // Signal → Observable для debounce и switchMap
  results$ = toObservable(this.query).pipe(
    debounceTime(300),
    switchMap(q => this.http.get(`/api/search?q=${q}`))
  )
}
```

## Итог

Signals — самый важный сдвиг в архитектуре Angular за последние годы:

| Примитив | Для чего |
|---|---|
| `signal()` | Хранение изменяемого состояния |
| `computed()` | Вычисляемые значения на основе других сигналов |
| `effect()` | Побочные эффекты при изменении сигналов |
| `input()` / `input.required()` | Входные параметры как сигналы |
| `model()` | Двусторонняя привязка через сигналы |
| `output()` | События компонента |
| `toSignal()` | Превратить Observable в Signal |
| `toObservable()` | Превратить Signal в Observable |

Signals делают код Angular чище, короче и предсказуемее. Для большинства задач в компонентах и сервисах Signals предпочтительнее RxJS. Но RxJS по-прежнему нужен для сложных асинхронных потоков — они дополняют друг друга.
