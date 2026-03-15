<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const state = reactive({
  email: '',
  password: '',
})

const loading = ref(false)

async function onSubmit() {
  loading.value = true
  // TODO: implement auth
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Вход в аккаунт</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
        Нет аккаунта?
        <NuxtLink to="/auth/register" class="text-violet-600 dark:text-violet-400 hover:underline font-medium">
          Зарегистрироваться
        </NuxtLink>
      </p>
    </div>

    <UCard class="shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            icon="i-lucide-mail"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Пароль" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            icon="i-lucide-lock"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between">
          <UCheckbox label="Запомнить меня" />
          <NuxtLink
            to="/auth/forgot-password"
            class="text-sm text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Забыли пароль?
          </NuxtLink>
        </div>

        <UButton
          type="submit"
          label="Войти"
          color="primary"
          class="w-full justify-center"
          :loading="loading"
        />
      </form>

      <UDivider label="или" class="my-4" />

      <UButton
        label="Войти через GitHub"
        icon="i-simple-icons-github"
        variant="outline"
        color="neutral"
        class="w-full justify-center"
      />
    </UCard>
  </div>
</template>
