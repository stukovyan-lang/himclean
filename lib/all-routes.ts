import { services } from '../content/services'
import { DEMO_MODE } from './demo'
import { routes } from './routes'

/**
 * Every route the site currently serves, derived from content rather than
 * hand-kept. Shared by scripts/screenshots.ts, scripts/audit.ts and
 * scripts/contrast-check.ts so the route list can't drift between them.
 */
export const ALL_ROUTES: string[] = [
  routes.home,
  routes.servicesHub,
  ...services.map((service) => routes.service(service.slug)),
  routes.howItWorks,
  routes.faq,
  // The approved design's pages; they exist unless DEMO_MODE=0.
  ...(DEMO_MODE ? [routes.works, routes.reviews, routes.about, routes.contacts] : []),
]
