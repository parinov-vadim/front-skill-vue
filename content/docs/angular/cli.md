---
title: "Angular CLI: установка и создание проекта"
description: Angular CLI — официальный инструмент командной строки для создания, сборки и генерации кода Angular-приложений. Установка, команда ng new, генераторы компонентов, сервисов и guards.
section: angular
difficulty: beginner
readTime: 10
order: 4
tags: [Angular, CLI, ng, scaffold, generator, Vite, esbuild]
---

## Что такое Angular CLI

Angular CLI (Command Line Interface) — официальный инструмент для разработки на Angular. Он берёт на себя рутину: создание проекта, генерацию компонентов, сборку, тестирование и деплой. Без CLI пришлось бы вручную настраивать TypeScript, бандлер и скаффолдить файлы — а с ним одна команда делает всё за вас.

## Установка

```bash
# Глобальная установка (нужен Node.js 18+)
npm install -g @angular/cli

# Проверка версии
ng version
# или коротко
ng v
```

Если не хотите ставить глобально — можно использовать `npx`:

```bash
npx @angular/cli@latest new my-app
```

## Создание проекта

```bash
ng new my-app
```

CLI задаст несколько вопросов. Вот что стоит выбрать для современного проекта:

```
? Would you like to add Angular routing? Yes
? Which stylesheet format do you want to use? SCSS   [или CSS, если привычнее]
? Do you want to enable Server-Side Rendering (SSR)? No  # можно добавить потом
```

Angular 17+ создаёт проект с **standalone-компонентами** по умолчанию — никаких NgModules. Бандлер по умолчанию — **esbuild** через `@angular/build`, что даёт очень быструю сборку.

### Ключевые флаги ng new

```bash
# Пропустить все вопросы — создать с настройками по умолчанию
ng new my-app --defaults

# Указать стили и routing сразу
ng new my-app --style=scss --routing --ssr=false

# Минимальный проект без тестов
ng new my-app --skip-tests --minimal

# Указать префикс компонентов (по умолчанию 'app')
ng new my-app --prefix=fs
```

## Структура проекта

После `ng new my-app` получится примерно такая структура:

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # Корневой компонент
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts          # Конфигурация приложения (providers)
│   │   └── app.routes.ts          # Маршруты
│   ├── assets/                    # Статика (картинки, шрифты)
│   ├── index.html                 # Главный HTML
│   ├── main.ts                    # Точка входа
│   └── styles.scss                # Глобальные стили
├── angular.json                   # Конфигурация CLI
├── tsconfig.json                  # Настройки TypeScript
├── package.json
└── .gitignore
```

### app.config.ts — центральный файл

```typescript
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
```

Вместо NgModule все провайдеры регистрируются здесь. Это подход standalone-приложения.

## Команда ng generate

CLI умеет генерировать бойлерплейт за вас. Формат команды:

```bash
ng generate <schematic> <name>
# или коротко
ng g <schematic> <name>
```

### Генерация компонентов

```bash
# Полный компонент (ts + html + scss + spec)
ng g components/user-profile

# Без тестов
ng g components/user-profile --skip-tests

# Инлайн шаблон и стили (всё в одном файле)
ng g components/user-profile --inline-template --inline-style
# коротко: -t -s

# Компонент в конкретной папке
ng g components/dashboard/widgets/stats-card

# Flat — без создания подпапки
ng g components/header --flat
```

Результат `ng g components/user-profile`:

```typescript
// src/app/components/user-profile/user-profile.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {

}
```

### Генерация сервисов

```bash
ng g services/user
# → src/app/services/user.service.ts

# Указать, что сервис не синглтон (редко нужно)
ng g services/user --not-provided-in-root
```

```typescript
// src/app/services/user.service.ts
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class UserService {

}
```

### Генерация guards

```bash
ng g guards/auth
```

```typescript
// src/app/guards/auth.guard.ts
import { CanActivateFn } from '@angular/router'

export const authGuard: CanActivateFn = (route, state) => {
  return true
}
```

### Генерация pipes, directives, interceptors

```bash
# Кастомный pipe
ng g pipes/truncate
# → truncate.pipe.ts

# Директива
ng g directives/highlight
# → highlight.directive.ts

# HTTP-интерцептор
ng g interceptors/logging
# → logging.interceptor.ts

# Resolver (загрузка данных до маршрута)
ng g resolvers/user
# → user.resolver.ts

# Модель (интерфейс)
ng g interfaces/user
# → user.model.ts  (нужен @schematics/angular — есть по умолчанию)

# Enum
ng g enumerations/user-role
# → user-role.enum.ts
```

### Полный список схематиков

| Сокращение | Полная команда | Что создаёт |
|---|---|---|
| `ng g c` | `component` | Компонент |
| `ng g s` | `service` | Сервис |
| `ng g g` | `guard` | Guard маршрута |
| `ng g p` | `pipe` | Канал (pipe) |
| `ng g d` | `directive` | Директива |
| `ng g i` | `interface` | Интерфейс |
| `ng g e` | `enum` | Перечисление |
| `ng g int` | `interceptor` | HTTP-интерцептор |
| `ng g r` | `resolver` | Resolver маршрута |

## Разработка и сборка

### Локальный сервер

```bash
# Запуск dev-сервера (по умолчанию http://localhost:4200)
ng serve

# Другой порт
ng serve --port 4300

# Открыть браузер автоматически
ng serve --open

# Прокси для API-запросов
ng serve --proxy-config proxy.conf.json
```

Проксирование нужно, когда бэкенд на другом порту:

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

### Сборка для продакшена

```bash
# Production-сборка (оптимизация, tree-shaking, минификация)
ng build

# Результат в dist/my-app/browser/
# Можно задать output-hashing (для кэша)
ng build --output-hashing=all
```

Angular 17+ использует esbuild, поэтому сборка очень быстрая — проект среднего размера собирается за пару секунд.

### Другие полезные команды

```bash
# Запуск тестов
ng test

# Линтинг (нужен eslint)
ng lint

# Проверка формата (Prettier — ставится отдельно)
npx prettier --check "src/**/*.{ts,html,scss}"

# Анализ бандла
ng build --stats-json
# Потом визуализировать через webpack-bundle-analyzer или source-map-explorer

# Обновление Angular до новой версии
ng update
ng update @angular/core @angular/cli
```

## Angular.json — конфигурация проекта

Файл `angular.json` содержит все настройки CLI: цели сборки, пути к файлам, конфигурации для разных окружений.

```json
{
  "projects": {
    "my-app": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": "dist/my-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "styles": ["src/styles.scss"],
            "assets": ["src/assets"]
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": { "buildTarget": "my-app:build:production" },
            "development": { "buildTarget": "my-app:build:development" }
          }
        }
      }
    }
  }
}
```

### Budgets — контроль размера бандла

Секция `budgets` в `angular.json` задаёт лимиты:

```json
"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]
```

Если бандл превышает лимит — CLI выдаст предупреждение или ошибку при сборке. Полезно, чтобы проект не «раздувался» незаметно.

## Добавление библиотек через ng add

Команда `ng add` автоматически настраивает сторонние библиотеки:

```bash
# Angular Material — компоненты UI
ng add @angular/material

# Angular CDK (Component Dev Kit)
ng add @angular/cdk

# Tailwind CSS
ng add tailwindcss

# PWA-поддержка
ng add @angular/pwa

# SSR (Server-Side Rendering)
ng add @angular/ssr
```

`ng add` не просто устанавливает npm-пакет — он модифицирует `angular.json`, импортирует модули, добавляет скрипты. Это удобнее, чем ручная установка.

## Свои schematics

Angular CLI расширяем. Можно создавать свои генераторы или использовать готовые из библиотек:

```bash
# Например, NgRx предоставляет свои schematics
ng add @ngrx/store
ng g store/root --root --module app.module.ts

# После установки появляются новые команды:
ng g action user            # NgRx action
ng g reducer user           # NgRx reducer
ng g effect user            # NgRx effect
ng g selector user          # NgRx selector
```

Если в команде `ng generate` нажать Tab дважды — CLI покажет все доступные schematics, включая те, что добавили сторонние пакеты.

## Итог

Angular CLI — не просто генератор файлов, а полноценный инструмент разработки. Основные команды, которые используются каждый день:

| Команда | Для чего |
|---|---|
| `ng new` | Создать проект |
| `ng serve` | Запустить dev-сервер |
| `ng build` | Собрать для продакшена |
| `ng g c name` | Создать компонент |
| `ng g s name` | Создать сервис |
| `ng g g name` | Создать guard |
| `ng add lib` | Добавить библиотеку |
| `ng test` | Запустить тесты |
| `ng update` | Обновить Angular |

CLI экономит десятки часов на рутине и гарантирует, что все файлы созданы по конвенциям фреймворка.
