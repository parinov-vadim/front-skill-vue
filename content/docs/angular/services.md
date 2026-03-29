---
title: Сервисы и Dependency Injection
description: Сервисы содержат бизнес-логику и данные, используемые несколькими компонентами. Angular DI автоматически предоставляет нужные зависимости.
section: angular
difficulty: intermediate
readTime: 9
order: 2
tags: [Angular, services, DI, Injectable, HttpClient]
---

## Что такое сервис?

Сервис — класс с декоратором `@Injectable`, содержащий логику, не связанную с представлением: HTTP-запросы, бизнес-логика, кэш, аутентификация.

```typescript
// user.service.ts
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface User {
  id: number
  name: string
  email: string
}

@Injectable({
  providedIn: 'root'  // Синглтон на всё приложение
})
export class UserService {
  private apiUrl = '/api/users'

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user)
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
```

## Внедрение зависимостей

```typescript
// В компоненте
@Component({ ... })
export class UserListComponent implements OnInit {

  // Современный способ (Angular 14+)
  private userService = inject(UserService)

  // Или через конструктор
  constructor(private userService: UserService) {}

  users: User[] = []

  ngOnInit() {
    this.userService.getAll().subscribe(users => {
      this.users = users
    })
  }
}
```

## Scope провайдеров

```typescript
// Синглтон на всё приложение (один экземпляр)
@Injectable({ providedIn: 'root' })

// Синглтон на конкретный модуль
@Injectable({ providedIn: UserModule })

// Новый экземпляр для каждого компонента
@Component({
  providers: [UserService] // Локальный провайдер
})
export class UserCardComponent {
  private service = inject(UserService) // Свой экземпляр
}
```

## Сервис состояния (State Service)

```typescript
// store/cart.service.ts
import { Injectable, signal, computed } from '@angular/core'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // Angular Signals (v17+)
  private items = signal<CartItem[]>([])

  // Вычисляемые данные
  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  )

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  addItem(item: CartItem) {
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

  removeItem(id: number) {
    this.items.update(items => items.filter(i => i.id !== id))
  }

  clear() {
    this.items.set([])
  }
}
```

```typescript
// В компоненте
@Component({
  template: `
    <span>{{ cartService.count() }} товаров</span>
    <span>{{ cartService.total() | currency:'RUB' }}</span>
  `
})
export class HeaderComponent {
  protected cartService = inject(CartService)
}
```

## HttpClient с перехватчиками

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken()

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  }

  return next(req)
}
```

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}
```

## Обработка ошибок в сервисе

```typescript
import { catchError, throwError } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Перенаправить на логин
        }
        return throwError(() => new Error(error.message))
      })
    )
  }
}
```
