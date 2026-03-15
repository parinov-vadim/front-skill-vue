<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center px-4 py-12">

    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2.5 mb-8 group">
      <div class="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:bg-violet-500 transition-colors">
        <span class="text-white text-sm font-bold select-none">F</span>
      </div>
      <span class="font-semibold text-lg tracking-tight">FrontSkill</span>
    </NuxtLink>

    <slot />

    <!-- Bottom controls -->
    <div class="mt-8 flex items-center gap-3 text-sm text-zinc-400">
      <UColorModeButton size="xs" variant="ghost" color="neutral" />
      <span>·</span>
      <NuxtLink to="/" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
        На главную
      </NuxtLink>
    </div>
  </div>
</template>
