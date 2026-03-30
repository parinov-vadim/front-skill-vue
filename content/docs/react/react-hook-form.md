---
title: React Hook Form — формы и валидация
description: React Hook Form — производительная библиотека для работы с формами. Регистрация полей, валидация, схемы Zod, обработка ошибок и работа с UI-библиотеками.
section: react
difficulty: intermediate
readTime: 12
order: 10
tags: [React Hook Form, формы, валидация, Zod, React]
---

## Установка

```bash
npm install react-hook-form
```

## Базовая форма

```tsx
import { useForm } from 'react-hook-form'

interface LoginForm {
  email: string
  password: string
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  function onSubmit(data: LoginForm) {
    console.log(data) // { email: '...', password: '...' }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input
          type="email"
          {...register('email', {
            required: 'Введите email',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Некорректный email',
            },
          })}
        />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>

      <div>
        <label>Пароль</label>
        <input
          type="password"
          {...register('password', {
            required: 'Введите пароль',
            minLength: { value: 8, message: 'Минимум 8 символов' },
          })}
        />
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Вход...' : 'Войти'}
      </button>
    </form>
  )
}
```

`register` связывает input с формой. `handleSubmit` валидирует данные и вызывает `onSubmit` только если всё заполнено верно.

## Встроенные правила валидации

```tsx
{...register('username', {
  required: 'Обязательное поле',
  minLength: { value: 3, message: 'Минимум 3 символа' },
  maxLength: { value: 20, message: 'Максимум 20 символов' },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: 'Только латиница, цифры и подчёркивание',
  },
  validate: {
    noSpaces: (value) => !value.includes(' ') || 'Без пробелов',
    notAdmin: (value) => value !== 'admin' || 'Имя занято',
  },
})}
```

## Валидация с Zod

Для сложных форм удобнее описывать схему валидации отдельно:

```bash
npm install @hookform/resolvers zod
```

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Имя минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterForm) {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Имя" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} placeholder="Пароль" />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" {...register('confirmPassword')} placeholder="Повторите пароль" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit">Зарегистрироваться</button>
    </form>
  )
}
```

## setValue и getValue

```tsx
function ProfileForm({ userId }: { userId: number }) {
  const { register, setValue, getValues } = useForm<UserForm>()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch(`/api/users/${userId}`)
      const user = await res.json()
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('bio', user.bio)
    }
    loadUser()
  }, [userId, setValue])

  function handleAutoFill() {
    const name = getValues('name')
    if (name) {
      setValue('slug', name.toLowerCase().replace(/\s+/g, '-'))
    }
  }
}
```

## Controller для кастомных компонентов

`register` работает только с нативными input. Для кастомных компонентов (date picker, select из UI-библиотеки) используйте `Controller`:

```tsx
import { Controller } from 'react-hook-form'

function ProductForm() {
  const { control, handleSubmit } = useForm<ProductForm>()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Выберите категорию' }}
        render={({ field, fieldState }) => (
          <CustomSelect
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'electronics', label: 'Электроника' },
              { value: 'clothing', label: 'Одежда' },
              { value: 'books', label: 'Книги' },
            ]}
            error={fieldState.error?.message}
          />
        )}
      />
    </form>
  )
}
```

## useFieldArray — динамические поля

Для списков (несколько телефонов, несколько адресов):

```tsx
import { useForm, useFieldArray } from 'react-hook-form'

interface RecipeForm {
  title: string
  ingredients: { name: string; amount: string }[]
}

function RecipeForm() {
  const { register, control, handleSubmit } = useForm<RecipeForm>({
    defaultValues: {
      title: '',
      ingredients: [{ name: '', amount: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title', { required: true })} placeholder="Название" />

      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`ingredients.${index}.name`)} placeholder="Ингредиент" />
          <input {...register(`ingredients.${index}.amount`)} placeholder="Количество" />
          <button type="button" onClick={() => remove(index)}>×</button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '', amount: '' })}>
        + Добавить ингредиент
      </button>

      <button type="submit">Сохранить</button>
    </form>
  )
}
```

## Форма с UI-библиотекой (Shadcn/ui)

```tsx
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

function SearchForm() {
  const { register, handleSubmit } = useForm<{ query: string }>()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))} className="flex gap-2">
      <Label htmlFor="query" className="sr-only">Поиск</Label>
      <Input id="query" {...register('query', { required: true })} placeholder="Поиск..." />
      <Button type="submit">Найти</Button>
    </form>
  )
}
```

## Основные методы

| Метод | Назначение |
|-------|-----------|
| `register` | Связать нативный input с формой |
| `handleSubmit` | Обработчик submit с валидацией |
| `watch` | Следить за значениями в реальном времени |
| `setValue` | Программно установить значение |
| `getValues` | Получить текущие значения |
| `reset` | Сбросить форму к начальным значениям |
| `setError` | Установить ошибку вручную |
| `trigger` | Запустить валидацию программно |
| `control` | Для использования с Controller |

## Итог

React Hook Form — стандарт де-факто для форм в React. Минимальные ре-рендеры, гибкая валидация (встроенная или через Zod), удобная работа с динамическими полями. В связке с `@hookform/resolvers` и Zod получается типобезопасная валидация с минимальным boilerplate.
