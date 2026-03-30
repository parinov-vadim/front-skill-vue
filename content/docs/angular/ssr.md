---
title: Angular SSR: Server-Side Rendering
description: Server-Side Rendering в Angular — рендеринг страниц на сервере для SEO и быстрой первой загрузки. Настройка SSR, hydration, transfer state, SSR для SEO-критичных страниц.
section: angular
difficulty: advanced
readTime: 11
order: 13
tags: [Angular, SSR, hydration, SEO, Universal, server-side rendering]
---

## Зачем нужен SSR в Angular

По умолчанию Angular-приложение — это SPA (Single Page Application): браузер получает пустой HTML и JavaScript-бандл, а весь рендеринг происходит на клиенте. Это работает, но у подхода есть проблемы:

- **SEO**: поисковые роботы могут не выполнить JavaScript, и увидят пустую страницу
- **Первая загрузка**: пользователь видит белый экран, пока грузится бандл
- **Производительность на слабых устройствах**: рендеринг тяжёлых компонентов ляжет на плечи мобильного браузера

SSR решает эти проблемы: сервер рендерит полный HTML и отдаёт его браузеру. Пользователь сразу видит контент, а поисковик — проиндексирует страницу.

## Добавление SSR

```bash
# Для нового проекта — при создании
ng new my-app --ssr

# Для существующего проекта
ng add @angular/ssr
```

Команда `ng add`:
- Добавит `server.ts` — точку входа для сервера
- Обновит `angular.json` — добавит серверный билд
- Обновит `main.ts` — добавит `bootstrapApplication` с SSR-поддержкой

## Как это работает

```
1. Пользователь заходит на /tasks
2. Сервер (Node.js) запускает Angular, рендерит компонент для /tasks
3. Сервер отдаёт готовый HTML
4. Браузер показывает страницу (пользователь видит контент)
5. Angular загружает JS-бандл
6. Hydration — Angular «оживляет» HTML: привязывает события, реактивность
7. Приложение работает как обычное SPA
```

## Структура после добавления SSR

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.config.server.ts    # Серверная конфигурация
│   └── app.routes.ts
├── main.ts                     # Клиентский вход
├── main.server.ts              # Серверный вход
├── server.ts                   # Express-сервер
└── index.html
```

### app.config.server.ts

```typescript
import { ApplicationConfig } from '@angular/core'
import { provideServerRendering } from '@angular/platform-server'
import { appConfig } from './app.config'

export const config: ApplicationConfig = {
  providers: [
    provideServerRendering(),
  ]
}
```

### server.ts

```typescript
import { APP_BASE_HREF } from '@angular/common'
import { CommonEngine } from '@angular/ssr'
import express from 'express'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDistFolder = dirname(fileURLToPath(import.meta.url))
const browserDistFolder = resolve(serverDistFolder, '../browser')
const indexHtml = join(serverDistFolder, 'index.server.html')

const app = express()

const commonEngine = new CommonEngine()

app.set('view engine', 'html')
app.set('views', browserDistFolder)

app.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }))

app.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req

  commonEngine
    .render({
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err))
})

const port = process.env['PORT'] || 4000
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`)
})
```

Это минимальный Express-сервер. Angular отрендерит HTML для каждого запроса через `CommonEngine`.

## Сборка и запуск

```bash
# Сборка (клиент + сервер)
ng build

# Результат
# dist/my-app/browser/   — клиентский бандл
# dist/my-app/server/    — серверный бундл

# Запуск SSR-сервера
node dist/my-app/server/server.mjs
```

Для разработки обычный `ng serve` использует SSR автоматически, если он включён.

## Hydration

Hydration — процесс, при котором Angular «оживляет» серверный HTML: привязывает события, реактивность, подписки. Без hydration серверный HTML был бы статичным — кнопки не работали бы.

Hydration включена по умолчанию с Angular 17:

```typescript
// app.config.ts
import { provideClientHydration } from '@angular/platform-browser'

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
  ]
}
```

### Проблемы hydration

Иногда серверный и клиентский рендер дают разный HTML. Angular выдаст ошибку hydration mismatch:

```
NG0500: During hydration Angular expected ...
```

Причины:
- Использование `Date.now()`, `Math.random()` — разные значения на сервере и клиенте
- Использование `window` или `document` в constructor/ngOnInit (на сервере их нет)
- Условия на основе `navigator.userAgent`

### Решение: проверка платформы

```typescript
import { isPlatformBrowser, isPlatformServer, PLATFORM_ID, inject } from '@angular/core'

@Component({ ... })
export class ChartComponent implements OnInit {
  private platformId = inject(PLATFORM_ID)

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Код, который работает только в браузере
      this.initChart()
    }
  }
}
```

### Отключение hydration для компонента

```typescript
@Component({
  selector: 'app-heavy-chart',
  standalone: true,
  template: `<canvas id="chart"></canvas>`,
})
export class HeavyChartComponent {
  // ...без hydration, компонент перерендерится на клиенте
}
```

```typescript
// В маршруте
{
  path: 'analytics',
  component: AnalyticsComponent,
  // Компонент по этому маршруту не будет гидратирован
}
```

## Transfer State — передача данных сервера клиенту

Проблема: данные, загруженные на сервере, загружаются снова на клиенте при hydration. Transfer State решает это — данные с сервера передаются клиенту через HTML:

```typescript
import { TransferState, inject, makeStateKey } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient)
  private transferState = inject(TransferState)

  getAll(): Observable<Task[]> {
    const key = makeStateKey<Task[]>('tasks-all')

    // Если данные уже есть в Transfer State (сервер их туда положил)
    if (this.transferState.hasKey(key)) {
      const data = this.transferState.get(key, [])
      this.transferState.remove(key)
      return of(data)
    }

    // Иначе загрузить
    return this.http.get<Task[]>('/api/tasks').pipe(
      tap(tasks => {
        // На сервере — сохранить в Transfer State
        if (isPlatformServer(inject(PLATFORM_ID))) {
          this.transferState.set(key, tasks)
        }
      })
    )
  }
}
```

Теперь данные загрузятся один раз на сервере и не будут повторно запрашиваться на клиенте.

## Server-only и Client-only код

### Server-only логика

```typescript
import { inject } from '@angular/core'
import { REQUEST, RESPONSE } from '@angular/ssr'

export class SitemapComponent implements OnInit {
  // REQUEST и RESPONSE доступны только на сервере
  private request = inject(REQUEST, { optional: true })
  private response = inject(RESPONSE, { optional: true })

  ngOnInit() {
    if (this.response) {
      this.response.statusCode = 200
    }
  }
}
```

### Client-only компонент

```typescript
// Используйте afterNextRender для браузерного кода
import { afterNextRender } from '@angular/core'

@Component({ ... })
export class MapComponent {
  constructor() {
    afterNextRender(() => {
      // Этот код выполнится только в браузере
      this.initGoogleMaps()
    })
  }
}
```

`afterNextRender` — это безопасная замена `ngAfterViewInit` для SSR. Код внутри гарантированно работает только в браузере.

## SSR и SEO

### Meta-теги и заголовки

```typescript
import { Meta, Title } from '@angular/platform-browser'

@Component({ ... })
export class TaskDetailComponent implements OnInit {
  private title = inject(Title)
  private meta = inject(Meta)

  ngOnInit() {
    this.route.data.subscribe(({ task }) => {
      this.title.setTitle(`${task.title} — FrontSkill`)

      this.meta.updateTag({
        name: 'description',
        content: task.description.slice(0, 160)
      })

      this.meta.updateTag({
        property: 'og:title',
        content: task.title
      })
    })
  }
}
```

### Resolvers для SSR

Чтобы SSR отдавал полный контент, данные должны загрузиться до рендеринга. Используйте Resolvers:

```typescript
{
  path: 'tasks/:id',
  component: TaskDetailComponent,
  resolve: {
    task: taskResolver  // Загрузит данные на сервере
  }
}
```

Без resolver SSR отдаст страницу с «Загрузка...», а данные подгрузятся только на клиенте.

## Статическая генерация (SSG)

Angular может предварительно отрендерить страницы в статические HTML-файлы при сборке. Это быстрее SSR — сервер не рендерит при каждом запросе:

```typescript
// app.routes.ts
import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
]
```

```bash
# Prerender всех статических маршрутов
ng build --prerender

# Prerender конкретных маршрутов
ng build --prerender --routes / /about /contacts

# Файл с маршрутами
ng build --prerender --routes-file routes.txt
```

```
# routes.txt
/
/about
/contacts
```

Результат — статические HTML-файлы в `dist/my-app/browser/`:

```
dist/my-app/browser/
├── index.html         # Prerendered
├── about/
│   └── index.html     # Prerendered
├── contacts/
│   └── index.html     # Prerendered
```

## Итог

| Концепция | Для чего |
|---|---|
| SSR | Рендеринг на сервере для SEO и быстрой загрузки |
| Hydration | «Оживление» серверного HTML на клиенте |
| Transfer State | Передача данных сервер → клиент без повторных запросов |
| `isPlatformBrowser` | Проверка среды выполнения |
| `afterNextRender` | Код, выполняемый только в браузере |
| `Meta` / `Title` | Управление SEO-метатегами |
| Resolver | Предзагрузка данных для SSR |
| SSG (Prerender) | Статическая генерация при сборке |

SSR — не бесплатный. Он усложняет деплой (нужен Node.js-сервер), добавляет ограничения (нельзя использовать browser API напрямую) и требует осторожности с hydration. Но для публичных сайтов, где важен SEO и быстрая первая загрузка, SSR — необходимый инструмент.
