---
title: Динамические и асинхронные компоненты Vue
description: "Динамические компоненты через <component :is=\"\"> и асинхронная загрузка через defineAsyncComponent. Паттерны lazy loading и keep-alive."
section: vue
difficulty: intermediate
readTime: 8
order: 12
tags: [Vue 3, dynamic components, defineAsyncComponent, keep-alive, lazy loading]
---

## Динамические компоненты

`<component :is="">` рендерит компонент по условию или переменной:

```vue
<script setup lang="ts">
import TabHome from './TabHome.vue'
import TabProfile from './TabProfile.vue'
import TabSettings from './TabSettings.vue'

const currentTab = ref('home')

const tabs = {
  home: TabHome,
  profile: TabProfile,
  settings: TabSettings,
}
</script>

<template>
  <div class="tabs">
    <button
      v-for="(component, key) in tabs"
      :key="key"
      @click="currentTab = key"
      :class="{ active: currentTab === key }"
    >
      {{ key }}
    </button>
  </div>

  <component :is="tabs[currentTab]" />
</template>
```

`:is` принимает:
- Строку с именем зарегистрированного компонента
- Объект компонента (import)
- Объект из `defineAsyncComponent`

### Переключение по строковому имени

Если компоненты зарегистрированы глобально:

```ts
app.component('TabHome', TabHome)
app.component('TabProfile', TabProfile)
```

```vue
<component :is="currentTab" />
```

### Вместо v-if / v-else-if

Длинная цепочка условий:

```vue
<!-- До -->
<UserAdmin v-if="role === 'admin'" />
<UserEditor v-else-if="role === 'editor'" />
<UserViewer v-else />

<!-- После -->
<component :is="roleComponents[role]" />
```

```ts
const roleComponents = {
  admin: UserAdmin,
  editor: UserEditor,
  viewer: UserViewer,
}
```

## KeepAlive

По умолчанию при переключении динамического компонента старый уничтожается. `<KeepAlive>` кэширует экземпляр:

```vue
<KeepAlive>
  <component :is="tabs[currentTab]" />
</KeepAlive>
```

Теперь состояние (введённый текст, прокрутка, данные) сохраняется при переключении вкладок.

### include / exclude

Ограничение кэширования:

```vue
<KeepAlive include="TabHome,TabProfile">
  <component :is="tabs[currentTab]" />
</KeepAlive>

<KeepAlive :include="/^Tab/">
  <component :is="tabs[currentTab]" />
</KeepAlive>

<KeepAlive :include="['TabHome', 'TabProfile']">
  <component :is="tabs[currentTab]" />
</KeepAlive>
```

### max

Максимальное количество кэшированных компонентов:

```vue
<KeepAlive :max="5">
  <component :is="current" />
</KeepAlive>
```

При превышении удаляется наименее используемый (LRU).

### Жизненный цикл KeepAlive

Кэшированные компоненты получают два дополнительных хука:

```vue
<script setup lang="ts">
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('Компонент активирован (показан)')
})

onDeactivated(() => {
  console.log('Компонент деактивирован (скрыт)')
})
</script>
```

Используйте `onActivated` для обновления данных при возвращении на вкладку.

## defineAsyncComponent

Асинхронная загрузка компонента — он не войдёт в основной бандл и загрузится при первом использовании:

```ts
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))
```

### С опциями

```ts
const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),

  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,

  delay: 200,
  timeout: 10000,

  onError(error, retry, fail, attempts) {
    if (error.message.includes('Failed') && attempts <= 3) {
      retry()
    } else {
      fail()
    }
  },
})
```

| Опция | Описание |
|-------|----------|
| `loader` | Функция, возвращающая `import()` |
| `loadingComponent` | Компонент загрузки |
| `errorComponent` | Компонент ошибки |
| `delay` | Задержка перед показом loading (мс) |
| `timeout` | Таймаут загрузки (мс) |
| `onError` | Обработчик ошибки (с retry/fail) |

### Асинхронный компонент + Suspense

```vue
<Suspense>
  <template #default>
    <HeavyChart />
  </template>
  <template #fallback>
    <div>Загрузка графика...</div>
  </template>
</Suspense>
```

## Практические примеры

### Табы с кэшированием

```vue
<script setup lang="ts">
import { ref } from 'vue'

type TabKey = 'overview' | 'details' | 'history'

const activeTab = ref<TabKey>('overview')

const tabComponents = {
  overview: defineAsyncComponent(() => import('./tabs/OverviewTab.vue')),
  details: defineAsyncComponent(() => import('./tabs/DetailsTab.vue')),
  history: defineAsyncComponent(() => import('./tabs/HistoryTab.vue')),
}
</script>

<template>
  <div class="tab-bar">
    <button
      v-for="(comp, key) in tabComponents"
      :key="key"
      :class="{ active: activeTab === key }"
      @click="activeTab = key"
    >
      {{ key }}
    </button>
  </div>

  <KeepAlive>
    <component :is="tabComponents[activeTab]" />
  </KeepAlive>
</template>
```

### Condition-based rendering

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  blockType: 'text' | 'image' | 'video' | 'code' | 'quote'
}>()

const blocks = {
  text: defineAsyncComponent(() => import('./blocks/TextBlock.vue')),
  image: defineAsyncComponent(() => import('./blocks/ImageBlock.vue')),
  video: defineAsyncComponent(() => import('./blocks/VideoBlock.vue')),
  code: defineAsyncComponent(() => import('./blocks/CodeBlock.vue')),
  quote: defineAsyncComponent(() => import('./blocks/QuoteBlock.vue')),
}
</script>

<template>
  <component :is="blocks[blockType]" v-bind="$attrs" />
</template>
```

### Dashboard с виджетами

```vue
<script setup lang="ts">
interface Widget {
  id: string
  type: 'stats' | 'chart' | 'table' | 'map'
  config: Record<string, unknown>
}

const widgets = ref<Widget[]>([])

const widgetComponents = {
  stats: defineAsyncComponent(() => import('./widgets/StatsWidget.vue')),
  chart: defineAsyncComponent(() => import('./widgets/ChartWidget.vue')),
  table: defineAsyncComponent(() => import('./widgets/TableWidget.vue')),
  map: defineAsyncComponent(() => import('./widgets/MapWidget.vue')),
}
</script>

<template>
  <div class="dashboard-grid">
    <div v-for="widget in widgets" :key="widget.id">
      <Suspense>
        <template #default>
          <component
            :is="widgetComponents[widget.type]"
            :config="widget.config"
          />
        </template>
        <template #fallback>
          <WidgetSkeleton />
        </template>
      </Suspense>
    </div>
  </div>
</template>
```

## Итог

`<component :is="">` рендерит компонент динамически. `<KeepAlive>` кэширует состояние при переключении. `defineAsyncComponent` загружает компонент по требованию, сокращая начальный бандл. Комбинируя все три, можно строить гибкие интерфейсы — табы, дашборды, контентные блоки — с минимальным расходом памяти и быстрым первым экраном.
