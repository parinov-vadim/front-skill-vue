<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useSeoMeta({ robots: 'noindex, nofollow' })

const { $api } = useNuxtApp()
const toast = useToast()
const { email, resetToken } = useForgotPassword()

// ─── Guard ───────
if (!email.value) {
  await navigateTo('/auth/forgot-password', { replace: true })
}

// ─── OTP State ───────
const digits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const error = ref('')
const loading = ref(false)

function setInputRef(el: any, index: number) {
  inputRefs.value[index] = el?.$el?.querySelector('input') ?? el
}

function onInput(index: number) {
  error.value = ''
  const val = digits.value[index]

  if (val && !/^\d$/.test(val)) {
    digits.value[index] = ''
    return
  }

  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  if (digits.value.every(d => d.length === 1)) {
    verifyCode()
  }
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6)
  if (!text) return

  for (let i = 0; i < 6; i++) {
    digits.value[i] = text[i] || ''
  }

  const focusIndex = Math.min(text.length, 5)
  inputRefs.value[focusIndex]?.focus()

  if (text.length === 6) {
    verifyCode()
  }
}

// ─── Code Timer (15 min) ───────
const CODE_LIFETIME = 15 * 60
const codeSecondsLeft = ref(CODE_LIFETIME)
let codeTimer: ReturnType<typeof setInterval> | null = null

function startCodeTimer() {
  codeSecondsLeft.value = CODE_LIFETIME
  if (codeTimer) clearInterval(codeTimer)
  codeTimer = setInterval(() => {
    if (codeSecondsLeft.value > 0) {
      codeSecondsLeft.value--
    }
    else {
      clearInterval(codeTimer!)
      codeTimer = null
    }
  }, 1000)
}

const codeTimerDisplay = computed(() => {
  const m = Math.floor(codeSecondsLeft.value / 60)
  const s = codeSecondsLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

// ─── Resend Cooldown (60s) ───────
const RESEND_COOLDOWN = 60
const resendSecondsLeft = ref(RESEND_COOLDOWN)
let resendTimer: ReturnType<typeof setInterval> | null = null
const resending = ref(false)

function startResendTimer() {
  resendSecondsLeft.value = RESEND_COOLDOWN
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    if (resendSecondsLeft.value > 0) {
      resendSecondsLeft.value--
    }
    else {
      clearInterval(resendTimer!)
      resendTimer = null
    }
  }, 1000)
}

const canResend = computed(() => resendSecondsLeft.value === 0 && !resending.value)

async function resendCode() {
  if (!canResend.value) return
  resending.value = true
  try {
    await ($api as typeof $fetch)('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    toast.add({
      title: 'Код отправлен повторно',
      color: 'success',
      icon: 'i-lucide-mail-check',
    })
    digits.value = ['', '', '', '', '', '']
    error.value = ''
    startCodeTimer()
    startResendTimer()
    nextTick(() => inputRefs.value[0]?.focus())
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
    resending.value = false
  }
}

// ─── Verify ───────
async function verifyCode() {
  const code = digits.value.join('')
  if (code.length !== 6) return

  loading.value = true
  error.value = ''

  try {
    const data = await ($api as typeof $fetch)<{ resetToken: string }>('/api/auth/verify-reset-code', {
      method: 'POST',
      body: { email: email.value, code },
    })
    resetToken.value = data.resetToken
    await navigateTo('/auth/forgot-password/reset')
  }
  catch (err: any) {
    const message = err?.data?.error || err?.message || 'Попробуйте позже'
    error.value = message
    digits.value = ['', '', '', '', '', '']
    nextTick(() => inputRefs.value[0]?.focus())
  }
  finally {
    loading.value = false
  }
}

// ─── Lifecycle ───────
onMounted(() => {
  startCodeTimer()
  startResendTimer()
  inputRefs.value[0]?.focus()
})

onUnmounted(() => {
  if (codeTimer) clearInterval(codeTimer)
  if (resendTimer) clearInterval(resendTimer)
})
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Введите код</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
        Код отправлен на <span class="font-medium text-zinc-700 dark:text-zinc-300">{{ email }}</span>
      </p>
    </div>

    <UCard class="shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
      <div class="space-y-5">
        <!-- OTP Inputs -->
        <div class="flex justify-center gap-2" @paste="onPaste">
          <input
            v-for="(_, i) in 6"
            :key="i"
            :ref="(el) => setInputRef(el, i)"
            v-model="digits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="w-11 h-13 text-center text-xl font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            :disabled="loading"
            @input="onInput(i)"
            @keydown="onKeydown($event, i)"
          >
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-500 text-center">
          {{ error }}
        </p>

        <!-- Timer -->
        <p class="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <template v-if="codeSecondsLeft > 0">
            Код действителен ещё <span class="font-medium tabular-nums">{{ codeTimerDisplay }}</span>
          </template>
          <template v-else>
            <span class="text-red-500">Код истёк</span>
          </template>
        </p>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center">
          <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-violet-600" />
        </div>

        <!-- Resend -->
        <div class="text-center">
          <button
            :disabled="!canResend"
            class="text-sm transition-colors disabled:text-zinc-400 disabled:cursor-not-allowed text-violet-600 dark:text-violet-400 hover:underline"
            @click="resendCode"
          >
            <template v-if="canResend">
              Отправить повторно
            </template>
            <template v-else-if="resending">
              Отправка...
            </template>
            <template v-else>
              Отправить повторно через {{ resendSecondsLeft }}с
            </template>
          </button>
        </div>
      </div>
    </UCard>

    <p class="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
      <NuxtLink
        to="/auth/forgot-password"
        class="text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        Назад
      </NuxtLink>
    </p>
  </div>
</template>
