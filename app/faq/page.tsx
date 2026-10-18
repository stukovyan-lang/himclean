import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs, FaqAccordion, RelatedServices } from '@/components/service'
import { Container, Heading, Section } from '@/components/ui'
import { faqPageContent } from '@/content/faq'
import type { FaqSection } from '@/content/schema'
import { site } from '@/content/site'
import { hasPublishedFaqItem, publishedFaqItems, renderFaqPageContent } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import { routes } from '@/lib/routes'
import { breadcrumbs, faqPage, graph, type Crumb } from '@/lib/schema'

export function generateMetadata() {
  const entry = renderFaqPageContent(faqPageContent, site)

  return buildMetadata({
    title: entry.metaTitle,
    description: entry.metaDescription,
    path: routes.faq,
    // metaTitle is authored complete, no brand suffix here.
    absoluteTitle: true,
  })
}

export default function FaqPage() {
  const entry = renderFaqPageContent(faqPageContent, site)
  // A section made entirely of pending questions is empty content, heading
  // included — invariant 1 applies section by section, not just page by page.
  const visibleSections = entry.sections.filter((section) => hasPublishedFaqItem(section.questions))

  const crumbs: Crumb[] = [
    { name: 'Главная', path: routes.home },
    { name: entry.h1, path: routes.faq },
  ]

  return (
    <>
      <JsonLd data={graph([faqPage(publishedFaqItems(entry)), breadcrumbs(crumbs)])} />

      <Container as="div" className="pb-10 pt-8 lg:pb-16 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        <Heading level={1} className="mt-6">
          {entry.h1}
        </Heading>
        <p className="mt-6 max-w-prose text-lead leading-relaxed text-text-muted">{entry.leadParagraph}</p>
      </Container>

      {visibleSections.map((section, index) => (
        <FaqSectionBlock key={section.id} section={section} tone={index % 2 === 0 ? 'cream' : 'dark'} />
      ))}
    </>
  )
}

function FaqSectionBlock({ section, tone }: { section: FaqSection; tone: 'cream' | 'dark' }) {
  return (
    <Section tone={tone} labelledBy={`faq-${section.id}`}>
      <Heading level={2} id={`faq-${section.id}`}>
        {section.label}
      </Heading>
      <FaqAccordion items={section.questions} tone={tone} />
      {section.relatedSlugs.length > 0 ? (
        <div className="mt-10">
          {/* opacity-60 reads at 6.4:1 on dark but only 3.9:1 on cream — bump
              it on cream rather than dimming the same amount on both. */}
          <p
            className={`font-display text-xs uppercase tracking-[0.18em] ${
              tone === 'cream' ? 'opacity-70' : 'opacity-60'
            }`}
          >
            Подробнее по услугам
          </p>
          <RelatedServices slugs={section.relatedSlugs} />
        </div>
      ) : null}
    </Section>
  )
}
