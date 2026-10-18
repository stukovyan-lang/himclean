import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/service'
import { DemoContactsCard } from '@/components/demo/DemoContactsCard'
import { Container, Heading } from '@/components/ui'
import { demoHome } from '@/content/demo/home'
import { demoSite } from '@/content/demo/site'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { DEMO_MODE } from '@/lib/demo'
import { renderCopy } from '@/lib/copy'
import { buildMetadata } from '@/lib/metadata'
import type { Crumb } from '@/lib/schema'

export function generateMetadata() {
  if (!DEMO_MODE) return buildMetadata({ title: 'Страница не найдена', path: '/kontakty', noindex: true })

  return buildMetadata({
    title: 'Контакты',
    description: `${renderCopy('Химчистка мебели и озонирование в {cityIn} и окрестностях', site)}: адрес, телефон, WhatsApp, Telegram, Viber. ${demoSite.hoursLabel}.`,
    path: '/kontakty',
    noindex: !isSiteLive(site),
  })
}

export default function DemoContactsPage() {
  if (!DEMO_MODE) notFound()

  const crumbs: Crumb[] = [
    { name: 'Главная', path: '/' },
    { name: 'Контакты', path: '/kontakty' },
  ]

  return (
    <Container as="div" className="pb-16 pt-8 lg:pb-24 lg:pt-12">
      <Breadcrumbs items={crumbs} />
      <Heading level={1} className="mt-6">
        Контакты
      </Heading>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="font-display text-xs uppercase tracking-[0.15em] opacity-60">
            {demoSite.address ? 'Адрес' : 'Город'}
          </dt>
          <dd className="mt-1 text-base">
            {demoSite.address ?? demoSite.city}
            {demoSite.googleMapsUrl ? (
              <a
                href={demoSite.googleMapsUrl}
                target="_blank"
                rel="noopener"
                className="flex min-h-11 w-fit items-center text-sm text-gold underline underline-offset-4 transition-colors hover:text-gold-soft active:text-gold-soft"
              >
                Открыть на Google Картах
              </a>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="font-display text-xs uppercase tracking-[0.15em] opacity-60">Часы работы</dt>
          <dd className="mt-1 text-base">{demoSite.hoursLabel}</dd>
        </div>
        {/* Full row from sm, so the client's one-line wording gets the width
            it needs; on a phone it is ~55 characters and has to wrap, so it
            wraps balanced (two even lines) instead of leaving a short tail. */}
        <div className="sm:col-span-2">
          <dt className="font-display text-xs uppercase tracking-[0.15em] opacity-60">Зона выезда</dt>
          <dd className="mt-1 text-balance text-base sm:whitespace-nowrap">{demoSite.areaServedLabel}</dd>
        </div>
        <div>
          <dt className="font-display text-xs uppercase tracking-[0.15em] opacity-60">Телефон</dt>
          <dd className="mt-1 text-base">
            {demoSite.phoneHref ? (
              <a
                href={demoSite.phoneHref}
                className="inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-gold hover:underline active:text-gold"
              >
                {demoSite.phoneDisplay}
              </a>
            ) : (
              demoSite.phoneDisplay
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-20">
        <DemoContactsCard content={demoHome.contactsCard} screenImageSrc={demoHome.hero.image.src} />
      </div>
    </Container>
  )
}
