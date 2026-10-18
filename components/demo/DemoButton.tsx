import type { ReactNode } from 'react'
import { ArrowRightIcon } from './icons'

/**
 * The reference's gold pill: mixed case, medium weight, trailing arrow. A
 * separate component rather than `Button` + override classes — `Button`
 * hardcodes `uppercase` and wide tracking, and an override passed through
 * `className` has the same specificity as those, so which one wins depends
 * on stylesheet order (the `hidden` vs `inline-flex` bug in DemoHeader was
 * exactly that).
 */
export function DemoButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-gold px-7 font-display text-sm font-semibold text-bg-dark transition-colors hover:bg-gold-soft active:bg-gold-soft"
    >
      {children}
      <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
    </a>
  )
}
