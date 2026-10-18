import { site } from '@/content/site'

export type ContactChannel = {
  id: 'phone' | 'whatsapp' | 'telegram' | 'viber' | 'email'
  href: string
  label: string
}

/**
 * Invariant 3: every contact link in the UI is derived here from
 * `content/site.ts`. Nothing is ever hardcoded in a component.
 */
export function getContactChannels(): ContactChannel[] {
  const channels: ContactChannel[] = []

  if (site.phoneE164 && site.phoneDisplay) {
    channels.push({ id: 'phone', href: `tel:${site.phoneE164}`, label: site.phoneDisplay })
  }

  if (site.whatsapp) {
    const digits = site.whatsapp.replace(/\D/g, '')
    channels.push({ id: 'whatsapp', href: `https://wa.me/${digits}`, label: 'WhatsApp' })
  }

  if (site.telegram) {
    const handle = site.telegram.replace(/^@/, '')
    channels.push({ id: 'telegram', href: `https://t.me/${handle}`, label: 'Telegram' })
  }

  if (site.viber) {
    // The `+` is percent-encoded: Viber's deep link takes the number as a query value.
    channels.push({
      id: 'viber',
      href: `viber://chat?number=${encodeURIComponent(site.viber.startsWith('+') ? site.viber : `+${site.viber.replace(/\D/g, '')}`)}`,
      label: 'Viber',
    })
  }

  if (site.email) {
    channels.push({ id: 'email', href: `mailto:${site.email}`, label: site.email })
  }

  return channels
}

export function getPhoneChannel(): ContactChannel | null {
  return getContactChannels().find((channel) => channel.id === 'phone') ?? null
}
