import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  Breadcrumbs,
  ContactCta,
  FactList,
  FaqAccordion,
  OrderedSteps,
  RelatedServices,
  ServiceGallery,
} from '@/components/service'
import { Container, Heading, Section } from '@/components/ui'
import type { Service } from '@/content/schema'
import { servicesHub } from '@/content/pages'
import { findService, hasService, services } from '@/content/services'
import { site } from '@/content/site'
import { works } from '@/content/works'
import { getContactChannels } from '@/lib/contacts'
import { hasPublishedFaqItem, renderService } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import { routes } from '@/lib/routes'
import { breadcrumbs, faqPage, graph, service as serviceNode, type Crumb } from '@/lib/schema'

/**
 * Section headings follow the kind of work: "Что чистим" and "Чего химчистка
 * не делает" on an ozonation page told the reader the wrong thing about what
 * they are ordering.
 */
const SECTION_HEADINGS: Record<Service['group'], { process: string; includes: string; limitations: string; cta: string }> = {
  himchistka: {
    process: 'Как проходит чистка',
    includes: 'Что чистим',
    limitations: 'Чего химчистка не делает',
    cta: 'Записаться на чистку',
  },
  ozonirovanie: {
    process: 'Как проходит озонирование',
    includes: 'Что обрабатываем',
    limitations: 'Чего озонирование не делает',
    cta: 'Записаться на озонирование',
  },
  problem: {
    process: 'Как проходит работа',
    includes: 'С чем работаем',
    limitations: 'Ограничения',
    cta: 'Обсудить вашу задачу',
  },
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return services.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const entry = findService(slug)
  if (!entry) return buildMetadata({ title: 'Страница не найдена', path: '/404', noindex: true })

  const rendered = renderService(entry, site)

  return buildMetadata({
    title: rendered.metaTitle,
    description: rendered.metaDescription,
    path: routes.service(rendered.slug),
    // metaTitle is authored complete; service pages carry no brand suffix.
    absoluteTitle: true,
  })
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const source = findService(slug)
  if (!source) notFound()

  const entry = renderService(source, site)
  const headings = SECTION_HEADINGS[entry.group]
  const gallery = works.filter((work) => work.serviceSlug === entry.slug)
  const related = entry.relatedSlugs.filter(hasService)
  const hasContacts = getContactChannels().some((channel) => channel.id !== 'email')

  const crumbs: Crumb[] = [
    { name: 'Главная', path: routes.home },
    { name: servicesHub.h1, path: routes.servicesHub },
    { name: entry.h1, path: routes.service(entry.slug) },
  ]

  return (
    <>
      <JsonLd
        data={graph([serviceNode(entry), faqPage(entry.faq), breadcrumbs(crumbs)])}
      />

      {/* 1–2. The answer comes first: h1 and a self-contained lead paragraph,
          above the fold and with no image pushing them down. Then, per the
          client, what it's for (reasons) and the result (photos) — before the
          process, which few people scroll down to read. */}
      <Container as="div" className="pb-10 pt-8 lg:pb-16 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        <Heading level={1} className="mt-6">
          {entry.h1}
        </Heading>
        <p className="mt-6 max-w-prose text-lead leading-relaxed text-text-muted">
          {entry.leadParagraph}
        </p>
        {entry.reasons && entry.reasons.length > 0 ? (
          <div className="mt-8">
            <h2 id="reasons" className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold">
              Когда нужно
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {entry.reasons.map((reason) => (
                <li key={reason} className="rounded-full border border-gold/40 px-4 py-2 text-sm">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>

      {gallery.length > 0 || entry.images.length > 0 ? (
        <Section tone="dark" labelledBy="gallery">
          <Heading level={2} id="gallery">
            Наши работы
          </Heading>
          <ServiceGallery works={gallery} photos={entry.images} />
        </Section>
      ) : null}

      {entry.whatWeDo.length > 0 ? (
        <Section tone="cream" labelledBy="process">
          <Heading level={2} id="process">
            {headings.process}
          </Heading>
          <OrderedSteps steps={entry.whatWeDo} tone="cream" />
        </Section>
      ) : null}

      {entry.includes.length > 0 ? (
        <Section tone="dark" labelledBy="includes">
          <Heading level={2} id="includes">
            {headings.includes}
          </Heading>
          <FactList items={entry.includes} marker="plus" tone="dark" />
        </Section>
      ) : null}

      {entry.limitations.length > 0 ? (
        <Section tone="cream" labelledBy="limitations">
          <Heading level={2} id="limitations">
            {headings.limitations}
          </Heading>
          <FactList items={entry.limitations} marker="minus" tone="cream" />
        </Section>
      ) : null}


      {hasPublishedFaqItem(entry.faq) ? (
        <Section tone="cream" labelledBy="faq">
          <Heading level={2} id="faq">
            Вопросы и ответы
          </Heading>
          <FaqAccordion items={entry.faq} tone="cream" />
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="dark" labelledBy="related">
          <Heading level={2} id="related">
            Смежные услуги
          </Heading>
          <RelatedServices slugs={related} />
        </Section>
      ) : null}

      {hasContacts ? (
        <Section tone="dark">
          <ContactCta title={headings.cta} showHowItWorksLink />
        </Section>
      ) : null}
    </>
  )
}
