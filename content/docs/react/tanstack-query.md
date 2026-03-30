---
title: TanStack Query — серверное состояние
description: "TanStack Query (React Query) — библиотека для работы с серверными данными: кэширование, автоматическое обновление, optimistic updates, пагинация и infinite scroll."
section: react
difficulty: intermediate
readTime: 14
order: 9
tags: [TanStack Query, React Query, кэширование, API, React]
---

## Что такое TanStack Query

TanStack Query (ранее React Query) — библиотека для управления **серверным состоянием**. Она не заменяет Zustand или Redux — те нужны для клиентского состояния. TanStack Query отвечает за загрузку, кэширование, синхронизацию и обновление данных с сервера.

Установка:

```bash
npm install @tanstack/react-query
```

## Настройка

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 минут — данные считаются свежими
      gcTime: 10 * 60 * 1000,         // 10 минут — время жизни в кэше
      retry: 1,                        // Один повтор при ошибке
      refetchOnWindowFocus: false,     // Не обновлять при фокусе окна
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
```

## useQuery — чтение данных

```tsx
import { useQuery } from '@tanstack/react-query'

interface Todo {
  id: number
  title: string
  completed: boolean
}

function TodoList() {
  const { data, isLoading, error, isFetching } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('Ошибка загрузки')
      return res.json()
    },
  })

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>

  return (
    <ul>
      {data!.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
      {isFetching && <span>Обновление...</span>}
    </ul>
  )
}
```

`queryKey` — уникальный ключ для кэша. По нему TanStack Query определяет, нужно ли делать новый запрос или использовать закэшированные данные.

## Параметры запроса

```tsx
function UserProfile({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    enabled: !!userId,         // Запрос не выполняется, если userId = 0
  })

  return <div>{data?.name}</div>
}
```

## useMutation — изменение данных

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const input = form.elements.namedItem('title') as HTMLInputElement
        mutation.mutate(input.value)
        form.reset()
      }}
    >
      <input name="title" placeholder="Новая задача" />
      <button disabled={mutation.isPending}>Добавить</button>
    </form>
  )
}
```

`invalidateQueries` помечает запрос как устаревший — TanStack Query автоматически сделает повторный запрос.

## Optimistic Update

Пользователь видит результат сразу, до ответа сервера. Если запрос не удался — откат:

```tsx
function ToggleTodo({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient()

  return (
    <button
      onClick={() => {
        mutation.mutate(todo.id)
      }}
    >
      {todo.completed ? '✓' : '○'}
    </button>
  )

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, { method: 'PATCH' })
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previous = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

## Пагинация

```tsx
function PaginatedTodos() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['todos', 'page', page],
    queryFn: () => fetch(`/api/todos?page=${page}`).then((r) => r.json()),
  })

  return (
    <div>
      {data?.items.map((todo: Todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
      <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
        Назад
      </button>
      <span>Страница {page}</span>
      <button onClick={() => setPage((p) => p + 1)}>
        Вперёд
      </button>
    </div>
  )
}
```

TanStack Query кэширует каждую страницу отдельно — при возврате на предыдущую данные берутся из кэша.

## Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

function InfiniteTodos() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['todos', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/todos?page=${pageParam}`).then((r) => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  })

  return (
    <div>
      {data?.pages.flatMap((page) =>
        page.items.map((todo: Todo) => (
          <div key={todo.id}>{todo.title}</div>
        )),
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Загрузка...' : 'Ещё'}
        </button>
      )}
    </div>
  )
}
```

## Параллельные запросы

```tsx
function Dashboard() {
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()),
  })

  const posts = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then((r) => r.json()),
  })

  if (users.isLoading || posts.isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <p>Пользователей: {users.data.length}</p>
      <p>Постов: {posts.data.length}</p>
    </div>
  )
}
```

Или через `useQueries` для динамического списка:

```tsx
function UserProfiles({ ids }: { ids: number[] }) {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['user', id],
      queryFn: () => fetch(`/api/users/${id}`).then((r) => r.json()),
    })),
  })

  if (queries.some((q) => q.isLoading)) return <div>Загрузка...</div>

  return (
    <div>
      {queries.map((q) => (
        <div key={q.data.id}>{q.data.name}</div>
      ))}
    </div>
  )
}
```

## Зависимые запросы

```tsx
function UserPosts({ userId }: { userId: number | null }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    enabled: !!userId,
  })

  const { data: posts } = useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => fetch(`/api/users/${userId}/posts`).then((r) => r.json()),
    enabled: !!user,
  })

  return (
    <div>
      <h2>{user?.name}</h2>
      {posts?.map((post: Post) => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}
```

## Ключи — как устроен кэш

`queryKey` работает как составной ключ:

```ts
['todos']                    // Все todos
['todos', 'page', 2]         // Todos, страница 2
['todos', { filter: 'active' }]  // Активные todos
['user', 42]                 // Пользователь с id 42
```

Инвалидация по префиксу:

```ts
queryClient.invalidateQueries({ queryKey: ['todos'] })
// Сбросит все запросы, начинающиеся с ['todos']
```

## React Query DevTools

```bash
npm install @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

DevTools показывают все запросы, их статус, кэш и timing.

## Итог

TanStack Query стоит использовать почти в каждом React-проекте, который работает с API. Она берёт на себя загрузку, кэширование, повторные запросы и состояния `loading/error`. Главное — разделить клиентское состояние (Zustand/Context) и серверное (TanStack Query). Не нужно складывать данные с API в Redux, если у вас есть TanStack Query.
