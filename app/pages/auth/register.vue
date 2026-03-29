<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  username: z.string()
    .min(3, 'Минимум 3 символа')
    .max(40, 'Максимум 40 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _'),
  email: z.email('Некорректный email'),
  password: z.string()
    .min(8, 'Минимум 8 символов'),
  agree: z.literal(true, { error: 'Необходимо принять условия' }),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  username: undefined,
  email: undefined,
  password: undefined,
  agree: false,
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await ($api as typeof $fetch)('/api/auth/register', {
      method: 'POST',
      body: {
        username: event.data.username,
        email: event.data.email,
        password: event.data.password,
      },
    })
    toast.add({
      title: 'Регистрация успешна',
      description: 'Теперь вы можете войти в аккаунт',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    await navigateTo('/auth/login')
  }
  catch (err: any) {
    const message = err?.data?.error || err?.error || 'Попробуйте позже'
    toast.add({
      title: 'Ошибка регистрации',
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
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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

        <UFormField name="agree">
          <UCheckbox v-model="state.agree">
            <template #label>
              <span class="text-sm text-zinc-500 dark:text-zinc-400">
                Принимаю
                <NuxtLink to="/terms" class="text-violet-600 dark:text-violet-400 hover:underline">условия использования</NuxtLink>
              </span>
            </template>
          </UCheckbox>
        </UFormField>

        <UButton
          type="submit"
          label="Зарегистрироваться"
          color="primary"
          class="w-full justify-center"
          :loading="loading"
        />
      </UForm>

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
