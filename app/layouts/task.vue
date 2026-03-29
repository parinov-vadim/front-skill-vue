<script setup lang="ts">
const route = useRoute()
const mobileMenuOpen = ref(false)
const { user, isLoggedIn, logout } = useAuth()

watch(() => route.path, () => { mobileMenuOpen.value = false })

async function handleLogout() {
  await logout()
  await navigateTo('/')
}

const navLinks = [
  { label: 'Задачи', to: '/tasks' },
  { label: 'Соревнования', to: '/contests' },
  { label: 'Рейтинг', to: '/leaderboard' },
]
</script>

<template>
  <div class="h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden">

    <!-- ── Header ── -->
    <header class="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm shrink-0">
      <div class="max-w-full mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0 mr-3">
          <div class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span class="text-white text-xs font-bold select-none">F</span>
          </div>
          <span class="font-semibold text-sm tracking-tight hidden sm:block">FrontSkill</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-0.5 flex-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="route.path.startsWith(link.to)
              ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-medium'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Spacer on mobile -->
        <div class="flex-1 md:hidden" />

        <!-- Controls -->
        <div class="flex items-center gap-1 shrink-0">
          <UColorModeButton size="sm" variant="ghost" color="neutral" />

          <template v-if="isLoggedIn">
            <UButton
              :to="`/users/${user?.username}`"
              :label="user?.username"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-user"
              class="hidden sm:flex"
            />
            <UButton
              label="Выйти"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-log-out"
              class="hidden sm:flex"
              @click="handleLogout"
            />
          </template>
          <template v-else>
            <UButton
              to="/auth/login"
              label="Войти"
              variant="ghost"
              color="neutral"
              size="sm"
              class="hidden sm:flex"
            />
            <UButton
              to="/auth/register"
              label="Регистрация"
              color="primary"
              size="sm"
              class="hidden sm:flex"
            />
          </template>

          <!-- Mobile hamburger -->
          <UButton
            :icon="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            variant="ghost"
            color="neutral"
            size="sm"
            class="flex md:hidden"
            aria-label="Меню"
            @click="mobileMenuOpen = !mobileMenuOpen"
          />
        </div>
      </div>
    </header>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-x-0 top-14 z-40 md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-sm shadow-lg"
      >
        <nav class="px-4 pt-3 pb-2 space-y-0.5">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="route.path.startsWith(link.to)
              ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-medium'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="px-4 pt-2 pb-4 border-t border-zinc-100 dark:border-zinc-800/60 flex gap-2">
          <template v-if="isLoggedIn">
            <UButton :to="`/users/${user?.username}`" :label="user?.username" icon="i-lucide-user" variant="outline" color="neutral" class="flex-1 justify-center" />
            <UButton label="Выйти" icon="i-lucide-log-out" variant="outline" color="neutral" class="flex-1 justify-center" @click="handleLogout" />
          </template>
          <template v-else>
            <UButton to="/auth/login" label="Войти" variant="outline" color="neutral" class="flex-1 justify-center" />
            <UButton to="/auth/register" label="Регистрация" color="primary" class="flex-1 justify-center" />
          </template>
        </div>
      </div>
    </Transition>

    <!-- ── Page content — fills remaining height ── -->
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

  </div>
</template>
