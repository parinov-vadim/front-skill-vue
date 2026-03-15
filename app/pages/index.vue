<script setup lang="ts">
useHead({
  title: 'FrontSkill — Задачи по фронтенд-разработке | HTML, CSS, JavaScript, Vue, React',
  meta: [
    {
      name: 'description',
      content: 'Практикуйте HTML, CSS, JavaScript, TypeScript, Vue и React на реальных задачах с живым превью в браузере. Бесплатная платформа для подготовки к фронтенд-собеседованиям.',
    },
    {
      name: 'keywords',
      content: 'фронтенд задачи, задачи по css, задачи по javascript, практика программирования, подготовка к собеседованию фронтенд, leetcode frontend, html css js практика, typescript задачи, vue задачи, react задачи',
    },
    { property: 'og:title', content: 'FrontSkill — Задачи по фронтенд-разработке' },
    {
      property: 'og:description',
      content: 'Реальные задачи по HTML, CSS, JS, TS, Vue и React. Живой предпросмотр. Полностью бесплатно.',
    },
    { property: 'og:type', content: 'website' },
  ],
})

const stats = [
  { value: '500+', label: 'Задач' },
  { value: '12 000', label: 'Разработчиков' },
  { value: '14', label: 'Технологий' },
  { value: '87%', label: 'Отмечают рост навыков' },
]

const categories = [
  { icon: 'i-lucide-layout', name: 'CSS-раскладки', count: 84, tag: 'css' },
  { icon: 'i-lucide-mouse-pointer-click', name: 'JavaScript DOM', count: 97, tag: 'js' },
  { icon: 'i-lucide-shield-check', name: 'TypeScript', count: 62, tag: 'ts' },
  { icon: 'i-lucide-component', name: 'Vue-компоненты', count: 51, tag: 'vue' },
  { icon: 'i-lucide-atom', name: 'React-паттерны', count: 48, tag: 'react' },
  { icon: 'i-lucide-zap', name: 'Анимации', count: 39, tag: 'css' },
  { icon: 'i-lucide-accessibility', name: 'Доступность', count: 28, tag: 'a11y' },
  { icon: 'i-lucide-gauge', name: 'Производительность', count: 33, tag: 'js' },
]

const tagStyles: Record<string, { color: string, bg: string }> = {
  css:   { color: 'var(--tag-css)',    bg: 'var(--tag-css-bg)' },
  js:    { color: 'var(--tag-js)',     bg: 'var(--tag-js-bg)' },
  ts:    { color: 'var(--tag-ts)',     bg: 'var(--tag-ts-bg)' },
  vue:   { color: 'var(--tag-vue)',    bg: 'var(--tag-vue-bg)' },
  react: { color: 'var(--tag-react)',  bg: 'var(--tag-react-bg)' },
  a11y:  { color: 'var(--tag-a11y)',   bg: 'var(--tag-a11y-bg)' },
}

const steps = [
  {
    num: '01',
    title: 'Выбери задачу',
    desc: 'Фильтруй по технологии, уровню сложности или теме. Каждая задача — это реальный сценарий из разработки.',
    icon: 'i-lucide-search',
  },
  {
    num: '02',
    title: 'Напиши код',
    desc: 'Редактор прямо в браузере. HTML, CSS, JS, TypeScript — без установки окружения.',
    icon: 'i-lucide-code-2',
  },
  {
    num: '03',
    title: 'Сравни решения',
    desc: 'Посмотри как решили другие. Найди более элегантный подход и разбери альтернативы.',
    icon: 'i-lucide-git-compare',
  },
]

const featuredTasks = [
  {
    id: 42,
    title: 'Адаптивная карточка товара',
    desc: 'Сверстайте карточку товара, которая корректно отображается на мобильных, планшетах и десктопе.',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    acceptance: '81%',
    solutions: 9320,
    tags: [
      { name: 'CSS', style: { color: 'var(--tag-css)', background: 'var(--tag-css-bg)' } },
      { name: 'HTML', style: { color: 'var(--tag-html)', background: 'var(--tag-html-bg)' } },
    ],
  },
  {
    id: 107,
    title: 'Debounce с нуля',
    desc: 'Реализуйте функцию debounce без использования библиотек. Примените к полю поиска.',
    difficulty: 'medium',
    difficultyLabel: 'Средне',
    acceptance: '58%',
    solutions: 5140,
    tags: [
      { name: 'JavaScript', style: { color: 'var(--tag-js)', background: 'var(--tag-js-bg)' } },
      { name: 'TypeScript', style: { color: 'var(--tag-ts)', background: 'var(--tag-ts-bg)' } },
    ],
  },
  {
    id: 213,
    title: 'Реактивный стейт-менеджер',
    desc: 'Создайте минималистичный менеджер состояния с подписками и batch-обновлениями.',
    difficulty: 'hard',
    difficultyLabel: 'Сложно',
    acceptance: '24%',
    solutions: 1870,
    tags: [
      { name: 'TypeScript', style: { color: 'var(--tag-ts)', background: 'var(--tag-ts-bg)' } },
      { name: 'Vue', style: { color: 'var(--tag-vue)', background: 'var(--tag-vue-bg)' } },
    ],
  },
]

const roadmap = [
  {
    level: 'Новичок',
    range: '0–30 задач',
    color: 'easy',
    skills: ['Box model', 'Flexbox', 'Селекторы CSS', 'DOM-события', 'Fetch API'],
  },
  {
    level: 'Junior',
    range: '30–100 задач',
    color: 'medium',
    skills: ['CSS Grid', 'Анимации', 'Promises / async', 'TypeScript basics', 'Vue / React SFC'],
  },
  {
    level: 'Middle',
    range: '100–250 задач',
    color: 'hard',
    skills: ['Custom hooks', 'Web Workers', 'Canvas / SVG', 'Оптимизация', 'Доступность'],
  },
  {
    level: 'Senior',
    range: '250+ задач',
    color: 'expert',
    skills: ['Virtual DOM', 'Компиляторы', 'SSR / Hydration', 'CSP / Security', 'Design systems'],
  },
]

const leaderboard = [
  { rank: 1, name: 'aleksei_dev', solved: 487, country: '🇷🇺', streak: 42 },
  { rank: 2, name: 'css_witch',   solved: 431, country: '🇧🇾', streak: 28 },
  { rank: 3, name: 'ts_enjoyer',  solved: 398, country: '🇺🇦', streak: 17 },
  { rank: 4, name: 'vue_master',  solved: 362, country: '🇷🇺', streak: 35 },
  { rank: 5, name: 'flexbox_god', solved: 341, country: '🇰🇿', streak: 11 },
]
</script>

<template>
  <div>
    <!-- ─────────────────────────────────────────
         1. HERO
    ───────────────────────────────────────── -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] bg-violet-500/6 dark:bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-10 sm:pb-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

        <!-- Left: text -->
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-sm font-medium mb-5 sm:mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Полностью бесплатно
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 sm:mb-5">
            Фронтенд-задачи,<br>
            которые <span class="text-violet-600 dark:text-violet-400">действительно</span><br>
            прокачивают
          </h1>

          <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-7 sm:mb-8 max-w-md">
            Практикуйте HTML, CSS, JavaScript и TypeScript на реальных задачах. Пишите код — видите результат сразу в браузере.
          </p>

          <div class="flex items-center gap-3 flex-wrap">
            <UButton to="/tasks" label="Начать решать" color="primary" size="lg" icon="i-lucide-arrow-right" trailing />
            <UButton to="/auth/register" label="Создать аккаунт" variant="outline" color="neutral" size="lg" />
          </div>

          <p class="mt-4 text-sm text-zinc-400">
            Уже <strong class="text-zinc-600 dark:text-zinc-300">12 000+</strong> разработчиков прокачиваются на FrontSkill
          </p>
        </div>

        <!-- Right: product mockup — visible from lg, simplified on md, hidden on mobile -->
        <div class="relative hidden sm:block">
          <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-violet-950/30">
            <!-- Toolbar -->
            <div class="flex items-center gap-1.5 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <span class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div class="ml-3 flex gap-1">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">Задание</span>
                <span class="px-2.5 py-0.5 rounded-md text-xs font-medium bg-violet-600 text-white">Редактор</span>
                <span class="px-2.5 py-0.5 rounded-md text-xs font-medium text-zinc-400">Результат</span>
              </div>
              <UButton label="Запустить" size="xs" color="primary" icon="i-lucide-play" class="ml-auto" />
            </div>

            <!-- Code + Preview split -->
            <div class="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
              <div class="p-4 font-mono text-xs leading-relaxed overflow-hidden" style="background: var(--editor-bg)">
                <div class="text-zinc-500 mb-2 text-[11px]">style.css</div>
                <div><span class="text-violet-400">.card</span><span class="text-zinc-300"> {</span></div>
                <div class="pl-4"><span class="text-sky-400">display</span><span class="text-zinc-300">: </span><span class="text-amber-300">flex</span><span class="text-zinc-300">;</span></div>
                <div class="pl-4"><span class="text-sky-400">gap</span><span class="text-zinc-300">: </span><span class="text-easy-400">16px</span><span class="text-zinc-300">;</span></div>
                <div class="pl-4"><span class="text-sky-400">padding</span><span class="text-zinc-300">: </span><span class="text-easy-400">24px</span><span class="text-zinc-300">;</span></div>
                <div class="pl-4"><span class="text-sky-400">border-radius</span><span class="text-zinc-300">: </span><span class="text-easy-400">12px</span><span class="text-zinc-300">;</span></div>
                <div class="pl-4"><span class="text-sky-400">background</span><span class="text-zinc-300">: </span><span class="text-expert-400">#fff</span><span class="text-zinc-300">;</span></div>
                <div class="pl-4"><span class="text-sky-400">box-shadow</span><span class="text-zinc-300">: </span><span class="text-easy-400">0 4px 24px</span></div>
                <div class="pl-8"><span class="text-expert-400">rgba(0,0,0,.08)</span><span class="text-zinc-300">;</span></div>
                <div><span class="text-zinc-300">}</span></div>
                <div class="mt-2 flex items-center gap-1">
                  <span class="w-2 h-4 bg-violet-500 rounded-sm animate-pulse" />
                </div>
              </div>
              <div class="p-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <div class="w-full bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md border border-zinc-100 dark:border-zinc-700">
                  <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900 mb-3" />
                  <div class="h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-2 w-3/4" />
                  <div class="h-2 bg-zinc-100 dark:bg-zinc-700/60 rounded-full mb-1 w-full" />
                  <div class="h-2 bg-zinc-100 dark:bg-zinc-700/60 rounded-full w-2/3" />
                  <div class="mt-3 flex gap-2">
                    <div class="h-7 flex-1 rounded-lg bg-violet-600" />
                    <div class="h-7 flex-1 rounded-lg border border-zinc-200 dark:border-zinc-600" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Status bar -->
            <div class="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span class="flex items-center gap-1.5 text-[11px] text-easy-600 dark:text-easy-400 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-easy-500" />
                Тесты: 3/3 пройдено
              </span>
              <span class="text-[11px] text-zinc-400 ml-auto font-mono">0.12s</span>
            </div>
          </div>

          <!-- Floating badge -->
          <div class="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
            <span class="text-lg">🔥</span>
            <div>
              <p class="text-xs font-semibold leading-none">Серия: 12 дней</p>
              <p class="text-[10px] text-zinc-400 mt-0.5">aleksei_dev</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         2. STATS BAR
    ───────────────────────────────────────── -->
    <section class="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center py-2 sm:px-8">
          <span class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ stat.value }}</span>
          <span class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 text-center">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         3. DIFFERENTIATORS
    ───────────────────────────────────────── -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div class="text-center mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Не ещё один LeetCode</h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
          LeetCode отлично подходит для алгоритмов. Мы — для тех, кто пишет интерфейсы.
        </p>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <div class="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-layout-template" class="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 class="font-semibold mb-2">Реальные фронтенд-задачи</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Никаких «найди k-й элемент в двусвязном списке». Только то, что встречается в реальных проектах — вёрстка, компоненты, браузерные API.
          </p>
        </div>

        <div class="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-easy-100 dark:bg-easy-950/40 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-eye" class="size-5 text-easy-600 dark:text-easy-400" />
          </div>
          <h3 class="font-semibold mb-2">Живой предпросмотр</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Написали CSS — сразу увидели результат. Никаких дополнительных инструментов и локальных серверов. Всё работает в браузере.
          </p>
        </div>

        <div class="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-medium-100 dark:bg-medium-950/40 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-briefcase" class="size-5 text-medium-600 dark:text-medium-400" />
          </div>
          <h3 class="font-semibold mb-2">Подготовка к собеседованиям</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Задачи составлены на основе реальных технических интервью в российских и международных компаниях.
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         4. CATEGORIES
    ───────────────────────────────────────── -->
    <section class="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div class="flex items-start sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Категории задач</h2>
            <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Выбирайте направление и прокачивайте конкретный навык</p>
          </div>
          <UButton to="/tasks" label="Все задачи" variant="outline" color="neutral" size="sm" icon="i-lucide-arrow-right" trailing class="shrink-0" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.name"
            :to="`/tasks?category=${cat.tag}`"
            class="group p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
          >
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3"
              :style="{ background: tagStyles[cat.tag]?.bg, color: tagStyles[cat.tag]?.color }"
            >
              <UIcon :name="cat.icon" class="size-4" />
            </div>
            <p class="font-medium text-sm mb-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight">{{ cat.name }}</p>
            <p class="text-xs text-zinc-400">{{ cat.count }} задач</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         5. HOW IT WORKS
    ───────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div class="text-center mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Как это работает</h2>
        <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Три шага от задачи до решения</p>
      </div>

      <div class="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
        <div class="hidden sm:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />

        <div v-for="step in steps" :key="step.num" class="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 sm:text-center">
          <div class="relative shrink-0 sm:mb-5">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
              <UIcon :name="step.icon" class="size-5 sm:size-6 text-violet-600 dark:text-violet-400" />
            </div>
            <span class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
              {{ step.num[1] }}
            </span>
          </div>
          <div>
            <h3 class="font-semibold mb-1 sm:mb-2">{{ step.title }}</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         6. FEATURED TASKS
    ───────────────────────────────────────── -->
    <section class="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div class="flex items-start sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Попробуйте прямо сейчас</h2>
            <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Несколько задач разной сложности для старта</p>
          </div>
          <UButton to="/tasks" label="Все задачи" variant="outline" color="neutral" size="sm" icon="i-lucide-arrow-right" trailing class="shrink-0" />
        </div>

        <div class="space-y-3">
          <div
            v-for="task in featuredTasks"
            :key="task.id"
            class="group p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer"
          >
            <div class="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
              <h3 class="font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm sm:text-base">
                {{ task.id }}. {{ task.title }}
              </h3>
              <span class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="`badge-${task.difficulty}`">
                {{ task.difficultyLabel }}
              </span>
            </div>

            <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{{ task.desc }}</p>

            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex gap-1.5 flex-wrap">
                <span
                  v-for="tag in task.tags"
                  :key="tag.name"
                  :style="tag.style"
                  class="px-2 py-0.5 rounded text-xs font-medium"
                >
                  {{ tag.name }}
                </span>
              </div>
              <div class="flex items-center gap-3 ml-auto">
                <span class="text-xs text-zinc-400 hidden sm:block">
                  {{ task.acceptance }} принято · {{ task.solutions.toLocaleString('ru') }} решений
                </span>
                <UButton label="Решить" size="xs" variant="soft" color="primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         7. SKILL ROADMAP
    ───────────────────────────────────────── -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div class="text-center mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Путь фронтенд-разработчика</h2>
        <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Задачи структурированы по уровням. Каждый следующий уровень строится на предыдущем.
        </p>
      </div>

      <!-- 2 cols on mobile, 4 on sm+ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(lvl, i) in roadmap"
          :key="lvl.level"
          class="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-zinc-900"
          :class="{
            'border-easy-300 dark:border-easy-900':     lvl.color === 'easy',
            'border-medium-300 dark:border-medium-900': lvl.color === 'medium',
            'border-hard-300 dark:border-hard-900':     lvl.color === 'hard',
            'border-expert-300 dark:border-expert-900': lvl.color === 'expert',
          }"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3"
            :class="{
              'bg-easy-500':   lvl.color === 'easy',
              'bg-medium-500': lvl.color === 'medium',
              'bg-hard-500':   lvl.color === 'hard',
              'bg-expert-500': lvl.color === 'expert',
            }"
          >
            {{ i + 1 }}
          </div>
          <p class="font-semibold text-sm sm:text-base mb-0.5">{{ lvl.level }}</p>
          <p class="text-xs text-zinc-400 mb-3">{{ lvl.range }}</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="skill in lvl.skills"
              :key="skill"
              class="px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         8. LEADERBOARD PREVIEW
    ───────────────────────────────────────── -->
    <section class="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div class="text-center mb-8 sm:mb-10">
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Топ недели</h2>
          <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Разработчики, которые решают больше всех</p>
        </div>

        <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden mb-6">
          <div
            v-for="(user, i) in leaderboard"
            :key="user.name"
            class="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            :class="{ 'border-b border-zinc-100 dark:border-zinc-800': i < leaderboard.length - 1 }"
          >
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="{
                'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400': user.rank === 1,
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500': user.rank === 2,
                'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400': user.rank === 3,
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-400': user.rank > 3,
              }"
            >
              {{ user.rank }}
            </span>

            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0">
              <span class="text-white text-xs font-semibold">{{ user.name[0].toUpperCase() }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ user.country }} {{ user.name }}
              </p>
              <p class="text-xs text-zinc-400">🔥 Серия {{ user.streak }} дней</p>
            </div>

            <div class="text-right shrink-0">
              <p class="text-sm font-semibold">{{ user.solved }}</p>
              <p class="text-xs text-zinc-400">задач</p>
            </div>
          </div>
        </div>

        <div class="text-center">
          <UButton to="/leaderboard" label="Полный рейтинг" variant="outline" color="neutral" icon="i-lucide-bar-chart-2" />
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────
         9. FINAL CTA
    ───────────────────────────────────────── -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
      <div class="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-violet-600 dark:bg-violet-700 px-5 sm:px-8 py-10 sm:py-16 text-center">
        <div class="absolute top-0 left-0 w-64 h-64 bg-violet-500/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div class="absolute bottom-0 right-0 w-64 h-64 bg-violet-800/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div class="relative">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-4 sm:mb-5">
            <UIcon name="i-lucide-gift" class="size-4" />
            Платформа полностью бесплатная
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Начните прямо сейчас
          </h2>
          <p class="text-violet-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
            Создайте аккаунт за 30 секунд и решите первую задачу сегодня.
          </p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <UButton
              to="/auth/register"
              label="Создать аккаунт"
              color="neutral"
              size="lg"
              class="font-semibold"
            />
            <UButton
              to="/tasks"
              label="Посмотреть задачи"
              variant="ghost"
              size="lg"
              class="text-white hover:bg-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
