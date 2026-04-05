<script setup lang="ts">
import type { LeaderboardResponse } from '~/types/leaderboard'

// ─── SEO ─────────────────────────────────────────────────────────────────────

useSeoMeta({
  title: 'Рейтинг фронтенд-разработчиков — Таблица лидеров | FrontSkill',
  description: 'Таблица лидеров FrontSkill — топ фронтенд-разработчиков по XP, стрикам и решённым задачам. Соревнуйтесь с другими разработчиками и улучшайте свои навыки.',
  keywords: 'рейтинг разработчиков, таблица лидеров, топ фронтендеров, соревнования по программированию, рейтинг программистов',
  ogTitle: 'Рейтинг фронтенд-разработчиков — FrontSkill',
  ogDescription: 'Топ фронтенд-разработчиков по XP, стрикам и решённым задачам.',
  ogUrl: 'https://frontskill.ru/leaderboard',
  twitterCard: 'summary',
})

// ─── Pagination ──────────────────────────────────────────────────────────────

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const currentPage = computed(() => {
  const p = Number(route.query.page)
  return p > 0 ? p : 1
})

// ─── Data fetching ───────────────────────────────────────────────────────────

const { data, status, error, refresh } = await useFetch<LeaderboardResponse>(
  () => `${config.public.baseTarget}/api/leaderboard`,
  {
    query: computed(() => ({ page: currentPage.value })),
    watch: [currentPage],
  },
)

const entries = computed(() => data.value?.leaderboard ?? [])
const total = computed(() => data.value?.total ?? 0)
const limit = computed(() => data.value?.limit ?? 20)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  router.push({ query: { ...route.query, page: page > 1 ? page : undefined } })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function xpLevel(xp: number) {
  if (xp >= 2500) return { label: 'Senior', class: 'badge-expert' }
  if (xp >= 1000) return { label: 'Middle', class: 'badge-hard' }
  if (xp >= 300) return { label: 'Junior', class: 'badge-medium' }
  return { label: 'Beginner', class: 'badge-easy' }
}

const rankMedals: Record<number, { icon: string; gradient: string; ring: string; text: string }> = {
  1: {
    icon: 'i-lucide-crown',
    gradient: 'from-amber-400 to-yellow-500',
    ring: 'ring-amber-300/50 dark:ring-amber-500/30',
    text: 'text-amber-500',
  },
  2: {
    icon: 'i-lucide-medal',
    gradient: 'from-zinc-300 to-zinc-400',
    ring: 'ring-zinc-300/50 dark:ring-zinc-400/30',
    text: 'text-zinc-400',
  },
  3: {
    icon: 'i-lucide-medal',
    gradient: 'from-amber-600 to-amber-700',
    ring: 'ring-amber-600/30 dark:ring-amber-700/30',
    text: 'text-amber-600',
  },
}

const paginationPages = computed(() => {
  const pages: (number | '...')[] = []
  const tp = totalPages.value
  const cp = currentPage.value

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
</script>

<template>
  <div>
    <!-- ── Hero ──────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-500/6 dark:bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Рейтинг</h1>
        <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Лучшие разработчики платформы по количеству набранных очков опыта
        </p>
      </div>
    </section>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <!-- ── Loading ───────────────────────────────────────────────────── -->
      <div v-if="status === 'pending'" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="i-lucide-loader-2" class="size-8 text-violet-500 animate-spin mb-4" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Загрузка рейтинга...</p>
      </div>

      <!-- ── Error ─────────────────────────────────────────────────────── -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-red-500" />
        </div>
        <p class="font-semibold mb-1">Не удалось загрузить рейтинг</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs">{{ error.message }}</p>
        <UButton label="Попробовать снова" variant="outline" color="neutral" @click="refresh()" />
      </div>

      <!-- ── Empty ─────────────────────────────────────────────────────── -->
      <div v-else-if="!entries.length" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <UIcon name="i-lucide-users" class="size-7 text-zinc-400" />
        </div>
        <p class="font-semibold mb-1">Рейтинг пуст</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Пока никто не набрал очков опыта</p>
      </div>

      <!-- ── Leaderboard ───────────────────────────────────────────────── -->
      <template v-else>

        <!-- Top-3 podium (only on first page) -->
        <div v-if="currentPage === 1 && entries.length >= 3" class="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <template v-for="idx in [1, 0, 2]" :key="entries[idx].id">
            <div
              class="relative flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              :class="{ 'sm:-mt-4': idx === 0 }"
            >
              <!-- Medal icon -->
              <div
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br flex items-center justify-center mb-3"
                :class="rankMedals[entries[idx].rank]?.gradient"
              >
                <UIcon
                  :name="rankMedals[entries[idx].rank]?.icon ?? 'i-lucide-medal'"
                  class="size-4 sm:size-5 text-white"
                />
              </div>

              <!-- Avatar -->
              <div class="mb-3">
                <div
                  v-if="entries[idx].avatarUrl"
                  class="w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden ring-3"
                  :class="rankMedals[entries[idx].rank]?.ring"
                >
                  <NuxtImg :src="entries[idx].avatarUrl!" :alt="entries[idx].username" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center ring-3"
                  :class="rankMedals[entries[idx].rank]?.ring"
                >
                  <span class="text-white text-xl sm:text-2xl font-bold">{{ entries[idx].username[0].toUpperCase() }}</span>
                </div>
              </div>

              <!-- Info -->
              <NuxtLink
                :to="`/users/${entries[idx].username}`"
                class="text-sm sm:text-base font-semibold truncate max-w-full hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {{ entries[idx].username }}
              </NuxtLink>

              <div class="flex items-center gap-1.5 mt-1.5">
                <UIcon name="i-lucide-star" class="size-3.5 text-violet-500" />
                <span class="text-sm font-semibold tabular-nums">{{ entries[idx].xp.toLocaleString('ru') }}</span>
                <span class="text-xs text-zinc-400">XP</span>
              </div>

              <div v-if="entries[idx].streakDays > 0" class="flex items-center gap-1 mt-1">
                <UIcon name="i-lucide-flame" class="size-3 text-amber-500" />
                <span class="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{{ entries[idx].streakDays }} дн.</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Table -->
        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

          <!-- Header -->
          <div class="hidden sm:grid grid-cols-[4rem_1fr_7rem_6rem_7rem] gap-2 px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <span class="text-center">#</span>
            <span>Пользователь</span>
            <span class="text-right">XP</span>
            <span class="text-right">Стрик</span>
            <span class="text-right">Уровень</span>
          </div>

          <!-- Rows -->
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <NuxtLink
              v-for="entry in (currentPage === 1 ? entries.slice(3) : entries)"
              :key="entry.id"
              :to="`/users/${entry.username}`"
              class="group flex items-center gap-3 px-4 py-3.5 sm:grid sm:grid-cols-[4rem_1fr_7rem_6rem_7rem] sm:gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Rank -->
              <span
                class="w-8 text-center text-sm font-bold tabular-nums shrink-0"
                :class="rankMedals[entry.rank] ? rankMedals[entry.rank].text : 'text-zinc-400'"
              >
                {{ entry.rank }}
              </span>

              <!-- User -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div v-if="entry.avatarUrl" class="w-9 h-9 rounded-full overflow-hidden shrink-0">
                  <NuxtImg :src="entry.avatarUrl" :alt="entry.username" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0">
                  <span class="text-white text-sm font-bold">{{ entry.username[0].toUpperCase() }}</span>
                </div>
                <span class="text-sm font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {{ entry.username }}
                </span>
              </div>

              <!-- XP -->
              <div class="flex items-center gap-1 sm:justify-end shrink-0">
                <UIcon name="i-lucide-star" class="size-3.5 text-violet-500 sm:hidden" />
                <span class="text-sm font-semibold tabular-nums">{{ entry.xp.toLocaleString('ru') }}</span>
              </div>

              <!-- Streak -->
              <div class="hidden sm:flex items-center gap-1 justify-end shrink-0">
                <UIcon name="i-lucide-flame" class="size-3.5 text-amber-500" />
                <span class="text-sm tabular-nums">{{ entry.streakDays }}</span>
              </div>

              <!-- Level -->
              <div class="hidden sm:flex justify-end shrink-0">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="xpLevel(entry.xp).class">
                  {{ xpLevel(entry.xp).label }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- ── Pagination ──────────────────────────────────────────────── -->
        <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 mt-6">
          <!-- Info -->
          <p class="text-sm text-zinc-400 hidden sm:block">
            {{ total.toLocaleString('ru') }} участников
          </p>

          <!-- Page buttons -->
          <nav class="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              class="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <UIcon name="i-lucide-chevron-left" class="size-4" />
            </button>

            <template v-for="(p, i) in paginationPages" :key="i">
              <span v-if="p === '...'" class="px-1 text-zinc-400 text-sm">...</span>
              <button
                v-else
                class="min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors"
                :class="p === currentPage
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
            </template>

            <button
              class="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <UIcon name="i-lucide-chevron-right" class="size-4" />
            </button>
          </nav>
        </div>
      </template>
    </div>
  </div>
</template>
