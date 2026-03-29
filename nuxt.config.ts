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
  app: {
    head: {
      script: [
        {
          children: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108292955','ym');ym(108292955,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
        },
      ],
      noscript: [
        {
          children: '<div><img src="https://mc.yandex.ru/watch/108292955" style="position:absolute; left:-9999px;" alt="" /></div>',
        },
      ],
    },
  },
  css: ['~/styles.css'],
})
