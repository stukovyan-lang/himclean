import { getDemoContactChannels } from '@/content/demo/site'
import { PhoneIcon, TelegramIcon, ViberIcon, WhatsAppIcon } from './icons'

const MESSENGER_ICONS: Record<string, typeof PhoneIcon> = {
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  viber: ViberIcon,
}

/**
 * Sticky mobile strip: "Позвонить" plus every messenger. The client asked for
 * Viber next to WhatsApp and Telegram (2026-10-18); three uppercase word
 * labels don't fit beside the call button on a 320px screen, so messengers
 * are an icon over a small label — still a full-height tap target each.
 */
export function DemoMobileCallBar() {
  const channels = getDemoContactChannels()
  const phone = channels.find((channel) => channel.id === 'phone')
  const messengers = channels.filter((channel) => channel.id in MESSENGER_ICONS)

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
        {messengers.map((channel) => {
          const Icon = MESSENGER_ICONS[channel.id] ?? PhoneIcon
          return (
            <a
              key={channel.id}
              href={channel.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-gold/40 text-gold transition-colors active:bg-gold/10"
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="text-[9px] leading-none min-[360px]:text-[10px]">{channel.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
