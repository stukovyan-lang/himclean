import { DraftNotice } from '@/components/DraftNotice'
import { DecisionTable, ReviewsPreview } from '@/components/home'
import { JsonLd } from '@/components/seo/JsonLd'
import { ContactCta, FaqAccordion, OrderedSteps, ServiceCard, ServiceGallery } from '@/components/service'
import { Button, Container, Heading, Section } from '@/components/ui'
import { DemoHomeContent } from '@/components/demo/DemoHomeContent'
import { home } from '@/content/pages'
import { reviews } from '@/content/reviews'
import { isSiteLive } from '@/content/schema'
import { services } from '@/content/services'
import { site } from '@/content/site'
import { HOME_WORKS_PREVIEW, works } from '@/content/works'
import { getContactChannels } from '@/lib/contacts'
import { hasPublishedFaqItem, renderHome, renderService } from '@/lib/copy'
import { DEMO_MODE } from '@/lib/demo'
import { buildMetadata } from '@/lib/metadata'
import { routes } from '@/lib/routes'
import { faqPage, graph, itemList, localBusiness, webSite } from '@/lib/schema'
import { groupServices } from '@/lib/service-groups'

const live = isSiteLive(site)
const rendered = live ? renderHome(home, site) : null

export const metadata = DEMO_MODE
  ? buildMetadata({
      // Same title and description as the original home page (content/pages.ts):
      // city and both services, no brand suffix — see CLAUDE.md's "Бренд в
      // заголовках".
      title: rendered ? rendered.metaTitle : 'Сайт в разработке',
      description: rendered?.metaDescription,
      path: routes.home,
      noindex: !live,
      absoluteTitle: true,
    })
  : buildMetadata({
      title: rendered ? rendered.metaTitle : 'Сайт в разработке',
      description: rendered?.metaDescription,
      path: routes.home,
      noindex: !live,
      // metaTitle is authored complete: city and both services, no brand suffix.
      absoluteTitle: true,
    })

export default function HomePage() {
  // Checked first and unconditionally: the demo mockup is a distinct branch
  // of the app, not a variant of the draft or live home page. `DemoHomeContent`
  // is imported and used exactly like `DraftNotice` below (an early-return
  // guarded import, not a locally-defined function) so seo-check's h1 counter
  // excludes its h1 from this file's count the same way it excludes
  // `DraftNotice`'s — see the comment on that function's definition.
  if (DEMO_MODE) return <DemoHomeContent />

  // The draft gate is unconditional, in every environment: until the site is
  // live, "/" is the one page that identifies the whole site as unfinished,
  // not a preview of the real home page.
  if (!live) return <DraftNotice />

  return <HomeContent />
}

function HomeContent() {
  const entry = renderHome(home, site)
  const renderedServices = services.map((service) => renderService(service, site))
  const groups = groupServices(renderedServices)
  const contactChannels = getContactChannels().filter((channel) => channel.id !== 'email')

  return (
    <>
      <JsonLd
        data={graph([
          webSite(),
          localBusiness(),
          faqPage(entry.faq),
          itemList(renderedServices),
        ])}
      />

      {/* Hero: h1, subtitle, lead paragraph — in that DOM order, with nothing
          decorative ahead of the lead paragraph. No image: the palette carries
          the section until the client sends photos. */}
      <Container as="div" className="pb-12 pt-10 lg:pb-20 lg:pt-16">
        <Heading level={1} className="max-w-4xl">
          {entry.h1}
        </Heading>
        <p className="mt-3 font-display text-sm uppercase tracking-[0.2em] text-gold sm:text-base">
          {entry.subtitle}
        </p>
        <p className="mt-6 max-w-prose text-lead leading-relaxed text-text-muted">{entry.leadParagraph}</p>
        {contactChannels.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-4">
            {contactChannels.map((channel, index) => (
              <Button
                key={channel.id}
                href={channel.href}
                size="lg"
                variant={index === 0 ? 'primary-gold' : 'ghost'}
              >
                {channel.label}
              </Button>
            ))}
          </div>
        ) : null}
      </Container>

      <Section tone="cream" labelledBy="services">
        <Heading level={2} id="services">
          Услуги
        </Heading>
        {groups.map((group) => (
          <div key={group.id} className="mt-10 first:mt-8">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-gold-on-light">
              {group.label}
            </p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.services.map((service) => (
                <ServiceCard key={service.slug} entry={service} tone="cream" />
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-10">
          <Button href={routes.servicesHub} variant="ghost" size="md" tone="cream">
            Все услуги
          </Button>
        </div>
      </Section>

      <Section tone="dark" labelledBy="decision-table">
        <Heading level={2} id="decision-table">
          Что выбрать под вашу задачу
        </Heading>
        <DecisionTable rows={entry.decisionTable} />
      </Section>

      <Section tone="cream" labelledBy="process">
        <Heading level={2} id="process">
          Как мы работаем
        </Heading>
        <OrderedSteps steps={entry.processSteps} tone="cream" />
      </Section>

      {works.length > 0 ? (
        <Section tone="dark" labelledBy="works">
          <Heading level={2} id="works">
            Наши работы
          </Heading>
          <ServiceGallery works={works.slice(0, HOME_WORKS_PREVIEW)} photos={[]} />
        </Section>
      ) : null}

      {reviews.length > 0 ? (
        <Section tone="cream" labelledBy="reviews">
          <Heading level={2} id="reviews">
            Отзывы
          </Heading>
          <ReviewsPreview reviews={reviews} />
        </Section>
      ) : null}

      {hasPublishedFaqItem(entry.faq) ? (
        <Section tone="dark" labelledBy="faq">
          <Heading level={2} id="faq">
            Частые вопросы
          </Heading>
          <FaqAccordion items={entry.faq} tone="dark" />
        </Section>
      ) : null}

      {contactChannels.length > 0 ? (
        <Section tone="cream">
          <ContactCta title={entry.contactsTitle} tone="cream" />
        </Section>
      ) : null}
    </>
  )
}
