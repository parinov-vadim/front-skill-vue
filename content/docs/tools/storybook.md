---
title: "Storybook: разработка и документация UI-компонентов"
description: "Storybook — инструмент для изолированной разработки, тестирования и документирования UI-компонентов. Настройка, stories, addons,interaction testing и публикация."
section: tools
difficulty: intermediate
readTime: 14
order: 12
tags: [storybook, ui, components, testing, documentation, design-system]
---

## Что такое Storybook

Storybook — это инструмент для разработки UI-компонентов в изоляции. Вы можете создавать, тестировать и документировать компоненты без необходимости запускать всё приложение.

Зачем Storybook:
- **Изолированная разработка** — не нужно настраивать всю страницу, чтобы отладить кнопку
- **Визуальная документация** — все компоненты с примерами в одном месте
- **Дизайн-система** — единая библиотека компонентов для команды
- **Визуальное тестирование** — скриншот-тесты для отслеживания изменений
- **Interaction testing** — тестирование кликов, ввода, навигации прямо в Storybook

Storybook поддерживает React, Vue, Angular, Svelte, Web Components и другие фреймворки.

## Установка

### С нуля

```bash
npx storybook@latest init
```

Команда:
1. Установит `@storybook/*` пакеты
2. Создаст папку `.storybook/` с конфигурацией
3. Создаст папку `src/stories/` с примерами
4. Добавит скрипты в `package.json`

### В существующий проект (Vite + Vue)

```bash
npx storybook@latest init --builder=vite
```

### Скрипты

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

```bash
npm run storybook                      # Запустить dev-сервер (http://localhost:6006)
npm run build-storybook                # Собрать статическую версию
```

## Структура проекта

```
my-app/
  .storybook/
    main.ts                            # Основная конфигурация
    preview.ts                         # Глобальный декоратор и параметры
  src/
    components/
      Button.vue
      Card.vue
      Modal.vue
    stories/
      Button.stories.ts                # Stories для Button
      Card.stories.ts
    composables/
      useTheme.ts
    stories/
      useTheme.stories.ts
```

## Конфигурация

### main.ts

```ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

### preview.ts

```ts
import type { Preview } from '@storybook/vue3'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
      ],
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="padding: 1rem"><story /></div>',
    }),
  ],
}

export default preview
```

## Написание Stories

Story (история) — это одно состояние компонента. Кнопка может иметь stories: default, hover, disabled, loading.

### Vue-компонент

```vue
<!-- src/components/BaseButton.vue -->
<script setup lang="ts">
interface Props {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner" />
    {{ label }}
  </button>
</template>
```

### Story-файл

```ts
// src/stories/BaseButton.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import BaseButton from '../components/BaseButton.vue'

type Story = StoryObj<typeof BaseButton>

const meta: Meta<typeof BaseButton> = {
  title: 'Components/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
  },
  args: {
    label: 'Нажми меня',
    variant: 'primary',
    size: 'md',
  },
}

export default meta

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    label: 'Delete',
    variant: 'danger',
  },
}

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Large Button',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    label: 'Loading...',
    loading: true,
  },
}
```

### Stories для composables

```ts
// src/stories/useCounter.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => { count.value++ }
  const decrement = () => { count.value-- }
  const reset = () => { count.value = initial }
  return { count, increment, decrement, reset }
}

const meta: Meta = {
  title: 'Composables/useCounter',
}

export default meta

export const Default: StoryObj = {
  render: () => ({
    setup() {
      const { count, increment, decrement, reset } = useCounter()
      return { count, increment, decrement, reset }
    },
    template: `
      <div>
        <p>Count: {{ count }}</p>
        <button @click="increment">+</button>
        <button @click="decrement">-</button>
        <button @click="reset">Reset</button>
      </div>
    `,
  }),
}
```

## CSF 3.0 (Component Story Format)

Современный формат — компактный, типобезопасный:

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import UserCard from '../components/UserCard.vue'

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  args: {
    name: 'Анна Иванова',
    role: 'Frontend Developer',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
}

export default meta
type Story = StoryObj<typeof UserCard>

export const Default: Story = {}

export const WithoutAvatar: Story = {
  args: { avatar: undefined },
}

export const LongName: Story = {
  args: { name: 'Очень Длинное Имя Для Проверки Переполнения Содержимого' },
}
```

## Addons (Плагины)

### @storybook/addon-essentials

Включает 6 плагинов одним пакетом:
- **Controls** — изменение props в реальном времени (панель справа)
- **Actions** — логирование событий (клики, эмиты)
- **Viewport** — переключение размеров экрана (mobile, tablet, desktop)
- **Backgrounds** — переключение цвета фона
- **Toolbars** — глобальные переключатели (тема, язык)
- **Measure & Outline** — инспектирование отступов и размеров

### @storybook/addon-interactions

Тестирование взаимодействий (клики, ввод) прямо в Storybook:

```bash
npm install -D @storybook/addon-interactions @storybook/test
```

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within, expect } from '@storybook/test'
import SearchForm from '../components/SearchForm.vue'

const meta: Meta<typeof SearchForm> = {
  title: 'Components/SearchForm',
  component: SearchForm,
}

export default meta

export const SearchInteraction: StoryObj<typeof SearchForm> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByPlaceholderText('Поиск...')
    await userEvent.type(input, 'Vue.js')

    const button = canvas.getByRole('button', { name: /найти/i })
    await userEvent.click(button)

    const result = canvas.getByText('Результаты для: Vue.js')
    await expect(result).toBeInTheDocument()
  },
}
```

### @storybook/addon-a11y

Проверка доступности (accessibility):

```bash
npm install -D @storybook/addon-a11y
```

```ts
// .storybook/main.ts
addons: ['@storybook/addon-a11y'],
```

Добавляет панель Accessibility, которая показывает нарушения WCAG: недостаточный контраст, отсутствующие aria-метки, неправильная семантика.

## Decorators

Декораторы оборачивают story в дополнительный контекст (провайдеры, стили, роутер).

### Глобальный декоратор

```ts
// .storybook/preview.ts
import { theme } from '../src/theme'

export const decorators = [
  (story) => ({
    components: { story },
    template: `
      <div :style="{ fontFamily: theme.fontFamily, padding: '2rem' }">
        <story />
      </div>
    `,
    setup() {
      return { theme }
    },
  }),
]
```

### Декоратор для конкретной story

```ts
export const InModal: Story = {
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
          <story />
        </div>
      `,
    }),
  ],
}
```

## Autodocs

При `tags: ['autodocs']` Storybook автоматически генерирует страницу документации для компонента:
- Описание (из JSDoc-комментариев)
- Таблица Props (типы, значения по умолчанию)
- Таблица Events
- Все stories в виде превью
- Исходный код

Можно добавить описание:

```ts
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Базовая кнопка с поддержкой вариантов, размеров и состояния загрузки.',
      },
    },
  },
}
```

## Публикация

### Статическая сборка

```bash
npm run build-storybook
```

Результат — папка `storybook-static/` с HTML/CSS/JS. Можно развернуть на любом хостинге.

### Chromatic

Chromatic (от команды Storybook) — сервис для публикации и визуального тестирования:

```bash
npx chromatic --project-token=<your-token>
```

Для каждого PR Chromatic:
1. Собирает Storybook
2. Делает скриншоты всех stories
3. Сравнивает с предыдущей версией
4. Показывает визуальные различия

### Vercel / Netlify

```bash
# Vercel
npx vercel storybook-static/

# Netlify
npx netlify deploy --dir=storybook-static --prod
```

## Интеграция с дизайном

### Design Addon

Позволяет встроить Figma-макет прямо в Storybook:

```bash
npm install -D @storybook/addon-designs
```

```ts
// .storybook/main.ts
addons: ['@storybook/addon-designs'],
```

```ts
export const Default: Story = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/abc123?node-id=1-100',
    },
  },
}
```

Кнопка «Design» в панели покажет Figma-макет рядом с компонентом.

## Практика: создание дизайн-системы

```
src/
  components/
    ui/
      BaseButton.vue
      BaseInput.vue
      BaseCard.vue
      BaseModal.vue
      BaseBadge.vue
      BaseAvatar.vue
      BaseTooltip.vue
    layout/
      AppHeader.vue
      AppSidebar.vue
      AppFooter.vue
  stories/
    ui/
      BaseButton.stories.ts
      BaseInput.stories.ts
      BaseCard.stories.ts
      ...
    layout/
      AppHeader.stories.ts
      ...
```

Каждый компонент имеет:
- Stories со всеми вариантами
- Autodocs для документации
- Interaction tests для поведения
- A11y-проверку

Storybook становится единой документацией и витриной дизайн-системы.

## Итог

- Storybook — среда для разработки, тестирования и документирования UI-компонентов
- **Stories** — состояния компонента (default, disabled, loading, error)
- **Autodocs** — автоматическая документация с таблицей Props и Events
- **Addons** расширяют возможности: Controls, Interactions, A11y, Viewport
- **Interaction testing** — тестирование кликов и ввода прямо в Storybook
- Подходит для создания дизайн-систем и библиотек компонентов
- Работает с Vue, React, Angular, Svelte
