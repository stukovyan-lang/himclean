import Image from 'next/image'
import { Container } from '@/components/ui'
import type { DemoHero as DemoHeroContent } from '@/content/demo/schema'
import { getDemoContactChannels } from '@/content/demo/site'
import { DemoButton } from './DemoButton'
import { ArrowRightIcon, DiamondIcon, LeafIcon, ShieldIcon } from './icons'

const MARKER_ICONS = [LeafIcon, ShieldIcon, DiamondIcon]

/**
 * Client mockup's hero. The header is transparent and sits *over* this
 * section: `-mt-20 lg:-mt-28` pulls the section up by exactly `DemoHeader`'s
 * row height.
 *
 * Below lg the copy is anchored to the bottom over a bottom-up gradient, and
 * the height is `100svh` (not `vh` — iOS's address bar eats the bottom of a
 * `vh` viewport) minus 4.5rem and the fixed call bar, so the hero's own call
 * button lands above the bar instead of under it. The 4.5rem once made room
 * for the demo banner (gone since the 2026-10-11 handover); it is kept so
 * the approved layout doesn't shift, and it lets the next section peek in. From lg it is the
 * reference's layout: fixed-ratio band, copy centred on the left over a
 * left→right gradient, the sofa clear on the right.
 */
export function DemoHero({ hero }: { hero: DemoHeroContent }) {
  const phone = getDemoContactChannels().find((channel) => channel.id === 'phone')

  return (
    <section className="relative -mt-20 min-h-[calc(100svh-4.5rem-var(--callbar-h))] overflow-hidden bg-bg-dark text-text-light md:min-h-[calc(100svh-4.5rem)] lg:-mt-28 lg:min-h-[44rem]">
      <Image src={hero.image.src} alt={hero.image.alt} fill priority quality={90} sizes="100vw" className="object-cover object-[86%_50%] lg:object-center" />

      {/* via /88: the beige cushions sit right under the subtitle on
          360-wide screens; /80 measured 4.23:1 there, under AA's 4.5. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/88 to-bg-dark/30 lg:hidden" />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-bg-dark/95 via-bg-dark/60 via-45% to-transparent lg:block"
      />
      {/* Keeps the transparent header's nav legible over the photo's top edge. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-dark/80 to-transparent" />

      {/* Below 360px the first H1 line reaches under a 56px badge, so it
          shrinks and rides a little higher there. */}
      <div className="absolute right-4 top-24 z-10 max-[359px]:top-[5.25rem] sm:right-8 lg:right-[13%] lg:top-[24%]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/70 bg-bg-dark/30 p-2 text-center backdrop-blur-sm max-[359px]:h-12 max-[359px]:w-12 max-[359px]:p-1.5 sm:h-24 sm:w-24 lg:h-44 lg:w-44 lg:p-6">
          <p className="font-display text-[6.5px] font-medium uppercase leading-snug max-[359px]:text-[5.5px] tracking-[0.08em] text-text-light/90 sm:text-[10px] lg:text-sm lg:tracking-[0.12em]">
            {hero.badgeText}
          </p>
        </div>
      </div>

      <Container
        as="div"
        className="relative z-10 flex min-h-[inherit] flex-col justify-end gap-3 pb-6 pt-24 sm:gap-5 sm:pb-12 lg:justify-center lg:pb-16 lg:pt-36"
      >
        <p className="max-w-[15rem] font-display text-xs font-medium uppercase tracking-[0.18em] text-text-light/75 sm:max-w-none sm:text-sm">
          {hero.overline}
        </p>

        {/* Its own clamp, not `text-h1`: the longest word is 16 capitals in a
            bold grotesque, and at text-h1's 28px floor it is wider than a
            360px column — it broke mid-word. 6.4vw keeps it on one line
            down to 320px and still tops out at the same 52px. */}
        <h1 className="text-[clamp(1.3rem,6.4vw,3.25rem)] font-bold uppercase leading-[1.12] tracking-tight">
          {hero.headingLines.map((line, index) => (
            <span key={line} className={`block ${hero.goldLineIndexes.includes(index) ? 'text-gold' : ''}`}>
              {line}
            </span>
          ))}
        </h1>

        <p className="max-w-xl text-lead leading-relaxed text-text-light/85">{hero.subtitle}</p>

        <ul className="mt-1 flex flex-wrap gap-x-7 gap-y-3 sm:mt-3">
          {hero.markers.map((marker, index) => {
            const MarkerIcon = MARKER_ICONS[index % MARKER_ICONS.length] ?? LeafIcon
            return (
              <li key={marker.label} className="flex items-center gap-2.5">
                <MarkerIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-gold" />
                <span className="font-display text-sm text-text-light/90">{marker.label}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-4">
          {phone ? <DemoButton href={phone.href}>Позвонить</DemoButton> : null}
          <a
            href="/raboty"
            className="group/works inline-flex min-h-12 items-center gap-3 font-display text-sm font-medium text-text-light/90 transition-colors hover:text-gold active:text-gold"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-text-light/60 transition-colors group-hover/works:border-gold">
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </span>
            Смотреть работы
          </a>
        </div>
      </Container>
    </section>
  )
}
