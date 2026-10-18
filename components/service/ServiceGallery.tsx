import Image from 'next/image'
import type { SiteImage, Work } from '@/content/schema'
import { groupRelatedFrames } from '@/content/works'

/**
 * Photos from real jobs for one service: before/after pairs first, then
 * single frames (`service.images`). Invariant 1: nothing to show, no block.
 *
 * Pairs sit side by side, not in a drag slider: the client's "before" and
 * "after" are two separate shots from different angles, so a slider would
 * show the frame jumping rather than a comparison. Every pair frame sits in
 * the same 3:4 box and every single frame in the same square (the photo
 * covers it), so rows line up — the client asked for that (2026-10-13). A
 * row-major grid, not CSS-columns masonry: the client places photos by
 * order ("this one last"). Frames of the same object (`RELATED_FRAMES`)
 * share one two-column item so they stay side by side. Pure server HTML.
 */
export function ServiceGallery({ works, photos }: { works: readonly Work[]; photos: readonly SiteImage[] }) {
  if (works.length === 0 && photos.length === 0) return null

  return (
    <>
      {works.length > 0 ? (
        <ul className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-x-8">
          {works.map((work) => (
            <li key={work.id}>
              <figure>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['До', work.before],
                      ['После', work.after],
                    ] as const
                  ).map(([label, frame]) => (
                    <div key={frame.src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/30">
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-text-light">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <figcaption className="mt-3 text-sm opacity-80">
                  {work.material}. {work.soiling}
                  {work.note ? `. ${work.note}` : ''}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length > 0 ? (
        <ul
          className={`grid grid-flow-row-dense grid-cols-2 items-start gap-3 lg:grid-cols-3 lg:gap-4 ${works.length > 0 ? 'mt-12' : 'mt-8'}`}
        >
          {groupRelatedFrames(photos, (photo) => photo.src).map((group) => (
            <li
              key={group[0]!.src}
              className={group.length > 1 ? 'col-span-2 grid grid-cols-2 items-start gap-3 lg:gap-4' : undefined}
            >
              {group.map((photo) => (
                <div key={photo.src} className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(min-width: 1024px) 30vw, 50vw" />
                </div>
              ))}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
