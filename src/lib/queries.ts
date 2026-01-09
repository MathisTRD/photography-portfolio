import { getCollection } from 'astro:content'

export type Series = {
  _id: string
  title: string
  year?: number
  slug: string
  description?: string
}

export async function getAllSeries(): Promise<Series[]> {
  const entries = await getCollection('series')
  return entries
    .map((entry) => ({
      _id: entry.id,
      title: entry.data.title,
      year: entry.data.year,
      slug: entry.slug,
      description: entry.data.description,
    }))
    .sort((a, b) => (b.year || 0) - (a.year || 0))
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const entries = await getCollection('series')
  const entry = entries.find((e) => e.slug === slug)

  if (!entry) return null

  return {
    _id: entry.id,
    title: entry.data.title,
    year: entry.data.year,
    slug: entry.slug,
    description: entry.data.description,
  }
}
