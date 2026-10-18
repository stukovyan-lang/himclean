import Image from 'next/image'
import Link from 'next/link'
import { HeaderScrollShell } from '@/components/layout/HeaderScrollShell'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Container } from '@/components/ui'
import { site } from '@/content/site'
import { DEMO_NAV_ITEMS } from '@/content/demo/nav'
import { getDemoContactChannels } from '@/content/demo/site'
import { DemoButton } from './DemoButton'

/**
 * Client mockup's header: transparent over the hero photo until the page
 * scrolls, the client's logo, mixed-case nav, gold pill. A fixed nav rather than `getNavItems()` — see
 * `content/demo/nav.ts`.
 *
 * The row is `h-20` / `lg:h-28` at the top of the page; `DemoHero` pulls
 * itself up under it by exactly those amounts (`-mt-20 lg:-mt-28`), so the
 * two numbers have to move together.
 */
export function DemoHeader() {
  const phone = getDemoContactChannels().find((channel) => channel.id === 'phone')

  return (
    <HeaderScrollShell transparentAtTop>
      <Container>
        <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4 transition-[height] duration-200 lg:h-28 group-data-[compact]:h-16 lg:group-data-[compact]:h-16">
          {/* The client asked for the full logo — armchair included —
              everywhere, not just the wordmark. One image in every state,
              only its height changes: 64px on phones, 88px at lg, 56px once
              the header compacts. At 56px the chair's strokes are under a
              CSS pixel, but on a 2× screen they still read (checked). */}
          <Link href="/" className="flex min-h-11 items-center" aria-label={`${site.name} — на главную`}>
            <Image
              src="/brand/logo.webp"
              alt={`Логотип ${site.name}: кресло, название, химчистка мебели и озонирование`}
              width={950}
              height={647}
              priority
              quality={90}
              sizes="(min-width: 1024px) 130px, 94px"
              className="h-16 w-auto transition-[height] duration-200 lg:h-[5.5rem] group-data-[compact]:h-14 lg:group-data-[compact]:h-14"
            />
          </Link>

          {/* From lg, not md: six items plus the lockup and the button don't
              fit a 768px row — it overflowed the viewport by 14px. */}
          <nav aria-label="Основная навигация" className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-6 lg:gap-8">
              {DEMO_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block min-w-11 py-3 text-center font-display text-sm font-medium text-text-light/90 transition-colors hover:text-gold active:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            {phone ? (
              // Hidden on the wrapper, not on the button: see DemoButton's
              // comment on why display overrides can't ride in on className.
              <div className="hidden sm:inline-flex">
                {/* On a phone the tel: link dials straight away. On a computer
                    it opens FaceTime or asks for an app, so from xl the number
                    itself is on the button — visible without clicking. */}
                <DemoButton href={phone.href}>
                  <span className="xl:hidden">Позвонить</span>
                  <span className="hidden xl:inline">{phone.label}</span>
                </DemoButton>
              </div>
            ) : null}
            <MobileMenu items={DEMO_NAV_ITEMS} hideFrom="lg" />
          </div>
        </div>
      </Container>
    </HeaderScrollShell>
  )
}
