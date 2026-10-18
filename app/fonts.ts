import { Manrope, Montserrat, Unbounded } from 'next/font/google'

/**
 * All faces are downloaded at build time and served from our own origin,
 * so the site makes no third-party font requests.
 */
export const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-unbounded',
})

export const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-manrope',
})

/**
 * Demo mockup only: the client's reference is set in a geometric grotesque
 * (light-to-extrabold), not Unbounded. It deliberately declares the *same*
 * CSS variable as `unbounded` — `app/layout.tsx` applies exactly one of the
 * two classes, so `font-display` resolves to whichever face the mode wants
 * without a single component having to know about it.
 */
export const montserratDisplay = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-unbounded',
})
