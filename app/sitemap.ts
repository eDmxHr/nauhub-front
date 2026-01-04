import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'
import { shows, categories } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // Show/Movie detail pages
  const showPages: MetadataRoute.Sitemap = shows.map((show) => ({
    url: `${baseUrl}/detail/${show.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Watch pages
  const watchPages: MetadataRoute.Sitemap = shows.map((show) => ({
    url: `${baseUrl}/watch/${show.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...showPages, ...watchPages]
}
