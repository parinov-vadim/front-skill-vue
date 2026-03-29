import type { SubmissionStatus, SubmissionResult, Submission } from '~/types/submission'

export function useSubmission() {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiFetch()

  const status = ref<SubmissionStatus | null>(null)
  const result = ref<SubmissionResult | null>(null)
  const isRunning = ref(false)
  const error = ref<string | null>(null)

  let eventSource: EventSource | null = null
  let pollTimer: ReturnType<typeof setTimeout> | null = null

  function reset() {
    status.value = null
    result.value = null
    error.value = null
    cleanup()
  }

  function cleanup() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function connectSSE(submissionId: string) {
    const url = `${config.public.baseTarget}/api/submissions/${submissionId}/stream`
    eventSource = new EventSource(url, { withCredentials: true })

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Submission
        status.value = data.status

        if (data.result) {
          result.value = data.result
        }

        if (['passed', 'failed', 'error', 'timeout'].includes(data.status)) {
          isRunning.value = false
          cleanup()
        }
      }
      catch {}
    }

    eventSource.onerror = () => {
      cleanup()
      // Fallback to polling on SSE failure
      startPolling(submissionId)
    }
  }

  async function startPolling(submissionId: string) {
    const poll = async () => {
      try {
        const data = await apiFetch<Submission>(`/api/submissions/${submissionId}`)
        status.value = data.status

        if (data.result) {
          result.value = data.result
        }

        if (['passed', 'failed', 'error', 'timeout'].includes(data.status)) {
          isRunning.value = false
          cleanup()
          return
        }

        pollTimer = setTimeout(poll, 500)
      }
      catch {
        isRunning.value = false
        error.value = 'Не удалось получить результат'
        cleanup()
      }
    }

    await poll()
  }

  async function submit(slug: string, code: string, language: string, mode: 'run' | 'submit') {
    reset()
    isRunning.value = true
    status.value = 'pending'

    const endpoint = mode === 'run'
      ? `/api/tasks/${slug}/run`
      : `/api/tasks/${slug}/submit`

    try {
      const data = await apiFetch<{ submissionId: string }>(endpoint, {
        method: 'POST',
        body: { code, language },
      })

      status.value = 'running'
      connectSSE(data.submissionId)
    }
    catch (err: any) {
      isRunning.value = false
      status.value = null
      error.value = err?.data?.message || err?.message || 'Ошибка отправки'
    }
  }

  function runTests(slug: string, code: string, language: string) {
    return submit(slug, code, language, 'run')
  }

  function submitSolution(slug: string, code: string, language: string) {
    return submit(slug, code, language, 'submit')
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    status,
    result,
    isRunning,
    error,
    runTests,
    submitSolution,
    reset,
  }
}
