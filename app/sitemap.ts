import type { MetadataRoute } from 'next'
import { faqPageContent } from '@/content/faq'
import { isSiteLive } from '@/content/schema'
import { services } from '@/content/services'
import { site, siteUrl } from '@/content/site'
import { publishedFaqItems } from '@/lib/copy'
import { DEMO_MODE } from '@/lib/demo'
import { SERVICES_HUB_READY, routes } from '@/lib/routes'

/**
 * Generated from `content/services.ts`, so a new service page can never be
 * forgotten by hand. Empty while the site is a draft.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSiteLive(site)) return []

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}${routes.howItWorks}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  if (services.length > 0 && SERVICES_HUB_READY) {
    staticRoutes.push({
      url: `${siteUrl}${routes.servicesHub}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }

  if (publishedFaqItems(faqPageContent).length > 0) {
    staticRoutes.push({
      url: `${siteUrl}${routes.faq}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  }

  if (DEMO_MODE) {
    for (const path of [routes.works, routes.reviews, routes.about, routes.contacts]) {
      staticRoutes.push({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })
    }
  }

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}${routes.service(service.slug)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: service.kind === 'service' ? 0.8 : 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes]
}
