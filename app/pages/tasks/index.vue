<script setup lang="ts">
import type { TaskListResponse } from '~/types/task'

useHead({ title: 'Задачи — FrontSkill' })

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'all' | 'solved' | 'attempted' | 'unsolved'
type SortKey = 'newest' | 'popularity' | 'acceptance' | 'easy_first' | 'hard_first'

// ─── Deps ────────────────────────────────────────────────────────────────────

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

// ─── Definitions ─────────────────────────────────────────────────────────────

const languageDefs = [
  { id: 'css',        label: 'CSS',        style: { color: 'var(--tag-css)',  background: 'var(--tag-css-bg)' } },
  { id: 'html',       label: 'HTML',       style: { color: 'var(--tag-html)', background: 'var(--tag-html-bg)' } },
  { id: 'javascript', label: 'JavaScript', style: { color: 'var(--tag-js)',   background: 'var(--tag-js-bg)' } },
  { id: 'typescript', label: 'TypeScript', style: { color: 'var(--tag-ts)',   background: 'var(--tag-ts-bg)' } },
]

const difficultyDefs = [
  { id: 'easy',   label: 'Легко',  cls: 'badge-easy' },
  { id: 'medium', label: 'Средне', cls: 'badge-medium' },
  { id: 'hard',   label: 'Сложно', cls: 'badge-hard' },
]

const statusOptions = [
  { value: 'all',       label: 'Все задачи' },
  { value: 'solved',    label: 'Решённые' },
  { value: 'attempted', label: 'В процессе' },
  { value: 'unsolved',  label: 'Нерешённые' },
]

const sortOptions = [
  { value: 'newest',     label: 'Новые' },
  { value: 'popularity', label: 'По популярности' },
  { value: 'acceptance', label: 'По % принятых' },
  { value: 'easy_first', label: 'Сначала лёгкие' },
  { value: 'hard_first', label: 'Сначала сложные' },
]

// ─── Filter state (initialized from URL) ─────────────────────────────────────

function parseQueryArray(val: unknown): string[] {
  if (!val) return []
  return String(val).split(',').filter(Boolean)
}

const search = ref((route.query.search as string) || '')
const debouncedSearch = ref(search.value)
const selectedDifficulties = ref<string[]>(parseQueryArray(route.query.difficulty))
const selectedLanguage = ref<string | null>((route.query.language as string) || null)
const selectedStatus = ref<Status>((route.query.status as Status) || 'all')
const sortBy = ref<SortKey>((route.query.sort as SortKey) || 'newest')
const page = ref(Number(route.query.page) || 1)
const mobileFiltersOpen = ref(false)

const LIMIT = 20

// ─── Search debounce ─────────────────────────────────────────────────────────

let searchTimeout: ReturnType<typeof setTimeout>

watch(search, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
  }, 400)
})

onUnmounted(() => clearTimeout(searchTimeout))

// ─── Reset page on filter/sort change ────────────────────────────────────────

watch([debouncedSearch, selectedDifficulties, selectedLanguage, selectedStatus, sortBy], () => {
  page.value = 1
})

// ─── Reset status filter when logged out ─────────────────────────────────────

watch(isLoggedIn, (val) => {
  if (!val && selectedStatus.value !== 'all') {
    selectedStatus.value = 'all'
  }
})

// ─── Query params for API ────────────────────────────────────────────────────

const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    page: page.value,
    limit: LIMIT,
  }
  if (debouncedSearch.value.trim()) params.search = debouncedSearch.value.trim()
  if (sortBy.value !== 'newest') params.sort = sortBy.value
  if (selectedDifficulties.value.length) params.difficulty = selectedDifficulties.value.join(',')
  if (selectedLanguage.value) params.language = selectedLanguage.value
  if (selectedStatus.value !== 'all') params.status = selectedStatus.value
  return params
})

// ─── URL query sync ──────────────────────────────────────────────────────────

const urlQuery = computed(() => {
  const q: Record<string, string> = {}
  if (page.value > 1) q.page = String(page.value)
  if (debouncedSearch.value.trim()) q.search = debouncedSearch.value.trim()
  if (sortBy.value !== 'newest') q.sort = sortBy.value
  if (selectedDifficulties.value.length) q.difficulty = selectedDifficulties.value.join(',')
  if (selectedLanguage.value) q.language = selectedLanguage.value
  if (selectedStatus.value !== 'all') q.status = selectedStatus.value
  return q
})

watch(urlQuery, (q) => {
  router.replace({ query: q })
}, { flush: 'post' })

// ─── Data fetching ───────────────────────────────────────────────────────────

const { data, status, error, refresh } = await useFetch<TaskListResponse>(`${config.public.baseTarget}/api/tasks`, {
  query: queryParams,
})

const tasks = computed(() => data.value?.tasks ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / LIMIT))

// ─── Pagination helpers ──────────────────────────────────────────────────────

const paginationPages = computed(() => {
  const pages: (number | '...')[] = []
  const tp = totalPages.value
  const cp = page.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (cp > 3) pages.push('...')

  const start = Math.max(2, cp - 1)
  const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (cp < tp - 2) pages.push('...')
  pages.push(tp)

  return pages
})

// ─── Computed ────────────────────────────────────────────────────────────────

const activeFiltersCount = computed(() =>
  selectedDifficulties.value.length + (selectedLanguage.value ? 1 : 0) + (selectedStatus.value !== 'all' ? 1 : 0),
)

const hasActiveFilters = computed(() => activeFiltersCount.value > 0 || search.value.trim() !== '')

// ─── Actions ─────────────────────────────────────────────────────────────────

function toggleDifficulty(id: string) {
  const idx = selectedDifficulties.value.indexOf(id)
  idx === -1 ? selectedDifficulties.value.push(id) : selectedDifficulties.value.splice(idx, 1)
}

function toggleLanguage(id: string) {
  selectedLanguage.value = selectedLanguage.value === id ? null : id
}

function resetFilters() {
  search.value = ''
  debouncedSearch.value = ''
  clearTimeout(searchTimeout)
  selectedDifficulties.value = []
  selectedLanguage.value = null
  selectedStatus.value = 'all'
  sortBy.value = 'newest'
  page.value = 1
}

function getLanguageDef(id: string) {
  return languageDefs.find(l => l.id === id)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

    <!-- Page header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Задачи</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ total }} задач по HTML, CSS, JavaScript и TypeScript
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">

      <!-- ── SIDEBAR (desktop) ──────────────────────────────────────────── -->
      <aside class="hidden lg:flex flex-col w-56 xl:w-60 shrink-0">

        <!-- Search -->
        <div class="pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-800">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Поиск задач..."
            :ui="{ base: 'w-full' }"
          />
        </div>

        <!-- Difficulty -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Сложность</p>
          <div class="flex flex-col gap-1">
            <button
              v-for="d in difficultyDefs"
              :key="d.id"
              class="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left"
              :class="selectedDifficulties.includes(d.id)
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'"
              @click="toggleDifficulty(d.id)"
            >
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" :class="d.cls">
                {{ d.label }}
              </span>
              <UIcon
                v-if="selectedDifficulties.includes(d.id)"
                name="i-lucide-check"
                class="ml-auto size-3.5 text-violet-500 shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Language -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Технология</p>
          <div class="flex flex-col gap-0.5">
            <button
              v-for="lang in languageDefs"
              :key="lang.id"
              class="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left"
              :class="selectedLanguage === lang.id
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'"
              @click="toggleLanguage(lang.id)"
            >
              <span
                class="w-2.5 h-2.5 rounded shrink-0"
                :style="{ background: lang.style.color }"
              />
              <span
                class="flex-1 text-sm transition-colors"
                :class="selectedLanguage === lang.id
                  ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'"
              >
                {{ lang.label }}
              </span>
              <UIcon
                v-if="selectedLanguage === lang.id"
                name="i-lucide-check"
                class="size-3.5 text-violet-500 shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Status (only for authenticated users) -->
        <div v-if="isLoggedIn" class="mb-6">
          <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Статус</p>
          <div class="flex flex-col gap-0.5">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              class="flex items-center px-2.5 py-2 rounded-lg text-sm transition-colors text-left"
              :class="selectedStatus === opt.value
                ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'"
              @click="selectedStatus = opt.value as Status"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Reset -->
        <UButton
          v-if="hasActiveFilters"
          label="Сбросить фильтры"
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          size="sm"
          class="justify-start"
          @click="resetFilters"
        />
      </aside>

      <!-- ── MAIN CONTENT ────────────────────────────────────────────────── -->
      <div class="flex-1 min-w-0">

        <!-- Mobile: search + filter toggle -->
        <div class="lg:hidden space-y-3 mb-4">
          <div class="flex gap-2">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Поиск задач..."
              class="flex-1"
            />
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-sliders-horizontal"
              @click="mobileFiltersOpen = !mobileFiltersOpen"
            >
              <span class="sr-only">Фильтры</span>
              <UBadge
                v-if="activeFiltersCount > 0"
                :label="String(activeFiltersCount)"
                color="primary"
                size="xs"
                class="-top-1.5 -right-1.5 absolute"
              />
            </UButton>
          </div>

          <!-- Mobile filter panel -->
          <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="mobileFiltersOpen"
              class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-5"
            >
              <!-- Difficulty chips -->
              <div>
                <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2.5">Сложность</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in difficultyDefs"
                    :key="d.id"
                    class="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    :class="[
                      d.cls,
                      selectedDifficulties.includes(d.id)
                        ? 'ring-2 ring-offset-1 ring-violet-400 dark:ring-offset-zinc-900'
                        : 'opacity-70',
                    ]"
                    @click="toggleDifficulty(d.id)"
                  >
                    {{ d.label }}
                  </button>
                </div>
              </div>

              <!-- Language chips -->
              <div>
                <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2.5">Технология</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="lang in languageDefs"
                    :key="lang.id"
                    class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    :style="lang.style"
                    :class="selectedLanguage === lang.id
                      ? 'ring-2 ring-offset-1 ring-violet-400 dark:ring-offset-zinc-900'
                      : 'opacity-70'"
                    @click="toggleLanguage(lang.id)"
                  >
                    {{ lang.label }}
                  </button>
                </div>
              </div>

              <!-- Status (only for authenticated users) -->
              <div v-if="isLoggedIn">
                <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2.5">Статус</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                    :class="selectedStatus === opt.value
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'"
                    @click="selectedStatus = opt.value as Status"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <!-- Reset -->
              <UButton
                v-if="hasActiveFilters"
                label="Сбросить всё"
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                size="sm"
                @click="resetFilters"
              />
            </div>
          </Transition>
        </div>

        <!-- Active filter chips (desktop) -->
        <div v-if="activeFiltersCount > 0" class="hidden lg:flex flex-wrap gap-2 mb-4">
          <span
            v-for="d in selectedDifficulties"
            :key="`d-${d}`"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="difficultyDefs.find(x => x.id === d)?.cls"
          >
            {{ difficultyDefs.find(x => x.id === d)?.label }}
            <button class="hover:opacity-70" @click="toggleDifficulty(d)">
              <UIcon name="i-lucide-x" class="size-3" />
            </button>
          </span>
          <span
            v-if="selectedLanguage"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium"
            :style="getLanguageDef(selectedLanguage)?.style"
          >
            {{ getLanguageDef(selectedLanguage)?.label }}
            <button class="hover:opacity-70" @click="toggleLanguage(selectedLanguage!)">
              <UIcon name="i-lucide-x" class="size-3" />
            </button>
          </span>
        </div>

        <!-- Toolbar: count + sort -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <p class="text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
            <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ total }}</span>
            {{ total === 1 ? 'задача' : total < 5 ? 'задачи' : 'задач' }}
          </p>
          <USelect
            v-model="sortBy"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            size="sm"
            class="w-52"
          />
        </div>

        <!-- Loading state -->
        <div v-if="status === 'pending'" class="flex flex-col items-center justify-center py-20 text-center">
          <UIcon name="i-lucide-loader-2" class="size-8 text-violet-500 animate-spin mb-4" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Загрузка задач...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-alert-triangle" class="size-7 text-red-500" />
          </div>
          <p class="font-semibold mb-1">Не удалось загрузить задачи</p>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs">
            {{ error.message }}
          </p>
          <UButton label="Попробовать снова" variant="outline" color="neutral" @click="refresh()" />
        </div>

        <!-- Task list -->
        <div v-else-if="tasks.length" class="space-y-2">
          <NuxtLink
            v-for="task in tasks"
            :key="task.id"
            :to="`/tasks/${task.slug}`"
            class="group flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200 dark:hover:border-violet-800/60 hover:shadow-sm transition-all block"
          >
            <!-- Status dot -->
            <div class="pt-1 shrink-0">
              <span
                class="status-dot"
                :class="{
                  'status-dot-solved':    task.solved,
                  'status-dot-attempted': !task.solved && task.attempted,
                  'status-dot-unsolved':  !task.solved && !task.attempted,
                }"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <!-- Title row -->
              <div class="flex items-start justify-between gap-2 mb-1 flex-wrap">
                <span class="text-sm font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                  {{ task.id }}. {{ task.title }}
                </span>
                <span
                  class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="`badge-${task.difficulty}`"
                >
                  {{ difficultyDefs.find(d => d.id === task.difficulty)?.label ?? task.difficulty }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-2.5 hidden sm:block">
                {{ task.description }}
              </p>

              <!-- Tags + stats -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex flex-wrap gap-1.5">
                  <!-- Language badge -->
                  <span
                    v-if="task.language && getLanguageDef(task.language)"
                    class="px-2 py-0.5 rounded text-xs font-medium"
                    :style="getLanguageDef(task.language)!.style"
                  >
                    {{ getLanguageDef(task.language)!.label }}
                  </span>
                  <!-- Category tags -->
                  <span
                    v-for="cat in task.categories"
                    :key="cat"
                    class="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    {{ cat }}
                  </span>
                </div>
                <div class="ml-auto flex items-center gap-2 text-xs text-zinc-400 shrink-0">
                  <span class="hidden sm:block">{{ task.acceptance }}% принято</span>
                  <span class="hidden md:block">·</span>
                  <span class="hidden md:block">{{ task.solutions.toLocaleString('ru') }} решений</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-search-x" class="size-7 text-zinc-400" />
          </div>
          <p class="font-semibold mb-1">Задачи не найдены</p>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs">
            Попробуйте изменить поисковый запрос или сбросить фильтры
          </p>
          <UButton label="Сбросить фильтры" variant="outline" color="neutral" @click="resetFilters" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-6">
          <UButton
            icon="i-lucide-chevron-left"
            variant="outline"
            color="neutral"
            size="sm"
            :disabled="page <= 1"
            @click="page--"
          />
          <template v-for="p in paginationPages" :key="p">
            <span v-if="p === '...'" class="px-2 text-sm text-zinc-400">...</span>
            <UButton
              v-else
              :label="String(p)"
              :variant="p === page ? 'solid' : 'ghost'"
              :color="p === page ? 'primary' : 'neutral'"
              size="sm"
              class="min-w-8"
              @click="page = p as number"
            />
          </template>
          <UButton
            icon="i-lucide-chevron-right"
            variant="outline"
            color="neutral"
            size="sm"
            :disabled="page >= totalPages"
            @click="page++"
          />
        </div>

      </div>
    </div>
  </div>
</template>
