import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        section: z.string(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        readTime: z.number().optional(),
        tags: z.array(z.string()).optional(),
        order: z.number().optional(),
        datePublished: z.string().optional(),
        dateModified: z.string().optional(),
      }),
    }),
  },
})
