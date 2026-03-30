---
title: Angular Material: компоненты UI
description: Angular Material — официальная библиотека UI-компонентов для Angular. Установка, темизация, таблицы, диалоги, snack bar, autocomplete и другие компоненты.
section: angular
difficulty: intermediate
readTime: 11
order: 10
tags: [Angular, Material, UI, components, theming, dialog, table]
---

## Что такое Angular Material

Angular Material — официальная библиотека UI-компонентов от команды Angular. Реализация Material Design от Google: кнопки, формы, таблицы, диалоги, меню и ещё несколько десятков компонентов. Работает только с Angular (не путать с MUI для React).

## Установка

```bash
ng add @angular/material
```

CLI задаст несколько вопросов:
- Выберите тему (рекомендуется `custom` для кастомизации)
- Настройки типографики (yes)
- Анимации (include и enable)

Команда автоматически:
- Добавит пакеты в `package.json`
- Подключит стили в `angular.json`
- Добавит `provideAnimationsAsync()` в `app.config.ts`

## Подключение стилей

После установки в `angular.json` появятся стили:

```json
{
  "styles": [
    "@angular/material/prebuilt-themes/indigo-pink.css",
    "src/styles.scss"
  ]
}
```

Для кастомной темы вместо prebuilt подключите свой файл:

```scss
// styles.scss — кастомная тема
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$violet-palette,
      tertiary: mat.$cyan-palette,
    ),
      typography: mat.typography-config(),
      density: 0,
  ));
}
```

## Standalone-компоненты

С Angular Material v15 все компоненты — standalone. Импортируйте конкретный компонент, а не целый модуль:

```typescript
import { MatButton } from '@angular/material/button'
import { MatCard } from '@angular/material/card'
import { MatFormField, MatLabel } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'

@Component({
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  template: `...`
})
export class SomeComponent {}
```

## Кнопки

```html
<!-- Basic button -->
<button mat-button>Обычная</button>
<button mat-raised-button>Приподнятая</button>
<button mat-flat-button>Плоская</button>
<button mat-stroked-button>С обводкой</button>

<!-- С иконкой -->
<button mat-icon-button>
  <mat-icon>favorite</mat-icon>
</button>

<!-- FAB (Floating Action Button) -->
<button mat-fab>
  <mat-icon>add</mat-icon>
</button>

<!-- Цвета: primary, accent, warn -->
<button mat-raised-button color="primary">Сохранить</button>
<button mat-raised-button color="warn">Удалить</button>

<!-- Отключённая -->
<button mat-raised-button disabled>Неактивна</button>
```

## Формы

### Текстовое поле

```typescript
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'
import { MatIcon } from '@angular/material/icon'

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatSuffix],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" type="email" placeholder="user@example.com">
      <mat-icon matSuffix>email</mat-icon>
      @if (email?.errors?.['required'] && email?.touched) {
        <mat-error>Email обязателен</mat-error>
      }
      @if (email?.errors?.['email']) {
        <mat-error>Некорректный email</mat-error>
      }
    </mat-form-field>
  `
})
```

`appearance` бывает: `fill` (по умолчанию), `outline`.

### Select

```typescript
import { MatSelect } from '@angular/material/select'
import { MatOption } from '@angular/material/core'

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption],
  template: `
    <mat-form-field>
      <mat-label>Сложность</mat-label>
      <mat-select formControlName="difficulty">
        <mat-option value="easy">Простая</mat-option>
        <mat-option value="medium">Средняя</mat-option>
        <mat-option value="hard">Сложная</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
```

### Checkbox, Slide toggle, Radio

```html
<!-- Checkbox -->
<mat-checkbox formControlName="agreeTerms">Принимаю условия</mat-checkbox>

<!-- Slide toggle -->
<mat-slide-toggle formControlName="notifications">Уведомления</mat-slide-toggle>

<!-- Radio -->
<mat-radio-group formControlName="role">
  <mat-radio-button value="user">Пользователь</mat-radio-button>
  <mat-radio-button value="admin">Администратор</mat-radio-button>
</mat-radio-group>
```

### Datepicker

```typescript
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'

@Component({
  imports: [MatDatepickerModule, MatNativeDateModule, MatFormField, MatLabel, MatInput],
  template: `
    <mat-form-field>
      <mat-label>Дата рождения</mat-label>
      <input matInput [matDatepicker]="picker" formControlName="birthdate">
      <mat-hint>ДД.ММ.ГГГГ</mat-hint>
      <mat-datepicker-toggle matSuffix [for]="picker" />
      <mat-datepicker #picker />
    </mat-form-field>
  `
})
```

### Autocomplete

```typescript
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatInput, MatAutocomplete],
  template: `
    <mat-form-field>
      <input
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        placeholder="Поиск задачи..."
      >
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event)">
        @for (task of filteredTasks(); track task.id) {
          <mat-option [value]="task.title">{{ task.title }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `
})
export class TaskSearchComponent {
  searchControl = new FormControl('')
  tasks = signal<Task[]>([])

  filteredTasks = computed(() => {
    const query = this.searchControl.value?.toLowerCase() ?? ''
    if (!query) return this.tasks()
    return this.tasks().filter(t => t.title.toLowerCase().includes(query))
  })

  onSelect(event: MatAutocompleteSelectedEvent) {
    console.log('Выбрано:', event.option.value)
  }
}
```

## Навигация

### Toolbar

```html
<mat-toolbar color="primary">
  <button mat-icon-button>
    <mat-icon>menu</mat-icon>
  </button>
  <span>FrontSkill</span>
  <span class="spacer"></span>
  <button mat-button>Задачи</button>
  <button mat-button>Профиль</button>
</mat-toolbar>
```

### Sidenav (боковое меню)

```typescript
import { MatSidenavModule } from '@angular/material/sidenav'

@Component({
  imports: [MatSidenavModule],
  template: `
    <mat-sidenav-container>
      <mat-sidenav #sidenav mode="over">
        <nav>
          <a routerLink="/dashboard">Дашборд</a>
          <a routerLink="/tasks">Задачи</a>
          <a routerLink="/settings">Настройки</a>
        </nav>
      </mat-sidenav>
      <mat-sidenav-content>
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
```

## Таблица (Table)

```typescript
import { MatTable, MatHeaderCell, MatCell, MatHeaderRow, MatRow } from '@angular/material/table'
import { MatSort, MatSortHeader } from '@angular/material/sort'
import { MatPaginator } from '@angular/material/paginator'

interface TaskRow {
  id: number
  title: string
  difficulty: string
  status: string
  createdAt: Date
}

@Component({
  imports: [MatTable, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatSort, MatSortHeader, MatPaginator],
  template: `
    <table mat-table [dataSource]="dataSource" matSort>

      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Название </th>
        <td mat-cell *matCellDef="let task"> {{ task.title }} </td>
      </ng-container>

      <ng-container matColumnDef="difficulty">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Сложность </th>
        <td mat-cell *matCellDef="let task">
          <span class="badge badge-{{ task.difficulty }}">{{ task.difficulty }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef> Статус </th>
        <td mat-cell *matCellDef="let task"> {{ task.status }} </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef> </th>
        <td mat-cell *matCellDef="let task">
          <button mat-icon-button (click)="edit(task.id)">
            <mat-icon>edit</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>

    </table>

    <mat-paginator
      [pageSize]="10"
      [pageSizeOptions]="[5, 10, 25]"
      showFirstLastButtons
    />
  `
})
export class TaskTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  columns = ['title', 'difficulty', 'status', 'actions']
  dataSource = new MatTableDataSource<TaskRow>()

  ngOnInit() {
    this.taskService.getAll().subscribe(tasks => {
      this.dataSource.data = tasks
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
}
```

## Диалоги (Dialog)

```typescript
// dialogs/confirm-dialog.component.ts
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog'
import { MatDialogData } from '@angular/material/dialog'

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButton],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        Удалить
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA)
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>)
}
```

```typescript
// Использование
import { MatDialog } from '@angular/material/dialog'

export class TaskListComponent {
  private dialog = inject(MatDialog)

  deleteTask(id: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Удалить задачу?',
        message: 'Это действие нельзя отменить.'
      }
    })

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.taskService.remove(id).subscribe()
      }
    })
  }
}
```

## Snack Bar (уведомления)

```typescript
import { MatSnackBar } from '@angular/material/snack-bar'

export class TaskComponent {
  private snackbar = inject(MatSnackBar)

  onSave() {
    this.taskService.create(this.form.value).subscribe({
      next: () => {
        this.snackbar.open('Задача создана', 'Отменить', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        })
      },
      error: () => {
        this.snackbar.open('Ошибка при создании', 'Закрыть', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        })
      }
    })
  }
}
```

## Прогресс-бар и спиннер

```html
<!-- Прогресс-бар -->
<mat-progress-bar mode="indeterminate" />
<mat-progress-bar mode="determinate" [value]="75" />

<!-- Спиннер -->
<mat-spinner />
<mat-spinner diameter="24" />

<!-- С текстом -->
@if (loading()) {
  <div class="overlay">
    <mat-spinner />
    <p>Загрузка...</p>
  </div>
}
```

## Tooltip и Chip

```html
<!-- Tooltip -->
<button mat-button [matTooltip]=" 'Нажмите для редактирования' " matTooltipPosition="above">
  Редактировать
</button>

<!-- Chips -->
<mat-chip-set>
  <mat-chip>Angular</mat-chip>
  <mat-chip>TypeScript</mat-chip>
  <mat-chip highlighted color="primary">Signals</mat-chip>
</mat-chip-set>

<!-- Chips для ввода тегов -->
<mat-form-field>
  <mat-label>Теги</mat-label>
  <mat-chip-grid #chipGrid>
    @for (tag of tags(); track tag) {
      <mat-chip-row (removed)="removeTag(tag)">
        {{ tag }}
        <mat-icon matChipRemove>cancel</mat-icon>
      </mat-chip-row>
    }
  </mat-chip-grid>
  <input [matChipInputFor]="chipGrid" (matChipInputTokenEnd)="addTag($event)" />
</mat-form-field>
```

## Итог

| Компонент | Для чего |
|---|---|
| `MatButton` | Кнопки разных стилей |
| `MatFormField` + `MatInput` | Текстовые поля с плавающим лейблом |
| `MatSelect` | Выпадающий список |
| `MatDatepicker` | Выбор даты |
| `MatAutocomplete` | Автодополнение |
| `MatTable` + `MatSort` + `MatPaginator` | Таблица с сортировкой и пагинацией |
| `MatDialog` | Модальные окна |
| `MatSnackBar` | Всплывающие уведомления |
| `MatToolbar` / `MatSidenav` | Навигация |
| `MatProgressBar` / `MatSpinner` | Индикаторы загрузки |
| `MatChips` | Теги |

Angular Material — не самая красивая библиотека из коробки, но зато стабильная, хорошо документированная и полностью совместимая с Angular. Для быстрого старта и внутренних приложений — отличный выбор. Для кастомного дизайна лучше посмотреть в сторону PrimeNG или Taiga UI.
