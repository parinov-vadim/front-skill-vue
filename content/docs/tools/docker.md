---
title: "Docker основы: Dockerfile, docker-compose для фронтенда"
description: "Docker для фронтенд-разработчика: Dockerfile для Nginx-деплоя, multi-stage сборка, docker-compose с API и базой данных, полезные команды."
section: tools
difficulty: intermediate
readTime: 14
order: 9
tags: [docker, dockerfile, docker-compose, nginx, deployment]
---

## Что такое Docker

Docker — это инструмент для запуска приложений в изолированных контейнерах. Контейнер — это минимальная виртуальная машина, которая содержит только необходимое для работы приложения: код, зависимости, конфигурацию.

Зачем Docker фронтендеру:
- Одинаковое окружение на всех компьютерах — «у меня работает» больше не проблема
- Деплой — один Docker-образ работает одинаково на любом сервере
- Запуск бэкенда и БД локально без их установки (PostgreSQL, Redis, API)
- CI/CD — сборка и тесты в контейнерах

### Контейнер vs Образ

- **Образ (Image)** — шаблон, «рецепт» контейнера. Определяется через `Dockerfile`
- **Контейнер (Container)** — запущенный экземпляр образа. Можно создать много контейнеров из одного образа

Аналогия: образ — это класс, контейнер — экземпляр класса.

## Установка

- **macOS**: Docker Desktop (https://docker.com/products/docker-desktop)
- **Linux**: `curl -fsSL https://get.docker.com | sh`
- **Windows**: Docker Desktop с WSL2

Проверка:
```bash
docker --version
docker compose version
```

## Базовые команды

```bash
docker ps                              # Список запущенных контейнеров
docker ps -a                           # Все контейнеры (включая остановленные)
docker images                          # Список образов
docker pull node:20                    # Скачать образ
docker run node:20 echo "hello"        # Запустить команду в контейнере
docker run -it node:20 bash            # Интерактивный терминал в контейнере
docker stop <container_id>             # Остановить контейнер
docker rm <container_id>               # Удалить контейнер
docker rmi <image_id>                  # Удалить образ
docker logs <container_id>             # Логи контейнера
docker exec -it <container_id> bash    # Зайти в запущенный контейнер
```

## Dockerfile

Dockerfile — текстовый файл с инструкциями для создания образа.

### Простой Dockerfile для фронтенда

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "preview"]
```

### Multi-stage Dockerfile (рекомендуемый)

Разделяем стадии: сборка (build) и продакшн (nginx):

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Production (Nginx)
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Multi-stage сборка — финальный образ содержит только Nginx и статику, без Node.js и исходников. Размер: ~25 МБ вместо ~500 МБ.

### nginx.conf для SPA

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

### Инструкции Dockerfile

| Инструкция | Описание |
|---|---|
| `FROM` | Базовый образ |
| `WORKDIR` | Рабочая директория внутри контейнера |
| `COPY` | Копировать файлы с хоста в контейнер |
| `RUN` | Выполнить команду при сборке образа |
| `CMD` | Команда при запуске контейнера |
| `EXPOSE` | Порт, который слушает контейнер |
| `ENV` | Переменные окружения |
| `ARG` | Аргументы при сборке |

### .dockerignore

Как `.gitignore`, но для Docker. Исключает файлы из контекста сборки:

```
node_modules
dist
.git
.vscode
*.md
.env
```

Это ускоряет сборку — Docker не отправляет эти файлы демону.

### Сборка и запуск

```bash
docker build -t my-app .
docker run -p 3000:80 my-app
```

`-t my-app` — имя образа
`-p 3000:80` — проброс порта: хост:контейнер
`.` — путь к Dockerfile

## docker-compose

docker-compose — инструмент для запуска нескольких контейнеров вместе. Описывается в `docker-compose.yml`.

### Фронтенд + API + БД

```yaml
# docker-compose.yml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api
    environment:
      - VITE_API_URL=http://api:8080

  api:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./api:/app
    ports:
      - "8080:8080"
    command: npm run dev
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Команды docker-compose

```bash
docker compose up                          # Запустить все сервисы
docker compose up -d                       # Запустить в фоне (detached)
docker compose up --build                  # Пересобрать и запустить
docker compose down                        # Остановить и удалить
docker compose down -v                     # Удалить с volumes
docker compose logs -f                     # Логи всех сервисов
docker compose logs -f frontend            # Логи одного сервиса
docker compose ps                          # Статус сервисов
docker compose exec api bash               # Зайти в контейнер API
docker compose restart api                 # Перезапустить сервис
```

### Только для разработки (dev-override)

```yaml
# docker-compose.dev.yml
services:
  frontend:
    build:
      target: builder                     # Остановиться на стадии builder
    command: pnpm dev
    volumes:
      - .:/app                            # Живая синхронизация файлов
      - /app/node_modules                 # Не перезаписывать node_modules
    ports:
      - "5173:5173"                       # Vite dev server
    environment:
      - CHOKIDAR_USEPOLLING=true          # HMR в Docker
```

```bash
docker compose -f docker-compose.dev.yml up
```

### Переменные окружения

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}               # Из .env файла
    env_file:
      - .env.docker
```

## Практические примеры

### Запуск PostgreSQL для локальной разработки

```bash
docker run -d \
  --name my-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  postgres:16-alpine
```

Подключение: `postgresql://user:pass@localhost:5432/mydb`

### Запуск Redis

```bash
docker run -d --name my-redis -p 6379:6379 redis:alpine
```

### Запуск mock API (json-server)

```bash
docker run -d \
  --name mock-api \
  -p 3001:3000 \
  -v $(pwd)/db.json:/data/db.json \
  clue/json-server
```

### Nginx для статики

```bash
docker run -d \
  --name static-site \
  -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html:ro \
  nginx:alpine
```

## Volumes

Volumes — механизм хранения данных, который переживёт удаление контейнера.

| Тип | Синтаксис | Описание |
|---|---|---|
| Named volume | `pgdata:/var/lib/postgresql/data` | Управляется Docker |
| Bind mount | `./src:/app/src` | Прямая связь с файлами хоста |
| Anonymous volume | `/app/node_modules` | Временный |

```bash
docker volume ls                        # Список volumes
docker volume rm pgdata                 # Удалить volume
```

## Сети

По умолчанию docker-compose создаёт сеть, и контейнеры видят друг друга по имени сервиса. `frontend` может обратиться к `api://api:8080`.

```yaml
services:
  frontend:
    networks:
      - frontend-net
  api:
    networks:
      - frontend-net
      - backend-net
  db:
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:
```

## Оптимизация Dockerfile

### Кэширование слоёв

Каждая инструкция в Dockerfile — слой. Docker кэширует их. Если слой изменился — все последующие пересобираются.

Плохо:
```dockerfile
COPY . .
RUN npm install
RUN npm run build
```

При любом изменении кода `npm install` запускается заново.

Хорошо:
```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

Сначала копируем только lock-файлы и устанавливаем зависимости (кэшируется). Потом копируем исходники и собираем.

### Уменьшение размера образа

1. Используйте `alpine`-образы (node:20-alpine вместо node:20)
2. Multi-stage сборка (финальный образ без build-инструментов)
3. `.dockerignore` с `node_modules`, `.git`, `dist`
4. `RUN --mount=type=cache` для кэша пакетного менеджера

```dockerfile
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
```

## Деплой на сервер

### Сборка и отправка в Registry

```bash
docker build -t my-registry.com/my-app:v1.0 .
docker push my-registry.com/my-app:v1.0
```

На сервере:
```bash
docker pull my-registry.com/my-app:v1.0
docker run -d -p 80:80 my-registry.com/my-app:v1.0
```

### Docker Hub (бесплатный публичный Registry)

```bash
docker login
docker tag my-app username/my-app:v1.0
docker push username/my-app:v1.0
```

## Итог

- Docker обеспечивает одинаковое окружение на всех машинах
- **Dockerfile** описывает, как собрать образ (multi-stage — для production)
- **docker-compose** запускает несколько сервисов (фронтенд + API + БД)
- Для фронтенд-деплоя: multi-stage Dockerfile → Nginx → статику
- Для локальной разработки: docker-compose с PostgreSQL, Redis, API
- Кэширование слоёв — копируйте `package.json` до `COPY . .`
- Используйте `alpine`-образы для минимального размера
