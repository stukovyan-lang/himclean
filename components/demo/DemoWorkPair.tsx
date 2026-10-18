import Image from 'next/image'
import type { DemoWork } from '@/content/demo/schema'

/**
 * A real before/after pair, side by side. The client's two shots are taken
 * from different angles, so a drag slider (which assumes pixel-aligned
 * frames) would show a jump rather than a comparison — two static frames are
 * the honest layout, and need no client JS. Every frame sits in the same 3:4
 * box (the photo covers it), so pairs side by side end — and their captions
 * start — on one line.
 */
export function DemoWorkPair({ work }: { work: DemoWork }) {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['До', work.before],
            ['После', work.after],
          ] as const
        ).map(([label, image]) => (
          <div
            key={label}
            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/30"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={85}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
            <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-text-light">
              {label}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-3">
        <span className="block font-display text-sm font-semibold tracking-wide">{work.title}</span>
        <span className="mt-0.5 block text-sm text-text-muted">{work.note}</span>
      </figcaption>
    </figure>
  )
}
