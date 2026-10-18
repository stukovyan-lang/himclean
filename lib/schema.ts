import type { FaqItem, Service, SiteImage } from '@/content/schema'
import { seo } from '@/content/seo'
import { site, siteUrl } from '@/content/site'

/**
 * Typed JSON-LD factories.
 *
 * Every factory returns `null` when the underlying data is missing. There are
 * no defaults and no stand-ins: a graph node that cannot be filled from
 * `content/` is simply not emitted (invariants 1 and 6).
 *
 * The factories gate on data, not on the draft flag. Nodes describing page
 * content (Service, FAQPage, BreadcrumbList) are therefore emitted as soon as
 * the copy exists, while entity nodes that need the client NAP stay null.
 * Whether a draft page ships them at all is the caller's decision.
 */

export type JsonLdNode = Record<string, unknown>

const ORGANIZATION_ID = `${siteUrl}/#organization`
const WEBSITE_ID = `${siteUrl}/#website`
const LOCAL_BUSINESS_ID = `${siteUrl}/#localbusiness`

function compact(node: JsonLdNode): JsonLdNode {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => {
      if (value === null || value === undefined) return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  )
}

export function organization(): JsonLdNode | null {
  return compact({
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.name,
    legalName: site.legalName,
    url: siteUrl,
    telephone: site.phoneE164,
    email: site.email,
    areaServed: site.areaServed.map((area) => ({ '@type': 'City', name: area })),
    sameAs: site.sameAs,
  })
}

export function webSite(): JsonLdNode | null {
  return compact({
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: siteUrl,
    inLanguage: seo.locale.split('_')[0] ?? 'ru',
    publisher: { '@id': ORGANIZATION_ID },
  })
}

export function localBusiness(): JsonLdNode | null {
  if (!site.city || !site.phoneE164) return null

  const openingHoursSpecification = site.openingHours.map((entry) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: entry.dayOfWeek,
    opens: entry.opens,
    closes: entry.closes,
  }))

  return compact({
    '@type': 'LocalBusiness',
    '@id': LOCAL_BUSINESS_ID,
    name: site.name,
    legalName: site.legalName,
    url: siteUrl,
    telephone: site.phoneE164,
    email: site.email,
    address: site.address
      ? { '@type': 'PostalAddress', addressLocality: site.city, streetAddress: site.address }
      : { '@type': 'PostalAddress', addressLocality: site.city },
    areaServed: site.areaServed.map((area) => ({ '@type': 'City', name: area })),
    geo: site.geo
      ? { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude }
      : null,
    openingHoursSpecification,
    sameAs: site.sameAs,
    // Invariant 8: no `priceRange`, no `offers`, no `price` until the client
    // confirms a range in writing.
  })
}

export function service(entry: Service): JsonLdNode | null {
  const hasProvider = localBusiness() !== null

  return compact({
    '@type': 'Service',
    '@id': `${siteUrl}/uslugi/${entry.slug}#service`,
    name: entry.h1,
    description: entry.metaDescription,
    serviceType: entry.h1,
    url: `${siteUrl}/uslugi/${entry.slug}`,
    provider: hasProvider ? { '@id': LOCAL_BUSINESS_ID } : null,
    areaServed: site.areaServed.map((area) => ({ '@type': 'City', name: area })),
  })
}

/**
 * A pending question — no confirmed answer — is filtered out here, once, so
 * FAQPage never advertises a guess and every call site can pass the full
 * array without remembering to filter it first.
 */
export function faqPage(items: readonly FaqItem[]): JsonLdNode | null {
  const published = items.filter(
    (item): item is FaqItem & { answer: string } => !item.pending && item.answer !== undefined,
  )
  if (published.length === 0) return null

  return {
    '@type': 'FAQPage',
    mainEntity: published.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** Ordered list of the service pages, used on the services hub. */
export function itemList(entries: readonly Service[]): JsonLdNode | null {
  if (entries.length === 0) return null

  return {
    '@type': 'ItemList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.h1,
      url: `${siteUrl}/uslugi/${entry.slug}`,
    })),
  }
}

export type Crumb = {
  name: string
  path: string
}

export function breadcrumbs(items: readonly Crumb[]): JsonLdNode | null {
  if (items.length < 2) return null

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  }
}

export function imageObject(image: SiteImage, caption?: string): JsonLdNode | null {
  if (!image.src) return null

  return compact({
    '@type': 'ImageObject',
    contentUrl: `${siteUrl}${image.src}`,
    description: image.alt,
    caption: caption ?? image.alt,
    width: image.width,
    height: image.height,
  })
}

/** Wraps emitted nodes into a single `@graph` document, or returns null. */
export function graph(nodes: ReadonlyArray<JsonLdNode | null>): JsonLdNode | null {
  const present = nodes.filter((node): node is JsonLdNode => node !== null)
  if (present.length === 0) return null

  return { '@context': 'https://schema.org', '@graph': present }
}
