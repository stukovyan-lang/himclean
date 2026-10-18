import Image from 'next/image'
import Link from 'next/link'
import type { DemoServiceCard } from '@/content/demo/schema'
import { ArrowRightIcon } from './icons'

/**
 * Client mockup's services section: bold heading with a small uppercase
 * strapline beside it, then three cards where the photo *is* the card —
 * full-bleed image, dark gradient rising from the bottom, title and
 * description over it, ringed arrow in the corner.
 */
export function DemoServices({
  heading,
  subtitle,
  services,
}: {
  heading: string
  subtitle: string
  services: readonly DemoServiceCard[]
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
        <h2 id="services" className="font-display text-h2 font-extrabold uppercase leading-none tracking-tight">
          {heading}
        </h2>
        <p className="max-w-[17rem] font-display text-[11px] font-medium uppercase leading-relaxed tracking-[0.12em] text-text-dark/75">
          {subtitle}
        </p>
      </div>

      <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((card) => (
          <li key={card.id}>
            <Link
              href={card.href}
              className="group/card relative block aspect-[4/3] overflow-hidden rounded-2xl bg-bg-dark text-text-light shadow-lg shadow-black/20 lg:aspect-[3/2]"
            >
              <Image
                src={card.image.src}
                alt={card.image.alt}
                fill
                quality={90}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 via-45% to-black/5"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 lg:p-6">
                <div>
                  <h3 className="max-w-[13rem] font-display text-base font-bold uppercase leading-tight lg:text-lg">
                    {card.title}
                  </h3>
                  <p className="mt-2 max-w-[15rem] text-sm leading-snug text-text-light/85">{card.description}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold text-gold transition-colors group-hover/card:bg-gold group-hover/card:text-bg-dark group-active/card:bg-gold group-active/card:text-bg-dark"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
