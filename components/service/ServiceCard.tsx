import Image from 'next/image'
import Link from 'next/link'
import type { Tone } from '@/components/ui'
import type { Service } from '@/content/schema'
import { site } from '@/content/site'
import { routes } from '@/lib/routes'
import { serviceCardImage } from '@/lib/service-card'
import { firstSentence } from '@/lib/service-groups'

/**
 * Photo on top, then the name, one sentence, and a filled gold "Подробнее"
 * pill — the client read the old small-caps label as plain text, not as
 * something to tap. The whole card is the link; the pill is its visual cue,
 * so it stays `aria-hidden` (the heading already names the link).
 *
 * Filled gold with dark text reads the same on both tones (~7:1), so the
 * pill doesn't need `goldTextClass`. A service with no real photo gets a
 * plain branded tile of the same size, not a stock image.
 */
export function ServiceCard({ entry, tone }: { entry: Service; tone: Tone }) {
  const image = serviceCardImage(entry)

  return (
    <li className="h-full">
      <Link
        href={routes.service(entry.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-current/20 transition-colors hover:border-gold active:border-gold"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-dark">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src="/brand/logo.webp"
              alt={`Логотип ${site.name} на карточке услуги «${entry.h1}»`}
              width={950}
              height={647}
              sizes="160px"
              className="absolute left-1/2 top-1/2 h-auto w-2/5 -translate-x-1/2 -translate-y-1/2 opacity-80"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h2 className="font-display text-lg font-semibold tracking-wide">{entry.h1}</h2>
          <p className="mt-3 text-sm leading-relaxed opacity-80">{firstSentence(entry.leadParagraph)}</p>
          <div className="mt-auto pt-5">
            <span
              aria-hidden="true"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-bg-dark transition-colors group-hover:bg-gold-soft group-active:bg-gold-soft ${tone === 'cream' ? 'shadow-sm' : ''}`}
            >
              Подробнее
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}
