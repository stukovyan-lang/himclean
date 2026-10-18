import { getContactChannels, type ContactChannel } from '../../lib/contacts'
import { site } from '../site'

/**
 * The demo used to carry its own fictional contact set, with a deliberately
 * non-working phone so nobody would ring a real line by accident. The client
 * has since sent the real ones, and they live in `content/site.ts` — the one
 * place invariant 3 allows — so the demo now reads them from there instead of
 * keeping a second copy that could drift from what the client actually said.
 *
 * Whether the site is public is decided by `site.status` (`isSiteLive`), not
 * by anything here.
 */

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function hoursLabel(): string {
  const [first] = site.openingHours
  if (!first) return ''
  const everyDay = WEEK.every((day) => site.openingHours.some((entry) => entry.dayOfWeek.some((d) => d === day)))
  if (everyDay && first.opens === '00:00' && first.closes === '23:59') return 'Работаем 24/7'
  return `${first.opens}–${first.closes}`
}

/**
 * The client's own wording (2026-10-08): «Полоцк/Новополоцк и ближайшие
 * населённые пункты и районы», wanted on one line. Both town names come from
 * `content/site.ts`; the rest is said as they said it. It already names the
 * home town, so nothing should print `city` right next to it.
 */
const areaServedLabel = `${[site.city, ...site.areaServed].filter(Boolean).join('/')} и ближайшие населённые пункты и районы`

/** The client's Google Maps profile, if `sameAs` has one (2026-10-09). */
const googleMapsUrl = site.sameAs.find((url) => url.startsWith('https://www.google.com/maps')) ?? null

export const demoSite = {
  city: site.city ?? '',
  address: site.address ? `${site.address}, ${site.city ?? ''}`.replace(/, $/, '') : null,
  googleMapsUrl,
  areaServedLabel,
  phoneDisplay: site.phoneDisplay ?? '',
  phoneHref: site.phoneE164 ? `tel:${site.phoneE164}` : null,
  hoursLabel: hoursLabel(),
}

export function getDemoContactChannels(): ContactChannel[] {
  return getContactChannels().filter((channel) => channel.id !== 'email')
}
