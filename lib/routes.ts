/**
 * Route availability.
 *
 * A link may only point at a page that exists. The services hub was built in
 * phase 2b-2, `/kak-my-rabotaem` and `/faq` in phase 3b — all are now part
 * of the navigation and the sitemap.
 */
export const SERVICES_HUB_READY = true

/**
 * `/raboty` exists (the approved design's gallery page), so the original
 * nav may link it. The approved design's own header has a fixed nav anyway.
 */
export const WORKS_PAGE_READY = true

export const routes = {
  home: '/',
  servicesHub: '/uslugi',
  service: (slug: string) => `/uslugi/${slug}`,
  howItWorks: '/kak-my-rabotaem',
  faq: '/faq',
  works: '/raboty',
  reviews: '/otzyvy',
  about: '/o-nas',
  contacts: '/kontakty',
} as const
