---
title: UI-библиотеки для React
description: Обзор UI-библиотек для React: Material UI, Ant Design, Shadcn/ui, Radix UI, Mantine. Сравнение, плюсы, минусы и когда какую использовать.
section: react
difficulty: beginner
readTime: 10
order: 21
tags: [Material UI, Ant Design, Shadcn, Radix, Mantine, UI-библиотеки, React]
---

## Зачем UI-библиотека

UI-библиотеки дают готовые компоненты: кнопки, модалки, таблицы, формы, date picker. Вместо верстки с нуля — берёте готовый компонент и настраиваете.

## Shadcn/ui

Shadcn/ui — не библиотека в привычном смысле. Это набор копируемых компонентов на основе Radix UI и Tailwind CSS. Код компонентов лежит в вашем проекте — вы полностью его контролируете.

```bash
npx shadcn@latest init
npx shadcn@latest add button dialog input table
```

```tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

function App() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Открыть</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заголовок</DialogTitle>
        </DialogHeader>
        <p>Содержимое диалога</p>
      </DialogContent>
    </Dialog>
  )
}
```

Плюсы:
- Полный контроль над кодом — компоненты у вас в проекте
- Tailwind CSS — стили привычные и гибкие
- Отличная TypeScript-поддержка
- Не нужен отдельный пакет в зависимостях

Минусы:
- Обновления нужно накатывать вручную
- Меньше готовых сложных компонентов по сравнению с MUI

## Material UI (MUI)

Крупнейшая UI-библиотека для React по дизайну Google Material Design.

```bash
npm install @mui/material @emotion/react @emotion/styled
```

```tsx
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

function LoginForm() {
  return (
    <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
      <TextField label="Email" type="email" fullWidth />
      <TextField label="Пароль" type="password" fullWidth />
      <Button variant="contained" size="large" fullWidth>
        Войти
      </Button>
    </Box>
  )
}
```

Тематизация:

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  )
}
```

Плюсы:
- Огромный набор компонентов (50+)
- Зрелая экосистема, MUI X для таблиц и date picker
- Отличная документация с примерами
- Полная кастомизация через тематику

Минусы:
- Тяжёлый бандл (~80 KB gzipped для базовых компонентов)
- Сложная кастомизация — нужно знать API тем
- Материальный дизайн не всем подходит

## Ant Design

UI-библиотека от Alibaba. Популярна в корпоративных приложениях.

```bash
npm install antd
```

```tsx
import { Button, Input, Form, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const columns: ColumnsType<User> = [
  { title: 'Имя', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  {
    title: 'Действия',
    key: 'actions',
    render: (_, record) => <a onClick={() => edit(record.id)}>Редактировать</a>,
  },
]

function UsersPage() {
  return (
    <div>
      <Form layout="inline">
        <Form.Item name="search">
          <Input.Search placeholder="Поиск" />
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={users} rowKey="id" />
    </div>
  )
}
```

Плюсы:
- 60+ компонентов, включая сложные (Form, Table, Upload)
- Продуманный дизайн для админок и дашбордов
- Встроенная интернационализация (включая русский)

Минусы:
- Специфичный визуальный стиль
- Тяжёлый бандл (~100 KB gzipped)
- Кастомизация сложнее, чем у Shadcn

## Mantine

Современная React-библиотека с хуками и утилитами.

```bash
npm install @mantine/core @mantine/hooks
```

```tsx
import { Button, TextInput, Paper, Title, Stack } from '@mantine/core'

function LoginForm() {
  return (
    <Paper shadow="sm" p="xl" radius="md">
      <Title order={2}>Вход</Title>
      <Stack gap="md">
        <TextInput label="Email" placeholder="you@mail.com" />
        <TextInput label="Пароль" type="password" />
        <Button fullWidth>Войти</Button>
      </Stack>
    </Paper>
  )
}
```

Плюсы:
- Современный дизайн «из коробки»
- 100+ хуков (@mantine/hooks) — useLocalStorage, useDebouncedValue, useMediaQuery
- Хорошая TypeScript-поддержка
- Активное развитие

Минусы:
- Меньше сообщество, чем у MUI
- Зависимость от emotion (CSS-in-JS)

## Radix UI

Headless-библиотека — компоненты без стилей. Даёт доступность и поведение, вы добавляете визуал.

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

```tsx
import * as Dialog from '@radix-ui/react-dialog'

function Modal({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

Shadcn/ui построен поверх Radix UI — вы получаете его доступность + готовые стили.

## Сравнение

| Критерий | Shadcn/ui | MUI | Ant Design | Mantine | Radix |
|----------|-----------|-----|------------|---------|-------|
| Подход | Копируемый | Библиотека | Библиотека | Библиотека | Headless |
| Стили | Tailwind | Emotion | CSS-in-JS | CSS Modules/Emotion | Нет (свои) |
| Размер бандла | Минимальный | Большой | Большой | Средний | Маленький |
| Кастомизация | Полная | Через тему | Через тему | Через тему | Полная |
| Доступность | ✅ (Radix) | ✅ | ✅ | ✅ | ✅ |
| Количество компонентов | ~50 | 50+ | 60+ | 100+ | ~30 |

## Что выбрать

- **Shadcn/ui** — лучший выбор для новых проектов с Tailwind. Полный контроль, минимум зависимостей.
- **MUI** — для корпоративных приложений с Material-дизайном и сложными таблицами.
- **Ant Design** — для админок и дашбордов с множеством форм и таблиц.
- **Mantine** — если нужны готовые хуки и быстрый старт без Tailwind.
- **Radix UI** — для собственных дизайн-систем.

## Итог

UI-библиотека ускоряет разработку в 2-3 раза — не нужно верстать каждый компонент с нуля. Shadcn/ui сейчас — самый популярный выбор в React-сообществе: Tailwind, Radix UI, код у вас в проекте. Для проектов без Tailwind стоит посмотреть Mantine или MUI.
