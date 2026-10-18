import { siteConfigSchema, type SiteConfig } from './schema'

/**
 * Invariant 3: the only place in the codebase where contact data exists.
 *
 * Every `null` below is a real gap in the client brief, not a placeholder to
 * be filled in with something plausible. `pnpm seo:check` prints them all.
 */
export const site: SiteConfig = siteConfigSchema.parse({
  // Live since the 2026-10-11 handover. Open checklist items in
  // `pnpm seo:check` were accepted by the client as they are.
  status: 'live',

  name: 'HimClean',
  // Not a gap: the client is self-employed (плательщик НПД, 2026-10-14) —
  // no legal entity, no registered name to publish. The number he sent is
  // a passport number and must never go on the site.
  legalName: null,

  city: 'Полоцк',
  cityPrepositional: 'Полоцке',
  // Client: "Полоцк и Новополоцк, а также ближайшие населённые пункты и
  // районы". Only the named town is listed — the nearby places have no names
  // yet, and inventing them would be a defect (see the note above).
  areaServed: ['Новополоцк'],
  // Client, 2026-10-09: the address on the Google Maps profile may be shown.
  // Street and house only — the city is `city` above, schema.org gets both.
  address: 'ул. Петруся Бровки, 122',

  phoneE164: '+375296102803',
  phoneDisplay: '+375 (29) 610-28-03',
  // One number for calls, WhatsApp, Telegram and Viber (client's answer).
  whatsapp: '+375296102803',
  telegram: '+375296102803',
  viber: '+375296102803',
  // Client wrote «Zhogolev1994gmail.com» (2026-10-13) — the @ was lost in typing.
  email: 'zhogolev1994@gmail.com',

  // "Работаем 24/7". schema.org has no round-the-clock flag for
  // OpeningHoursSpecification; 00:00–23:59 every day is the accepted form.
  openingHours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  // The pin of the client's Google Maps profile (same address, same phone).
  geo: { latitude: 55.474264, longitude: 28.751078 },
  // Stable place link (by CID), not the session-bound search URL the client
  // sent — that one carries tokens and expires.
  sameAs: ['https://www.google.com/maps?cid=14870038811686557777'],
} satisfies SiteConfig)

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)
