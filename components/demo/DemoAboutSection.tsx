import Image from 'next/image'
import type { DemoAbout } from '@/content/demo/schema'
import { CheckIcon } from './icons'

export function DemoAboutSection({ content }: { content: DemoAbout }) {
  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
      <div className="flex max-w-3xl flex-col gap-10">
        {content.sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`about-${index}`}>
            <h2 id={`about-${index}`} className="font-display text-h3 font-normal uppercase tracking-wide">
              {section.heading}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed opacity-90">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="about-facts" className="rounded-2xl border border-gold/25 p-6 sm:p-8">
          <h2 id="about-facts" className="font-display text-h3 font-normal uppercase tracking-wide">
            {content.factsHeading}
          </h2>
          <ul className="mt-5 flex flex-col gap-4">
            {content.facts.map((fact) => (
              <li key={fact} className="flex gap-3">
                <CheckIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span className="text-base leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ul className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1 lg:gap-6">
        {content.photos.map((photo) => (
          <li key={photo.image.src}>
            <figure>
              {/* Same 3:4 box for both photos so their captions line up. */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/30">
                <Image
                  src={photo.image.src}
                  alt={photo.image.alt}
                  fill
                  quality={85}
                  sizes="(min-width: 1024px) 384px, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="mt-2 text-xs leading-snug text-text-muted sm:text-sm">{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
