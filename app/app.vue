<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'ru' },
  templateParams: { site: { name: 'FrontSkill', url: 'https://frontskill.ru' } },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            'name': 'FrontSkill',
            'url': 'https://frontskill.ru',
            'logo': 'https://frontskill.ru/logo.png',
            'description': 'Платформа для практики фронтенд-разработки с интерактивными задачами',
            'sameAs': [
              'https://t.me/frontskill',
              'https://vk.com/frontskill',
              'https://github.com/frontskill',
            ],
          },
          {
            '@type': 'WebSite',
            'name': 'FrontSkill',
            'url': 'https://frontskill.ru',
            'inLanguage': 'ru',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': 'https://frontskill.ru/tasks?search={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
