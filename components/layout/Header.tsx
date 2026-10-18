import Link from 'next/link'
import { Button, Container } from '@/components/ui'
import { getPhoneChannel } from '@/lib/contacts'
import { getNavItems } from '@/lib/navigation'
import { BrandMark } from './BrandMark'
import { HeaderScrollShell } from './HeaderScrollShell'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const items = getNavItems()
  const phone = getPhoneChannel()

  return (
    <HeaderScrollShell>
      <Container>
        {/* group-data-[compact]: set by HeaderScrollShell once the page has
            scrolled a little — shrinks the row without the header ever
            leaving the top of the screen. */}
        <div className="flex h-16 items-center justify-between gap-4 transition-[height] duration-200 lg:h-20 group-data-[compact]:h-14 lg:group-data-[compact]:h-16">
          <BrandMark />

          {items.length > 0 ? (
            <nav aria-label="Основная навигация" className="hidden md:block">
              <ul className="flex items-center gap-7">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block py-2 font-display text-xs uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="flex items-center gap-3">
            {/* Present at all times, including while the mobile menu is
                open — it's not part of that menu's own DOM. */}
            {phone ? (
              <Button href={phone.href} variant="primary-gold" size="md">
                {/* The full number beside the logo and burger doesn't fit a
                    320px row; the label is the same link either way. */}
                <span className="sm:hidden">Позвонить</span>
                <span className="hidden sm:inline">{phone.label}</span>
              </Button>
            ) : null}
            <MobileMenu items={items} />
          </div>
        </div>
      </Container>
    </HeaderScrollShell>
  )
}
