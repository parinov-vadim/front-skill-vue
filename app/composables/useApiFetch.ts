/**
 * Authenticated fetch wrapper with automatic 401 → refresh → retry.
 *
 * Usage:
 *   const { apiFetch } = useApiFetch()
 *   const tasks = await apiFetch<Task[]>('/api/tasks')
 *
 * With useAsyncData:
 *   const { data } = await useAsyncData('tasks', () => apiFetch<Task[]>('/api/tasks'))
 */
export function useApiFetch() {
  const { $api } = useNuxtApp()
  const { refresh } = useAuth()

  async function apiFetch<T>(url: string, opts: Record<string, any> = {}): Promise<T> {
    try {
      return await ($api as typeof $fetch)<T>(url, opts)
    }
    catch (err: any) {
      if ((err?.status === 401 || err?.statusCode === 401) && !opts._retry) {
        const ok = await refresh()
        if (ok) {
          return await ($api as typeof $fetch)<T>(url, { ...opts, _retry: true })
        }
      }
      throw err
    }
  }

  return { apiFetch }
}
