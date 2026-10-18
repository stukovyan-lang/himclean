import Link from 'next/link'
import { Container } from '@/components/ui'
import { site } from '@/content/site'
import { getContactChannels } from '@/lib/contacts'
import { getNavItems } from '@/lib/navigation'

export function Footer() {
  const items = getNavItems()
  const channels = getContactChannels()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gold/15 bg-bg-dark pb-24 pt-12 md:pb-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-[0.2em] text-text-light">
              {site.name}
            </p>
            {site.city ? <p className="mt-3 text-sm text-text-muted">{site.city}</p> : null}
            {site.areaServed.length > 0 ? (
              <p className="mt-1 text-sm text-text-muted">{site.areaServed.join(', ')}</p>
            ) : null}
            {site.address ? <p className="mt-1 text-sm text-text-muted">{site.address}</p> : null}
          </div>

          {channels.length > 0 ? (
            <ul className="flex flex-col">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    className="inline-block py-3 text-sm text-text-muted transition-colors hover:text-gold active:text-gold"
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {items.length > 0 ? (
            <nav aria-label="Навигация в подвале">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block py-3 text-sm text-text-muted transition-colors hover:text-gold active:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <p className="mt-10 border-t border-gold/10 pt-6 text-xs text-text-muted">
          © {year} {site.legalName ?? site.name}
        </p>
      </Container>
    </footer>
  )
}
