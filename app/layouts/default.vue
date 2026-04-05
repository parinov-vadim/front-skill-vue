<script setup lang="ts">
const route = useRoute()
const mobileMenuOpen = ref(false)
const { user, isLoggedIn, logout } = useAuth()

// Закрывать меню при переходе на другую страницу
watch(() => route.path, () => { mobileMenuOpen.value = false })

async function handleLogout() {
  await logout()
  await navigateTo('/')
}

const navLinks = [
  { label: 'Задачи', to: '/tasks' },
  { label: 'Документация', to: '/docs' },
  { label: 'Соревнования', to: '/contests' },
  { label: 'Рейтинг', to: '/leaderboard' },
]

const footerLinks = [
  {
    title: 'Платформа',
    links: [
      { label: 'Задачи', to: '/tasks' },
      { label: 'Соревнования', to: '/contests' },
      { label: 'Рейтинг', to: '/leaderboard' },
      { label: 'Дизайн-система', to: '/ui' },
    ],
  },
  {
    title: 'Технологии',
    links: [
      { label: 'HTML & CSS', to: '/tasks?category=css' },
      { label: 'JavaScript', to: '/tasks?category=js' },
      { label: 'TypeScript', to: '/tasks?category=ts' },
      { label: 'Vue', to: '/tasks?category=vue' },
      { label: 'React', to: '/tasks?category=react' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О проекте', to: '/about' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Блог', to: '/blog' },
      { label: 'Условия использования', to: '/terms' },
      { label: 'Конфиденциальность', to: '/privacy' },
    ],
  },
]

const socials = [
  { icon: 'i-simple-icons-github', href: 'https://github.com', label: 'GitHub' },
  { icon: 'i-simple-icons-telegram', href: 'https://t.me', label: 'Telegram' },
  { icon: 'i-simple-icons-vk', href: 'https://vk.com', label: 'ВКонтакте' },
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">

    <!-- ── Header ── -->
    <header class="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm shrink-0">

      <!-- Main bar -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0 mr-3">
          <div class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span class="text-white text-xs font-bold select-none">F</span>
          </div>
          <span class="font-semibold text-sm tracking-tight hidden sm:block">FrontSkill</span>
        </NuxtLink>

        <!-- Desktop nav — hidden on mobile -->
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

        <!-- Spacer on mobile to push controls to the right -->
        <div class="flex-1 md:hidden" />

        <!-- Controls -->
        <div class="flex items-center gap-1 shrink-0">
          <UColorModeButton size="sm" variant="ghost" color="neutral" />

          <!-- Desktop auth buttons -->
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

    <!-- Mobile menu — вне <header>, чтобы не менять его высоту -->
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
        <!-- Nav links -->
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

        <!-- Auth buttons -->
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

    <!-- ── Page content ── -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- ── Footer ── -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">

        <!-- Main grid: 1 col mobile → 5 col desktop -->
        <div class="py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-5 gap-8">

          <!-- Brand -->
          <div class="sm:col-span-2">
            <NuxtLink to="/" class="flex items-center gap-2 mb-4 w-fit">
              <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <span class="text-white text-sm font-bold select-none">F</span>
              </div>
              <span class="font-semibold tracking-tight">FrontSkill</span>
            </NuxtLink>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mb-5">
              Бесплатная платформа для практики фронтенд-разработки. Реальные задачи, живой предпросмотр, русскоязычное сообщество.
            </p>
            <div class="flex items-center gap-2">
              <a
                v-for="social in socials"
                :key="social.label"
                :href="social.href"
                :aria-label="social.label"
                target="_blank"
                rel="noopener noreferrer"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <UIcon :name="social.icon" class="size-4" />
              </a>
            </div>
          </div>

          <!-- Link columns — on mobile они идут в 3 равные колонки -->
          <div class="grid grid-cols-2 gap-6 sm:contents">
            <div v-for="col in footerLinks" :key="col.title">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{{ col.title }}</p>
              <ul class="space-y-2">
                <li v-for="link in col.links" :key="link.label">
                  <NuxtLink
                    :to="link.to"
                    class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-zinc-200 dark:border-zinc-800 py-5 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
          <p class="text-xs text-zinc-400 order-last sm:order-first">
            © {{ new Date().getFullYear() }} FrontSkill. Все права защищены.
          </p>
          <div class="flex items-center gap-4 flex-wrap justify-center">
            <NuxtLink to="/terms" class="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              Условия
            </NuxtLink>
            <NuxtLink to="/privacy" class="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              Конфиденциальность
            </NuxtLink>
            <span class="flex items-center gap-1.5 text-xs text-zinc-400">
              Сделано с <UIcon name="i-lucide-heart" class="size-3 text-violet-500" /> для фронтендеров
            </span>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>
