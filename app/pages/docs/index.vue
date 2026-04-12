<script setup lang="ts">
const { DOCS_SECTIONS } = useDocs()

// ─── SEO ──────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Документация по фронтенд-разработке — JavaScript, CSS, HTML, Vue, React | FrontSkill',
  description: 'Бесплатный справочник по фронтенд-технологиям. Статьи по JavaScript, CSS, HTML, TypeScript, Vue, React, Angular, Git и инструментам разработки. Для начинающих и опытных разработчиков.',
  keywords: 'справочник javascript, документация css, учебник html, руководство vue, руководство react, фронтенд документация, изучение веб-разработки, учебник по программированию',
  ogTitle: 'Документация по фронтенд-разработке — FrontSkill',
  ogDescription: 'Бесплатный справочник: JavaScript, CSS, HTML, TypeScript, Vue, React, Angular, Git.',
  ogUrl: 'https://frontskill.ru/docs',
  twitterCard: 'summary',
  twitterTitle: 'Документация по фронтенд-разработке — FrontSkill',
  twitterDescription: 'Бесплатный справочник: JavaScript, CSS, HTML, TypeScript, Vue, React, Angular, Git.',
})

// ─── Schema.org ──────────────────────────────────────────────────────
useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    'name': 'Документация по фронтенд-разработке — FrontSkill',
    'description': 'Бесплатный справочник по фронтенд-технологиям. Статьи по JavaScript, CSS, HTML, TypeScript, Vue, React, Angular, Git и инструментам разработки.',
    'inLanguage': 'ru',
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Главная', item: '/' },
      { name: 'Документация' },
    ],
  }),
])

// ─── Stats per section ────────────────────────────────────────────────
const { data: allPages } = await useAsyncData('docs-all', () =>
  queryCollection('docs').select('path').all()
)

const sections = computed(() =>
  DOCS_SECTIONS.map(section => ({
    ...section,
    count: (allPages.value ?? []).filter(p =>
      p.path.startsWith(`/docs/${section.id}/`)
    ).length,
  }))
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

    <!-- ── Hero ────────────────────────────────────────────────────── -->
    <div class="mb-10 sm:mb-12">
      <div class="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 font-medium mb-3">
        <UIcon name="i-lucide-book-open" class="size-4" />
        Документация
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
        Справочник технологий
      </h1>
      <p class="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl">
        Концепции, примеры кода и лучшие практики по ключевым технологиям фронтенд-разработки.
      </p>
    </div>

    <!-- ── Sections grid ───────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="section in sections"
        :key="section.id"
        :to="`/docs/${section.id}`"
        class="group relative flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all duration-200"
      >
        <!-- Icon -->
        <div class="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-violet-50 dark:group-hover:bg-violet-950/50 transition-colors">
          <UIcon :name="section.icon" class="size-5" :class="section.iconColor" />
        </div>

        <!-- Label + description -->
        <div class="flex-1">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {{ section.label }}
          </h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {{ section.description }}
          </p>
        </div>

        <!-- Topic count -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-zinc-400 dark:text-zinc-500">
            {{ section.count }} {{ section.count === 1 ? 'тема' : section.count < 5 ? 'темы' : 'тем' }}
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 text-zinc-300 dark:text-zinc-600 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all duration-200"
          />
        </div>
      </NuxtLink>
    </div>

  </div>
</template>
