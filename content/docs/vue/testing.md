---
title: Тестирование Vue — Vitest + Vue Test Utils
description: Тестирование Vue-компонентов с Vitest и Vue Test Utils. Unit-тесты, монтирование, взаимодействие, mock-и, тестирование composables и Pinia stores.
section: vue
difficulty: intermediate
readTime: 14
order: 16
tags: [Vue 3, Vitest, testing, Vue Test Utils, unit tests]
---

## Настройка

### Установка

```bash
npm install -D vitest @vue/test-utils @testing-library/vue happy-dom
```

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Vue Test Utils — основы

### mount

`mount` создаёт полноценный экземпляр компонента:

```ts
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

test('счётчик увеличивается', async () => {
  const wrapper = mount(Counter)

  expect(wrapper.text()).toContain('0')

  await wrapper.find('button').trigger('click')

  expect(wrapper.text()).toContain('1')
})
```

### shallowMount

`shallowMount` рендерит только сам компонент, заменяя дочерние заглушками:

```ts
import { shallowMount } from '@vue/test-utils'
import Dashboard from './Dashboard.vue'

test('рендерит Dashboard без дочерних компонентов', () => {
  const wrapper = shallowMount(Dashboard)

  expect(wrapper.findComponent(HeavyChart).exists()).toBe(true)
})
```

Полезно для изолированного тестирования одного компонента.

### Props

```ts
test('отображает title из props', () => {
  const wrapper = mount(TitleBar, {
    props: {
      title: 'Привет',
    },
  })

  expect(wrapper.text()).toContain('Привет')
})
```

Обновление props:

```ts
await wrapper.setProps({ title: 'Новый заголовок' })
expect(wrapper.text()).toContain('Новый заголовок')
```

### Emits

```ts
test('эмитит событие при клике', async () => {
  const wrapper = mount(Button, {
    props: {
      label: 'Кликни',
    },
  })

  await wrapper.find('button').trigger('click')

  expect(wrapper.emitted()).toHaveProperty('click')
  expect(wrapper.emitted('click')).toHaveLength(1)
})
```

Эмит с payload:

```ts
await wrapper.find('input').setValue('hello')
expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
```

### Slots

```ts
test('рендерит slot', () => {
  const wrapper = mount(Card, {
    slots: {
      default: 'Контент карточки',
      header: '<h2>Заголовок</h2>',
    },
  })

  expect(wrapper.text()).toContain('Контент карточки')
  expect(wrapper.html()).toContain('<h2>Заголовок</h2>')
})
```

### Find и findAll

```ts
const button = wrapper.find('button')
const items = wrapper.findAll('li')

expect(items).toHaveLength(3)
expect(items[0].text()).toBe('Первый')
```

По data-testid:

```ts
const input = wrapper.find('[data-testid="email-input"]')
```

### Trigger

```ts
await wrapper.find('button').trigger('click')
await wrapper.find('input').trigger('input')
await wrapper.find('form').trigger('submit.prevent')
```

Клавиатура:

```ts
await wrapper.find('input').trigger('keydown.enter')
await wrapper.find('input').trigger('keydown', { key: 'Escape' })
```

### setValue

```ts
await wrapper.find('input').setValue('новое значение')
await wrapper.find('select').setValue('option1')
await wrapper.find('input[type="checkbox"]').setValue(true)
```

## Тестирование composables

Composable без DOM можно тестировать как обычную функцию:

```ts
import { useCounter } from './useCounter'

test('useCounter', () => {
  const { count, doubled, increment } = useCounter(5)

  expect(count.value).toBe(5)
  expect(doubled.value).toBe(10)

  increment()
  expect(count.value).toBe(6)
  expect(doubled.value).toBe(12)
})
```

Composable с DOM (onMounted, addEventListener) оборачиваем в компонент:

```ts
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMouse } from './useMouse'

test('useMouse отслеживает позицию', async () => {
  const TestComponent = defineComponent({
    setup() {
      const { x, y } = useMouse()
      return { x, y }
    },
    template: '<div>{{ x }}, {{ y }}</div>',
  })

  const wrapper = mount(TestComponent)

  await wrapper.trigger('mousemove', { clientX: 100, clientY: 200 })

  expect(wrapper.text()).toContain('100')
})
```

## Тестирование Pinia

### createTestingPinia

```bash
npm install -D @pinia/testing
```

```ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import Cart from './Cart.vue'

test('корзина отображает товары', () => {
  const wrapper = mount(Cart, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            cart: {
              items: [
                { id: 1, name: 'Товар', price: 100, quantity: 2 },
              ],
            },
          },
        }),
      ],
    },
  })

  expect(wrapper.text()).toContain('Товар')
  expect(wrapper.text()).toContain('200')
})
```

### Мокирование actions

```ts
test('checkout вызывает store action', async () => {
  const wrapper = mount(Cart, {
    global: {
      plugins: [createTestingPinina()],
    },
  })

  const store = useCartStore()

  await wrapper.find('[data-testid="checkout"]').trigger('click')

  expect(store.checkout).toHaveBeenCalledTimes(1)
})
```

С `createTestingPinia` все actions автоматически заменяются на stubs (spy-функции).

## Тестирование роутера

```ts
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

test('навигация на страницу about', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/about', component: { template: '<div>About</div>' } },
    ],
  })

  await router.push('/about')
  await router.isReady()

  const wrapper = mount(NavBar, {
    global: {
      plugins: [router],
    },
  })

  expect(wrapper.text()).toContain('About')
})
```

## Mock-и

### Мокирование API

```ts
import { vi } from 'vitest'

test('загрузка пользователей', async () => {
  const mockUsers = [
    { id: 1, name: 'Анна' },
    { id: 2, name: 'Иван' },
  ]

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockUsers),
  })

  const wrapper = mount(UserList)
  await flushPromises()

  expect(wrapper.text()).toContain('Анна')
  expect(wrapper.text()).toContain('Иван')
})
```

### Мокирование модулей

```ts
vi.mock('@/api/users', () => ({
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Анна' },
  ]),
}))
```

### Мокирование composables

```ts
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ name: 'Тестовый пользователь' }),
    isLoggedIn: ref(true),
  }),
}))
```

## Snapshot-тесты

```ts
test('рендер UserCard', () => {
  const wrapper = mount(UserCard, {
    props: {
      user: { id: 1, name: 'Анна', email: 'anna@mail.ru' },
    },
  })

  expect(wrapper.html()).toMatchSnapshot()
})
```

При первом запуске Vitest создаст файл `__snapshots__/UserCard.test.ts.snap`. При последующих — будет сравнивать с ним. Если изменилось — обновите: `vitest -u`.

## Структура тестов

```
src/
├── components/
│   ├── Button.vue
│   └── __tests__/
│       └── Button.test.ts
├── composables/
│   ├── useCounter.ts
│   └── __tests__/
│       └── useCounter.test.ts
└── stores/
    ├── cart.ts
    └── __tests__/
        └── cart.test.ts
```

Или рядом с файлом:

```
src/
├── components/
│   ├── Button.vue
│   └── Button.test.ts
```

## Итог

Vitest + Vue Test Utils — стандартный набор для тестирования Vue. `mount` для полного рендера, `shallowMount` для изоляции. Тестируйте props, emits, slots, interactions. Composables без DOM можно тестировать напрямую. `createTestingPinia` мокирует stores. `vi.mock` подменяет модули. Snapshot-тесты контролируют HTML-вывод.
