---
title: Формы в Angular
description: Два подхода к формам в Angular — Template-driven для простых случаев и Reactive Forms для сложных. Валидация, FormBuilder, динамические поля, кастомные валидаторы.
section: angular
difficulty: intermediate
readTime: 13
order: 6
tags: [Angular, forms, reactive, template-driven, validation, FormBuilder]
---

## Два подхода к формам

Angular предлагает два способа работы с формами:

| | Template-driven | Reactive Forms |
|---|---|---|
| Где логика | В шаблоне (HTML) | В классе (TypeScript) |
| Подход | Декларативный | Императивный |
| Когда использовать | Простые формы | Сложные формы, динамические поля |
| Валидация | Директивы в шаблоне | Функции в классе |
| Тестирование | Сложнее | Проще |

Для серьёзных проектов почти всегда выбирают Reactive Forms — они дают полный контроль.

## Template-driven формы

Template-driven формы опираются на директивы `ngModel` и `FormsModule`. Логика описывается прямо в шаблоне:

```typescript
// signup.component.ts
import { Component } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form #signupForm="ngForm" (ngSubmit)="onSubmit(signupForm)">

      <label>
        Имя:
        <input
          name="name"
          ngModel
          required
          minlength="2"
          #nameInput="ngModel"
        >
      </label>
      @if (nameInput.invalid && nameInput.touched) {
        <p class="error">Имя обязательно (минимум 2 символа)</p>
      }

      <label>
        Email:
        <input
          name="email"
          ngModel
          required
          email
          #emailInput="ngModel"
        >
      </label>
      @if (emailInput.errors?.['email']) {
        <p class="error">Введите корректный email</p>
      }

      <button type="submit" [disabled]="signupForm.invalid">
        Зарегистрироваться
      </button>

    </form>
  `
})
export class SignupComponent {
  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(form.value) // { name: '...', email: '...' }
      form.resetForm()
    }
  }
}
```

### Как это работает

1. `#signupForm="ngForm"` — получаем ссылку на объект формы
2. `ngModel` на каждом инпуте привязывает его к форме
3. `name="..."` обязателен — Angular использует его как ключ в `form.value`
4. `required`, `email`, `minlength` — встроенные директивы-валидаторы
5. `#nameInput="ngModel"` — ссылка на конкретный контрол для проверки состояния

Template-driven формы просты для маленьких форм, но быстро становятся неуправляемыми, когда нужна сложная логика валидации или динамические поля.

## Reactive Forms

Reactive Forms создаются программно в TypeScript. Каждый элемент формы — объект `FormControl`, `FormGroup` или `FormArray`.

### FormControl — один элемент

```typescript
import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <input [formControl]="search">
    <p>Значение: {{ search.value }}</p>
    <p>Статус: {{ search.status }}</p>
  `
})
export class SearchComponent {
  search = new FormControl('')

  constructor() {
    this.search.valueChanges.subscribe(value => {
      console.log('Поиск:', value)
    })
  }
}
```

### FormGroup — группа контролов

```typescript
import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms'

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="onSave()">

      <label>Имя:
        <input formControlName="name">
      </label>
      @if (name?.invalid && name?.touched) {
        <p class="error">Имя обязательно</p>
      }

      <label>Email:
        <input formControlName="email">
      </label>
      @if (email?.errors?.['email']) {
        <p class="error">Некорректный email</p>
      }

      <label>Возраст:
        <input formControlName="age" type="number">
      </label>

      <button type="submit" [disabled]="profileForm.invalid">
        Сохранить
      </button>

    </form>
  `
})
export class ProfileComponent implements OnInit {
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    age: new FormControl<number | null>(null, [Validators.min(0), Validators.max(120)]),
  })

  get name() { return this.profileForm.get('name') }
  get email() { return this.profileForm.get('email') }

  ngOnInit() {
    // Подписка на все изменения формы
    this.profileForm.valueChanges.subscribe(value => {
      console.log(value)
    })

    // Подписка на статус
    this.profileForm.statusChanges.subscribe(status => {
      console.log('Статус формы:', status)
    })
  }

  onSave() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value)
      // { name: 'Иван', email: 'ivan@mail.ru', age: 25 }
    }

    // Пометить все поля как touched, чтобы показать ошибки
    this.profileForm.markAllAsTouched()
  }
}
```

### FormBuilder — менее многословный способ

`FormBuilder` — сервис, который сокращает бойлерплейт:

```typescript
import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `...`
})
export class RegisterComponent {
  private fb = inject(FormBuilder)

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: this.passwordMatchValidator
  })

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value
    const confirm = group.get('confirmPassword')?.value
    return password === confirm ? null : { mismatch: true }
  }

  onSubmit() {
    if (this.form.valid) {
      const { username, email, password } = this.form.value
      console.log('Регистрация:', username, email)
    }
  }
}
```

Разница: `new FormGroup({...})` требует `new FormControl(...)` для каждого поля, а `fb.group({...})` принимает массив `[initialValue, validators]`. Это чище и короче.

## Встроенные валидаторы

```typescript
import { Validators } from '@angular/forms'

const control = new FormControl('', [
  Validators.required,           // Обязательное поле
  Validators.minLength(3),       // Минимум 3 символа
  Validators.maxLength(100),     // Максимум 100 символов
  Validators.email,              // Проверка email
  Validators.pattern('^[a-z]+$') // Регулярное выражение
])

// Числовые
const age = new FormControl(null, [
  Validators.required,
  Validators.min(1),
  Validators.max(120)
])
```

### Проверка ошибок в шаблоне

```html
<input formControlName="username">
@if (form.get('username')?.errors?.['required']) {
  <p>Поле обязательно</p>
}
@if (form.get('username')?.errors?.['minlength']) {
  <p>Минимум {{ form.get('username')?.errors?.['minlength']?.requiredLength }} символов</p>
}
```

## Кастомные валидаторы

### Синхронный валидатор

```typescript
// validators/forbidden-name.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms'

export function forbiddenNameValidator(name: string): ValidationErrors | null {
  return (control: AbstractControl) => {
    const forbidden = control.value?.toLowerCase().includes(name.toLowerCase())
    return forbidden ? { forbiddenName: { value: control.value } } : null
  }
}

// Использование
this.fb.group({
  username: ['', [Validators.required, forbiddenNameValidator('admin')]]
})
```

### Асинхронный валидатор

```typescript
// validators/unique-email.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms'
import { Observable, of, timer } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { inject } from '@angular/core'
import { UserService } from '../services/user.service'

export function uniqueEmailValidator(): (control: AbstractControl) => Observable<ValidationErrors | null> {
  return (control: AbstractControl) => {
    if (!control.value) return of(null)

    const userService = inject(UserService)

    return timer(500).pipe(
      switchMap(() => userService.checkEmail(control.value)),
      map(isTaken => isTaken ? { emailTaken: true } : null)
    )
  }
}

// Использование
this.fb.group({
  email: ['', [Validators.required, Validators.email], [uniqueEmailValidator()]]
})
```

Асинхронные валидаторы передаются третьим аргументом в `FormControl` или `fb.control()`.

## FormArray — динамические поля

`FormArray` нужен, когда количество полей заранее неизвестно — например, список тегов или несколько адресов:

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <label>Название задачи:
        <input formControlName="title">
      </label>

      <div>Теги:</div>
      <div formArrayName="tags">
        @for (tag of tags.controls; track $index) {
          <div>
            <input [formControlName]="$index" placeholder="Тег">
            <button type="button" (click)="removeTag($index)">Удалить</button>
          </div>
        }
      </div>
      <button type="button" (click)="addTag()">Добавить тег</button>

      <button type="submit">Сохранить</button>
    </form>
  `
})
export class TaskFormComponent {
  private fb = inject(FormBuilder)

  form = this.fb.group({
    title: ['', Validators.required],
    tags: this.fb.array([
      this.fb.control('Angular'),
      this.fb.control('TypeScript'),
    ]),
  })

  get tags() {
    return this.form.get('tags') as FormArray
  }

  addTag() {
    this.tags.push(this.fb.control(''))
  }

  removeTag(index: number) {
    this.tags.removeAt(index)
  }

  onSubmit() {
    console.log(this.form.value)
    // { title: '...', tags: ['Angular', 'TypeScript', ''] }
  }
}
```

### Вложенные FormGroup внутри FormArray

```typescript
// Форма с несколькими адресами — каждый адрес это отдельная группа
form = this.fb.group({
  name: ['', Validators.required],
  addresses: this.fb.array([
    this.fb.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      zip: ['', Validators.pattern('^[0-9]{6}$')],
    })
  ])
})

get addresses() {
  return this.form.get('addresses') as FormArray
}

addAddress() {
  this.addresses.push(this.fb.group({
    city: '',
    street: '',
    zip: '',
  }))
}
```

## Состояния контролов

Каждый FormControl имеет набор состояний:

| Свойство | Когда true |
|---|---|
| `pristine` | Пользователь не менял значение |
| `dirty` | Пользователь менял значение |
| `untouched` | Пользователь не был в поле (no blur) |
| `touched` | Пользователь побывал в поле |
| `valid` | Валидация пройдена |
| `invalid` | Есть ошибки валидации |

Типичный паттерн: показывать ошибки только если поле `dirty` и `invalid`:

```html
@if (form.get('email')?.invalid && form.get('email')?.dirty) {
  <p class="error">Некорректный email</p>
}
```

Или пометить всё как touched перед проверкой:

```typescript
onSubmit() {
  if (this.form.invalid) {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched()
    })
    return
  }
  // Отправка данных
}
```

## setValue и patchValue

```typescript
// setValue — заполняет ВСЕ поля (строго)
this.form.setValue({
  title: 'Изучить Angular',
  tags: ['Angular', 'TypeScript'],
})

// patchValue — заполняет только указанные поля
this.form.patchValue({
  title: 'Изучить Angular',
  // tags не указан — останется как есть
})

// reset — сбросить всё
this.form.reset()
this.form.reset({ title: 'Новая задача' })
```

## Практический пример — полная форма регистрации

```typescript
import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

      <label>Логин:
        <input formControlName="username" placeholder="username">
      </label>
      @if (f['username'].errors?.['required'] && f['username'].touched) {
        <small class="error">Введите логин</small>
      }

      <label>Email:
        <input formControlName="email" type="email" placeholder="email@example.com">
      </label>
      @if (f['email'].errors?.['email'] && f['email'].touched) {
        <small class="error">Некорректный email</small>
      }

      <label>Пароль:
        <input formControlName="password" type="password" placeholder="Минимум 8 символов">
      </label>
      @if (f['password'].errors?.['minlength'] && f['password'].touched) {
        <small class="error">Минимум 8 символов</small>
      }

      <label>
        <input type="checkbox" formControlName="agreeTerms">
        Принимаю условия использования
      </label>
      @if (f['agreeTerms'].errors?.['required'] && f['agreeTerms'].touched) {
        <small class="error">Необходимо принять условия</small>
      }

      <button type="submit" [disabled]="form.invalid || isLoading">
        @if (isLoading) { Регистрация... } @else { Зарегистрироваться }
      </button>

    </form>
  `
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder)
  private auth = inject(AuthService)
  private router = inject(Router)

  isLoading = false

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    agreeTerms: [false, [Validators.requiredTrue]],
  })

  get f() { return this.form.controls }

  async onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched())
      return
    }

    this.isLoading = true
    try {
      await this.auth.register(this.form.value)
      this.router.navigate(['/dashboard'])
    } catch (err) {
      console.error('Ошибка регистрации', err)
    } finally {
      this.isLoading = false
    }
  }
}
```

## Итог

- **Template-driven** — для простых форм, логика в HTML, `ngModel` + `FormsModule`
- **Reactive Forms** — для сложных форм, полный контроль в TypeScript, `FormControl` + `FormGroup` + `ReactiveFormsModule`
- **FormBuilder** — сокращает бойлерплейт при создании Reactive Forms
- **FormArray** — для динамического числа полей
- **Кастомные валидаторы** — синхронные (второй аргумент) и асинхронные (третий аргумент)
- **Состояния** (`touched`, `dirty`, `valid`) — показывайте ошибки осмысленно, не при первой загрузке

Reactive Forms — стандарт де-факто для продакшен-приложений. Они делают формы тестируемыми, предсказуемыми и легко масштабируются.
