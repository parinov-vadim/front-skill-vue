---
title: Оптимизация производительности Angular
description: "Оптимизация Angular-приложений: OnPush change detection, trackBy, deferrable views, virtual scrolling, lazy loading, tree-shaking и профилирование с Angular DevTools."
section: angular
difficulty: advanced
readTime: 12
order: 14
tags: [Angular, performance, OnPush, trackBy, virtual scroll, optimization, defer]
---

## Почему Angular может тормозить

Angular по умолчанию проверяет **все** компоненты при каждом событии (клик, ввод, таймер, HTTP-ответ). В большом приложении это тысячи проверок за один цикл. Если компоненты тяжёлые или их много, приложение начинает тормозить.

Оптимизация сводится к трём стратегиям:
1. **Меньше проверок** — OnPush, trackBy
2. **Меньше DOM-элементов** — virtual scrolling, lazy loading
3. **Меньше кода в бандле** — tree-shaking, code splitting

## OnPush Change Detection

По умолчанию Angular использует стратегию `Default`: при каждом событии проверяет весь дерево компонентов. Стратегия `OnPush` говорит Angular проверять компонент только когда:

- Изменился `@Input()` (новая ссылка)
- Сработало событие самого компонента (клик, инпут)
- Сработал `AsyncPipe`
- Вручную вызван `ChangeDetectorRef.markForCheck()`

### Включение OnPush

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ task().title }}</h3>
      <span>{{ task().difficulty }}</span>
    </div>
  `
})
export class TaskCardComponent {
  task = input.required<Task>()
}
```

### Когда OnPush работает автоматически

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Input изменился — Angular проверит -->
    <app-user-card [user]="currentUser" />

    <!-- AsyncPipe обновил значение — Angular проверит -->
    <p>{{ title$ | async }}</p>

    <!-- Сигнал изменился — Angular проверит (v17+) -->
    <p>{{ count() }}</p>

    <!-- Клик внутри компонента — Angular проверит -->
    <button (click)="doSomething()">Click</button>
  `
})
```

### Когда нужно markForCheck

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ data }}</p>`
})
export class DataComponent implements OnInit {
  data: string = ''

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // setTimeout не триггерит OnPush автоматически в некоторых случаях
    setTimeout(() => {
      this.data = 'Загружено'
      this.cdr.markForCheck()
    }, 1000)
  }
}
```

Но если используете Signals — `markForCheck` не нужен:

```typescript
// С Signals OnPush работает автоматически
data = signal('')

ngOnInit() {
  setTimeout(() => {
    this.data.set('Загружено')  // Angular сам обновит представление
  }, 1000)
}
```

## trackBy и @for track

Когда Angular перерисовывает список, он уничтожает и создаёт все элементы DOM заново. `track` помогает Angular понять, какие элементы уже существуют:

### @for (Angular 17+)

```html
<!-- track обязателен в @for — Angular использует его для оптимизации -->
@for (task of tasks(); track task.id) {
  <app-task-card [task]="task" />
} @empty {
  <p>Нет задач</p>
}
```

### *ngFor с trackBy (старый синтаксис)

```typescript
@Component({
  template: `
    <div *ngFor="let task of tasks; trackBy: trackById">
      {{ task.title }}
    </div>
  `
})
export class TaskListComponent {
  tasks: Task[] = []

  trackById(index: number, task: Task): string {
    return task.id
  }
}
```

Без trackBy при обновлении списка Angular уничтожит и пересоздаст все DOM-элементы. С trackBy — обновит только изменившиеся.

## Deferrable Views (@defer)

Angular 17.3+ позволяет отложить загрузку и рендеринг части шаблона:

### Загрузка при попадании в viewport

```html
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-placeholder">Загрузка графика...</div>
} @loading (minimum 500ms) {
  <mat-spinner />
}
```

### Загрузка по условию

```html
@defer (when showComments()) {
  <app-comments [taskId]="taskId()" />
} @placeholder {
  <p>Комментарии скрыты</p>
}
```

### Загрузка при hover

```html
@defer (on hover) {
  <app-user-profile [userId]="userId()" />
} @placeholder {
  <div class="avatar-placeholder" />
}
```

### Загрузка при взаимодействии

```html
@defer (on interaction) {
  <app-video-player [src]="videoUrl()" />
} @placeholder {
  <div class="video-thumbnail">
    <span>Нажмите для воспроизведения</span>
  </div>
}
```

### Prefetch — предварительная загрузка

```html
<!-- Загрузить при hover, показать при клике -->
<div (click)="show = true">
  @defer (on interaction; prefetch on hover) {
    <app-heavy-module />
  } @placeholder {
    <p>Наведите для предзагрузки</p>
  }
</div>
```

`@defer` создаёт отдельный чанк — код подгружается только когда нужен. Это уменьшает начальный бандл.

## Virtual Scrolling

Виртуальный скроллинг рендерит только видимые элементы списка. Если у вас 10 000 задач — в DOM будут только те, что видны на экране (плюс буфер):

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling'

@Component({
  standalone: true,
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="viewport">
      <div *cdkVirtualFor="let task of tasks" class="item">
        <span>{{ task.title }}</span>
        <span>{{ task.difficulty }}</span>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport {
      height: 600px;
    }
    .item {
      height: 72px;
      display: flex;
      align-items: center;
    }
  `]
})
export class TaskListComponent {
  tasks: Task[] = []  // Может быть 10 000+
}
```

`itemSize` — высота одного элемента в пикселях. CDK использует это для вычисления, какие элементы видны.

### С динамической высотой

```html
<cdk-virtual-scroll-viewport [minBufferSize]="10">
  <div *cdkVirtualFor="let task of tasks; autoSize">
    <p>{{ task.title }}</p>
    <p>{{ task.description }}</p>
  </div>
</cdk-virtual-scroll-viewport>
```

## Pure Pipes

Pure Pipes пересчитываются только при изменении входных данных. Impure Pipes — при каждой проверке change detection:

```typescript
// Pure (по умолчанию) — пересчитывается только при изменении аргументов
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.slice(0, limit) + '...' : value
  }
}

// Impure — пересчитывается при КАЖДОМ change detection
// ⚠️ Используйте только если действительно нужно
@Pipe({ name: 'filterTasks', standalone: true, pure: false })
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[], filter: string): Task[] {
    return tasks.filter(t => t.difficulty === filter)
  }
}
```

Лучше использовать `computed` сигналы вместо impure pipes:

```typescript
// Вместо impure pipe
filteredTasks = computed(() =>
  this.tasks().filter(t => t.difficulty === this.filter())
)
```

## Lazy Loading модулей и компонентов

### Lazy loading маршрутов

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/task.routes')
      .then(m => m.TASK_ROUTES)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component')
      .then(m => m.AdminComponent)
  },
]
```

### Preloading стратегия

Загрузить lazy-модули заранее, пока пользователь на главной:

```typescript
import { PreloadAllModules, provideRouter } from '@angular/router'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, PreloadAllModules)
  ]
}
```

Кастомная стратегия — загружать только определённые модули:

```typescript
import { PreloadingStrategy, Route } from '@angular/router'
import { Observable, of } from 'rxjs'

export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload']) {
      return load()
    }
    return of(null)
  }
}

// В маршрутах
{
  path: 'tasks',
  loadChildren: () => import('./features/tasks/task.routes').then(m => m.TASK_ROUTES),
  data: { preload: true }
}

// В app.config
provideRouter(routes, SelectivePreloadingStrategy)
```

## Оптимизация бандла

### Tree-shaking

Angular CLI (esbuild) автоматически удаляет неиспользуемый код. Но нужно帮他:

```typescript
// ❌ Плохо — импортирует всю библиотеку
import _ from 'lodash'

// ✅ Хорошо — импортирует только нужное
import debounce from 'lodash/debounce'
```

### Анализ бандла

```bash
# Сборка с source map
ng build --source-map

# Анализ
npx source-map-explorer dist/my-app/browser/*.js
```

Откроется визуализация — видно, что занимает место в бандле.

### Budgets — лимиты размера

В `angular.json`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "4kB",
    "maximumError": "8kB"
  }
]
```

Если бандл превысит лимит — сборка упадёт с ошибкой.

## Профилирование с Angular DevTools

Angular DevTools — расширение для Chrome:

1. Установите [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh)
2. Откройте DevTools → вкладка «Angular»
3. **Profiler** — записывает циклы change detection, показывает какие компоненты проверялись и сколько времени это заняло

Как использовать:
- Начать запись
- Выполнить действие (клик, ввод)
- Остановить запись
- Посмотреть, какие компоненты проверялись и почему

Если компонент проверяется без изменений — это кандидат на OnPush.

## Практический чеклист оптимизации

| Проблема | Решение |
|---|---|
| Тормозит список | `@for track`, virtual scrolling |
| Компонент перерисовывается без изменений | `OnPush` |
| Большой начальный бандл | Lazy loading, `@defer` |
| Тяжёлый компонент не сразу нужен | `@defer on viewport` |
| Большие зависимости (lodash, moment) | Tree-shaking, альтернативы (date-fns) |
| Медленный change detection | Angular DevTools Profiler → найти горячие компоненты |
| Повторные HTTP-запросы | Кэширование (интерцептор или Transfer State) |
| Impure pipe | Переписать на `computed` |
| Нет preload статики | Service Worker + `@angular/pwa` |

## Итог

Оптимизация Angular — это не магия, а набор конкретных техник:

1. **OnPush** — включайте везде, где используются Signals или immutable Inputs
2. **track** в `@for` — обязательно, без исключений
3. **@defer** — откладывайте тяжёлые компоненты до момента, когда они нужны
4. **Virtual scrolling** — для списков длиннее 100 элементов
5. **Lazy loading** — для маршрутов, которые пользователь может не посетить
6. **Budgets** — установите лимиты и следите за размером бандла

Начинайте с OnPush + trackBy — это даёт 80% эффекта за 20% усилий. Angular DevTools подскажет, где проблема.
