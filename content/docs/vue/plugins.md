---
title: Плагины во Vue 3
description: "Создание и использование плагинов Vue — app.use(), provide/inject, директивы, миксины и реальные примеры: toast-плагин, i18n, аналитика."
section: vue
difficulty: intermediate
readTime: 10
order: 13
tags: [Vue 3, plugins, app.use, provide, inject, global properties]
---

## Что такое плагин

Плагин — объект с методом `install()` или функция, которая вызывается при `app.use()`. Плагины добавляют глобальную функциональность: компоненты, директивы, provide/inject, глобальные свойства.

## Базовый плагин

### Объект с install

```ts
// plugins/myPlugin.ts
import type { App } from 'vue'

export default {
  install(app: App, options?: { prefix?: string }) {
    const prefix = options?.prefix ?? 'App'

    app.provide('appName', prefix)

    app.config.globalProperties.$appName = prefix
  },
}
```

### Функция

```ts
export default function myPlugin(app: App, options?: { prefix?: string }) {
  app.provide('appName', options?.prefix ?? 'App')
}
```

### Подключение

```ts
import myPlugin from './plugins/myPlugin'

app.use(myPlugin, { prefix: 'FrontSkill' })
```

## Что может делать плагин

- Регистрировать глобальные компоненты
- Регистрировать директивы
- Предоставлять данные через `provide`
- Добавлять глобальные свойства
- Настраивать `app.config`
- Использовать `onUnmounted` / `onScopeDispose`

## Примеры плагинов

### Toast-плагин

```ts
// plugins/toast.ts
import type { App } from 'vue'
import { ref } from 'vue'
import ToastContainer from '@/components/ToastContainer.vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export function createToastPlugin() {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function add(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    install(app: App) {
      app.provide('toast', { add })
      app.component('ToastContainer', ToastContainer)
    },
    toasts,
  }
}
```

```ts
// main.ts
import { createToastPlugin } from './plugins/toast'

const toast = createToastPlugin()
app.use(toast)
```

Использование в компоненте:

```ts
const toast = inject('toast') as { add: (message: string, type?: string) => void }

toast.add('Сохранено!', 'success')
toast.add('Ошибка', 'error')
```

### i18n-плагин

```ts
// plugins/i18n.ts
import type { App } from 'vue'
import { ref, computed } from 'vue'

export function createI18n(messages: Record<string, Record<string, string>>) {
  const locale = ref('ru')

  function t(key: string): string {
    return messages[locale.value]?.[key] ?? key
  }

  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  return {
    install(app: App) {
      app.provide('i18n', { t, locale, setLocale })
    },
  }
}
```

```ts
// main.ts
import { createI18n } from './plugins/i18n'

const i18n = createI18n({
  ru: {
    greeting: 'Привет',
    logout: 'Выйти',
  },
  en: {
    greeting: 'Hello',
    logout: 'Log out',
  },
})

app.use(i18n)
```

### Analytics-плагин

```ts
// plugins/analytics.ts
import type { App } from 'vue'
import { ref } from 'vue'

interface AnalyticsOptions {
  trackingId: string
  debug?: boolean
}

export default {
  install(app: App, options: AnalyticsOptions) {
    const enabled = ref(true)

    function track(event: string, data?: Record<string, unknown>) {
      if (!enabled.value) return

      if (options.debug) {
        console.log(`[Analytics] ${event}`, data)
      }

      // Отправка в Google Analytics / Yandex Metrica / etc.
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, data)
      }
    }

    function disable() {
      enabled.value = false
    }

    app.provide('analytics', { track, disable })
  },
}
```

### Плагин с директивой

```ts
// plugins/clickOutside.ts
import type { App, Directive, DirectiveBinding } from 'vue'

const vClickOutside: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<(...args: any[]) => void>) {
    function handleClick(event: Event) {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }

    document.addEventListener('click', handleClick)
    ;(el as any).__clickOutside = = handleClick
  },

  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any).__clickOutside)
  },
}

export default {
  install(app: App) {
    app.directive('click-outside', vClickOutside)
  },
}
```

```vue
<template>
  <div v-click-outside="close" class="dropdown">
    <ul>...</ul>
  </div>
</template>
```

### Плагин с глобальными компонентами

```ts
// plugins/ui.ts
import type { App } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseCard from '@/components/BaseCard.vue'

export default {
  install(app: App) {
    app.component('BaseButton', BaseButton)
    app.component('BaseInput', BaseInput)
    app.component('BaseModal', BaseModal)
    app.component('BaseCard', BaseCard)
  },
}
```

```ts
// main.ts
import UIPlugin from './plugins/ui'
app.use(UIPlugin)
```

Теперь эти компоненты доступны везде без импортов.

## Типизация глобальных свойств

Когда плагин добавляет свойства в `globalProperties`:

```ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $appName: string
    $toast: {
      add: (message: string, type?: string) => void
    }
  }
}
```

## provide/inject с Symbol-ключами

Лучше использовать Symbol, чтобы избежать коллизий:

```ts
// plugins/toast.ts
export const ToastKey = Symbol('toast')

// В плагине
app.provide(ToastKey, { add })

// В компоненте
const toast = inject(ToastKey)!
```

С типизацией:

```ts
export const ToastKey: InjectionKey<{
  add: (message: string, type?: 'success' | 'error' | 'info') => void
}> = Symbol('toast')
```

## Порядок регистрации

Плагины применяются в порядке вызова `app.use()`:

```ts
app.use(pinia)      // Сначала Pinia — хранилище
app.use(router)     // Потом Router — маршрутизация
app.use(i18n)       // Потом i18n — переводы
app.use(toast)      // Потом Toast — уведомления
```

Pinia должна быть подключена до stores, которые используются в guards роутера.

## Итог

Плагины — способ добавить глобальную функциональность в Vue-приложение. Используйте `provide/inject` вместо `globalProperties` для лучшей типизации. Symbol-ключи защищают от коллизий. Плагины могут регистрировать компоненты, директивы и composables. Типизируйте глобальные свойства через `ComponentCustomProperties`.
