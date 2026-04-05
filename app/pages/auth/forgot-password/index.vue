<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

useSeoMeta({
  title: 'Восстановление пароля — FrontSkill',
  robots: 'noindex, nofollow',
})

const { $api } = useNuxtApp()
const toast = useToast()
const { email: savedEmail } = useForgotPassword()

const schema = z.object({
  email: z.email('Некорректный email'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await ($api as typeof $fetch)('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: event.data.email },
    })
  }
  catch (err: any) {
    const message = err?.data?.error || err?.message || 'Попробуйте позже'
    toast.add({
      title: 'Ошибка',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
    loading.value = false
    return
  }

  savedEmail.value = event.data.email
  loading.value = false

  toast.add({
    title: 'Код отправлен на вашу почту',
    color: 'success',
    icon: 'i-lucide-mail-check',
  })

  await navigateTo('/auth/forgot-password/verify')
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Восстановление пароля</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
        Введите email, привязанный к вашему аккаунту
      </p>
    </div>

    <UCard class="shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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

        <UButton
          type="submit"
          label="Отправить код"
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
  </div>
</template>
