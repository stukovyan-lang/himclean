import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs, ServiceCard } from '@/components/service'
import { Container, Heading, Section, goldTextClass } from '@/components/ui'
import { servicesHub, servicesHubDescription } from '@/content/pages'
import { services } from '@/content/services'
import { site } from '@/content/site'
import { renderCopy, renderService } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import { routes } from '@/lib/routes'
import { breadcrumbs, graph, itemList, type Crumb } from '@/lib/schema'
import { groupServices } from '@/lib/service-groups'

export const metadata = buildMetadata({
  title: renderCopy(servicesHub.metaTitle, site),
  // Reuses the first sentence of the approved intro rather than inventing copy.
  description: renderCopy(servicesHubDescription, site),
  path: routes.servicesHub,
  absoluteTitle: true,
})

export default function ServicesHubPage() {
  const rendered = services.map((entry) => renderService(entry, site))
  const groups = groupServices(rendered)

  const crumbs: Crumb[] = [
    { name: 'Главная', path: routes.home },
    { name: servicesHub.h1, path: routes.servicesHub },
  ]

  return (
    <>
      <JsonLd data={graph([itemList(rendered), breadcrumbs(crumbs)])} />

      <Container as="div" className="pb-10 pt-8 lg:pb-16 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        <Heading level={1} className="mt-6">
          {servicesHub.h1}
        </Heading>
        <p className="mt-6 max-w-prose text-lead leading-relaxed text-text-muted">
          {renderCopy(servicesHub.intro, site)}
        </p>
      </Container>

      {groups.map((group, index) => {
        const tone = index % 2 === 0 ? 'cream' : 'dark'

        return (
          // The group label is not a heading: every card carries the h2, and
          // a second h2 above them would compete with the service names.
          <Section key={group.id} tone={tone}>
            <div aria-label={group.label} role="group">
              <p className={`font-display text-xs uppercase tracking-[0.25em] ${goldTextClass(tone)}`}>
                {group.label}
              </p>
              <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((entry) => (
                  <ServiceCard key={entry.slug} entry={entry} tone={tone} />
                ))}
              </ul>
            </div>
          </Section>
        )
      })}
    </>
  )
}
