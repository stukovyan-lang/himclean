import Image from 'next/image'
import type { DemoPhoto } from '@/content/demo/schema'
import { groupRelatedFrames } from '@/content/works'

/**
 * Row-major grid of equal square frames, the photo filling each (cover).
 * Mixed portrait/landscape heights made the captions start at different
 * heights within a row; the client asked for them on one line (2026-10-13).
 * Frames of the same object (`RELATED_FRAMES`) form one item two columns
 * wide, so they always stand side by side; `grid-flow-row-dense` lets single
 * frames fill the gap a group leaves at the end of a row. Not CSS-columns
 * masonry: the client places photos by order.
 */
export function DemoPhotoGrid({ photos }: { photos: readonly DemoPhoto[] }) {
  const items = groupRelatedFrames(photos, (photo) => photo.image.src)

  return (
    <ul className="mt-6 grid grid-flow-row-dense grid-cols-2 items-start gap-3 lg:grid-cols-3 lg:gap-4">
      {items.map((group) =>
        group.length === 1 ? (
          <li key={group[0]!.image.src}>
            <Frame photo={group[0]!} />
          </li>
        ) : (
          <li key={group[0]!.image.src} className="col-span-2 grid grid-cols-2 items-start gap-3 lg:gap-4">
            {group.map((photo) => (
              <Frame key={photo.image.src} photo={photo} />
            ))}
          </li>
        ),
      )}
    </ul>
  )
}

function Frame({ photo }: { photo: DemoPhoto }) {
  return (
    <figure>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
        <Image
          src={photo.image.src}
          alt={photo.image.alt}
          fill
          quality={85}
          sizes="(min-width: 1024px) 30vw, 50vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-2 text-xs leading-snug text-text-muted sm:text-sm">{photo.caption}</figcaption>
    </figure>
  )
}
