import Image from 'next/image'
import { Container } from '@/components/ui'
import type { DemoOzone } from '@/content/demo/schema'
import { DemoButton } from './DemoButton'
import { ClockIcon, DiamondIcon, HouseIcon, LeafIcon } from './icons'

const POINT_ICONS = [DiamondIcon, ClockIcon, LeafIcon, HouseIcon]

/**
 * Full-bleed band, as in the reference: the car-interior photo edge to edge,
 * copy on the left, button and the four points on one row along the bottom.
 * Renders its own `<section>` (no `Section` wrapper) because it has to break
 * out of the page container.
 *
 * Overlay: below lg the copy spans the full width and the fog in this photo
 * is near-white, so it's a flat /85; from lg it's a left→right gradient plus
 * a bottom-up one under the points row, leaving the wheel and the generator
 * clear. Both measured — docs/demo-image-credits.md.
 */
export function DemoOzoneSection({ content }: { content: DemoOzone }) {
  const [firstWord, ...restWords] = content.heading.split(' ')

  return (
    <section aria-labelledby="ozone" className="relative overflow-hidden bg-black text-text-light">
      <Image
        src={content.image.src}
        alt={content.image.alt}
        fill
        quality={90}
        sizes="100vw"
        className="object-cover object-[90%_50%]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/85 lg:hidden" />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-black/90 via-black/45 via-35% to-transparent lg:block"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-black via-black/75 via-45% to-transparent lg:block" />

      <Container as="div" className="relative z-10 py-12 lg:py-[4.5rem]">
        <h2 id="ozone" className="w-fit font-display text-h2 font-normal uppercase leading-[1.2] tracking-wide lg:text-[2rem]">
          <span className="block">{firstWord}</span>
          <span className="block">{restWords.join(' ')}</span>
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-light/85">{content.paragraph}</p>

        <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
          <div>
            <DemoButton href="/uslugi/ozonirovanie-pomescheniy">Узнать больше</DemoButton>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:flex lg:flex-1 lg:justify-between lg:gap-8">
            {content.points.map((point, index) => {
              const PointIcon = POINT_ICONS[index % POINT_ICONS.length] ?? LeafIcon
              return (
                <li key={point} className="flex items-center gap-3.5">
                  <PointIcon aria-hidden="true" className="h-9 w-9 shrink-0 text-gold" />
                  <span className="max-w-[11rem] text-sm leading-snug">{point}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}
