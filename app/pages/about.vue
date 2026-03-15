<script setup lang="ts">
useHead({
  title: 'О проекте FrontSkill — Бесплатная платформа для практики фронтенд-разработки',
  meta: [
    {
      name: 'description',
      content: 'FrontSkill — бесплатная платформа для практики HTML, CSS, JavaScript, TypeScript, Vue и React. Реальные задачи, живой предпросмотр, русскоязычное сообщество разработчиков.',
    },
    {
      name: 'keywords',
      content: 'frontskill о проекте, платформа для фронтендеров, практика программирования, изучение frontend, задачи по веб-разработке, сообщество разработчиков',
    },
    { property: 'og:title', content: 'О проекте FrontSkill' },
    { property: 'og:description', content: 'Бесплатная платформа для практики фронтенд-разработки. Реальные задачи, живой предпросмотр.' },
    { property: 'og:type', content: 'website' },
  ],
})

const stats = [
  { value: '500+', label: 'Задач' },
  { value: '12 000+', label: 'Пользователей' },
  { value: '14', label: 'Технологий' },
  { value: '2024', label: 'Год запуска' },
]

const values = [
  {
    icon: 'i-lucide-heart-handshake',
    title: 'Доступность',
    desc: 'Платформа полностью бесплатная. Никаких премиум-подписок или скрытых платежей. Знания должны быть доступны всем.',
  },
  {
    icon: 'i-lucide-target',
    title: 'Практичность',
    desc: 'Только реальные задачи, с которыми вы столкнётесь на работе. Никаких абстрактных алгоритмов без практического применения.',
  },
  {
    icon: 'i-lucide-users',
    title: 'Сообщество',
    desc: 'Русскоязычная платформа с активным сообществом. Делитесь решениями, обсуждайте подходы, учитесь друг у друга.',
  },
  {
    icon: 'i-lucide-rocket',
    title: 'Рост',
    desc: 'Система прогресса и достижений помогает не бросить тренировки. Отслеживайте свой путь от новичка до эксперта.',
  },
]

const team = [
  { name: 'Команда FrontSkill', role: 'Разработка и поддержка', icon: 'i-lucide-code-2' },
]

const faq = [
  {
    q: 'FrontSkill действительно бесплатный?',
    a: 'Да, полностью. Все задачи, редактор кода и система прогресса доступны без оплаты. Мы верим, что качественное образование должно быть доступно каждому.',
  },
  {
    q: 'Для кого подходит платформа?',
    a: 'Для всех, кто хочет прокачать навыки фронтенд-разработки: от новичков до опытных разработчиков, готовящихся к собеседованиям.',
  },
  {
    q: 'Какие технологии можно практиковать?',
    a: 'HTML, CSS, JavaScript, TypeScript, Vue, React, а также смежные темы: доступность, производительность, сборщики и многое другое.',
  },
  {
    q: 'Нужно ли устанавливать что-то на компьютер?',
    a: 'Нет. Редактор кода и предпросмотр работают прямо в браузере. Просто откройте задачу и начинайте писать код.',
  },
]

const timeline = [
  { year: '2024', event: 'Запуск платформы', desc: 'Первые 100 задач и базовый функционал' },
  { year: '2024', event: 'Рост сообщества', desc: '10 000+ пользователей за первые месяцы' },
  { year: '2025', event: 'Новые возможности', desc: 'Соревнования, рейтинг и расширенная аналитика' },
  { year: '2026', event: 'Масштабирование', desc: '500+ задач, 14 технологий, интеграции' },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] bg-violet-500/6 dark:bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-10 sm:pb-16 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-sm font-medium mb-5 sm:mb-6">
          <UIcon name="i-lucide-info" class="size-4" />
          О проекте
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 sm:mb-5">
          FrontSkill — платформа для<br>
          <span class="text-violet-600 dark:text-violet-400">практики фронтенда</span>
        </h1>

        <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Мы создаём пространство, где разработчики могут прокачивать навыки на реальных задачах. Бесплатно, без рекламы, с живым предпросмотром кода.
        </p>
      </div>
    </section>

    <section class="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center py-2 sm:px-8">
          <span class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ stat.value }}</span>
          <span class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 text-center">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div class="text-center mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Наша миссия</h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
          Сделать качественную практику фронтенд-разработки доступной для каждого русскоязычного разработчика.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div v-for="value in values" :key="value.title" class="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center mb-4">
            <UIcon :name="value.icon" class="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 class="font-semibold mb-2">{{ value.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ value.desc }}</p>
        </div>
      </div>
    </section>

    <section class="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div class="text-center mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">История развития</h2>
          <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Как развивался проект</p>
        </div>

        <div class="grid sm:grid-cols-4 gap-4">
          <div v-for="(item, i) in timeline" :key="i" class="relative p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span class="text-xs font-mono text-violet-600 dark:text-violet-400 font-semibold">{{ item.year }}</span>
            <h3 class="font-semibold text-sm mt-1 mb-1">{{ item.event }}</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div class="text-center mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Команда</h2>
        <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Люди, стоящие за FrontSkill</p>
      </div>

      <div class="flex justify-center">
        <div v-for="member in team" :key="member.name" class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center max-w-sm">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <UIcon :name="member.icon" class="size-8 text-white" />
          </div>
          <h3 class="font-semibold text-lg">{{ member.name }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ member.role }}</p>
        </div>
      </div>
    </section>

    <section class="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div class="text-center mb-8 sm:mb-10">
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Частые вопросы</h2>
          <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Ответы на популярные вопросы</p>
        </div>

        <div class="space-y-3">
          <div v-for="(item, i) in faq" :key="i" class="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 class="font-semibold mb-2 flex items-start gap-2">
              <UIcon name="i-lucide-help-circle" class="size-5 text-violet-500 shrink-0 mt-0.5" />
              {{ item.q }}
            </h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pl-7">{{ item.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
      <div class="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-violet-600 dark:bg-violet-700 px-5 sm:px-8 py-10 sm:py-16 text-center">
        <div class="absolute top-0 left-0 w-64 h-64 bg-violet-500/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div class="absolute bottom-0 right-0 w-64 h-64 bg-violet-800/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div class="relative">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Готовы начать?
          </h2>
          <p class="text-violet-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
            Присоединяйтесь к сообществу и прокачивайте навыки каждый день.
          </p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <UButton to="/tasks" label="К задачам" color="neutral" size="lg" class="font-semibold" />
            <UButton to="/auth/register" label="Создать аккаунт" variant="ghost" size="lg" class="text-white hover:bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
