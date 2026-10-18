import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/service'
import { DemoPhotoGrid } from '@/components/demo/DemoPhotoGrid'
import { DemoWorkPair } from '@/components/demo/DemoWorkPair'
import { Container, Heading } from '@/components/ui'
import { demoOzonePhotos, demoWorkPhotos, demoWorks } from '@/content/demo/works'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { demoSite } from '@/content/demo/site'
import { DEMO_MODE } from '@/lib/demo'
import { renderCopy } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import type { Crumb } from '@/lib/schema'

/**
 * The work-photo gallery. Part of the approved design; with `DEMO_MODE=0`
 * (the pre-redesign pages) it returns 404.
 */
export function generateMetadata() {
  if (!DEMO_MODE) return buildMetadata({ title: 'Страница не найдена', path: '/raboty', noindex: true })

  return buildMetadata({
    title: renderCopy('Фото работ: химчистка мебели и озонирование в {cityIn}', site),
    description: 'Фото до и после: химчистка диванов, стульев, матрасов и салонов авто, озонирование квартир и автомобилей.',
    path: '/raboty',
    noindex: !isSiteLive(site),
    absoluteTitle: true,
  })
}

export default function DemoWorksPage() {
  if (!DEMO_MODE) notFound()

  const crumbs: Crumb[] = [
    { name: 'Главная', path: '/' },
    { name: 'Наши работы', path: '/raboty' },
  ]

  return (
    <Container as="div" className="pb-16 pt-8 lg:pb-24 lg:pt-12">
      <Breadcrumbs items={crumbs} />
      <Heading level={1} className="mt-6">
        Наши работы
      </Heading>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-muted">
        Фотографии с наших заказов: {demoSite.areaServedLabel}.
      </p>

      <section aria-labelledby="works-pairs" className="mt-12">
        <h2 id="works-pairs" className="font-display text-h2 font-normal uppercase tracking-wide">
          Химчистка: до и после
        </h2>
        <ul className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
          {demoWorks.map((work) => (
            <li key={work.id}>
              <DemoWorkPair work={work} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="works-more" className="mt-16">
        <h2 id="works-more" className="font-display text-h2 font-normal uppercase tracking-wide">
          Ещё работы
        </h2>
        <DemoPhotoGrid photos={demoWorkPhotos} />
      </section>

      <section aria-labelledby="works-ozone" className="mt-16">
        <h2 id="works-ozone" className="font-display text-h2 font-normal uppercase tracking-wide">
          Озонирование
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-muted">
          Квартиры, кухни, мебель изнутри и салоны автомобилей. Генераторы Ozonbox общей мощностью до 150 г/ч.
        </p>
        <DemoPhotoGrid photos={demoOzonePhotos} />
      </section>
    </Container>
  )
}
