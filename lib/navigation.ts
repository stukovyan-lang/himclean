import { faqPageContent } from '@/content/faq'
import { reviews } from '@/content/reviews'
import { services } from '@/content/services'
import { works } from '@/content/works'
import { publishedFaqItems } from './copy'
import { SERVICES_HUB_READY, WORKS_PAGE_READY, routes } from './routes'

export type NavItem = {
  href: string
  label: string
}

/**
 * Invariant 1: a route appears in the navigation only when the content that
 * fills it exists. Phases 2 and 3 extend this list as pages are built.
 */
export function getNavItems(): NavItem[] {
  const items: NavItem[] = []

  if (services.length > 0 && SERVICES_HUB_READY) {
    items.push({ href: routes.servicesHub, label: 'Услуги' })
  }
  items.push({ href: routes.howItWorks, label: 'Как мы работаем' })
  if (works.length > 0 && WORKS_PAGE_READY) items.push({ href: '/raboty', label: 'Работы' })
  if (reviews.length > 0) items.push({ href: '/otzyvy', label: 'Отзывы' })
  if (publishedFaqItems(faqPageContent).length > 0) {
    items.push({ href: routes.faq, label: 'Вопросы' })
  }

  return items
}
