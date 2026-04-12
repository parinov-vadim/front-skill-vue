<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const faqItems: { question: string; answer: string }[] = [
  {
    question: 'Что такое FrontSkill?',
    answer: 'FrontSkill — бесплатная платформа для практики фронтенд-разработки. Здесь вы решаете реальные задачи по HTML, CSS, JavaScript, TypeScript, Vue и React прямо в браузере с мгновенным предпросмотром результата.',
  },
  {
    question: 'Платформа бесплатная?',
    answer: 'Да, FrontSkill полностью бесплатна. Все задачи, редактор кода, проверка решений и доступ к документации — без подписок и скрытых платежей.',
  },
  {
    question: 'Какие технологии поддерживаются?',
    answer: 'На платформе доступны задачи по HTML, CSS, JavaScript, TypeScript, Vue и React. Задачи охватывают вёрстку, работу с DOM, анимации, доступность (a11y), паттерны компонентов и многое другое.',
  },
  {
    question: 'Как устроены задачи?',
    answer: 'Каждая задача содержит описание, требования, примеры и стартовый код. Вы пишете решение в редакторе с живым превью, запускаете автоматические тесты и получаете мгновенную обратную связь.',
  },
  {
    question: 'Подходит ли FrontSkill для подготовки к собеседованиям?',
    answer: 'Да, задачи на FrontSkill основаны на реальных сценариях из работы и собеседований. В отличие от LeetCode, здесь фокус именно на фронтенд-задачах: вёрстка, стилизация, работа с компонентами и браузерными API.',
  },
  {
    question: 'Чем FrontSkill отличается от LeetCode и Codewars?',
    answer: 'LeetCode и Codewars ориентированы на алгоритмы. FrontSkill фокусируется на практических навыках фронтенд-разработки — CSS-раскладки, адаптивная вёрстка, JavaScript DOM, компоненты Vue и React. Плюс живой предпросмотр результата прямо в браузере.',
  },
  {
    question: 'Нужна ли регистрация?',
    answer: 'Решать задачи можно без регистрации. Но с аккаунтом сохраняется прогресс, вы попадаете в рейтинг и получаете доступ к статистике решений.',
  },
  {
    question: 'Какие уровни сложности есть?',
    answer: 'Задачи делятся на четыре уровня: лёгкие (для начинающих), средние (для джуниоров), сложные (для мидлов) и экспертные (для опытных разработчиков). Можно фильтровать каталог по сложности.',
  },
  {
    question: 'Есть ли документация или учебные материалы?',
    answer: 'Да, в разделе «Документация» собраны справочники по JavaScript, CSS, HTML, TypeScript, Vue, React, Angular, Git и инструментам разработки. Материалы бесплатны и доступны без регистрации.',
  },
  {
    question: 'Как работает рейтинг?',
    answer: 'За каждую решённую задачу вы получаете XP. Количество XP зависит от сложности задачи. В таблице лидеров отображаются топ-разработчики по XP, стрикам и количеству решённых задач.',
  },
  {
    question: 'Можно ли предложить задачу?',
    answer: 'Да, пишите на hello@frontskill.ru или в наш Telegram-канал. Мы рассматриваем все предложения от сообщества.',
  },
  {
    question: 'На каком языке платформа?',
    answer: 'Интерфейс и все задачи на русском языке. FrontSkill создан для русскоязычного сообщества разработчиков.',
  },
]

// ─── SEO ─────────────────────────────────────────────────────────────────────

useSeoMeta({
  title: 'Частые вопросы о FrontSkill — FAQ | Задачи по фронтенду',
  description: 'Ответы на частые вопросы о FrontSkill: как решать задачи, какие технологии поддерживаются, чем отличается от LeetCode, подходит ли для подготовки к собеседованиям.',
  keywords: 'frontskill faq, фронтенд задачи вопросы, подготовка к собеседованию фронтенд, где решать задачи по css, где практиковаться в верстке, leetcode для фронтенда, бесплатные задачи по javascript',
  ogTitle: 'FAQ — FrontSkill',
  ogDescription: 'Ответы на частые вопросы о платформе FrontSkill.',
  ogUrl: 'https://frontskill.ru/faq',
  twitterCard: 'summary',
  twitterTitle: 'FAQ — FrontSkill',
  twitterDescription: 'Ответы на частые вопросы о платформе FrontSkill.',
})

useSchemaOrg([
  defineWebPage({
    '@type': 'FAQPage',
  }),
  ...faqItems.map(item => defineQuestion({
    name: item.question,
    acceptedAnswer: item.answer,
  })),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Главная', item: '/' },
      { name: 'Частые вопросы' },
    ],
  }),
])

// ─── Accordion ───────────────────────────────────────────────────────────────

const items: AccordionItem[] = faqItems.map(item => ({
  label: item.question,
  content: item.answer,
}))
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Частые вопросы</h1>
    <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
      Всё, что нужно знать о FrontSkill
    </p>

    <UAccordion :items="items" type="multiple">
      <template #content="{ item }">
        <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed px-4 pb-4">
          {{ item.content }}
        </p>
      </template>
    </UAccordion>

    <div class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <p class="text-zinc-600 dark:text-zinc-400">
        Не нашли ответ? Напишите нам на
        <a href="mailto:hello@frontskill.ru" class="text-violet-600 dark:text-violet-400 hover:underline">hello@frontskill.ru</a>
        или в
        <a href="https://t.me/frontskill" target="_blank" rel="noopener" class="text-violet-600 dark:text-violet-400 hover:underline">Telegram</a>.
      </p>
    </div>
  </div>
</template>
