import type { User, LoginResponse, RefreshResponse } from '~/types/user'

export function useAuth() {
  const user = useState<User | null>('auth:user', () => null)
  const accessToken = useCookie('access_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days (actual expiry is handled by JWT validation on backend)
    path: '/',
    sameSite: 'lax',
  })

  const isLoggedIn = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const { $api } = useNuxtApp()
    const data = await ($api as typeof $fetch)<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    accessToken.value = data.accessToken
    // Pass token explicitly — useCookie in the plugin interceptor
    // may not yet reflect the updated value on the same tick
    user.value = await ($api as typeof $fetch)<User>('/api/auth/me', {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
  }

  async function refresh(): Promise<boolean> {
    const { $api } = useNuxtApp()
    try {
      const data = await ($api as typeof $fetch)<RefreshResponse>('/api/auth/refresh', {
        method: 'POST',
      })
      accessToken.value = data.accessToken
      return true
    }
    catch (err: any) {
      // Only clear tokens if refresh was explicitly rejected by the backend
      if (err?.status === 401 || err?.status === 403 || err?.statusCode === 401 || err?.statusCode === 403) {
        accessToken.value = null
        user.value = null
      }
      return false
    }
  }

  async function fetchUser() {
    if (!accessToken.value) {
      user.value = null
      return
    }

    const { $api } = useNuxtApp()
    try {
      user.value = await ($api as typeof $fetch)<User>('/api/auth/me')
    }
    catch (err: any) {
      // Token expired — try refresh
      if (err?.status === 401 || err?.statusCode === 401) {
        const ok = await refresh()
        if (ok) {
          try {
            user.value = await ($api as typeof $fetch)<User>('/api/auth/me')
            return
          }
          catch {}
        }
        // 401 + refresh failed → token is definitely invalid
        return
      }
      // Non-401 errors (network, 500, etc.) — keep token, clear user
      user.value = null
    }
  }

  async function logout() {
    const { $api } = useNuxtApp()
    try {
      await ($api as typeof $fetch)('/api/auth/logout', { method: 'POST' })
    }
    catch {}
    accessToken.value = null
    user.value = null
  }

  return { user, isLoggedIn, login, logout, fetchUser, refresh }
}
