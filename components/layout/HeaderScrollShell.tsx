'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * The header's one piece of interactive behavior: shrink its height once the
 * page has scrolled past a small threshold, so a phone screen keeps more
 * room for content while still always showing the call button. Position-
 * based, not direction-based — simpler, and it means the header doesn't
 * flicker between states while the visitor scrolls up and down near the top.
 *
 * `Header` stays a server component; this shell only wraps it so the scroll
 * listener is the only client-side piece, matching the same pattern already
 * used for `MobileMenu`.
 *
 * `transparentAtTop`: no background until the page has scrolled — for a
 * header that sits over a hero photo. The solid state comes from
 * `data-[compact]` variants, which out-specify the plain transparent base,
 * so the two never compete in the cascade.
 */
export function HeaderScrollShell({
  children,
  transparentAtTop = false,
}: {
  children: ReactNode
  transparentAtTop?: boolean
}) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const surface = transparentAtTop
    ? 'border-b border-transparent bg-transparent transition-colors duration-200 data-[compact]:border-gold/15 data-[compact]:bg-bg-dark/95 data-[compact]:backdrop-blur'
    : 'border-b border-gold/15 bg-bg-dark/95 backdrop-blur'

  return (
    <header data-compact={compact ? '' : undefined} className={`group sticky top-0 z-40 ${surface}`}>
      {children}
    </header>
  )
}
