<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

useSeoMeta({ robots: 'noindex, nofollow' })

const { $api } = useNuxtApp()
const toast = useToast()
const { resetToken, clear: clearForgotPassword } = useForgotPassword()

// ─── Guard ───────
if (!resetToken.value) {
  await navigateTo('/auth/forgot-password', { replace: true })
}

const schema = z.object({
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

const state = reactive({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const success = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await ($api as typeof $fetch)('/api/auth/reset-password', {
      method: 'POST',
      body: {
        resetToken: resetToken.value,
        password: event.data.password,
      },
    })
    success.value = true
    clearForgotPassword()
  }
  catch (err: any) {
    const message = err?.data?.error || err?.message || 'Попробуйте позже'
    toast.add({
      title: 'Ошибка',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <!-- Success Screen -->
    <template v-if="success">
      <div class="text-center mb-8">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="size-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Пароль успешно изменён</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Теперь вы можете войти с новым паролем
        </p>
      </div>

      <UButton
        label="Войти"
        color="primary"
        class="w-full justify-center"
        to="/auth/login"
      />
    </template>

    <!-- Reset Form -->
    <template v-else>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold tracking-tight">Новый пароль</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Придумайте новый пароль для вашего аккаунта
        </p>
      </div>

      <UCard class="shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Новый пароль" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Минимум 8 символов"
              autocomplete="new-password"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Подтвердите пароль" name="confirmPassword">
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              autocomplete="new-password"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            label="Сменить пароль"
            color="primary"
            class="w-full justify-center"
            :loading="loading"
          />
        </UForm>
      </UCard>

      <p class="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        <NuxtLink
          to="/auth/login"
          class="text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          Вернуться ко входу
        </NuxtLink>
      </p>
    </template>
  </div>
</template>
