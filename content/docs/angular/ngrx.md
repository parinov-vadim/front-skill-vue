---
title: NgRx: управление состоянием
description: NgRx — Redux-паттерн для Angular. Actions, Reducers, Selectors, Effects — предсказуемое управление состоянием в крупных приложениях.
section: angular
difficulty: advanced
readTime: 13
order: 12
tags: [Angular, NgRx, Redux, store, state management, effects, selectors]
---

## Что такое NgRx

NgRx — реализация Redux-паттерна для Angular. Состояние всего приложения хранится в одном Store. Компоненты читают данные через Selectors и меняют их через Actions. Асинхронные операции (HTTP-запросы) обрабатываются через Effects.

Когда NgRx нужен:
- Крупное приложение с десятками взаимосвязанных страниц
- Данные используются в нескольких несвязанных компонентах
- Нужна отладка (time-travel debugging)

Когда NgRx избыточен:
- Небольшое приложение
- Данные живут локально в компоненте
- Достаточно Signals или сервисов со state

## Установка

```bash
ng add @ngrx/store
ng add @ngrx/effects
ng add @ngrx/store-devtools    # Для Redux DevTools
```

## Архитектура NgRx

```
Компонент → dispatch(Action) → Reducer → новый State → Selector → Компонент
                                    ↑
                              Effect (асинхронные операции)
```

Поток однонаправленный:
1. **Action** — описание того, что произошло
2. **Reducer** — чистая функция, создающая новый state на основе action
3. **Selector** — извлечение данных из state
4. **Effect** — побочные эффекты (HTTP, таймеры)

## Actions

Action описывает событие. Это объект с типом и опциональными данными:

```typescript
// store/tasks/task.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store'

export const TaskActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: Task[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    'Create Task': props<{ title: string; description: string }>(),
    'Create Task Success': props<{ task: Task }>(),
    'Create Task Failure': props<{ error: string }>(),

    'Update Task': props<{ id: string; changes: Partial<Task> }>(),
    'Delete Task': props<{ id: string }>(),

    'Set Filter': props<{ difficulty: string | null }>(),
  }
})
```

`createActionGroup` (NgRx 14+) создаёт типобезопасные action-крейторы в одной группе. Каждый action — функция:

```typescript
// Диспетчеризация
store.dispatch(TaskActions.loadTasks())
store.dispatch(TaskActions.createTask({ title: 'Изучить NgRx', description: '...' }))
store.dispatch(TaskActions.setFilter({ difficulty: 'hard' }))
```

## State и Reducer

Reducer определяет форму состояния и обрабатывает actions:

```typescript
// store/tasks/task.reducer.ts
import { createReducer, on } from '@ngrx/store'
import { TaskActions } from './task.actions'

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  filter: {
    difficulty: string | null
  }
}

export const initialTaskState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: {
    difficulty: null,
  },
}

export const taskReducer = createReducer(
  initialTaskState,

  // Загрузка
  on(TaskActions.loadTasks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
  })),

  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Создание
  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [task, ...state.tasks],
  })),

  // Обновление
  on(TaskActions.updateTask, (state, { id, changes }) => ({
    ...state,
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...changes } : t),
  })),

  // Удаление
  on(TaskActions.deleteTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== id),
  })),

  // Фильтр
  on(TaskActions.setFilter, (state, { difficulty }) => ({
    ...state,
    filter: { ...state.filter, difficulty },
  })),
)
```

Редюсер — **чистая функция**: не мутирует state, не вызывает API, не бросает исключений. Только создаёт новый объект на основе старого.

## Регистрация Store

```typescript
// store/index.ts
import { ActionReducerMap } from '@ngrx/store'

export interface AppState {
  tasks: TaskState
  auth: AuthState
}

export const reducers: ActionReducerMap<AppState> = {
  tasks: taskReducer,
  auth: authReducer,
}
```

```typescript
// app.config.ts
import { provideStore } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'
import { provideStoreDevtools } from '@ngrx/store-devtools'
import { reducers } from './store'

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(reducers),
    provideEffects([TaskEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ]
}
```

## Selectors

Selectors — функции для извлечения данных из Store. Они мемоизированы — не пересчитываются, если данные не изменились:

```typescript
// store/tasks/task.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store'

// Feature selector — получить весь слайс состояния
export const selectTaskState = createFeatureSelector<TaskState>('tasks')

// Простые селекторы
export const selectAllTasks = createSelector(
  selectTaskState,
  (state) => state.tasks
)

export const selectTasksLoading = createSelector(
  selectTaskState,
  (state) => state.loading
)

export const selectTasksError = createSelector(
  selectTaskState,
  (state) => state.error
)

export const selectFilter = createSelector(
  selectTaskState,
  (state) => state.filter
)

// Комбинированный селектор — фильтрованные задачи
export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectFilter,
  (tasks, filter) => {
    if (!filter.difficulty) return tasks
    return tasks.filter(t => t.difficulty === filter.difficulty)
  }
)

// Селектор с пропсами
export const selectTaskById = createSelector(
  selectAllTasks,
  (tasks, props: { id: string }) => tasks.find(t => t.id === props.id)
)

// Использование
// store.select(selectTaskById, { id: '123' })
```

## Effects — побочные эффекты

Effects обрабатывают асинхронные операции: HTTP-запросы, навигация, логирование. Effect слушает Actions и может диспатчить новые Actions:

```typescript
// store/tasks/task.effects.ts
import { Injectable, inject } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { TaskService } from '../../services/task.service'
import { TaskActions } from './task.actions'

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions)
  private taskService = inject(TaskService)

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.taskService.getAll().pipe(
          map(tasks => TaskActions.loadTasksSuccess({ tasks })),
          catchError(error => of(TaskActions.loadTasksFailure({ error: error.message })))
        )
      )
    )
  )

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      mergeMap(({ title, description }) =>
        this.taskService.create({ title, description }).pipe(
          map(task => TaskActions.createTaskSuccess({ task })),
          catchError(error => of(TaskActions.createTaskFailure({ error: error.message })))
        )
      )
    )
  )

  // Effect без dispatch — для навигации, логирования
  taskCreatedLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTaskSuccess),
      tap(({ task }) => console.log('Задача создана:', task.title))
    ),
    { dispatch: false }
  )
}
```

### ofType — фильтрация actions

`ofType` фильтрует поток actions по типу. Можно указать несколько:

```typescript
ofType(
  TaskActions.createTaskSuccess,
  TaskActions.updateTask,
  TaskActions.deleteTask,
)
```

### switchMap vs mergeMap в Effects

| Оператор | Поведение | Когда использовать |
|---|---|---|
| `switchMap` | Отменяет предыдущий при новом | Поиск, загрузка данных |
| `mergeMap` | Параллельное выполнение | Создание, обновление |
| `concatMap` | Последовательное выполнение | Операции, где важен порядок |
| `exhaustMap` | Игнорирует новые до завершения | Отправка формы |

## Использование в компонентах

```typescript
// features/task-list/task-list.component.ts
import { Component, inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { TaskActions } from '@store/tasks/task.actions'
import {
  selectFilteredTasks,
  selectTasksLoading,
  selectFilter,
} from '@store/tasks/task.selectors'

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="filters">
      <button (click)="setFilter(null)" [class.active]="(filter$ | async)?.difficulty === null">
        Все
      </button>
      <button (click)="setFilter('easy')" [class.active]="(filter$ | async)?.difficulty === 'easy'">
        Простые
      </button>
      <button (click)="setFilter('hard')" [class.active]="(filter$ | async)?.difficulty === 'hard'">
        Сложные
      </button>
    </div>

    @if (loading$ | async) {
      <p>Загрузка...</p>
    } @else {
      <ul>
        @for (task of (tasks$ | async); track task.id) {
          <li>
            {{ task.title }}
            <button (click)="deleteTask(task.id)">Удалить</button>
          </li>
        }
      </ul>
    }
  `
})
export class TaskListComponent {
  private store = inject(Store)

  tasks$ = this.store.select(selectFilteredTasks)
  loading$ = this.store.select(selectTasksLoading)
  filter$ = this.store.select(selectFilter)

  ngOnInit() {
    this.store.dispatch(TaskActions.loadTasks())
  }

  setFilter(difficulty: string | null) {
    this.store.dispatch(TaskActions.setFilter({ difficulty }))
  }

  deleteTask(id: string) {
    this.store.dispatch(TaskActions.deleteTask({ id }))
  }
}
```

## Entity — работа с коллекциями

`@ngrx/entity` упрощает работу с коллекциями объектов — CRUD-операции без ручного `map`/`filter`:

```typescript
// store/tasks/task.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity'

export interface TaskState extends EntityState<Task> {
  loading: boolean
  error: string | null
  filter: { difficulty: string | null }
}

export const taskAdapter = createEntityAdapter<Task>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
})

export const initialTaskState: TaskState = taskAdapter.getInitialState({
  loading: false,
  error: null,
  filter: { difficulty: null },
})

export const taskReducer = createReducer(
  initialTaskState,

  on(TaskActions.loadTasksSuccess, (state, { tasks }) =>
    taskAdapter.setAll(tasks, state)
  ),

  on(TaskActions.createTaskSuccess, (state, { task }) =>
    taskAdapter.addOne(task, state)
  ),

  on(TaskActions.updateTask, (state, { id, changes }) =>
    taskAdapter.updateOne({ id, changes }, state)
  ),

  on(TaskActions.deleteTask, (state, { id }) =>
    taskAdapter.removeOne(id, state)
  ),
)

// Встроенные селекторы Entity
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = taskAdapter.getSelectors()
```

Методы Entity-адаптера: `setAll`, `addOne`, `addMany`, `updateOne`, `updateMany`, `removeOne`, `removeMany`, `upsertOne`.

## NgRx ComponentStore — альтернатива для локального состояния

Если Store избыточен для конкретного компонента, используйте `ComponentStore`:

```typescript
import { ComponentStore } from '@ngrx/component-store'

interface TasksLocalState {
  tasks: Task[]
  loading: boolean
  filter: string | null
}

@Injectable()
export class TasksLocalStore extends ComponentStore<TasksLocalState> {
  constructor(private taskService: TaskService) {
    super({ tasks: [], loading: false, filter: null })
  }

  // Selector
  readonly filteredTasks$ = this.select(
    this.select(state => state.tasks),
    this.select(state => state.filter),
    (tasks, filter) => filter ? tasks.filter(t => t.difficulty === filter) : tasks
  )

  // Updater
  readonly setFilter = this.updater((state, filter: string | null) => ({
    ...state,
    filter,
  }))

  // Effect
  readonly loadTasks = this.effect(() =>
    this.taskService.getAll().pipe(
      tapResponse(
        (tasks) => this.patchState({ tasks, loading: false }),
        (error) => this.patchState({ error: error.message, loading: false }),
      )
    )
  )
}
```

ComponentStore ближе к Signals по простоте, но с RxJS-подходом.

## NgRx и Signals

Начиная с NgRx 17+ можно использовать Signals для чтения Store:

```typescript
import { toSignal } from '@angular/core/rxjs-interop'

export class TaskListComponent {
  private store = inject(Store)

  // Observable → Signal
  tasks = toSignal(this.store.select(selectFilteredTasks), { initialValue: [] })
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false })

  ngOnInit() {
    this.store.dispatch(TaskActions.loadTasks())
  }
}
```

```html
<!-- В шаблоне — без async pipe -->
@if (loading()) {
  <p>Загрузка...</p>
} @else {
  @for (task of tasks(); track task.id) {
    <p>{{ task.title }}</p>
  }
}
```

## Итог

| Концепция | Для чего |
|---|---|
| `Action` | Описание события |
| `Reducer` | Чистая функция обновления состояния |
| `Selector` | Извлечение и мемоизация данных из Store |
| `Effect` | Асинхронные операции (HTTP, навигация) |
| `Entity` | CRUD с коллекциями |
| `ComponentStore` | Локальное состояние компонента |

NgRx — мощный, но не бесплатный инструмент. Он добавляет бойлерплейт (actions, reducer, selectors, effects для каждой фичи). Для небольших проектов Signals + сервисы часто достаточно. Но для крупных SPA с десятками разработчиков NgRx окупается: предсказуемое состояние, трассировка через DevTools и единая архитектура.
