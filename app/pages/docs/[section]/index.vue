<script setup lang="ts">
const { getSectionMeta } = useDocs()

// ─── Route ────────────────────────────────────────────────────────────
const route = useRoute()
const sectionId = computed(() => route.params.section as string)

// ─── Section meta ─────────────────────────────────────────────────────
const sectionMeta = computed(() => getSectionMeta(sectionId.value))

// ─── Topics ───────────────────────────────────────────────────────────
const { data: topics } = await useAsyncData(`docs-section-${sectionId.value}`, () =>
  queryCollection('docs').all()
)

const sectionTopics = computed(() =>
  (topics.value ?? [])
    .filter(p => p.path.startsWith(`/docs/${sectionId.value}/`))
    .sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
)

// ─── 404 ──────────────────────────────────────────────────────────────
if (!sectionMeta.value) {
  throw createError({ statusCode: 404, statusMessage: 'Раздел не найден' })
}

// ─── SEO ──────────────────────────────────────────────────────────────
useSeoMeta({
  title: `${sectionMeta.value?.label} — Документация FrontSkill`,
  description: sectionMeta.value?.description,
})

// ─── Difficulty labels ─────────────────────────────────────────────────
const difficultyLabels: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const difficultyClasses: Record<string, string> = {
  beginner: 'badge-easy',
  intermediate: 'badge-medium',
  advanced: 'badge-hard',
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-56px)]">

    <!-- ── Sidebar ─────────────────────────────────────────────────── -->
    <aside class="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div class="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-6">
        <DocsSidebar :current-section="sectionId" />
      </div>
    </aside>

    <!-- ── Main content ────────────────────────────────────────────── -->
    <main class="flex-1 min-w-0 px-4 sm:px-8 py-8 sm:py-10">
      <div class="max-w-3xl">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-sm text-zinc-400 mb-6">
          <NuxtLink to="/docs" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Документация
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <span class="text-zinc-700 dark:text-zinc-200">{{ sectionMeta?.label }}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="[sectionMeta?.tagColor, 'bg-opacity-20']"
          >
            <UIcon :name="sectionMeta?.icon ?? ''" class="size-6" :class="sectionMeta?.iconColor" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {{ sectionMeta?.label }}
            </h1>
            <p class="text-zinc-500 dark:text-zinc-400 mt-0.5">
              {{ sectionMeta?.description }}
            </p>
          </div>
        </div>

        <!-- Topics list -->
        <div class="space-y-3">
          <NuxtLink
            v-for="(topic, idx) in sectionTopics"
            :key="topic.path"
            :to="topic.path"
            class="group flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all duration-200"
          >
            <!-- Order number -->
            <span class="shrink-0 w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-950/50 group-hover:text-violet-500 transition-colors">
              {{ idx + 1 }}
            </span>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2 flex-wrap">
                <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {{ topic.title }}
                </h2>
                <span
                  v-if="topic.difficulty"
                  class="inline-flex text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  :class="difficultyClasses[topic.difficulty as string] ?? 'badge-easy'"
                >
                  {{ difficultyLabels[topic.difficulty as string] ?? topic.difficulty }}
                </span>
              </div>
              <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                {{ topic.description }}
              </p>
            </div>

            <!-- Read time + arrow -->
            <div class="shrink-0 flex items-center gap-2 text-zinc-400">
              <span v-if="topic.readTime" class="text-xs">{{ topic.readTime }} мин</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div
          v-if="sectionTopics.length === 0"
          class="text-center py-16 text-zinc-400"
        >
          <UIcon name="i-lucide-file-text" class="size-10 mx-auto mb-3 opacity-40" />
          <p>Темы для этого раздела скоро появятся</p>
        </div>

      </div>
    </main>
  </div>
</template>
