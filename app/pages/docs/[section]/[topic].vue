<script setup lang="ts">
const { getSectionMeta } = useDocs()

// ─── Route ────────────────────────────────────────────────────────────
const route = useRoute()
const sectionId = computed(() => route.params.section as string)
const topicSlug = computed(() => route.params.topic as string)

// ─── Section meta ─────────────────────────────────────────────────────
const sectionMeta = computed(() => getSectionMeta(sectionId.value))

// ─── Topic content ────────────────────────────────────────────────────
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('docs').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Тема не найдена' })
}

// ─── Prev/Next navigation ─────────────────────────────────────────────
const { data: allSectionTopics } = await useAsyncData(`docs-nav-${sectionId.value}`, () =>
  queryCollection('docs').all()
)

const sectionTopics = computed(() =>
  (allSectionTopics.value ?? [])
    .filter(p => p.path.startsWith(`/docs/${sectionId.value}/`))
    .sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
)

const currentIdx = computed(() =>
  sectionTopics.value.findIndex(t => t.path === route.path)
)

const prevTopic = computed(() =>
  currentIdx.value > 0 ? sectionTopics.value[currentIdx.value - 1] : null
)

const nextTopic = computed(() =>
  currentIdx.value < sectionTopics.value.length - 1
    ? sectionTopics.value[currentIdx.value + 1]
    : null
)

// ─── SEO ──────────────────────────────────────────────────────────────
useSeoMeta({
  title: `${page.value?.title} — ${sectionMeta.value?.label} — FrontSkill`,
  description: page.value?.description as string,
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

// ─── Mobile sidebar ───────────────────────────────────────────────────
const mobileNavOpen = ref(false)
watch(() => route.path, () => { mobileNavOpen.value = false })
</script>

<template>
  <div class="flex min-h-[calc(100vh-56px)]">

    <!-- ── Sidebar (desktop) ───────────────────────────────────────── -->
    <aside class="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div class="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-6">
        <DocsSidebar :current-section="sectionId" :current-topic="topicSlug" />
      </div>
    </aside>

    <!-- ── Main ───────────────────────────────────────────────────── -->
    <div class="flex-1 min-w-0">

      <!-- Mobile nav toggle -->
      <div class="lg:hidden border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-2">
        <UButton
          icon="i-lucide-panel-left"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="mobileNavOpen = true"
        />
        <div class="flex items-center gap-1.5 text-sm text-zinc-400">
          <NuxtLink to="/docs" class="hover:text-zinc-600 transition-colors">Документация</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3" />
          <NuxtLink :to="`/docs/${sectionId}`" class="hover:text-zinc-600 transition-colors">{{ sectionMeta?.label }}</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3" />
          <span class="text-zinc-700 dark:text-zinc-300 truncate">{{ page?.title }}</span>
        </div>
      </div>

      <!-- Mobile sidebar drawer -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileNavOpen"
          class="fixed inset-0 z-50 lg:hidden"
          @click.self="mobileNavOpen = false"
        >
          <div class="absolute inset-0 bg-black/40" />
          <div class="absolute inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto px-4 py-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Навигация</span>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="mobileNavOpen = false"
              />
            </div>
            <DocsSidebar :current-section="sectionId" :current-topic="topicSlug" />
          </div>
        </div>
      </Transition>

      <!-- Content area -->
      <main class="px-4 sm:px-8 lg:px-12 py-8 sm:py-10 max-w-3xl">

        <!-- Breadcrumb (desktop) -->
        <nav class="hidden lg:flex items-center gap-1.5 text-sm text-zinc-400 mb-6">
          <NuxtLink to="/docs" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Документация
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <NuxtLink :to="`/docs/${sectionId}`" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            {{ sectionMeta?.label }}
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <span class="text-zinc-700 dark:text-zinc-300 truncate">{{ page?.title }}</span>
        </nav>

        <!-- Topic header -->
        <div class="mb-8">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span
              v-if="page?.difficulty"
              class="inline-flex text-xs px-2 py-0.5 rounded-full font-medium"
              :class="difficultyClasses[page.difficulty as string] ?? 'badge-easy'"
            >
              {{ difficultyLabels[page.difficulty as string] ?? page.difficulty }}
            </span>
            <span v-if="page?.readTime" class="text-xs text-zinc-400 flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="size-3" />
              {{ page.readTime }} мин чтения
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {{ page?.title }}
          </h1>
          <p class="text-zinc-500 dark:text-zinc-400 mt-2 text-base">
            {{ page?.description }}
          </p>
          <!-- Tags -->
          <div v-if="(page?.tags as string[])?.length" class="flex flex-wrap gap-1.5 mt-3">
            <span
              v-for="tag in (page?.tags as string[])"
              :key="tag"
              class="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-zinc-200 dark:border-zinc-800 mb-8" />

        <!-- Markdown content -->
        <div class="prose prose-zinc dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300
          prose-code:before:content-none prose-code:after:content-none
          prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
          prose-table:text-sm
          prose-th:text-zinc-700 dark:prose-th:text-zinc-200 prose-th:font-semibold
          prose-td:text-zinc-600 dark:prose-td:text-zinc-300
          prose-blockquote:border-violet-400 prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400
        ">
          <ContentRenderer :value="page!" />
        </div>

        <!-- ── Prev/Next navigation ─────────────────────────────────── -->
        <div class="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-6 grid grid-cols-2 gap-4">
          <NuxtLink
            v-if="prevTopic"
            :to="prevTopic.path"
            class="group flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
          >
            <span class="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-violet-500 transition-colors">
              <UIcon name="i-lucide-arrow-left" class="size-3" />
              Предыдущая
            </span>
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
              {{ prevTopic.title }}
            </span>
          </NuxtLink>
          <div v-else />

          <NuxtLink
            v-if="nextTopic"
            :to="nextTopic.path"
            class="group flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-right col-start-2"
          >
            <span class="flex items-center justify-end gap-1 text-xs text-zinc-400 group-hover:text-violet-500 transition-colors">
              Следующая
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </span>
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
              {{ nextTopic.title }}
            </span>
          </NuxtLink>
        </div>

      </main>
    </div>
  </div>
</template>
