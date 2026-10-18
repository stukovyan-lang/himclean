import type { DemoContactsCard as DemoContactsCardContent } from '@/content/demo/schema'
import { getDemoContactChannels } from '@/content/demo/site'
import { DemoButton } from './DemoButton'
import { PhoneIcon, TelegramIcon, ViberIcon, WhatsAppIcon } from './icons'

const CHANNEL_ICONS: Record<string, typeof PhoneIcon> = {
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  viber: ViberIcon,
  phone: PhoneIcon,
}

const CHANNEL_ROW_LABELS: Record<string, string> = {
  whatsapp: 'Написать в WhatsApp',
  telegram: 'Написать в Telegram',
  viber: 'Написать в Viber',
  phone: 'Позвонить',
}

// Reference order (WhatsApp, Telegram, phone) with Viber alongside the messengers.
const CHANNEL_ORDER = ['whatsapp', 'telegram', 'viber', 'phone']

/**
 * The reference's closing card, four parts in a row from lg: a phone mock
 * poking out above the card's top edge, the question + line of copy, a
 * darker inset box with the three channels, and the gold button.
 */
export function DemoContactsCard({
  content,
  screenImageSrc,
}: {
  content: DemoContactsCardContent
  /** Photo shown "on the phone screen" in the decorative mock — the hero, as in the reference. */
  screenImageSrc: string
}) {
  const channels = getDemoContactChannels()
  const phone = channels.find((channel) => channel.id === 'phone')
  const ordered = [...channels].sort((a, b) => CHANNEL_ORDER.indexOf(a.id) - CHANNEL_ORDER.indexOf(b.id))

  return (
    <div className="relative rounded-3xl bg-bg-dark px-6 py-8 text-text-light shadow-xl shadow-black/25 lg:py-7 lg:pl-52 lg:pr-9">
      {/* Decorative phone mock (aria-hidden), lg only. Clipped by the card's
          bottom edge, rising 2.5rem above its top. The "screen" is a CSS
          background rather than an <img>: a decorative duplicate of the hero
          has no alt of its own to give. */}
      <div aria-hidden="true" className="absolute bottom-0 left-12 hidden h-[calc(100%+2.5rem)] w-32 overflow-hidden lg:block">
        <div className="relative h-72 w-full overflow-hidden rounded-[1.6rem] border-[3px] border-neutral-500 bg-black">
          <div
            className="absolute inset-0 bg-cover bg-[position:72%_50%]"
            style={{ backgroundImage: `url(${screenImageSrc})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/10" />
          {/* The client's logo (chair + wordmark), same file as the header.
              Background, not <Image>, for the same reason as the screen. */}
          <div
            className="relative mx-auto mt-6 h-[4.5rem] w-[6.6rem] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/brand/logo.webp)' }}
          />
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-8">
        <div className="text-center lg:text-left">
          <h2 id="demo-contacts" className="font-display text-xl font-normal uppercase leading-snug tracking-wide lg:text-[1.35rem]">
            {content.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-text-light/80 lg:mx-0">
            {content.paragraph}
          </p>
        </div>

        <ul className="mx-auto grid w-full max-w-[22rem] grid-cols-4 gap-2 rounded-2xl bg-black/45 p-2.5 lg:mx-0 lg:w-[25rem]">
          {ordered.map((channel) => {
            const ChannelIcon = CHANNEL_ICONS[channel.id] ?? PhoneIcon
            return (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl px-0.5 text-text-light transition-colors hover:text-gold active:bg-white/5 active:text-gold"
                >
                  <ChannelIcon aria-hidden="true" className="h-6 w-6" />
                  <span className="text-center text-[10px] leading-tight text-text-light/80">
                    {CHANNEL_ROW_LABELS[channel.id] ?? channel.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-col items-center gap-3">
          {phone ? <DemoButton href={phone.href}>Позвонить</DemoButton> : null}
          <p className="text-xs text-text-light/75">{content.subtitle}</p>
        </div>
      </div>
    </div>
  )
}
