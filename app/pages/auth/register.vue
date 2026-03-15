<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const state = reactive({
  username: '',
  email: '',
  password: '',
  agree: false,
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
      <h1 class="text-2xl font-bold tracking-tight">Создать аккаунт</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
        Уже есть аккаунт?
        <NuxtLink to="/auth/login" class="text-violet-600 dark:text-violet-400 hover:underline font-medium">
          Войти
        </NuxtLink>
      </p>
    </div>

    <UCard class="shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="Имя пользователя" name="username">
          <UInput
            v-model="state.username"
            placeholder="frontend_ninja"
            autocomplete="username"
            icon="i-lucide-at-sign"
            class="w-full"
          />
        </UFormField>

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
            placeholder="Минимум 8 символов"
            autocomplete="new-password"
            icon="i-lucide-lock"
            class="w-full"
          />
        </UFormField>

        <UCheckbox v-model="state.agree">
          <template #label>
            <span class="text-sm text-zinc-500 dark:text-zinc-400">
              Принимаю
              <NuxtLink to="/terms" class="text-violet-600 dark:text-violet-400 hover:underline">условия использования</NuxtLink>
            </span>
          </template>
        </UCheckbox>

        <UButton
          type="submit"
          label="Зарегистрироваться"
          color="primary"
          class="w-full justify-center"
          :loading="loading"
          :disabled="!state.agree"
        />
      </form>

      <UDivider label="или" class="my-4" />

      <UButton
        label="Регистрация через GitHub"
        icon="i-simple-icons-github"
        variant="outline"
        color="neutral"
        class="w-full justify-center"
      />
    </UCard>
  </div>
</template>
