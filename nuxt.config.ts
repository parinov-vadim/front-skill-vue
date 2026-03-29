// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      baseTarget: '',
    },
  },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/image', '@nuxt/fonts', '@nuxt/content', '@nuxtjs/seo'],
  site: {
    url: 'https://frontskill.ru',
    name: 'FrontSkill',
    description: 'Платформа для практики фронтенд-разработки с интерактивными задачами по HTML, CSS и JavaScript',
    defaultLocale: 'ru',
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
        },
      },
    },
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
  robots: {
    disallow: ['/admin'],
  },
  nitro: {
    preset: 'bun',
  },
  css: ['~/styles.css'],
})
