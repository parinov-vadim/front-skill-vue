import { readdirSync } from 'node:fs'
import { join } from 'node:path'

function getDocsRoutes(): string[] {
  const docsDir = join(import.meta.dirname, 'content/docs')
  const routes: string[] = ['/docs']

  for (const section of readdirSync(docsDir, { withFileTypes: true })) {
    if (!section.isDirectory()) continue
    routes.push(`/docs/${section.name}`)
    for (const file of readdirSync(join(docsDir, section.name), { withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith('.md')) continue
      routes.push(`/docs/${section.name}/${file.name.replace('.md', '')}`)
    }
  }

  return routes
}

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
    urls: getDocsRoutes(),
  },
  robots: {
    disallow: ['/admin'],
  },
  icon: {
    localApiEndpoint: '/_nuxt_icon',
  },
  linkChecker: {
    enabled: false,
  },
  routeRules: {
    '/docs/**': { prerender: true },
  },
  nitro: {
    preset: 'bun',
    prerender: {
      crawlLinks: false,
      routes: getDocsRoutes(),
    },
    devStorage: {
      'cache:nuxt:payload': {
        driver: 'lruCache',
      },
    },
  },
  css: ['~/styles.css'],
})
