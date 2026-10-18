'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { NavItem } from '@/lib/navigation'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])'

/**
 * Invariant 4: the menu only duplicates links that already exist in the
 * server-rendered header, so nothing meaningful depends on hydration.
 *
 * Full-screen overlay on open: closes on Escape, on a tap outside the panel
 * (the backdrop itself), and on picking an item; focus is moved into the
 * panel on open, trapped inside it (Tab/Shift+Tab wrap at the ends) while
 * it's open, and returned to the trigger button on close.
 *
 * The overlay itself is portaled to `document.body`, not rendered inline
 * where this component sits in the tree (inside `<header>`). `<header>`
 * carries `backdrop-blur` (`backdrop-filter`), and per spec a
 * `backdrop-filter` on an ancestor makes *that ancestor* the containing
 * block for any `position: fixed` descendant — so an inline `fixed inset-0`
 * overlay here would size and position itself against the header's small
 * box instead of the viewport, not actually covering the screen. Portaling
 * out from under that ancestor is the fix, not dropping the blur.
 *
 * The header's own trigger button toggles `open`, but once the overlay is
 * up it's the wrong element to also serve as the close control: `<header>`
 * establishes its own stacking context (that same `backdrop-filter`, plus
 * `position: sticky`), so no z-index on the button can lift it above a
 * portalled sibling of `<body>` — z-index only competes within one
 * stacking context, and the button's is trapped inside the header's. The
 * overlay renders its own close button instead, which is a genuine sibling
 * of the backdrop and needs no z-index trick to sit on top of it.
 */
export function MobileMenu({
  items,
  hideFrom = 'md',
}: {
  items: NavItem[]
  /** Breakpoint from which the desktop nav takes over. A longer nav needs the burger for longer. */
  hideFrom?: 'md' | 'lg'
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const focusable = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab' || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  if (items.length === 0) return null

  return (
    <div className={hideFrom === 'lg' ? 'lg:hidden' : 'md:hidden'}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors active:bg-gold/10"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? '✕' : '☰'}
        </span>
      </button>

      {open
        ? createPortal(
            // The backdrop is the "tap outside" target. `nav` only wraps its
            // own content (not the full screen) so there's a real backdrop
            // area to tap around it — centering happens on the backdrop,
            // not on `nav` itself, otherwise `nav` would cover the whole
            // viewport and there'd be nothing left to count as "outside".
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark"
              onClick={close}
            >
              <nav
                id="mobile-menu"
                ref={panelRef}
                aria-label="Основная навигация"
                onClick={(event) => event.stopPropagation()}
                className="px-6"
              >
                <button
                  type="button"
                  aria-label="Закрыть меню"
                  onClick={close}
                  className="fixed right-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors active:bg-gold/10"
                  style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    ✕
                  </span>
                </button>

                <ul className="flex flex-col items-center gap-2">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="block px-4 py-4 text-center font-display text-2xl uppercase tracking-[0.1em] text-text-light transition-colors active:text-gold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
