import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { graph, localBusiness } from '@/lib/schema'
import { demoHome } from '@/content/demo/home'
import { DemoContactsCard } from './DemoContactsCard'
import { DemoHero } from './DemoHero'
import { DemoOzoneSection } from './DemoOzoneSection'
import { DemoResults } from './DemoResults'
import { DemoServices } from './DemoServices'
import { DemoWhyUs } from './DemoWhyUs'

/**
 * The home page of the approved design (started as the client mockup —
 * see CLAUDE.md's "Дизайн сайта").
 *
 * Its own file, imported and used behind `if (DEMO_MODE) return
 * <DemoHomeContent />` in `app/page.tsx` — the same shape as `DraftNotice`.
 * seo-check's h1 counter only excludes an imported component's h1 from the
 * count when it is used exactly that way; a locally-defined function with
 * the same JSX does not get the same exclusion (see the comment above that
 * `if` in `app/page.tsx`).
 *
 * Plain `<section>`s rather than the shared `Section`: the reference's bands
 * are much tighter than the site's 48/64/96 rhythm, and `Section` hardcodes
 * that padding — overriding it through `className` would be two same-
 * specificity utilities racing on stylesheet order.
 */
export function DemoHomeContent() {
  return (
    <>
      {/* `LocalBusiness` lives on the home page (address, phone, hours, map
          pin); service pages point at it by `@id`. No `FAQPage`/`ItemList`:
          this home page shows neither a FAQ nor the full service list. */}
      {isSiteLive(site) ? <JsonLd data={graph([localBusiness()])} /> : null}
      <DemoHero hero={demoHome.hero} />

      <section aria-labelledby="services" className="bg-bg-cream py-10 text-text-dark lg:py-9">
        <Container>
          <DemoServices
            heading={demoHome.servicesHeading}
            subtitle={demoHome.servicesSubtitle}
            services={demoHome.services}
          />
        </Container>
      </section>

      <section aria-labelledby="results" className="bg-bg-dark py-10 text-text-light lg:py-6">
        <Container>
          <DemoResults content={demoHome.results} />
        </Container>
      </section>

      <DemoOzoneSection content={demoHome.ozone} />

      <section aria-labelledby="why-us" className="bg-bg-cream py-10 text-text-dark lg:py-9">
        <Container>
          <DemoWhyUs heading={demoHome.whyUsHeading} items={demoHome.whyUs} />
        </Container>
      </section>

      <section aria-labelledby="demo-contacts" className="bg-bg-cream pb-12 pt-4 text-text-dark lg:pb-14 lg:pt-10">
        <Container>
          <DemoContactsCard content={demoHome.contactsCard} screenImageSrc={demoHome.hero.image.src} />
        </Container>
      </section>
    </>
  )
}
