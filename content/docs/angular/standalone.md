---
title: Standalone компоненты в Angular
description: Standalone компоненты — компоненты без NgModule, которые сами объявляют свои зависимости. С Angular 17 это подход по умолчанию. Миграция, providers, lazy loading без модулей.
section: angular
difficulty: intermediate
readTime: 10
order: 8
tags: [Angular, standalone, NgModule, migration, imports]
---

## Что такое standalone компоненты

До Angular 15 каждый компонент belonged to NgModule — специальному классу, который объявлял все компоненты, директивы, pipes и импортируемые модули. Это добавляло слой косвенности: чтобы использовать кнопку, нужно было импортировать целый модуль.

Standalone-компоненты убирают NgModule. Компонент сам указывает, что ему нужно:

```typescript
// ДО: компонент в NgModule
@NgModule({
  declarations: [TaskCardComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [TaskCardComponent]
})
class TaskCardModule {}

// ПОСЛЕ: standalone-компонент
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `...`
})
export class TaskCardComponent {}
```

С Angular 17 `standalone: true` стоит по умолчанию — писать его не обязательно.

## standalone: true — как это работает

Когда компонент `standalone`, он:
1. **Сам импортирует** свои зависимости (другие компоненты, директивы, pipes, модули)
2. **Не нуждается** в объявлении в NgModule
3. **Может использоваться** напрямую в `bootstrapApplication` или в `imports` другого standalone-компонента

```typescript
// shared/components/user-avatar/user-avatar.component.ts
@Component({
  selector: 'app-user-avatar',
  imports: [],  // Нет внешних зависимостей
  template: `
    <img [src]="url()" [alt]="name()">
    <span>{{ name() }}</span>
  `
})
export class UserAvatarComponent {
  url = input.required<string>()
  name = input('')
}
```

```typescript
// features/task-board/task-board.component.ts
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component'
import { NgFor } from '@angular/common'

@Component({
  selector: 'app-task-board',
  imports: [UserAvatarComponent, NgFor],  // Прямой импорт
  template: `
    @for (task of tasks(); track task.id) {
      <app-user-avatar [url]="task.avatar" [name]="task.assignee" />
    }
  `
})
export class TaskBoardComponent {
  tasks = signal<Task[]>([])
}
```

Никаких NgModule, никаких intermediate-модулей. Зависимость видна прямо в компоненте.

## Импорт зависимостей

### Другие standalone-компоненты

```typescript
@Component({
  imports: [
    HeaderComponent,     // Standalone-компонент
    TaskCardComponent,   // Standalone-компонент
    FooterComponent,     // Standalone-компонент
  ],
  template: `
    <app-header />
    <app-task-card />
    <app-footer />
  `
})
export class PageComponent {}
```

### Pipes и директивы

```typescript
import { TruncatePipe } from '@shared/pipes/truncate.pipe'
import { HighlightDirective } from '@shared/directives/highlight.directive'

@Component({
  imports: [TruncatePipe, HighlightDirective],
  template: `
    <p [appHighlight]="'yellow'">{{ text | truncate:50 }}</p>
  `
})
```

### Существующие NgModule

Если библиотека ещё не перешла на standalone, её NgModule можно импортировать напрямую:

```typescript
@Component({
  imports: [
    MatToolbarModule,      // NgModule из Angular Material
    MatButtonModule,       // NgModule из Angular Material
    FormsModule,           // Встроенный NgModule
  ]
})
```

Angular Material начиная с v15 экспортирует standalone-компоненты, поэтому лучше импортировать конкретные компоненты:

```typescript
// ВМЕСТО MatButtonModule:
import { MatButton } from '@angular/material/button'

@Component({
  imports: [MatButton],  // Только кнопка, без лишнего
})
```

## Bootstrap приложения без NgModule

Старый способ (с NgModule):

```typescript
// app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

// main.ts
platformBrowserDynamic().bootstrapModule(AppModule)
```

Новый способ (standalone):

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient } from '@angular/common/http'

import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
}

// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

bootstrapApplication(AppComponent, appConfig)
```

`appConfig` заменяет NgModule — здесь регистрируются все глобальные провайдеры.

## Providers в standalone-компонентах

Standalone-компоненты могут иметь своих провайдеров — это заменяет `providers` в NgModule:

```typescript
@Component({
  selector: 'app-task-editor',
  imports: [ReactiveFormsModule],
  providers: [
    TaskEditService,    // Экземпляр только для этого компонента и его детей
    {
      provide: TASK_TOKEN,
      useFactory: () => new Task({ status: 'draft' }),
    }
  ],
  template: `...`
})
export class TaskEditorComponent {}
```

Провайдеры, указанные в `providers` standalone-компонента, создают **новый экземпляр** для каждого компонента — как если бы это был lazy-loaded модуль.

Для синглтон-сервисов по-прежнему используйте `@Injectable({ providedIn: 'root' })`.

## Lazy loading без NgModule

Раньше lazy loading работал только с NgModule через `loadChildren`. Теперь можно загружать отдельные компоненты:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes')
      .then(m => m.SETTINGS_ROUTES)
  },
]
```

```typescript
// features/settings/settings.routes.ts
import { Routes } from '@angular/router'

export const SETTINGS_ROUTES: Routes = [
  { path: '', component: SettingsListComponent },
  { path: ':id', component: SettingsDetailComponent },
]
```

Никаких модулей-обёрток для lazy loading — только маршруты и компоненты.

## Миграция с NgModule на standalone

### Шаг 1: Включить standalone (Angular 16+)

```bash
ng generate @angular/core:standalone
```

Схематик пройдётся по всем компонентам и добавит `standalone: true` + заполнит `imports` на основе того, что было в NgModule.

### Шаг 2: Ручная миграция отдельного компонента

```typescript
// ДО: компонент в SharedModule
@NgModule({
  declarations: [
    UserCardComponent,
    TaskBadgeComponent,
    TruncatePipe,
  ],
  imports: [CommonModule, MatIconModule],
  exports: [
    UserCardComponent,
    TaskBadgeComponent,
    TruncatePipe,
  ]
})
export class SharedModule {}
```

```typescript
// ПОСЛЕ: каждый становится standalone

// user-card.component.ts
@Component({
  selector: 'app-user-card',
  imports: [TaskBadgeComponent, TruncatePipe, MatIconModule],
  template: `...`
})
export class UserCardComponent {}

// task-badge.component.ts
@Component({
  selector: 'app-task-badge',
  imports: [],
  template: `...`
})
export class TaskBadgeComponent {}

// truncate.pipe.ts
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform { ... }
```

### Шаг 3: Удалить AppModule

Когда все компоненты standalone, замените AppModule на `app.config.ts`:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    // Всё, что было в AppModule.providers
  ]
}

// main.ts
bootstrapApplication(AppComponent, appConfig)
```

### Шаг 4: Обновить маршруты

```typescript
// Заменить lazy NgModule
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
}

// На lazy routes
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
}
```

## Паттерны организации кода

### Barrel exports

С barrel-файлом можно импортировать несколько компонентов из одной точки:

```typescript
// shared/components/index.ts
export { UserAvatarComponent } from './user-avatar/user-avatar.component'
export { TaskBadgeComponent } from './task-badge/task-badge.component'
export { StatusChipComponent } from './status-chip/status-chip.component'
```

```typescript
// В компоненте-потребителе
import { UserAvatarComponent, TaskBadgeComponent } from '@shared/components'
```

### Группировка по фичам

```
src/app/
├── shared/
│   ├── components/
│   │   ├── user-avatar/
│   │   └── status-chip/
│   ├── pipes/
│   │   └── truncate/
│   └── directives/
│       └── highlight/
├── features/
│   ├── tasks/
│   │   ├── task-list.component.ts
│   │   ├── task-detail.component.ts
│   │   ├── task-create.component.ts
│   │   └── task.routes.ts
│   └── auth/
│       ├── login.component.ts
│       ├── register.component.ts
│       └── auth.routes.ts
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Итог

| Концепция | Было (NgModule) | Стало (Standalone) |
|---|---|---|
| Где компонент живёт | В declarations модуля | Сам по себе |
| Зависимости | В imports модуля | В `imports` компонента |
| Bootstrap | `bootstrapModule(AppModule)` | `bootstrapApplication(App, config)` |
| Провайдеры | В модуле или `@Injectable` | В `providers` компонента или `appConfig` |
| Lazy loading | `loadChildren` + NgModule | `loadComponent` или `loadChildren` + routes |

Standalone-компоненты — это не просто «другой синтаксис». Они меняют архитектуру приложения: каждый компонент становится самодостаточной единицей, которую легко переиспользовать, тестировать и перемещать между проектами. Если начинаете новый проект на Angular 17+ — даже не думайте о NgModule, используйте standalone.
