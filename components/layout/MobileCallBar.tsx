import { getContactChannels } from '@/lib/contacts'

/**
 * Sticky mobile call strip — the primary conversion path on a phone. Renders
 * only when the client contacts exist, so a draft site shows no dead
 * buttons; if there's no phone specifically, the remaining channels still
 * fill the bar rather than hiding it.
 *
 * Always visible, never hidden on scroll: a visitor can decide to call at
 * any point while reading, and the button has to be under their thumb right
 * then, not after they scroll back up to find it.
 *
 * `env(safe-area-inset-bottom)` keeps the bar clear of the iOS home
 * indicator; `--callbar-h` (globals.css) is the fixed content height that
 * `body`'s bottom padding matches exactly, so the bar never covers the last
 * block of a page.
 */
export function MobileCallBar() {
  // Call / WhatsApp / Telegram — three actions. A fourth (Viber) doesn't fit a
  // 320px bar without wrapping its label; it lives in the footer and CTA blocks.
  const channels = getContactChannels().filter((channel) => channel.id !== 'email' && channel.id !== 'viber')
  const phone = channels.find((channel) => channel.id === 'phone')
  const rest = channels.filter((channel) => channel.id !== 'phone')

  if (channels.length === 0) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-bg-dark/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-[var(--callbar-h)] items-stretch gap-px">
        {phone ? (
          // tel: is a direct, single tap — no confirmation screen in between.
          <a
            href={phone.href}
            className="flex flex-[1.6] items-center justify-center gap-2 bg-gold px-3 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] text-bg-dark transition-colors active:bg-gold-soft"
          >
            Позвонить
          </a>
        ) : null}
        {rest.map((channel) => (
          <a
            key={channel.id}
            href={channel.href}
            className="flex flex-1 items-center justify-center px-2 text-center font-display text-xs uppercase tracking-[0.1em] text-gold transition-colors active:bg-gold/10"
          >
            {channel.label}
          </a>
        ))}
      </div>
    </div>
  )
}
