---
title: HTTP-клиент в Angular
description: Работа с HTTP-запросами в Angular: HttpClient, типизированные запросы, интерцепторы для авторизации и логирования, загрузка файлов, обработка ошибок.
section: angular
difficulty: intermediate
readTime: 11
order: 9
tags: [Angular, HttpClient, interceptors, REST, upload, error handling]
---

## Настройка HttpClient

HttpClient — встроенный сервис Angular для HTTP-запросов. В standalone-приложении подключается через провайдер:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideHttpClient } from '@angular/common/http'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
  ]
}
```

В组件е — просто инжектим:

```typescript
import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'

export class UserService {
  private http = inject(HttpClient)
}
```

## Базовые запросы

HttpClient возвращает Observable — результат нужно получить через `.subscribe()` или `async` pipe:

### GET

```typescript
interface User {
  id: number
  name: string
  email: string
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private apiUrl = '/api/users'

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  getWithParams(page: number, limit: number): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      params: { page: page.toString(), limit: limit.toString() }
      // или через HttpParams:
      // params: new HttpParams().set('page', page).set('limit', limit)
    })
  }
}
```

### POST, PUT, PATCH, DELETE

```typescript
create(user: Omit<User, 'id'>): Observable<User> {
  return this.http.post<User>(this.apiUrl, user)
}

update(id: number, data: Partial<User>): Observable<User> {
  return this.http.patch<User>(`${this.apiUrl}/${id}`, data)
}

replace(id: number, user: User): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${id}`, user)
}

delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`)
}
```

### Полный набор опций

```typescript
this.http.get<User[]>('/api/users', {
  headers: {
    'X-Custom-Header': 'value',
    'Accept-Language': 'ru',
  },
  params: {
    page: '1',
    sort: 'name',
  },
  observe: 'response',     // Получить полный HttpResponse
  responseType: 'json',    // 'blob', 'text', 'arraybuffer'
  withCredentials: true,   // Отправлять cookies
})
```

### observe: 'response' — доступ к заголовкам

```typescript
getUsersPage(page: number): Observable<HttpResponse<User[]>> {
  return this.http.get<User[]>('/api/users', {
    params: { page: page.toString() },
    observe: 'response',
  })
}

// Использование
this.userService.getUsersPage(1).subscribe(response => {
  const users = response.body!
  const total = response.headers.get('X-Total-Count')
  console.log(`Получено ${users.length} из ${total}`)
})
```

## Использование в компонентах

### Способ 1: toSignal (рекомендуется с Signals)

```typescript
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  template: `
    @for (user of users(); track user.id) {
      <p>{{ user.name }}</p>
    }
  `
})
export class UserListComponent {
  private userService = inject(UserService)

  users = toSignal(this.userService.getAll(), { initialValue: [] })
}
```

### Способ 2: async pipe

```typescript
@Component({
  template: `
    @for (user of users$ | async; track user.id) {
      <p>{{ user.name }}</p>
    }
  `
})
export class UserListComponent {
  private userService = inject(UserService)

  users$ = this.userService.getAll()
}
```

### Способ 3: подписка вручную

```typescript
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService)
  users: User[] = []

  ngOnInit() {
    this.userService.getAll()
      .pipe(takeUntilDestroyed())
      .subscribe(users => this.users = users)
  }
}
```

## Интерцепторы

Интерцепторы — функции, которые перехватывают каждый запрос и ответ. Используются для добавления токена, логирования, обработки ошибок.

### Авторизационный интерцептор

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const token = auth.token()

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return next(req)
}
```

### Интерцептор логирования

```typescript
// interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http'
import { tap } from 'rxjs/operators'

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = performance.now()

  return next(req).pipe(
    tap({
      next: () => {
        const elapsed = Math.round(performance.now() - start)
        console.log(`[HTTP] ${req.method} ${req.url} — ${elapsed}ms`)
      },
      error: (err) => {
        const elapsed = Math.round(performance.now() - start)
        console.error(`[HTTP] ${req.method} ${req.url} — ${err.status} (${elapsed}ms)`)
      }
    })
  )
}
```

### Интерцептор обработки ошибок

```typescript
// interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { NotificationService } from '../services/notification.service'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const notify = inject(NotificationService)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          router.navigate(['/login'])
          break
        case 403:
          notify.error('Доступ запрещён')
          break
        case 404:
          notify.error('Ресурс не найден')
          break
        case 500:
          notify.error('Ошибка сервера. Попробуйте позже.')
          break
        default:
          notify.error(error.error?.message || 'Произошла ошибка')
      }

      return throwError(() => error)
    })
  )
}
```

### Регистрация интерцепторов

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        errorInterceptor,
      ])
    ),
  ]
}
```

Порядок важен — интерцепторы выполняются в том порядке, в котором указаны.

### Интерцепторы для кэширования

```typescript
// interceptors/cache.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http'
import { of } from 'rxjs'

const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req)
  }

  const cached = cache.get(req.urlWithParams)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return of(cached.data as any)
  }

  return next(req).pipe(
    tap(response => {
      cache.set(req.urlWithParams, { data: response, timestamp: Date.now() })
    })
  )
}
```

## Загрузка файлов

### Загрузка одного файла

```typescript
uploadFile(file: File): Observable<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  return this.http.post<{ url: string }>('/api/upload', formData, {
    reportProgress: true,
    observe: 'events',
  }).pipe(
    filter(event => event.type === HttpEventType.Response),
    map(event => (event as HttpResponse<{ url: string }>).body!)
  )
}
```

### Загрузка с прогрессом

```typescript
import { HttpEventType, HttpResponse } from '@angular/common/http'

@Component({ ... })
export class UploadComponent {
  private http = inject(HttpClient)
  progress = signal(0)
  isUploading = signal(false)

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    this.isUploading.set(true)

    const formData = new FormData()
    formData.append('avatar', file)

    this.http.post('/api/upload/avatar', formData, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = Math.round((event.loaded / (event.total ?? 1)) * 100)
          this.progress.set(percent)
        }
        if (event instanceof HttpResponse) {
          this.isUploading.set(false)
          console.log('Файл загружен:', event.body)
        }
      },
      error: () => this.isUploading.set(false),
    })
  }
}
```

```html
<!-- Шаблон -->
<input type="file" (change)="onFileSelected($event)" accept="image/*">
@if (isUploading()) {
  <progress [value]="progress()" max="100"></progress>
  <span>{{ progress() }}%</span>
}
```

### Загрузка нескольких файлов

```typescript
uploadFiles(files: FileList): Observable<string[]> {
  const formData = new FormData()
  Array.from(files).forEach((file, i) => {
    formData.append(`files`, file)
  })

  return this.http.post<string[]>('/api/upload/batch', formData)
}
```

### Скачивание файла

```typescript
downloadReport(id: string): Observable<Blob> {
  return this.http.get(`/api/reports/${id}/download`, {
    responseType: 'blob',
  }).pipe(
    tap(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    })
  )
}
```

## Обработка ошибок в сервисе

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient)

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError(this.handleError)
    )
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Произошла ошибка'

    if (error.status === 0) {
      message = 'Нет связи с сервером'
    } else if (error.status === 422) {
      const errors = error.error?.errors
      message = Object.values(errors ?? {}).join(', ')
    } else {
      message = error.error?.message || `Ошибка ${error.status}`
    }

    return throwError(() => new Error(message))
  }
}
```

## Практический пример — CRUD-сервис

```typescript
// services/task.service.ts
import { Injectable, inject, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, switchMap, tap } from 'rxjs'

export interface Task {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'open' | 'in_progress' | 'done'
  createdAt: string
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient)
  private apiUrl = '/api/tasks'

  private tasks = signal<Task[]>([])
  readonly tasksList = this.tasks.asReadonly()

  loadAll(params?: { difficulty?: string; status?: string }): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      tap(tasks => this.tasks.set(tasks))
    )
  }

  loadOne(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
  }

  create(data: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, data).pipe(
      tap(task => this.tasks.update(list => [task, ...list]))
    )
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => this.tasks.update(list =>
        list.map(t => t.id === id ? updated : t)
      ))
    )
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.tasks.update(list => list.filter(t => t.id !== id)))
    )
  }
}
```

## Итог

| Возможность | Для чего |
|---|---|
| `HttpClient.get/post/...` | Типизированные HTTP-запросы |
| `provideHttpClient()` | Регистрация в standalone-приложении |
| Интерцепторы | Токен, логирование, кэш, обработка ошибок |
| `HttpParams` | Query-параметры |
| `observe: 'response'` | Доступ к заголовкам и статусу |
| `reportProgress` | Прогресс загрузки файла |
| `responseType: 'blob'` | Скачивание файлов |
| `retry` | Повтор запроса при ошибке |
| `toSignal` | Превратить HTTP-вызов в Signal |

HttpClient — зрелый и продуманный HTTP-клиент. Интерцепторы позволяют вынести сквозную логику (авторизация, логирование, ошибки) из сервисов и компонентов, а типизация делает работу с ответами безопасной.
