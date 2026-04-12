<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'ru' },
  templateParams: { site: { name: 'FrontSkill', url: 'https://frontskill.ru' } },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
})

useSeoMeta({
  ogImage: 'https://frontskill.ru/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogLocale: 'ru_RU',
  ogSiteName: 'FrontSkill',
  twitterImage: 'https://frontskill.ru/og-image.png',
})

useSchemaOrg([
  defineOrganization({
    name: 'FrontSkill',
    url: 'https://frontskill.ru',
    logo: 'https://frontskill.ru/logo.png',
    description: 'Платформа для практики фронтенд-разработки с интерактивными задачами',
    sameAs: [
      'https://t.me/frontskill',
      'https://vk.com/frontskill',
      'https://github.com/frontskill',
    ],
  }),
  defineWebSite({
    name: 'FrontSkill',
    inLanguage: 'ru',
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://frontskill.ru/tasks?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }),
])
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
