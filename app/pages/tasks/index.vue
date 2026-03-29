<script setup lang="ts">
import type { Difficulty, Task, TaskListResponse } from '~/types/task'

useHead({ title: 'Задачи — FrontSkill' })

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'all' | 'solved' | 'attempted' | 'unsolved'
type SortKey = 'popular' | 'newest' | 'acceptance-desc' | 'acceptance-asc' | 'difficulty-asc' | 'difficulty-desc'

// ─── Data fetching ───────────────────────────────────────────────────────────

const config = useRuntimeConfig()

const { data, status, error, refresh } = await useFetch<TaskListResponse>(`${config.public.baseTarget}/api/tasks`)

const allTasks = computed(() => data.value?.tasks ?? [])

// ─── Category definitions ─────────────────────────────────────────────────────

const categoryDefs = [
  { id: 'css',   label: 'CSS',        style: { color: 'var(--tag-css)',     background: 'var(--tag-css-bg)' } },
  { id: 'js',    label: 'JavaScript', style: { color: 'var(--tag-js)',      background: 'var(--tag-js-bg)' } },
  { id: 'ts',    label: 'TypeScript', style: { color: 'var(--tag-ts)',      background: 'var(--tag-ts-bg)' } },
  { id: 'vue',   label: 'Vue',        style: { color: 'var(--tag-vue)',     background: 'var(--tag-vue-bg)' } },
  { id: 'react', label: 'React',      style: { color: 'var(--tag-react)',   background: 'var(--tag-react-bg)' } },
  { id: 'html',  label: 'HTML',       style: { color: 'var(--tag-html)',    background: 'var(--tag-html-bg)' } },
  { id: 'svg',   label: 'SVG',        style: { color: 'var(--tag-svg)',     background: 'var(--tag-svg-bg)' } },
  { id: 'a11y',  label: 'A11y',       style: { color: 'var(--tag-a11y)',    background: 'var(--tag-a11y-bg)' } },
]

const difficultyDefs = [
  { id: 'easy',   label: 'Легко',   cls: 'badge-easy' },
  { id: 'medium', label: 'Средне',  cls: 'badge-medium' },
  { id: 'hard',   label: 'Сложно',  cls: 'badge-hard' },
  { id: 'expert', label: 'Эксперт', cls: 'badge-expert' },
]

const statusOptions = [
  { value: 'all',       label: 'Все задачи' },
  { value: 'solved',    label: 'Решённые' },
  { value: 'attempted', label: 'В процессе' },
  { value: 'unsolved',  label: 'Нерешённые' },
]

const sortOptions = [
  { value: 'popular',          label: 'По популярности' },
  { value: 'acceptance-desc',  label: 'По % принятых ↓' },
  { value: 'acceptance-asc',   label: 'По % принятых ↑' },
  { value: 'difficulty-asc',   label: 'Сначала лёгкие' },
  { value: 'difficulty-desc',  label: 'Сначала сложные' },
  { value: 'newest',           label: 'Новые' },
]

// ─── Filter state ─────────────────────────────────────────────────────────────

const search = ref('')
const selectedDifficulties = ref<string[]>([])
const selectedCategories = ref<string[]>([])
const selectedStatus = ref<Status>('all')
const sortBy = ref<SortKey>('popular')
const mobileFiltersOpen = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────

const difficultyOrder: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2, expert: 3 }

const filteredTasks = computed(() => {
  let result = allTasks.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
  }

  if (selectedDifficulties.value.length)
    result = result.filter(t => selectedDifficulties.value.includes(t.difficulty))

  if (selectedCategories.value.length)
    result = result.filter(t => t.categories.some(c => selectedCategories.value.includes(c)))

  if (selectedStatus.value === 'solved')    result = result.filter(t => t.solved)
  if (selectedStatus.value === 'attempted') result = result.filter(t => !t.solved && t.attempted)
  if (selectedStatus.value === 'unsolved')  result = result.filter(t => !t.solved && !t.attempted)

  return [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'popular':         return b.solutions - a.solutions
      case 'acceptance-desc': return b.acceptance - a.acceptance
      case 'acceptance-asc':  return a.acceptance - b.acceptance
      case 'difficulty-asc':  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      case 'difficulty-desc': return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
      default:                return 0
    }
  })
})

const activeFiltersCount = computed(() =>
  selectedDifficulties.value.length + selectedCategories.value.length + (selectedStatus.value !== 'all' ? 1 : 0),
)

const hasActiveFilters = computed(() => activeFiltersCount.value > 0 || search.value.trim() !== '')

function toggleDifficulty(id: string) {
  const idx = selectedDifficulties.value.indexOf(id)
  idx === -1 ? selectedDifficulties.value.push(id) : selectedDifficulties.value.splice(idx, 1)
}

function toggleCategory(id: string) {
  const idx = selectedCategories.value.indexOf(id)
  idx === -1 ? selectedCategories.value.push(id) : selectedCategories.value.splice(idx, 1)
}

function resetFilters() {
  search.value = ''
  selectedDifficulties.value = []
  selectedCategories.value = []
  selectedStatus.value = 'all'
  sortBy.value = 'popular'
}

function getCategoryDef(id: string) {
  return categoryDefs.find(c => c.id === id)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

    <!-- Page header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Задачи</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ allTasks.length }} задач по HTML, CSS, JavaScript, TypeScript, Vue и React
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">

      <!-- ── SIDEBAR (desktop) ──────────────────────────────────────────── -->
      <aside class="hidden lg:flex flex-col w-56 xl:w-60 shrink-0">

        <!-- Search — отделён бордером снизу -->
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
              <span
                class="ml-auto text-xs transition-colors shrink-0"
                :class="selectedDifficulties.includes(d.id)
                  ? 'text-zinc-600 dark:text-zinc-300'
                  : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'"
              >
                {{ allTasks.filter(t => t.difficulty === d.id).length }}
              </span>
              <UIcon
                v-if="selectedDifficulties.includes(d.id)"
                name="i-lucide-check"
                class="size-3.5 text-violet-500 shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Category -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Технология</p>
          <div class="flex flex-col gap-0.5">
            <button
              v-for="cat in categoryDefs"
              :key="cat.id"
              class="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left"
              :class="selectedCategories.includes(cat.id)
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'"
              @click="toggleCategory(cat.id)"
            >
              <span
                class="w-2.5 h-2.5 rounded shrink-0"
                :style="{ background: cat.style.color }"
              />
              <span
                class="flex-1 text-sm transition-colors"
                :class="selectedCategories.includes(cat.id)
                  ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'"
              >
                {{ cat.label }}
              </span>
              <span
                class="text-xs transition-colors shrink-0"
                :class="selectedCategories.includes(cat.id)
                  ? 'text-zinc-600 dark:text-zinc-300'
                  : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'"
              >
                {{ allTasks.filter(t => t.categories.includes(cat.id)).length }}
              </span>
              <UIcon
                v-if="selectedCategories.includes(cat.id)"
                name="i-lucide-check"
                class="size-3.5 text-violet-500 shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-6">
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

              <!-- Category chips -->
              <div>
                <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2.5">Технология</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="cat in categoryDefs"
                    :key="cat.id"
                    class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    :style="cat.style"
                    :class="selectedCategories.includes(cat.id)
                      ? 'ring-2 ring-offset-1 ring-violet-400 dark:ring-offset-zinc-900'
                      : 'opacity-70'"
                    @click="toggleCategory(cat.id)"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <!-- Status -->
              <div>
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
            v-for="c in selectedCategories"
            :key="`c-${c}`"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium"
            :style="getCategoryDef(c)?.style"
          >
            {{ getCategoryDef(c)?.label }}
            <button class="hover:opacity-70" @click="toggleCategory(c)">
              <UIcon name="i-lucide-x" class="size-3" />
            </button>
          </span>
        </div>

        <!-- Toolbar: count + sort -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <p class="text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
            <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ filteredTasks.length }}</span>
            {{ filteredTasks.length === 1 ? 'задача' : filteredTasks.length < 5 ? 'задачи' : 'задач' }}
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
        <div v-else-if="filteredTasks.length" class="space-y-2">
          <NuxtLink
            v-for="task in filteredTasks"
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
                  {{ difficultyDefs.find(d => d.id === task.difficulty)?.label }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-2.5 hidden sm:block">
                {{ task.description }}
              </p>

              <!-- Tags + stats -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="catId in task.categories"
                    :key="catId"
                    class="px-2 py-0.5 rounded text-xs font-medium"
                    :style="getCategoryDef(catId)?.style"
                  >
                    {{ getCategoryDef(catId)?.label }}
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

      </div>
    </div>
  </div>
</template>
