---
title: Тестирование Angular
description: "Тестирование Angular-приложений: TestBed для настройки окружения, тестирование компонентов и сервисов, моки HttpClient, spy-функции Jasmine и покрытие кода."
section: angular
difficulty: intermediate
readTime: 12
order: 11
tags: [Angular, testing, TestBed, Jasmine, Karma, Vitest, unit tests]
---

## Что тестируем в Angular

Angular-приложения обычно покрывают тремя уровнями тестов:

| Уровень | Что тестирует | Инструмент |
|---|---|---|
| Unit-тесты | Сервисы, pipes, чистые функции | TestBed + Jasmine/Karma или Vitest |
| Component-тесты | Компоненты + шаблон | TestBed + ComponentFixture |
| E2E-тесты | Потоки пользователя | Cypress или Playwright |

В этой статье — unit- и component-тесты.

## Настройка

Angular по умолчанию использует Karma + Jasmine. Начиная с Angular 17 можно переключиться на Vitest или Jest:

```bash
# С Vitest (рекомендуется для новых проектов)
ng test --config vitest

# Или добавьте vitest вручную
npm install -D vitest @angular/testing
```

Но мы рассмотрим стандартный подход — Jasmine-синтаксис, который работает и с Karma, и с Vitest, и с Jest.

## TestBed — основа тестов Angular

TestBed создаёт тестовое окружение для Angular-компонентов. Без него нельзя рендерить компоненты, инжектить сервисы или работать с DI.

```typescript
import { TestBed } from '@angular/core/testing'
import { ComponentFixture } from '@angular/core/testing'

describe('UserCardComponent', () => {
  let component: UserCardComponent
  let fixture: ComponentFixture<UserCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent],  // Standalone-компонент — просто импорт
    }).compileComponents()

    fixture = TestBed.createComponent(UserCardComponent)
    component = fixture.componentInstance
  })

  it('создаётся', () => {
    expect(component).toBeTruthy()
  })
})
```

### ComponentFixture

`ComponentFixture` — обёртка вокруг компонента для тестирования:

```typescript
fixture.componentInstance   // Экземпляр компонента
fixture.nativeElement       // DOM-элемент
fixture.debugElement        // DebugElement — для запросов по директивам
fixture.detectChanges()     // Запустить change detection
```

## Тестирование компонентов

### Простой компонент

```typescript
// counter.component.ts
@Component({
  standalone: true,
  template: `
    <span data-testid="count">{{ count() }}</span>
    <button data-testid="increment" (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  count = signal(0)

  increment() {
    this.count.update(n => n + 1)
  }
}
```

```typescript
// counter.component.spec.ts
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CounterComponent]
    })
    fixture = TestBed.createComponent(CounterComponent)
    fixture.detectChanges()
  })

  it('показывает начальное значение 0', () => {
    const count = fixture.nativeElement.querySelector('[data-testid="count"]')
    expect(count.textContent).toBe('0')
  })

  it('увеличивает счётчик при клике', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="increment"]')
    button.click()
    fixture.detectChanges()

    const count = fixture.nativeElement.querySelector('[data-testid="count"]')
    expect(count.textContent).toBe('1')
  })

  it('увеличивает сигнал', () => {
    fixture.componentInstance.increment()
    expect(fixture.componentInstance.count()).toBe(1)
  })
})
```

### Компонент с Input/Output

```typescript
// task-card.component.ts
@Component({
  standalone: true,
  imports: [MatButton],
  template: `
    <div class="card">
      <h3>{{ title() }}</h3>
      <span>{{ difficulty() }}</span>
      <button (click)="onClick()">Открыть</button>
    </div>
  `
})
export class TaskCardComponent {
  title = input.required<string>()
  difficulty = input<'easy' | 'medium' | 'hard'>('easy')
  selected = output<string>()
}
```

```typescript
// task-card.component.spec.ts
describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskCardComponent]
    })
    fixture = TestBed.createComponent(TaskCardComponent)
  })

  it('отображает title и difficulty', () => {
    fixture.componentRef.setInput('title', 'Изучить Signals')
    fixture.componentRef.setInput('difficulty', 'medium')
    fixture.detectChanges()

    const h3 = fixture.nativeElement.querySelector('h3')
    expect(h3.textContent).toBe('Изучить Signals')

    const badge = fixture.nativeElement.querySelector('span')
    expect(badge.textContent).toBe('medium')
  })

  it('эмитит selected при клике', () => {
    fixture.componentRef.setInput('title', 'Тестовая задача')
    fixture.detectChanges()

    spyOn(fixture.componentInstance.selected, 'emit')

    const button = fixture.nativeElement.querySelector('button')
    button.click()

    expect(fixture.componentInstance.selected.emit).toHaveBeenCalled()
  })
})
```

## Тестирование сервисов

### Простой сервис

```typescript
// math.service.ts
@Injectable({ providedIn: 'root' })
export class MathService {
  add(a: number, b: number): number {
    return a + b
  }

  factorial(n: number): number {
    if (n < 0) throw new Error('Negative number')
    if (n <= 1) return 1
    return n * this.factorial(n - 1)
  }
}
```

```typescript
// math.service.spec.ts
describe('MathService', () => {
  let service: MathService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(MathService)
  })

  it('складывает числа', () => {
    expect(service.add(2, 3)).toBe(5)
  })

  it('вычисляет факториал', () => {
    expect(service.factorial(5)).toBe(120)
    expect(service.factorial(0)).toBe(1)
  })

  it('бросает ошибку для отрицательного числа', () => {
    expect(() => service.factorial(-1)).toThrowError('Negative number')
  })
})
```

### Сервис с HttpClient — моки

```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users')
  }

  create(data: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>('/api/users', data)
  }
}
```

```typescript
// user.service.spec.ts
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'

describe('UserService', () => {
  let service: UserService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    service = TestBed.inject(UserService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()  // Убедиться, что нет незавершённых запросов
  })

  it('getAll — GET /api/users', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Иван', email: 'ivan@test.ru' },
      { id: 2, name: 'Анна', email: 'anna@test.ru' },
    ]

    service.getAll().subscribe(users => {
      expect(users).toEqual(mockUsers)
    })

    const req = httpMock.expectOne('/api/users')
    expect(req.request.method).toBe('GET')
    req.flush(mockUsers)  // Отправить фиктивный ответ
  })

  it('create — POST /api/users', () => {
    const newUser = { name: 'Олег', email: 'oleg@test.ru' }
    const created = { id: 3, ...newUser }

    service.create(newUser).subscribe(user => {
      expect(user).toEqual(created)
    })

    const req = httpMock.expectOne('/api/users')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(newUser)
    req.flush(created)
  })
})
```

## Jasmine spy — шпионы

Spy перехватывают вызовы функций — для проверки, был ли вызов, и с какими аргументами:

```typescript
// spyOn — шпион на метод объекта
const userService = TestBed.inject(UserService)
spyOn(userService, 'getAll').and.returnValue(of(mockUsers))

// Проверка
expect(userService.getAll).toHaveBeenCalled()
expect(userService.getAll).toHaveBeenCalledTimes(1)
```

### Создание шпионского объекта

```typescript
// jasmine.createSpyObj — объект с шпионскими методами
const mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'isLoggedIn'])
mockAuthService.isLoggedIn.and.returnValue(true)
mockAuthService.login.and.returnValue(of({ token: 'abc' }))

// Подстановка в TestBed
TestBed.configureTestingModule({
  providers: [
    { provide: AuthService, useValue: mockAuthService }
  ]
})
```

### Пример: компонент, вызывающий сервис

```typescript
@Component({
  standalone: true,
  template: `
    <button (click)="loadUsers()">Загрузить</button>
    <ul>
      @for (user of users(); track user.id) {
        <li>{{ user.name }}</li>
      }
    </ul>
  `
})
export class UserListComponent {
  private userService = inject(UserService)
  users = signal<User[]>([])

  loadUsers() {
    this.userService.getAll().subscribe(users => this.users.set(users))
  }
}
```

```typescript
describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>
  let mockUserService: jasmine.SpyObj<UserService>

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getAll'])

    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    })

    fixture = TestBed.createComponent(UserListComponent)
  })

  it('загружает пользователей при нажатии кнопки', () => {
    const mockUsers = [
      { id: 1, name: 'Иван', email: 'ivan@test.ru' }
    ]
    mockUserService.getAll.and.returnValue(of(mockUsers))

    fixture.detectChanges()

    const button = fixture.nativeElement.querySelector('button')
    button.click()
    fixture.detectChanges()

    const items = fixture.nativeElement.querySelectorAll('li')
    expect(items.length).toBe(1)
    expect(items[0].textContent).toBe('Иван')
    expect(mockUserService.getAll).toHaveBeenCalled()
  })
})
```

## Тестирование Pipes

```typescript
// truncate.pipe.ts
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    if (value.length <= limit) return value
    return value.slice(0, limit) + '...'
  }
}
```

```typescript
describe('TruncatePipe', () => {
  let pipe = new TruncatePipe()

  it('не обрезает короткую строку', () => {
    expect(pipe.transform('Привет')).toBe('Привет')
  })

  it('обрезает длинную строку', () => {
    const long = 'а'.repeat(100)
    expect(pipe.transform(long, 10)).toBe('а'.repeat(10) + '...')
  })

  it('использует лимит по умолчанию 50', () => {
    const text = 'б'.repeat(60)
    expect(pipe.transform(text).length).toBe(53)  // 50 + '...'
  })
})
```

Pipes не требуют TestBed — просто создайте экземпляр и вызовите `transform`.

## Тестирование Guards

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (auth.isLoggedIn()) return true
  router.navigate(['/login'])
  return false
}
```

```typescript
describe('authGuard', () => {
  let mockAuth: jasmine.SpyObj<AuthService>
  let mockRouter: jasmine.SpyObj<Router>

  beforeEach(() => {
    mockAuth = jasmine.createSpyObj('AuthService', ['isLoggedIn'])
    mockRouter = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ]
    })
  })

  it('разрешает доступ, если пользователь авторизован', () => {
    mockAuth.isLoggedIn.and.returnValue(true)

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any))
    expect(result).toBe(true)
  })

  it('перенаправляет на логин, если не авторизован', () => {
    mockAuth.isLoggedIn.and.returnValue(false)

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any))
    expect(result).toBe(false)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'])
  })
})
```

`TestBed.runInInjectionContext` нужен, потому что guard использует `inject()`.

## Покрытие кода

```bash
# Запуск тестов с отчётом покрытия
ng test --code-coverage

# Результат в coverage/ директории
# Откройте coverage/index.html в браузере
```

Настройка порогов в `angular.json`:

```json
{
  "test": {
    "options": {
      "codeCoverage": true,
      "codeCoverageExclude": ["src/app/**/index.ts"],
      "coverageReporters": ["html", "lcov", "text-summary"]
    }
  }
}
```

## Полезные утилиты для тестов

### Автоматический detectChanges

```typescript
import { ComponentFixtureAutoDetect } from '@angular/core/testing'

TestBed.configureTestingModule({
  imports: [MyComponent],
  providers: [
    { provide: ComponentFixtureAutoDetect, useValue: true }
  ]
})
```

### FakeAsync и tick — для тестирования асинхронного кода

```typescript
import { fakeAsync, tick } from '@angular/core/testing'

it('обновляет данные через задержку', fakeAsync(() => {
  component.loadData()

  tick(3000)  // Промотать 3 секунды

  expect(component.data()).toEqual(mockData)
}))
```

### waitForAsync — для тестов с обещаниями

```typescript
import { waitForAsync } from '@angular/core/testing'

it('загружает данные', waitForAsync(() => {
  component.loadUsers()

  fixture.whenStable().then(() => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(3)
  })
}))
```

## Итог

| Инструмент | Для чего |
|---|---|
| `TestBed.configureTestingModule` | Настройка тестового модуля |
| `TestBed.createComponent` | Создание компонента для теста |
| `TestBed.inject` | Получение сервиса из DI |
| `HttpTestingController` | Мокирование HTTP-запросов |
| `jasmine.createSpyObj` | Создание мок-объекта |
| `spyOn` | Слежение за вызовами метода |
| `fakeAsync` + `tick` | Тестирование таймеров |
| `fixture.detectChanges()` | Запуск change detection |
| `--code-coverage` | Отчёт о покрытии |

Хорошие тесты — это инвестиция. Покрывайте сервисы и guards на 100%, компоненты — хотя бы на 80% (ключевые сценарии). Pipes с простой логикой можно не тестировать, но для сложных — стоит.
