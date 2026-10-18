import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui'
import { site } from '@/content/site'
import { DEMO_NAV_ITEMS } from '@/content/demo/nav'
import { routes } from '@/lib/routes'
import { demoSite, getDemoContactChannels } from '@/content/demo/site'

/**
 * The header's six items plus the two pages the header has no room for —
 * otherwise "Как мы работаем" and "Вопросы и ответы" are in the sitemap but
 * linked from nowhere a visitor or crawler can follow.
 */
const FOOTER_NAV_ITEMS = [
  ...DEMO_NAV_ITEMS,
  { href: routes.howItWorks, label: 'Как мы работаем' },
  { href: routes.faq, label: 'Вопросы и ответы' },
]

export function DemoFooter() {
  const channels = getDemoContactChannels()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gold/15 bg-bg-dark pb-24 pt-12 md:pb-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Image
              src="/brand/logo.webp"
              alt={`Логотип ${site.name} в подвале страницы`}
              width={950}
              height={647}
              quality={90}
              sizes="150px"
              className="h-24 w-auto"
            />
            {demoSite.address ? <p className="mt-4 text-sm text-text-muted">{demoSite.address}</p> : null}
            <p className={`${demoSite.address ? 'mt-1' : 'mt-4'} text-sm text-text-muted`}>{demoSite.areaServedLabel}</p>
            <p className="mt-1 text-sm text-text-muted">{demoSite.hoursLabel}</p>
          </div>

          <ul className="flex flex-col">
            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  className="inline-block min-w-11 py-3 text-sm text-text-muted transition-colors hover:text-gold active:text-gold"
                >
                  {channel.label}
                </a>
              </li>
            ))}
          </ul>

          <nav aria-label="Навигация в подвале">
            <ul className="flex flex-col">
              {FOOTER_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block min-w-11 py-3 text-sm text-text-muted transition-colors hover:text-gold active:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-gold/10 pt-6 text-xs text-text-muted">
          © {year} {site.name}
        </p>
      </Container>
    </footer>
  )
}
