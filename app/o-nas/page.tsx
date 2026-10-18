import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/service'
import { DemoAboutSection } from '@/components/demo/DemoAboutSection'
import { Container, Heading } from '@/components/ui'
import { demoAbout } from '@/content/demo/about'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { DEMO_MODE } from '@/lib/demo'
import { buildMetadata } from '@/lib/metadata'
import type { Crumb } from '@/lib/schema'

export function generateMetadata() {
  if (!DEMO_MODE) return buildMetadata({ title: 'Страница не найдена', path: '/o-nas', noindex: true })

  return buildMetadata({
    title: 'О нас',
    description: 'Химчистка мебели и озонирование с 2023 года: оборудование, химия, генераторы Ozonbox до 150 г/ч.',
    path: '/o-nas',
    noindex: !isSiteLive(site),
  })
}

export default function DemoAboutPage() {
  if (!DEMO_MODE) notFound()

  const crumbs: Crumb[] = [
    { name: 'Главная', path: '/' },
    { name: 'О нас', path: '/o-nas' },
  ]

  return (
    <Container as="div" className="pb-16 pt-8 lg:pb-24 lg:pt-12">
      <Breadcrumbs items={crumbs} />
      <Heading level={1} className="mt-6">
        О нас
      </Heading>
      <DemoAboutSection content={demoAbout} />
    </Container>
  )
}
