import { getDemoContactChannels } from '@/content/demo/site'

/** Same sticky mobile strip as components/layout/MobileCallBar.tsx, demo contacts. */
export function DemoMobileCallBar() {
  // Call / WhatsApp / Telegram — three actions; a fourth label (Viber) doesn't
  // fit a 320px bar. Same rule as components/layout/MobileCallBar.tsx.
  const channels = getDemoContactChannels().filter((channel) => channel.id !== 'viber')
  const phone = channels.find((channel) => channel.id === 'phone')
  const rest = channels.filter((channel) => channel.id !== 'phone')

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-bg-dark/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* gap-2, not a hairline: neighbouring touch targets need 8px between
          them, and a 1px seam between a "call" and a "message" button is
          exactly where a thumb lands on the wrong one. */}
      <div className="flex h-[var(--callbar-h)] items-stretch gap-2 p-2">
        {phone ? (
          <a
            href={phone.href}
            className="flex flex-[1.6] items-center justify-center gap-2 rounded-full bg-gold px-3 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] text-bg-dark transition-colors active:bg-gold-soft"
          >
            Позвонить
          </a>
        ) : null}
        {rest.map((channel) => (
          <a
            key={channel.id}
            href={channel.href}
            className="flex flex-1 items-center justify-center rounded-full border border-gold/40 px-2 text-center font-display text-xs uppercase tracking-[0.08em] text-gold transition-colors active:bg-gold/10"
          >
            {channel.label}
          </a>
        ))}
      </div>
    </div>
  )
}
