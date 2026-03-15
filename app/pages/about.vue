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
      content: 'frontskill о проекте, платформа для фронтендеров, практика программирования, изучение frontend, задачи по веб-разработке',
    },
  ],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-6">О проекте</h1>

    <div class="prose prose-zinc dark:prose-invert max-w-none">
      <p class="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <strong class="text-zinc-900 dark:text-zinc-100">FrontSkill</strong> — бесплатная платформа для практики фронтенд-разработки. Мы помогаем разработчикам прокачивать навыки на реальных задачах с живым предпросмотром кода прямо в браузере.
      </p>

      <h2 class="text-xl font-semibold mt-8 mb-4">Что мы предлагаем</h2>
      <ul class="text-zinc-600 dark:text-zinc-400 space-y-2">
        <li>Более 500 задач по HTML, CSS, JavaScript, TypeScript, Vue и React</li>
        <li>Редактор кода с мгновенным предпросмотром результата</li>
        <li>Задачи, основанные на реальных сценариях из работы</li>
        <li>Систему прогресса и достижений для мотивации</li>
        <li>Русскоязычное сообщество разработчиков</li>
      </ul>

      <h2 class="text-xl font-semibold mt-8 mb-4">Наша миссия</h2>
      <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Сделать качественную практику фронтенд-разработки доступной для каждого. Платформа полностью бесплатна — никаких премиум-подписок или скрытых платежей.
      </p>

      <h2 class="text-xl font-semibold mt-8 mb-4">Для кого</h2>
      <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Для новичков, которые только начинают путь в разработке. Для опытных разработчиков, готовящихся к собеседованиям. Для всех, кто хочет поддерживать навыки в тонусе и учиться новому.
      </p>

      <div class="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <p class="text-sm text-zinc-500">
          Вопросы и предложения? Пишите на <a href="mailto:hello@frontskill.ru" class="text-violet-600 dark:text-violet-400 hover:underline">hello@frontskill.ru</a>
        </p>
      </div>
    </div>
  </div>
</template>
