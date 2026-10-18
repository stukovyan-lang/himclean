import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs, ContactCta, FactList, FaqAccordion, OrderedSteps } from '@/components/service'
import { Container, Heading, Section } from '@/components/ui'
import { howItWork } from '@/content/pages'
import { site } from '@/content/site'
import { getContactChannels } from '@/lib/contacts'
import { hasPublishedFaqItem, renderHowItWorks } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import { routes } from '@/lib/routes'
import { breadcrumbs, faqPage, graph, type Crumb } from '@/lib/schema'

export function generateMetadata() {
  const entry = renderHowItWorks(howItWork, site)

  return buildMetadata({
    title: entry.metaTitle,
    description: entry.metaDescription,
    path: routes.howItWorks,
    // metaTitle is authored complete, no brand suffix here.
    absoluteTitle: true,
  })
}

export default function HowItWorksPage() {
  const entry = renderHowItWorks(howItWork, site)
  const hasContacts = getContactChannels().some((channel) => channel.id !== 'email')

  const crumbs: Crumb[] = [
    { name: 'Главная', path: routes.home },
    { name: entry.h1, path: routes.howItWorks },
  ]

  return (
    <>
      <JsonLd data={graph([faqPage(entry.faq), breadcrumbs(crumbs)])} />

      {/* The answer comes first: h1 and a self-contained lead paragraph,
          above the fold and with nothing decorative ahead of it. */}
      <Container as="div" className="pb-10 pt-8 lg:pb-16 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        <Heading level={1} className="mt-6">
          {entry.h1}
        </Heading>
        <p className="mt-6 max-w-prose text-lead leading-relaxed text-text-muted">{entry.leadParagraph}</p>
      </Container>

      <Section tone="cream" labelledBy="process">
        <Heading level={2} id="process">
          Порядок работы
        </Heading>
        <OrderedSteps steps={entry.processSteps} tone="cream" />
      </Section>

      <Section tone="dark" labelledBy="price-factors">
        <Heading level={2} id="price-factors">
          Из чего складывается цена
        </Heading>
        <FactList items={entry.priceFactors} marker="plus" tone="dark" />
      </Section>

      <Section tone="cream" labelledBy="why-no-price">
        <Heading level={2} id="why-no-price">
          Почему мы не называем точную сумму по телефону
        </Heading>
        <p className="mt-6 max-w-prose text-base leading-relaxed">{entry.whyNoPhonePrice}</p>
      </Section>

      <Section tone="dark" labelledBy="prepare">
        <Heading level={2} id="prepare">
          Что подготовить к приезду мастера
        </Heading>
        <FactList items={entry.prepareForVisit} marker="plus" tone="dark" />
      </Section>

      {hasPublishedFaqItem(entry.faq) ? (
        <Section tone="cream" labelledBy="faq">
          <Heading level={2} id="faq">
            Вопросы и ответы
          </Heading>
          <FaqAccordion items={entry.faq} tone="cream" />
        </Section>
      ) : null}

      {hasContacts ? (
        <Section tone="dark">
          <ContactCta title="Позвоните или напишите" />
        </Section>
      ) : null}
    </>
  )
}
