<script setup lang="ts">
const { DOCS_SECTIONS } = useDocs()

// ─── Props ────────────────────────────────────────────────────────────
interface Props {
  currentSection?: string
  currentTopic?: string
}

const props = defineProps<Props>()

// ─── Nav data ─────────────────────────────────────────────────────────
const route = useRoute()

// Fetch all docs for navigation (metadata only via queryCollectionNavigation)
const { data: allPages } = await useAsyncData('docs-nav', () =>
  queryCollection('docs').all()
)

const sections = computed(() => {
  return DOCS_SECTIONS.map(section => ({
    ...section,
    topics: (allPages.value ?? [])
      .filter(page => page.path.startsWith(`/docs/${section.id}/`))
      .sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
      .map(page => ({
        title: page.title as string,
        path: page.path,
        slug: page.path.split('/').pop() ?? '',
      })),
  }))
})

// ─── Collapsible state ────────────────────────────────────────────────
const openSections = ref<Set<string>>(new Set([props.currentSection ?? '']))

// Auto-open section on route change
watch(() => route.path, (path) => {
  const parts = path.split('/')
  if (parts[1] === 'docs' && parts[2]) {
    openSections.value.add(parts[2])
  }
}, { immediate: true })

function toggleSection(sectionId: string) {
  if (openSections.value.has(sectionId)) {
    openSections.value.delete(sectionId)
  } else {
    openSections.value.add(sectionId)
  }
  openSections.value = new Set(openSections.value)
}

function isTopicActive(topicPath: string) {
  return route.path === topicPath
}

function isSectionActive(sectionId: string) {
  return route.path.startsWith(`/docs/${sectionId}`)
}
</script>

<template>
  <nav class="w-full">
    <!-- Docs home link -->
    <NuxtLink
      to="/docs"
      class="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg text-sm font-medium transition-colors"
      :class="route.path === '/docs'
        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
    >
      <UIcon name="i-lucide-book-open" class="size-4 shrink-0" />
      Документация
    </NuxtLink>

    <div class="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-0.5">
      <!-- Section group -->
      <div v-for="section in sections" :key="section.id">
        <!-- Section toggle button -->
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
          :class="isSectionActive(section.id)
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
          @click="toggleSection(section.id)"
        >
          <UIcon
            :name="section.icon"
            class="size-4 shrink-0"
            :class="isSectionActive(section.id) ? section.iconColor : 'text-zinc-400 dark:text-zinc-500'"
          />
          <span class="flex-1 truncate">{{ section.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5 shrink-0 text-zinc-400 transition-transform duration-200"
            :class="openSections.has(section.id) ? 'rotate-90' : ''"
          />
        </button>

        <!-- Topics list (collapsible) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out overflow-hidden"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-150 ease-in overflow-hidden"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <ul v-if="openSections.has(section.id)" class="ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 mt-0.5 mb-1 space-y-0.5">
            <li v-for="topic in section.topics" :key="topic.path">
              <NuxtLink
                :to="topic.path"
                class="block px-2 py-1.5 rounded-md text-sm transition-colors truncate"
                :class="isTopicActive(topic.path)
                  ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
              >
                {{ topic.title }}
              </NuxtLink>
            </li>

            <!-- No topics placeholder -->
            <li v-if="section.topics.length === 0" class="px-2 py-1.5 text-xs text-zinc-400 italic">
              Скоро
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  </nav>
</template>
