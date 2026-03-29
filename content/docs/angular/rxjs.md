---
title: RxJS основы
description: RxJS — библиотека реактивного программирования на основе Observable. Angular использует RxJS для работы с HTTP, формами и асинхронными событиями.
section: angular
difficulty: intermediate
readTime: 11
order: 3
tags: [RxJS, Observable, operators, Angular, reactive]
---

## Что такое Observable?

**Observable** — поток данных, на который можно подписаться. В отличие от Promise, Observable может:
- Испускать **несколько** значений
- Быть **отменён** (через unsubscribe)
- Быть **синхронным** или **асинхронным**

```typescript
import { Observable, of, from, interval } from 'rxjs'

// Создание Observable
const numbers$ = new Observable<number>(subscriber => {
  subscriber.next(1)
  subscriber.next(2)
  subscriber.next(3)
  subscriber.complete()
})

// Подписка
const sub = numbers$.subscribe({
  next: (value) => console.log(value),   // 1, 2, 3
  error: (err) => console.error(err),
  complete: () => console.log('Готово'),
})

// Отписка
sub.unsubscribe()
```

## Вспомогательные функции создания

```typescript
// of — из значений
of(1, 2, 3).subscribe(console.log) // 1, 2, 3

// from — из массива, Promise, итерабельного
from([1, 2, 3]).subscribe(console.log)
from(fetch('/api/data')).subscribe(console.log) // Promise → Observable

// interval — через интервал
interval(1000).subscribe(n => console.log(n)) // 0, 1, 2... каждую секунду

// timer — задержка + интервал
timer(2000, 1000).subscribe(n => console.log(n)) // Начало через 2с, потом каждую 1с

// fromEvent — DOM-события
fromEvent(document, 'click').subscribe(e => console.log(e))
```

## Операторы

Операторы трансформируют потоки. Используются через `pipe()`:

### Трансформация

```typescript
import { map, filter, tap, take } from 'rxjs/operators'

// map — преобразование значения
from([1, 2, 3]).pipe(
  map(n => n * 2)
).subscribe(console.log) // 2, 4, 6

// filter — фильтрация
from([1, 2, 3, 4, 5]).pipe(
  filter(n => n % 2 === 0)
).subscribe(console.log) // 2, 4

// tap — побочный эффект без изменения значения
getData().pipe(
  tap(data => console.log('Получено:', data))
).subscribe(process)

// take — взять N значений
interval(1000).pipe(
  take(5)
).subscribe(console.log) // 0, 1, 2, 3, 4 → complete
```

### Работа с HTTP и вложенными Observable

```typescript
import { switchMap, mergeMap, exhaustMap, concatMap } from 'rxjs/operators'

// switchMap — отменяет предыдущий Observable при новом значении
// Идеально для поиска
searchInput$.pipe(
  debounceTime(300),
  switchMap(query => this.api.search(query))
).subscribe(results => this.results = results)

// mergeMap — параллельное выполнение
// Для нескольких независимых запросов
ids$.pipe(
  mergeMap(id => this.api.getItem(id))
).subscribe(item => this.items.push(item))

// concatMap — последовательное выполнение
// Для операций, требующих порядка
actions$.pipe(
  concatMap(action => this.api.process(action))
).subscribe()

// exhaustMap — игнорирует новые, пока текущий не завершён
// Для кнопки отправки формы
submitClick$.pipe(
  exhaustMap(() => this.api.submit(formData))
).subscribe()
```

### Управление временем

```typescript
import { debounceTime, throttleTime, delay, timeout } from 'rxjs/operators'

// debounceTime — ждать паузу N мс после последнего события
searchInput$.pipe(
  debounceTime(400)
).subscribe(query => this.search(query))

// throttleTime — не чаще одного раза в N мс
scrollEvent$.pipe(
  throttleTime(100)
).subscribe(this.handleScroll)

// timeout — ошибка если нет значения за N мс
api.getData().pipe(
  timeout(5000)
).subscribe({
  error: (err) => console.error('Таймаут!')
})
```

### Обработка ошибок

```typescript
import { catchError, retry, retryWhen } from 'rxjs/operators'

// catchError — перехватить и вернуть другой Observable
this.api.getUsers().pipe(
  catchError(err => of([])) // При ошибке вернуть пустой массив
).subscribe()

// retry — повторить N раз при ошибке
this.api.getData().pipe(
  retry(3)
).subscribe()
```

## Subject

Subject — одновременно Observable и Observer. Позволяет императивно генерировать события:

```typescript
import { Subject, BehaviorSubject } from 'rxjs'

// Subject — нет начального значения, только новые подписчики
const events$ = new Subject<string>()
events$.subscribe(e => console.log('Sub 1:', e))
events$.next('click')  // Sub 1: click

// BehaviorSubject — хранит последнее значение
const user$ = new BehaviorSubject<User | null>(null)
user$.subscribe(u => console.log(u)) // null сразу при подписке
user$.next({ name: 'Иван' })         // { name: 'Иван' }
console.log(user$.getValue())        // Синхронное получение
```

## Управление подписками в Angular

```typescript
@Component({ template: `{{ user$ | async }}` })
export class UserComponent implements OnDestroy {
  // Способ 1: async pipe (рекомендуется)
  user$ = this.userService.getUser(1)

  // Способ 2: takeUntilDestroyed (Angular 16+)
  constructor() {
    this.userService.getAll()
      .pipe(takeUntilDestroyed())
      .subscribe(users => this.users = users)
  }

  // Способ 3: ручная отписка
  private sub = new Subscription()

  ngOnInit() {
    this.sub.add(
      interval(1000).subscribe(n => this.time = n)
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe() // Предотвращает утечку памяти
  }
}
```
