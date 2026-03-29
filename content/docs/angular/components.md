---
title: Компоненты Angular
description: Компоненты — строительные блоки Angular-приложений. Каждый компонент управляет частью экрана и состоит из шаблона, стилей и класса TypeScript.
section: angular
difficulty: beginner
readTime: 9
order: 1
tags: [Angular, components, decorators, TypeScript]
---

## Анатомия компонента

Angular-компонент состоит из трёх частей:

```typescript
// user-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-user-card',     // HTML-тег для использования компонента
  standalone: true,              // Standalone компонент (Angular 15+)
  imports: [CommonModule],       // Импортируемые зависимости
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() name = ''
  @Input() age = 0
  @Output() clicked = new EventEmitter<string>()

  onClick() {
    this.clicked.emit(this.name)
  }
}
```

```html
<!-- user-card.component.html -->
<div class="card" (click)="onClick()">
  <h3>{{ name }}</h3>
  <p>{{ age }} лет</p>
</div>
```

## Шаблонный синтаксис

### Интерполяция и привязка

```html
<!-- Вывод данных -->
<h1>{{ title }}</h1>
<p>{{ user.name | uppercase }}</p>

<!-- Привязка свойств [property] -->
<img [src]="user.avatar" [alt]="user.name">
<button [disabled]="isLoading">Загрузить</button>

<!-- Привязка событий (event) -->
<button (click)="handleClick()">Нажми</button>
<input (input)="onInput($event)">

<!-- Двусторонняя привязка [(ngModel)] -->
<input [(ngModel)]="searchQuery" placeholder="Поиск">
```

### Директивы управления потоком (Angular 17+)

```html
<!-- @if -->
@if (user) {
  <div>{{ user.name }}</div>
} @else if (loading) {
  <div>Загрузка...</div>
} @else {
  <div>Пользователь не найден</div>
}

<!-- @for -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>Список пуст</li>
}

<!-- @switch -->
@switch (status) {
  @case ('active') { <span class="green">Активен</span> }
  @case ('inactive') { <span class="red">Неактивен</span> }
  @default { <span>Неизвестно</span> }
}
```

### Старый синтаксис директив (ngIf, ngFor)

```html
<!-- *ngIf -->
<div *ngIf="isVisible; else hidden">Видимый блок</div>
<ng-template #hidden>Скрытый блок</ng-template>

<!-- *ngFor -->
<li *ngFor="let item of items; let i = index; trackBy: trackById">
  {{ i + 1 }}. {{ item.name }}
</li>
```

## Input и Output

```typescript
// Дочерний компонент
@Component({ selector: 'app-counter', standalone: true, ... })
export class CounterComponent {
  @Input({ required: true }) initialValue!: number  // Angular 16+
  @Output() valueChange = new EventEmitter<number>()

  count = 0

  ngOnInit() {
    this.count = this.initialValue
  }

  increment() {
    this.count++
    this.valueChange.emit(this.count)
  }
}
```

```html
<!-- Родитель -->
<app-counter
  [initialValue]="5"
  (valueChange)="onCountChange($event)"
/>
```

## Lifecycle Hooks

```typescript
import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core'

@Component({ ... })
export class MyComponent implements OnInit, OnDestroy, OnChanges {

  ngOnChanges(changes: SimpleChanges) {
    // При изменении Input-свойств
    if (changes['userId']) {
      this.loadUser(changes['userId'].currentValue)
    }
  }

  ngOnInit() {
    // Компонент инициализирован, Input-свойства доступны
    this.loadData()
  }

  ngOnDestroy() {
    // Очистка — отписки от Observable
    this.subscription?.unsubscribe()
  }
}
```

## ViewChild и ContentChild

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core'

@Component({
  template: `<input #nameInput placeholder="Имя">`,
})
export class FormComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>

  ngAfterViewInit() {
    this.nameInput.nativeElement.focus()
  }
}
```

## Pipes (Каналы)

```html
<!-- Встроенные pipes -->
{{ name | uppercase }}
{{ price | currency:'RUB':'symbol':'1.0-0' }}
{{ date | date:'dd.MM.yyyy' }}
{{ data | json }}
{{ text | slice:0:100 }}
{{ items | async }}  <!-- Для Observable/Promise -->
```

```typescript
// Кастомный pipe
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'pluralize', standalone: true })
export class PluralizePipe implements PipeTransform {
  transform(value: number, words: [string, string, string]): string {
    const cases = [2, 0, 1, 1, 1, 2]
    return `${value} ${words[
      value % 100 > 4 && value % 100 < 20
        ? 2
        : cases[Math.min(value % 10, 5)]
    ]}`
  }
}

// {{ count | pluralize:['задача','задачи','задач'] }}
```
