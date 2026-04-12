<script setup lang="ts">
import type { UserProfile } from '~/types/user'

const route = useRoute()
const username = route.params.username as string
const config = useRuntimeConfig()

// ─── Data fetching ──────────────────────────────────────────────────────────

const { data: profile, status, error } = await useFetch<UserProfile>(
  `${config.public.baseTarget}/api/users/${username}`,
)

useSeoMeta({
  title: computed(() =>
    profile.value ? `${profile.value.username} — профиль разработчика | FrontSkill` : 'Профиль не найден — FrontSkill',
  ),
  description: computed(() =>
    profile.value ? `Профиль ${profile.value.username} на FrontSkill — решённые задачи, рейтинг и статистика фронтенд-разработчика.` : '',
  ),
  ogTitle: computed(() => profile.value ? `${profile.value.username} — FrontSkill` : ''),
  ogDescription: computed(() => profile.value ? `Профиль и статистика ${profile.value.username} на FrontSkill.` : ''),
  ogUrl: computed(() => `https://frontskill.ru/users/${username}`),
  twitterCard: 'summary',
  twitterTitle: computed(() => profile.value ? `${profile.value.username} — FrontSkill` : ''),
  twitterDescription: computed(() => profile.value ? `Профиль и статистика ${profile.value.username} на FrontSkill.` : ''),
})

if (profile.value) {
  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: 'Главная', item: '/' },
        { name: 'Рейтинг', item: '/leaderboard' },
        { name: profile.value.username },
      ],
    }),
  ])
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const categoryDefs: Record<string, { label: string; color: string; bg: string }> = {
  css: { label: 'CSS', color: 'var(--tag-css)', bg: 'var(--tag-css-bg)' },
  js: { label: 'JavaScript', color: 'var(--tag-js)', bg: 'var(--tag-js-bg)' },
  ts: { label: 'TypeScript', color: 'var(--tag-ts)', bg: 'var(--tag-ts-bg)' },
  vue: { label: 'Vue', color: 'var(--tag-vue)', bg: 'var(--tag-vue-bg)' },
  react: { label: 'React', color: 'var(--tag-react)', bg: 'var(--tag-react-bg)' },
  html: { label: 'HTML', color: 'var(--tag-html)', bg: 'var(--tag-html-bg)' },
  svg: { label: 'SVG', color: 'var(--tag-svg)', bg: 'var(--tag-svg-bg)' },
  a11y: { label: 'A11y', color: 'var(--tag-a11y)', bg: 'var(--tag-a11y-bg)' },
}

const roleDefs: Record<string, { label: string; class: string }> = {
  admin: { label: 'Админ', class: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
  moderator: { label: 'Модератор', class: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
}

const difficultyLabels: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
  expert: 'Эксперт',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин. назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч. назад`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} дн. назад`
  return formatDate(iso)
}

function xpLevel(xp: number) {
  if (xp >= 2500) return { label: 'Senior', class: 'badge-expert' }
  if (xp >= 1000) return { label: 'Middle', class: 'badge-hard' }
  if (xp >= 300) return { label: 'Junior', class: 'badge-medium' }
  return { label: 'Beginner', class: 'badge-easy' }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <UIcon name="i-lucide-loader-2" class="size-8 text-violet-500 animate-spin mb-4" />
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Загрузка профиля...</p>
    </div>

    <!-- Error / Not found -->
    <div v-else-if="error || !profile" class="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-user-x" class="size-7 text-zinc-400" />
      </div>
      <p class="font-semibold mb-1">Пользователь не найден</p>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        {{ error?.message ?? `Пользователя «${username}» не существует` }}
      </p>
      <UButton to="/" label="На главную" variant="outline" color="neutral" />
    </div>

    <!-- Profile -->
    <div v-else>

      <!-- ── Hero banner ── -->
      <section class="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div class="absolute inset-0 -z-10">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-500/6 dark:bg-violet-500/8 rounded-full blur-3xl" />
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            <!-- Avatar -->
            <div class="shrink-0">
              <div v-if="profile.avatarUrl" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 ring-4 ring-white dark:ring-zinc-900">
                <NuxtImg :src="profile.avatarUrl" :alt="profile.username" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30 ring-4 ring-white dark:ring-zinc-900">
                <span class="text-white text-3xl sm:text-4xl font-bold">{{ profile.username[0].toUpperCase() }}</span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 text-center sm:text-left">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{{ profile.username }}</h1>
                <span
                  v-if="roleDefs[profile.role]"
                  class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="roleDefs[profile.role].class"
                >
                  {{ roleDefs[profile.role].label }}
                </span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="xpLevel(profile.xp).class"
                >
                  {{ xpLevel(profile.xp).label }}
                </span>
              </div>

              <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                На платформе с {{ formatDate(profile.createdAt) }}
                <template v-if="profile.lastActive">
                  · был {{ relativeDate(profile.lastActive) }}
                </template>
              </p>

              <!-- Inline stats -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-star" class="size-4 text-violet-500" />
                  <span class="text-sm"><strong class="font-semibold">{{ profile.xp.toLocaleString('ru') }}</strong> <span class="text-zinc-400">XP</span></span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="size-4 text-green-500" />
                  <span class="text-sm"><strong class="font-semibold">{{ profile.stats?.solved ?? 0 }}</strong> <span class="text-zinc-400">решено</span></span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-flame" class="size-4 text-amber-500" />
                  <span class="text-sm"><strong class="font-semibold">{{ profile.streakDays }}</strong> <span class="text-zinc-400">дней подряд</span></span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-send" class="size-4 text-blue-500" />
                  <span class="text-sm"><strong class="font-semibold">{{ (profile.stats?.totalSubmissions ?? 0).toLocaleString('ru') }}</strong> <span class="text-zinc-400">отправок</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Content ── -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div class="grid lg:grid-cols-3 gap-6 lg:gap-8">

          <!-- Left: Category progress -->
          <div>
            <h2 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Прогресс по категориям</h2>

            <div v-if="profile.categoryProgress?.length" class="space-y-3.5">
              <div v-for="cat in (profile.categoryProgress ?? [])" :key="cat.category">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-2.5 h-2.5 rounded-sm shrink-0"
                      :style="{ background: categoryDefs[cat.category]?.color }"
                    />
                    <span class="text-sm font-medium">{{ categoryDefs[cat.category]?.label ?? cat.category }}</span>
                  </div>
                  <span class="text-xs text-zinc-400 tabular-nums">{{ cat.solved }}/{{ cat.total }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: cat.total ? `${(cat.solved / cat.total) * 100}%` : '0%',
                      background: categoryDefs[cat.category]?.color,
                    }"
                  />
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-zinc-400">Пока нет решённых задач</p>
          </div>

          <!-- Right: Recent activity -->
          <div class="lg:col-span-2">
            <h2 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Последняя активность</h2>

            <div v-if="profile.recentActivity?.length" class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              <NuxtLink
                v-for="activity in (profile.recentActivity ?? [])"
                :key="activity.taskSlug + activity.date"
                :to="`/tasks/${activity.taskSlug}`"
                class="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <!-- Status dot -->
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :class="activity.status === 'passed' ? 'bg-green-500' : 'bg-red-500'"
                />

                <!-- Task title -->
                <span class="flex-1 text-sm font-medium truncate">{{ activity.taskTitle }}</span>

                <!-- Difficulty badge -->
                <span
                  class="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                  :class="`badge-${activity.difficulty}`"
                >
                  {{ difficultyLabels[activity.difficulty] ?? activity.difficulty }}
                </span>

                <!-- Time -->
                <span class="text-xs text-zinc-400 shrink-0 tabular-nums">{{ relativeDate(activity.date) }}</span>
              </NuxtLink>
            </div>

            <div v-else class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <UIcon name="i-lucide-clock" class="size-8 text-zinc-300 dark:text-zinc-600 mb-2 mx-auto" />
              <p class="text-sm text-zinc-400">Нет активности</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
