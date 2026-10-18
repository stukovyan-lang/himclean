import Image from 'next/image'
import type { DemoResults as DemoResultsContent } from '@/content/demo/schema'
import { ClockIcon, ShieldIcon, SparkleIcon } from './icons'

const POINT_ICONS = [SparkleIcon, ClockIcon, ShieldIcon]

/**
 * The home page's results frame is the client's own before/after composite
 * — one photo with the "ДО"/"ПОСЛЕ" labels and the divider already in the
 * pixels — so it is rendered as a plain image, exactly as supplied. Putting
 * the interactive slider on top of it would double the labels and leave a
 * painted divider that doesn't follow the real one; splitting it into two
 * frames would mean fabricating the missing half of each. /raboty shows the
 * client's real pairs side by side (`DemoWorkPair`).
 */
export function DemoResults({ content }: { content: DemoResultsContent }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10">
      <h2 id="results" className="font-display text-h2 font-normal uppercase leading-[1.2] tracking-wide lg:text-[1.75rem]">
        {content.heading}
      </h2>

      <figure className="overflow-hidden rounded-xl">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          width={content.image.width}
          height={content.image.height}
          quality={90}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="h-auto w-full lg:aspect-[2.35/1] lg:object-cover"
        />
      </figure>

      <ul className="flex flex-col gap-5 lg:pl-4">
        {content.points.map((point, index) => {
          const PointIcon = POINT_ICONS[index % POINT_ICONS.length] ?? SparkleIcon
          return (
            <li key={point} className="flex items-center gap-4">
              <PointIcon aria-hidden="true" className="h-7 w-7 shrink-0 text-gold" />
              <span className="text-sm leading-relaxed text-text-light/90">{point}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
