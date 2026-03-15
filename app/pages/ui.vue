<script setup lang="ts">
definePageMeta({ name: 'ui' })

const sections = [
  { id: 'colors', label: 'Цвета' },
  { id: 'typography', label: 'Типографика' },
  { id: 'difficulty', label: 'Сложность' },
  { id: 'tags', label: 'Теги технологий' },
  { id: 'status', label: 'Статусы' },
  { id: 'cards', label: 'Карточки задач' },
  { id: 'buttons', label: 'Кнопки' },
  { id: 'editor', label: 'Редактор' },
]

const primaryColors = [
  { shade: '50', class: 'bg-violet-50', text: 'text-violet-950' },
  { shade: '100', class: 'bg-violet-100', text: 'text-violet-950' },
  { shade: '200', class: 'bg-violet-200', text: 'text-violet-950' },
  { shade: '300', class: 'bg-violet-300', text: 'text-violet-950' },
  { shade: '400', class: 'bg-violet-400', text: 'text-white' },
  { shade: '500', class: 'bg-violet-500', text: 'text-white' },
  { shade: '600', class: 'bg-violet-600', text: 'text-white' },
  { shade: '700', class: 'bg-violet-700', text: 'text-white' },
  { shade: '800', class: 'bg-violet-800', text: 'text-white' },
  { shade: '900', class: 'bg-violet-900', text: 'text-white' },
  { shade: '950', class: 'bg-violet-950', text: 'text-white' },
]

const neutralColors = [
  { shade: '50', class: 'bg-zinc-50', text: 'text-zinc-950' },
  { shade: '100', class: 'bg-zinc-100', text: 'text-zinc-950' },
  { shade: '200', class: 'bg-zinc-200', text: 'text-zinc-950' },
  { shade: '300', class: 'bg-zinc-300', text: 'text-zinc-950' },
  { shade: '400', class: 'bg-zinc-400', text: 'text-white' },
  { shade: '500', class: 'bg-zinc-500', text: 'text-white' },
  { shade: '600', class: 'bg-zinc-600', text: 'text-white' },
  { shade: '700', class: 'bg-zinc-700', text: 'text-white' },
  { shade: '800', class: 'bg-zinc-800', text: 'text-white' },
  { shade: '900', class: 'bg-zinc-900', text: 'text-white' },
  { shade: '950', class: 'bg-zinc-950', text: 'text-white' },
]

const difficultyColors = [
  { shade: '50', easy: 'bg-easy-50', medium: 'bg-medium-50', hard: 'bg-hard-50', expert: 'bg-expert-50' },
  { shade: '200', easy: 'bg-easy-200', medium: 'bg-medium-200', hard: 'bg-hard-200', expert: 'bg-expert-200' },
  { shade: '400', easy: 'bg-easy-400', medium: 'bg-medium-400', hard: 'bg-hard-400', expert: 'bg-expert-400' },
  { shade: '500', easy: 'bg-easy-500', medium: 'bg-medium-500', hard: 'bg-hard-500', expert: 'bg-expert-500' },
  { shade: '700', easy: 'bg-easy-700', medium: 'bg-medium-700', hard: 'bg-hard-700', expert: 'bg-expert-700' },
  { shade: '900', easy: 'bg-easy-900', medium: 'bg-medium-900', hard: 'bg-hard-900', expert: 'bg-expert-900' },
]

const tags = [
  { name: 'HTML', style: { color: 'var(--tag-html)', background: 'var(--tag-html-bg)' } },
  { name: 'CSS', style: { color: 'var(--tag-css)', background: 'var(--tag-css-bg)' } },
  { name: 'JavaScript', style: { color: 'var(--tag-js)', background: 'var(--tag-js-bg)' } },
  { name: 'TypeScript', style: { color: 'var(--tag-ts)', background: 'var(--tag-ts-bg)' } },
  { name: 'Vue', style: { color: 'var(--tag-vue)', background: 'var(--tag-vue-bg)' } },
  { name: 'React', style: { color: 'var(--tag-react)', background: 'var(--tag-react-bg)' } },
  { name: 'Angular', style: { color: 'var(--tag-angular)', background: 'var(--tag-angular-bg)' } },
  { name: 'Sass', style: { color: 'var(--tag-sass)', background: 'var(--tag-sass-bg)' } },
  { name: 'Webpack', style: { color: 'var(--tag-webpack)', background: 'var(--tag-webpack-bg)' } },
  { name: 'Vite', style: { color: 'var(--tag-vite)', background: 'var(--tag-vite-bg)' } },
  { name: 'Nuxt', style: { color: 'var(--tag-nuxt)', background: 'var(--tag-nuxt-bg)' } },
  { name: 'Next.js', style: { color: 'var(--tag-next)', background: 'var(--tag-next-bg)' } },
  { name: 'SVG', style: { color: 'var(--tag-svg)', background: 'var(--tag-svg-bg)' } },
  { name: 'A11y', style: { color: 'var(--tag-a11y)', background: 'var(--tag-a11y-bg)' } },
]

const mockTasks = [
  {
    id: 1,
    title: 'Центрирование элемента',
    description: 'Расположите div по центру родительского контейнера тремя разными способами.',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    tags: [
      { name: 'CSS', style: { color: 'var(--tag-css)', background: 'var(--tag-css-bg)' } },
      { name: 'Flexbox', style: { color: 'var(--tag-css)', background: 'var(--tag-css-bg)' } },
    ],
    solved: true,
    acceptance: '78%',
    solvedCount: 12430,
  },
  {
    id: 2,
    title: 'Бесконечная прокрутка',
    description: 'Реализуйте компонент с подгрузкой данных при достижении конца списка.',
    difficulty: 'medium',
    difficultyLabel: 'Средне',
    tags: [
      { name: 'JavaScript', style: { color: 'var(--tag-js)', background: 'var(--tag-js-bg)' } },
      { name: 'Vue', style: { color: 'var(--tag-vue)', background: 'var(--tag-vue-bg)' } },
    ],
    solved: false,
    attempted: true,
    acceptance: '52%',
    solvedCount: 6840,
  },
  {
    id: 3,
    title: 'Виртуальный DOM с нуля',
    description: 'Напишите минималистичную реализацию виртуального DOM с поддержкой diff-алгоритма.',
    difficulty: 'hard',
    difficultyLabel: 'Сложно',
    tags: [
      { name: 'JavaScript', style: { color: 'var(--tag-js)', background: 'var(--tag-js-bg)' } },
      { name: 'TypeScript', style: { color: 'var(--tag-ts)', background: 'var(--tag-ts-bg)' } },
    ],
    solved: false,
    attempted: false,
    acceptance: '21%',
    solvedCount: 1250,
  },
]
</script>

<template>
  <div class="max-w-7xl mx-auto flex">
    <!-- Sidebar -->
    <aside class="hidden lg:block w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4">
      <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 mb-3">Design System</p>
      <nav class="space-y-0.5">
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          class="block px-3 py-1.5 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {{ s.label }}
        </a>
      </nav>
    </aside>

    <!-- Content -->
    <main class="flex-1 min-w-0 px-6 py-10 space-y-16">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Design System</h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Токены, компоненты и паттерны FrontSkill</p>
        </div>
        <UBadge label="v0.1" variant="subtle" color="neutral" class="ml-auto" />
      </div>

      <!-- ── Colors ── -->
      <section id="colors">
        <h2 class="text-xl font-semibold mb-1">Цвета</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Primary: <code class="font-mono text-violet-500">violet</code> · Neutral: <code class="font-mono text-zinc-400">zinc</code>
        </p>
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Primary — Violet</p>
            <div class="flex rounded-xl overflow-hidden h-10">
              <div v-for="c in primaryColors" :key="c.shade" :class="[c.class, 'flex-1 flex items-center justify-center']">
                <span :class="[c.text, 'text-[10px] font-mono hidden xl:block']">{{ c.shade }}</span>
              </div>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Neutral — Zinc</p>
            <div class="flex rounded-xl overflow-hidden h-10">
              <div v-for="c in neutralColors" :key="c.shade" :class="[c.class, 'flex-1 flex items-center justify-center']">
                <span :class="[c.text, 'text-[10px] font-mono hidden xl:block']">{{ c.shade }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Typography ── -->
      <section id="typography">
        <h2 class="text-xl font-semibold mb-1">Типографика</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Sans: <code class="font-mono text-violet-500">Inter</code> · Mono: <code class="font-mono text-violet-500">JetBrains Mono</code>
        </p>
        <div class="space-y-5 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div>
            <p class="text-4xl font-bold tracking-tight">Заголовок страницы</p>
            <p class="text-xs text-zinc-400 mt-1 font-mono">4xl / bold / tracking-tight</p>
          </div>
          <div>
            <p class="text-2xl font-semibold">Заголовок раздела</p>
            <p class="text-xs text-zinc-400 mt-1 font-mono">2xl / semibold</p>
          </div>
          <div>
            <p class="text-lg font-medium">Подзаголовок</p>
            <p class="text-xs text-zinc-400 mt-1 font-mono">lg / medium</p>
          </div>
          <div>
            <p class="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-xl">Основной текст для описания задач и пояснений. Должен хорошо читаться на любом экране и при любом уровне освещения.</p>
            <p class="text-xs text-zinc-400 mt-1 font-mono">base / leading-relaxed</p>
          </div>
          <div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">Вспомогательный текст для метаданных, временных меток и второстепенной информации.</p>
            <p class="text-xs text-zinc-400 mt-1 font-mono">sm / muted</p>
          </div>
          <div>
            <code class="font-mono text-sm bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-violet-600 dark:text-violet-400">display: flex; align-items: center;</code>
            <p class="text-xs text-zinc-400 mt-2 font-mono">code / mono / sm</p>
          </div>
        </div>
      </section>

      <!-- ── Difficulty ── -->
      <section id="difficulty">
        <h2 class="text-xl font-semibold mb-1">Уровни сложности</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Четыре уровня: Легко · Средне · Сложно · Эксперт</p>
        <div class="flex flex-wrap gap-3 mb-8">
          <span class="badge-easy px-3 py-1 rounded-full text-sm font-semibold">Легко</span>
          <span class="badge-medium px-3 py-1 rounded-full text-sm font-semibold">Средне</span>
          <span class="badge-hard px-3 py-1 rounded-full text-sm font-semibold">Сложно</span>
          <span class="badge-expert px-3 py-1 rounded-full text-sm font-semibold">Эксперт</span>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="level in ['easy', 'medium', 'hard', 'expert']" :key="level">
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 capitalize">{{ level }}</p>
            <div class="space-y-1">
              <div
                v-for="row in difficultyColors"
                :key="row.shade"
                :class="[row[level as keyof typeof row], 'h-8 rounded-lg flex items-center px-2']"
              >
                <span class="text-[10px] font-mono text-white/70">{{ row.shade }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Tags ── -->
      <section id="tags">
        <h2 class="text-xl font-semibold mb-1">Теги технологий</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Фирменные цвета с адаптацией для тёмной темы через CSS-переменные.</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in tags"
            :key="tag.name"
            :style="tag.style"
            class="px-2.5 py-1 rounded-md text-sm font-medium"
          >
            {{ tag.name }}
          </span>
        </div>
        <div class="mt-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <p class="text-xs font-mono text-zinc-400 mb-2">Использование:</p>
          <code class="text-xs font-mono text-violet-500">:style="{ color: 'var(--tag-vue)', background: 'var(--tag-vue-bg)' }"</code>
        </div>
      </section>

      <!-- ── Status ── -->
      <section id="status">
        <h2 class="text-xl font-semibold mb-1">Статусы задач</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Индикаторы прогресса пользователя.</p>
        <div class="flex flex-col gap-3 max-w-xs">
          <div class="flex items-center gap-3">
            <span class="status-dot status-dot-solved" />
            <span class="text-sm font-medium">Решена</span>
            <span class="text-xs text-zinc-400 font-mono ml-auto">easy-500</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="status-dot status-dot-attempted" />
            <span class="text-sm font-medium">Попытка</span>
            <span class="text-xs text-zinc-400 font-mono ml-auto">medium-500</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="status-dot status-dot-unsolved" />
            <span class="text-sm font-medium">Не решена</span>
            <span class="text-xs text-zinc-400 font-mono ml-auto">surface-500</span>
          </div>
        </div>
      </section>

      <!-- ── Task Cards ── -->
      <section id="cards">
        <h2 class="text-xl font-semibold mb-1">Карточки задач</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Основной элемент списка задач.</p>
        <div class="space-y-3">
          <div
            v-for="task in mockTasks"
            :key="task.id"
            class="group flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer"
          >
            <div class="mt-1 shrink-0">
              <span
                class="status-dot"
                :class="{
                  'status-dot-solved': task.solved,
                  'status-dot-attempted': !task.solved && task.attempted,
                  'status-dot-unsolved': !task.solved && !task.attempted,
                }"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <h3 class="text-sm font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {{ task.id }}. {{ task.title }}
                </h3>
                <span class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="`badge-${task.difficulty}`">
                  {{ task.difficultyLabel }}
                </span>
              </div>
              <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{{ task.description }}</p>
              <div class="flex items-center gap-3 mt-2.5 flex-wrap">
                <div class="flex gap-1.5">
                  <span
                    v-for="tag in task.tags"
                    :key="tag.name"
                    :style="tag.style"
                    class="px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {{ tag.name }}
                  </span>
                </div>
                <span class="text-xs text-zinc-400 ml-auto">
                  Принятых: {{ task.acceptance }} · {{ task.solvedCount.toLocaleString('ru') }} решений
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Buttons ── -->
      <section id="buttons">
        <h2 class="text-xl font-semibold mb-1">Кнопки</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Варианты Nuxt UI.</p>
        <div class="space-y-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Основные действия</p>
            <div class="flex flex-wrap gap-2">
              <UButton label="Решить задачу" color="primary" />
              <UButton label="Запустить код" color="primary" variant="outline" icon="i-lucide-play" />
              <UButton label="Посмотреть решение" color="neutral" variant="soft" />
              <UButton label="Подсказка" color="neutral" variant="ghost" icon="i-lucide-lightbulb" />
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Размеры</p>
            <div class="flex flex-wrap items-center gap-2">
              <UButton label="xs" color="primary" size="xs" />
              <UButton label="sm" color="primary" size="sm" />
              <UButton label="md" color="primary" size="md" />
              <UButton label="lg" color="primary" size="lg" />
              <UButton label="xl" color="primary" size="xl" />
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Семантические</p>
            <div class="flex flex-wrap gap-2">
              <UButton label="Успех" color="success" variant="soft" icon="i-lucide-check" />
              <UButton label="Предупреждение" color="warning" variant="soft" icon="i-lucide-alert-triangle" />
              <UButton label="Ошибка" color="error" variant="soft" icon="i-lucide-x-circle" />
              <UButton label="Информация" color="info" variant="soft" icon="i-lucide-info" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Editor ── -->
      <section id="editor">
        <h2 class="text-xl font-semibold mb-1">Редактор кода</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Тёмный фон + синтаксическая типографика.</p>
        <div class="rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
          <div class="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-zinc-600" />
              <span class="w-3 h-3 rounded-full bg-zinc-600" />
              <span class="w-3 h-3 rounded-full bg-zinc-600" />
            </div>
            <span class="px-2.5 py-0.5 rounded text-xs font-medium" :style="{ color: 'var(--tag-css)', background: 'var(--tag-css-bg)' }">CSS</span>
            <UButton label="Запустить" size="xs" color="primary" icon="i-lucide-play" />
          </div>
          <div class="editor-surface p-4 text-sm leading-relaxed overflow-x-auto" style="background: var(--editor-bg);">
            <pre class="font-mono text-zinc-300"><span class="text-zinc-500">1  </span><span class="text-violet-400">.container</span> <span class="text-zinc-300">{</span>
<span class="text-zinc-500">2  </span>  <span class="text-sky-400">display</span><span class="text-zinc-300">: </span><span class="text-amber-300">flex</span><span class="text-zinc-300">;</span>
<span class="text-zinc-500">3  </span>  <span class="text-sky-400">align-items</span><span class="text-zinc-300">: </span><span class="text-amber-300">center</span><span class="text-zinc-300">;</span>
<span class="text-zinc-500">4  </span>  <span class="text-sky-400">justify-content</span><span class="text-zinc-300">: </span><span class="text-amber-300">center</span><span class="text-zinc-300">;</span>
<span class="text-zinc-500">5  </span>  <span class="text-sky-400">min-height</span><span class="text-zinc-300">: </span><span class="text-easy-400">100vh</span><span class="text-zinc-300">;</span>
<span class="text-zinc-500">6  </span><span class="text-zinc-300">}</span></pre>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div v-for="token in [
            { name: '--editor-bg', value: '#0f1117', style: 'background: var(--editor-bg)' },
            { name: '--editor-gutter', value: '#1a1f2e', style: 'background: var(--editor-gutter)' },
            { name: '--editor-selection', value: '#2d4263', style: 'background: var(--editor-selection)' },
            { name: '--editor-cursor', value: '#528bff', style: 'background: var(--editor-cursor)' },
          ]" :key="token.name" class="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <div class="w-5 h-5 rounded mb-2" :style="token.style" />
            <p class="text-zinc-400">{{ token.name }}</p>
            <p class="text-zinc-500">{{ token.value }}</p>
          </div>
        </div>
      </section>

      <div class="h-16" />
    </main>
  </div>
</template>
