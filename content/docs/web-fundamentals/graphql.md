---
title: "GraphQL: запросы, мутации, подписки, когда использовать"
description: "GraphQL — язык запросов для API. Запросы, мутации, подписки, схема, резолверы, сравнение с REST, Apollo Client и когда переходить на GraphQL."
section: web-fundamentals
difficulty: intermediate
readTime: 15
order: 3
tags: [graphql, api, queries, mutations, subscriptions, apollo]
---

## Что такое GraphQL

GraphQL — язык запросов для API, созданный Facebook в 2015 году. В отличие от REST, где вы делаете запрос к конкретному эндпоинту и получаете фиксированный набор данных, GraphQL позволяет клиенту указать **ровно те поля**, которые нужны.

Проблемы REST, которые решает GraphQL:
- **Over-fetching** — REST возвращает все поля, даже если нужны 3 из 20
- **Under-fetching** — для связанных данных нужно делать несколько запросов
- **Множество эндпоинтов** — `/users`, `/users/1/posts`, `/users/1/comments`

GraphQL: **один эндпоинт**, один запрос — все нужные данные.

```
REST:
  GET /users/1              → { id, name, email, phone, address, company, ... }
  GET /users/1/posts        → [{ id, title, body, ... }]
  GET /users/1/followers    → [{ id, name, ... }]

GraphQL:
  query {
    user(id: 1) {
      name
      posts(limit: 5) { title }
      followers { name }
    }
  }
  → { name: "Анна", posts: [{ title: "..." }], followers: [{ name: "..." }] }
```

## Основные понятия

| Понятие | Описание |
|---|---|
| **Query** | Получение данных (аналог GET) |
| **Mutation** | Изменение данных (аналог POST/PUT/DELETE) |
| **Subscription** | Получение данных в реальном времени (WebSocket) |
| **Schema** | Описание типов и связей (контракт API) |
| **Resolver** | Функция, которая возвращает данные для поля |

## Schema (Схема)

Схема описывает все типы данных и операции API:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  avatar: String
  posts(limit: Int): [Post!]!
  followers: [User!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  comments: [Comment!]!
  createdAt: String!
}

type Comment {
  id: ID!
  text: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): [User!]!
  post(id: ID!): Post
  posts(filter: PostFilter): [Post!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  login(email: String!, password: String!): AuthPayload!
}

type Subscription {
  newPost: Post!
  newComment(postId: ID!): Comment!
}

input CreatePostInput {
  title: String!
  body: String!
}

input UpdatePostInput {
  title: String
  body: String
}

input PostFilter {
  authorId: ID
  search: String
}

type AuthPayload {
  token: String!
  user: User!
}
```

Символы:
- `!` — поле обязательно (non-null)
- `[Type!]!` — обязательный массив обязательных элементов
- `ID` — уникальный идентификатор (строка)
- `Input` — тип для входных данных

## Queries (Запросы)

### Простой запрос

```graphql
query {
  user(id: 1) {
    name
    email
  }
}
```

Ответ:
```json
{
  "data": {
    "user": {
      "name": "Анна",
      "email": "anna@example.com"
    }
  }
}
```

### Связанные данные (один запрос вместо трёх в REST)

```graphql
query {
  user(id: 1) {
    name
    avatar
    posts(limit: 5) {
      title
      createdAt
      comments {
        text
        author { name }
      }
    }
  }
}
```

### Несколько запросов за один раз

```graphql
query {
  user(id: 1) { name email }
  posts(limit: 10) { title author { name } }
  categories { id name }
}
```

### Переменные

```graphql
query GetUser($userId: ID!, $postsLimit: Int = 5) {
  user(id: $userId) {
    name
    posts(limit: $postsLimit) { title }
  }
}
```

Variables:
```json
{
  "userId": 1,
  "postsLimit": 10
}
```

### Фрагменты

Повторяющиеся наборы полей можно вынести:

```graphql
fragment UserFields on User {
  id
  name
  email
  avatar
}

query {
  user(id: 1) {
    ...UserFields
    posts { title }
  }
  currentUser {
    ...UserFields
  }
}
```

### Aliases

Когда нужно запросить одно поле с разными параметрами:

```graphql
query {
  allPosts: posts(status: "published") { title }
  draftPosts: posts(status: "draft") { title }
}
```

## Mutations (Мутации)

Мутации изменяют данные:

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    body
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "title": "Мой первый пост",
    "body": "Привет, мир!"
  }
}
```

### Обновление

```graphql
mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
  updatePost(id: $id, input: $input) {
    id
    title
    body
  }
}
```

```json
{
  "id": 42,
  "input": { "title": "Обновлённый заголовок" }
}
```

### Удаление

```graphql
mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}
```

Ответ: `{ "data": { "deletePost": true } }`

## Subscriptions (Подписки)

Подписки работают через WebSocket — данные приходят в реальном времени:

```graphql
subscription OnNewComment($postId: ID!) {
  newComment(postId: $postId) {
    id
    text
    author { name avatar }
    createdAt
  }
}
```

Каждый новый комментарий к посту будет приходить автоматически:
```json
{
  "data": {
    "newComment": {
      "id": 99,
      "text": "Отличная статья!",
      "author": { "name": "Иван", "avatar": "..." },
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

Применение: чаты, уведомления, лента, collaborative editing.

## GraphQL на фронтенде

### fetch (без библиотек)

```ts
async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const { data, errors } = await response.json()

  if (errors) {
    throw new Error(errors[0].message)
  }

  return data
}

// Использование
const data = await graphql<{ user: User }>(`
  query GetUser($id: ID!) {
    user(id: $id) { name email posts { title } }
  }
`, { id: 1 })
```

### Apollo Client (React)

```bash
npm install @apollo/client graphql
```

```tsx
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client'

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  headers: { authorization: `Bearer ${token}` },
})

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      posts { title createdAt }
    }
  }
`

function UserProfile({ userId }: { userId: string }) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
  })

  if (loading) return <p>Загрузка...</p>
  if (error) return <p>Ошибка: {error.message}</p>

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
      {data.user.posts.map((post: any) => (
        <article key={post.title}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Vue + Vue Apollo

```bash
npm install @vue/apollo-composable graphql
```

```vue
<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) { name email posts { title } }
  }
`

const userId = ref('1')
const { result, loading, error } = useQuery(GET_USER, { id: userId })
</script>

<template>
  <div v-if="loading">Загрузка...</div>
  <div v-else-if="error">Ошибка: {{ error.message }}</div>
  <div v-else>
    <h1>{{ result.user.name }}</h1>
    <p>{{ result.user.email }}</p>
  </div>
</template>
```

## Сравнение REST и GraphQL

| Критерий | REST | GraphQL |
|---|---|---|
| Эндпоинты | Много (`/users`, `/posts`) | Один (`/graphql`) |
| Данные | Фиксированный набор полей | Клиент выбирает поля |
| Количество запросов | N запросов для N ресурсов | Один запрос |
| Over-fetching | Часто | Нет |
| Under-fetching | Часто | Нет |
| Кэширование | HTTP-кэш (просто) | Нужен Apollo Cache |
| Файловая загрузка | Просто (multipart) | Сложнее |
| Отладка | Простая (curl, Postman) | Нужен GraphiQL / Playground |
| Кривая обучения | Низкая | Средняя |
| Инструменты | Стандартные | GraphiQL, Apollo DevTools |

## Когда использовать GraphQL

### Подходит для:
- Сложные данные с множеством связей (соцсети, e-commerce)
- Мобильные приложения (экономия трафика)
- Когда фронтенд-команда хочет независимости от бэкенда
- Real-time функции (subscriptions)
- Микросервисная архитектура (GraphQL как агрегатор)

### Не подходит для:
- Простых CRUD-приложений (REST проще)
- Кэширование файлов (CDN для REST проще)
- Команд, где никто не знает GraphQL
- Простых API с 5–10 эндпоинтами

## Инструменты

### GraphiQL / GraphQL Playground

Интерактивная среда для тестирования запросов. Встроена во многие GraphQL-серверы:
- Автодополнение на основе схемы
- Документация типов
- История запросов

### Apollo Explorer

Облачный инструмент от Apollo с визуальным построением запросов.

### Apollo Client DevTools

Расширение для Chrome — показывает кэш, запросы и мутации.

## Best Practices

### Фрагменты для переиспользования

```graphql
fragment PostCard on Post {
  id
  title
  createdAt
  author { name avatar }
}
```

### DataLoader для N+1 проблемы

Если у поста есть `author` и резолвер делает запрос к БД на каждого автора — это N+1 запрос. DataLoader группирует их в один batch-запрос.

### Persisted Queries

Вместо отправки полного текста запроса отправляется хеш:
```
POST /graphql
{ "extensions": { "persistedQuery": { "sha256Hash": "abc123..." } } }
```
Экономит трафик и улучшает безопасность.

### Pagination (Relay-style)

```graphql
query {
  posts(first: 10, after: "cursor123") {
    edges {
      node { id title }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Итог

- GraphQL — один эндпоинт, клиент выбирает нужные поля
- **Query** — чтение, **Mutation** — запись, **Subscription** — real-time
- Schema определяет типы, resolver'ы возвращают данные
- Решает over-fetching и under-fetching
- Apollo Client — стандартная библиотека для React и Vue
- Используйте для сложных данных, экономии трафика, real-time
- REST проще для CRUD-приложений — выбирайте по задаче
