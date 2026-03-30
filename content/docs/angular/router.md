---
title: Маршрутизация в Angular
description: "Angular Router — навигация между страницами SPA: настройка маршрутов, параметры, guards для защиты страниц, lazy loading модулей и resolver для предзагрузки данных."
section: angular
difficulty: intermediate
readTime: 12
order: 5
tags: [Angular, Router, navigation, guards, lazy loading, resolver]
---

## Что такое Angular Router

Angular Router превращает одностраничное приложение (SPA) в многостраничное с точки зрения пользователя. URL в адресной строке меняется, но страница не перезагружается — Router просто подставляет нужный компонент в `<router-outlet>`.

## Базовая настройка

### app.routes.ts

Начиная с Angular 17 standalone-приложения используют файл маршрутов вместо RouterModule:

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', component: NotFoundComponent },
]
```

### Регистрация в приложении

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
  ]
}
```

### Router outlet

В корневом компоненте указываем, куда рендерить текущий маршрут:

```html
<!-- app.component.html -->
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Главная</a>
  <a routerLink="/tasks" routerLinkActive="active">Задачи</a>
  <a routerLink="/profile" routerLinkActive="active">Профиль</a>
</nav>

<router-outlet />
```

`routerLinkActive` добавляет CSS-класс `active`, когда ссылка совпадает с текущим URL. Опция `exact: true` нужна для корневого маршрута, иначе `/` совпадёт со всеми путями.

## Параметры маршрута

### Параметры пути (path params)

```typescript
// Маршрут с параметром
{ path: 'tasks/:id', component: TaskDetailComponent }
```

```typescript
// task-detail.component.ts
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  standalone: true,
  template: `<h2>Задача #{{ taskId }}</h2>`
})
export class TaskDetailComponent implements OnInit {
  taskId = ''

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Один раз при загрузке
    this.taskId = this.route.snapshot.paramMap.get('id') ?? ''

    // Реагировать на изменение параметра без перезагрузки компонента
    this.route.paramMap.subscribe(params => {
      this.taskId = params.get('id') ?? ''
      this.loadTask(this.taskId)
    })
  }

  loadTask(id: string) {
    // Загрузить данные задачи
  }
}
```

### Query-параметры

```typescript
// Переход с query-параметрами
import { Router } from '@angular/router'

export class TaskListComponent {
  constructor(private router: Router) {}

  filterByDifficulty(difficulty: string) {
    this.router.navigate(['/tasks'], {
      queryParams: { difficulty, page: 1 }
    })
  }
}
```

```typescript
// Чтение query-параметров
this.route.queryParamMap.subscribe(params => {
  const difficulty = params.get('difficulty')
  const page = params.get('page')
})
```

```html
<!-- Ссылка с query-параметрами -->
<a [routerLink]="['/tasks']" [queryParams]="{ difficulty: 'easy' }">
  Простые задачи
</a>
```

## Дочерние маршруты (nested routes)

Дочерние маршруты позволяют вкладывать `<router-outlet>` друг в друга:

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  }
]
```

```html
<!-- dashboard-layout.component.html -->
<div class="dashboard">
  <aside>
    <a routerLink="overview">Обзор</a>
    <a routerLink="analytics">Аналитика</a>
    <a routerLink="settings">Настройки</a>
  </aside>
  <main>
    <router-outlet />
  </main>
</div>
```

Дочерние маршруты рендерятся во внутренний `<router-outlet>`.

## Lazy loading

Lazy loading загружает код маршрута только при переходе на него. Это уменьшает начальный бандл и ускоряет загрузку:

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/task.routes')
      .then(m => m.TASK_ROUTES)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent)
  },
]
```

```typescript
// features/tasks/task.routes.ts
import { Routes } from '@angular/router'

export const TASK_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: ':id', component: TaskDetailComponent },
  { path: 'new', component: TaskCreateComponent },
]
```

`loadChildren` загружает целый набор маршрутов, `loadComponent` — один компонент. И то, и другое создаёт отдельный чанк (файл), который подгрузится по требованию.

## Guards — защита маршрутов

Guards решают, можно ли перейти на маршрут. Начиная с Angular 15 guards — это функции, а не классы:

### CanActivate — проверка доступа

```typescript
// guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (auth.isLoggedIn()) {
    return true
  }

  router.navigate(['/auth/login'])
  return false
}
```

```typescript
// Применение к маршруту
{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [authGuard]
}
```

### CanActivateChild — защита дочерних маршрутов

```typescript
export const adminGuard: CanActivateChildFn = () => {
  const auth = inject(AuthService)
  return auth.hasRole('admin') || inject(Router).parseUrl('/403')
}

// В маршрутах
{
  path: 'admin',
  component: AdminLayoutComponent,
  canActivateChild: [adminGuard],
  children: [
    { path: 'users', component: AdminUsersComponent },
    { path: 'settings', component: AdminSettingsComponent },
  ]
}
```

### CanMatch — условная загрузка lazy-модуля

```typescript
import { CanMatchFn, Router } from '@angular/router'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'

export const premiumGuard: CanMatchFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (auth.hasPremium()) {
    return true
  }

  router.navigate(['/subscribe'])
  return false
}

// Модуль загрузится только если guard вернёт true
{
  path: 'premium',
  canMatch: [premiumGuard],
  loadChildren: () => import('./features/premium/premium.routes')
    .then(m => m.PREMIUM_ROUTES)
}
```

### CanDeactivate — защита от ухода со страницы

```typescript
export const unsavedChangesGuard: CanDeactivateFn<FormComponent> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('Есть несохранённые изменения. Уйти со страницы?')
  }
  return true
}

// В маршрутах
{
  path: 'tasks/:id/edit',
  component: TaskEditComponent,
  canDeactivate: [unsavedChangesGuard]
}
```

## Resolver — предзагрузка данных

Resolver загружает данные до того, как компонент отрендерится. Маршрут не активируется, пока resolver не вернёт данные:

```typescript
// resolvers/task.resolver.ts
import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { TaskService } from '../services/task.service'
import { Task } from '../models/task'

export const taskResolver: ResolveFn<Task> = (route) => {
  return inject(TaskService).getById(
    route.paramMap.get('id')!
  )
}
```

```typescript
// В маршрутах
{
  path: 'tasks/:id',
  component: TaskDetailComponent,
  resolve: { task: taskResolver }
}
```

```typescript
// В компоненте — данные уже доступны
export class TaskDetailComponent {
  task = this.route.snapshot.data['task'] as Task

  constructor(private route: ActivatedRoute) {}
}
```

Resolver удобен, когда нужно показать страницу только с готовыми данными. Но в большинстве случаев проще загружать данные прямо в компоненте и показывать спиннер — это даёт лучший UX.

## Программная навигация

```typescript
import { Router, NavigationExtras } from '@angular/router'

export class SomeComponent {
  private router = inject(Router)

  goToTask(id: string) {
    this.router.navigate(['/tasks', id])
  }

  goToTasksWithFilter() {
    this.router.navigate(['/tasks'], {
      queryParams: { difficulty: 'hard', status: 'open' }
    })
  }

  goBack() {
    history.back()
    // или
    inject(Location).back()
  }
}
```

## События навигации

```typescript
// Отслеживать все переходы (для аналитики, прогресс-бара)
export class AppComponent implements OnInit {
  private router = inject(Router)

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Начинаем переход к:', event.url)
      }
      if (event instanceof NavigationEnd) {
        console.log('Переход завершён:', event.urlAfterRedirects)
      }
      if (event instanceof NavigationError) {
        console.error('Ошибка навигации:', event.error)
      }
    })
  }
}
```

## Практический пример — полный файл маршрутов

```typescript
// app.routes.ts
import { Routes } from '@angular/router'
import { authGuard } from './guards/auth.guard'
import { unsavedChangesGuard } from './guards/unsaved-changes.guard'

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/tasks/task-list.component')
          .then(m => m.TaskListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./features/tasks/task-create.component')
          .then(m => m.TaskCreateComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/tasks/task-detail.component')
          .then(m => m.TaskDetailComponent),
        resolve: { task: taskResolver },
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/tasks/task-edit.component')
          .then(m => m.TaskEditComponent),
        canDeactivate: [unsavedChangesGuard],
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found.component')
      .then(m => m.NotFoundComponent),
  },
]
```

## Итог

| Концепция | Для чего |
|---|---|
| `Routes` | Описание структуры страниц |
| `<router-outlet>` | Место, куда рендерится текущий маршрут |
| `routerLink` | Навигация через шаблон |
| `ActivatedRoute` | Чтение параметров и query |
| `lazy loading` | Отложенная загрузка — меньше начальный бандл |
| `CanActivate` | Проверка доступа к странице |
| `CanDeactivate` | Защита от потери данных |
| `CanMatch` | Условная загрузка lazy-модуля |
| `Resolve` | Предзагрузка данных перед показом |

Angular Router — один из самых мощных роутеров среди фреймворков. Он поддерживает вложенность любой глубины, несколько outlet-ов (auxiliary routes) и детальный контроль над навигацией.
