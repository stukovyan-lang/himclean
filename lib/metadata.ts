import type { Metadata } from 'next'
import { isSiteLive } from '@/content/schema'
import { seo, verification } from '@/content/seo'
import { site, siteUrl } from '@/content/site'

type PageMetadataInput = {
  title: string
  description?: string | null
  path: string
  image?: { url: string; alt: string } | null
  /** Dev-only or gated pages opt out of indexing explicitly. */
  noindex?: boolean
  /**
   * Set when the title already carries the brand, so the root template does
   * not append it a second time.
   */
  absoluteTitle?: boolean
}

const NOINDEX: Metadata['robots'] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const live = isSiteLive(site)
  const canonical = `${siteUrl}${path === '/' ? '' : path}` || siteUrl
  const resolvedDescription = description ?? seo.defaultDescription ?? undefined
  const ogImage = image ?? (seo.ogImage ? { url: seo.ogImage.src, alt: seo.ogImage.alt } : null)

  return {
    metadataBase: new URL(siteUrl),
    title: absoluteTitle ? { absolute: title } : title,
    description: resolvedDescription,
    alternates: { canonical },
    robots: !live || noindex ? NOINDEX : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: seo.locale,
      url: canonical,
      title,
      description: resolvedDescription,
      images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description: resolvedDescription,
      images: ogImage ? [ogImage.url] : undefined,
    },
    verification: live
      ? {
          google: verification.google ?? undefined,
          yandex: verification.yandex ?? undefined,
        }
      : undefined,
  }
}

/** Root metadata: title template applies to every child route. */
export function buildRootMetadata(): Metadata {
  const base = buildMetadata({ title: seo.defaultTitle, path: '/' })

  return {
    ...base,
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
  }
}
