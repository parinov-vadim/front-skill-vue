declare global {
  interface Window {
    ym: ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number }
  }
}

export default defineNuxtPlugin(() => {
  const ym_id = 108292955

  // Init ym function queue
  window.ym = window.ym || function (...args: unknown[]) {
    (window.ym.a = window.ym.a || []).push(args)
  }
  window.ym.l = Date.now()

  // Load tag.js
  const script = document.createElement('script')
  script.async = true
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${ym_id}`
  document.head.appendChild(script)

  // Init counter
  window.ym(ym_id, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })

  // Track SPA navigations
  const router = useRouter()
  router.afterEach((to) => {
    window.ym(ym_id, 'hit', to.fullPath)
  })
})
