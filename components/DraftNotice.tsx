import { Container, Heading } from '@/components/ui'
import { site } from '@/content/site'

/**
 * The only page the site serves while `site.status` is `draft`. It carries no
 * marketing claims, no invented contacts and no indexable content.
 */
export function DraftNotice() {
  return (
    <Container as="section" className="flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="max-w-xl text-center">
        <p className="font-display text-2xl font-bold uppercase tracking-[0.3em] text-gold">
          {site.name}
        </p>
        <Heading level={1} className="mt-8">
          Сайт в разработке
        </Heading>
        <p className="mt-6 text-base leading-relaxed text-text-muted">
          Химчистка мягкой мебели и озонирование. Страница откроется, когда будут готовы данные
          компании.
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
        />
      </div>
    </Container>
  )
}
