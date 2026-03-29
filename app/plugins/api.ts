import { appendResponseHeader } from 'h3'
import type { User, RefreshResponse } from '~/types/user'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const accessToken = useCookie('access_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })

  // Capture SSR-only values synchronously (before any await) to avoid context loss
  const ssrCookies = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  const ssrEvent = import.meta.server ? useRequestEvent() : undefined

  const api = $fetch.create({
    baseURL: config.public.baseTarget,
    credentials: 'include',

    onRequest({ options }) {
      const headers = new Headers(options.headers)

      try {
        if (accessToken.value) {
          headers.set('Authorization', `Bearer ${accessToken.value}`)
        }
      }
      catch {}

      if (import.meta.server && ssrCookies?.cookie) {
        headers.set('Cookie', ssrCookies.cookie)
      }

      options.headers = headers
    },

    onResponse({ response }) {
      if (!import.meta.server || !ssrEvent) return

      const setCookies = response.headers.getSetCookie?.()
      if (!setCookies?.length) return

      for (const cookie of setCookies) {
        appendResponseHeader(ssrEvent, 'set-cookie', cookie)
      }
    },
  })

  // ─── Init auth ───
  // Use raw $fetch with explicit headers — $fetch.create interceptors
  // lose Nuxt async context after await in the plugin
  const user = useState<User | null>('auth:user', () => null)

  if (accessToken.value && !user.value) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken.value}`,
    }
    if (import.meta.server && ssrCookies?.cookie) {
      headers['Cookie'] = ssrCookies.cookie
    }

    try {
      user.value = await $fetch<User>('/api/auth/me', {
        baseURL: config.public.baseTarget,
        headers,
        credentials: 'include',
      })
    }
    catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        try {
          const data = await $fetch<RefreshResponse>('/api/auth/refresh', {
            baseURL: config.public.baseTarget,
            method: 'POST',
            headers,
            credentials: 'include',
          })
          accessToken.value = data.accessToken
          user.value = await $fetch<User>('/api/auth/me', {
            baseURL: config.public.baseTarget,
            headers: { ...headers, Authorization: `Bearer ${data.accessToken}` },
            credentials: 'include',
          })
        }
        catch {}
      }
    }
  }

  return { provide: { api } }
})
