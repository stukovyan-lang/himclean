import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/service'
import { DemoReviewsGrid } from '@/components/demo/DemoReviewsGrid'
import { Container, Heading, Section } from '@/components/ui'
import { demoReviews } from '@/content/demo/reviews'
import { demoSite } from '@/content/demo/site'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { DEMO_MODE } from '@/lib/demo'
import { renderCopy } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import type { Crumb } from '@/lib/schema'

export function generateMetadata() {
  if (!DEMO_MODE) return buildMetadata({ title: 'Страница не найдена', path: '/otzyvy', noindex: true })

  return buildMetadata({
    title: renderCopy('Отзывы о химчистке мебели и озонировании в {cityIn}', site),
    description: 'Отзывы клиентов о химчистке мебели, матрасов, салонов авто и озонировании квартир — из мессенджеров и с Google Карт.',
    path: '/otzyvy',
    noindex: !isSiteLive(site),
    absoluteTitle: true,
  })
}

export default function DemoReviewsPage() {
  if (!DEMO_MODE) notFound()

  const crumbs: Crumb[] = [
    { name: 'Главная', path: '/' },
    { name: 'Отзывы', path: '/otzyvy' },
  ]

  return (
    <>
      <Container as="div" className="pb-10 pt-8 lg:pb-16 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        <Heading level={1} className="mt-6">
          Отзывы
        </Heading>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-muted">
          Отзывы из мессенджеров и с Google Карт. Имена, номера и фото профиля скрыты — нажмите на скриншот, чтобы открыть его целиком.
        </p>
        {demoSite.googleMapsUrl ? (
          <a
            href={demoSite.googleMapsUrl}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex min-h-11 items-center text-base text-gold underline underline-offset-4 transition-colors hover:text-gold-soft active:text-gold-soft"
          >
            Все отзывы на Google Картах
          </a>
        ) : null}
      </Container>

      <Section tone="cream">
        <DemoReviewsGrid reviews={demoReviews} />
      </Section>
    </>
  )
}
