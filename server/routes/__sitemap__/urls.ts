import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  const { tasks } = await $fetch<{ tasks: { slug: string }[] }>(`${config.public.baseTarget}/api/tasks`, {
    query: { limit: 1000 },
  })

  return tasks.map(task => ({
    loc: `/tasks/${task.slug}`,
    changefreq: 'weekly' as const,
    priority: 0.7,
  }))
})
