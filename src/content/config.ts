import { defineCollection, z } from 'astro:content'

const seriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number().optional(),
    description: z.string().optional(),
  }),
})

export const collections = {
  series: seriesCollection,
}
