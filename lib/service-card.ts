import type { Service, SiteImage } from '@/content/schema'
import { services } from '@/content/services'
import { works } from '@/content/works'

const ALL_IMAGES: SiteImage[] = [
  ...works.flatMap((work) => [work.after, work.before]),
  ...services.flatMap((service) => service.images),
]

/**
 * The photo on a service's card: an explicit `cardImageSrc`, else the
 * service's own first "after" frame, else its own first image, else none —
 * the card then shows a plain branded tile (invariant 1: no stock photos).
 * An explicit src that matches no known image is a content bug, so it throws
 * and fails the build rather than rendering an empty card.
 */
export function serviceCardImage(entry: Service): SiteImage | null {
  if (entry.cardImageSrc) {
    const found = ALL_IMAGES.find((image) => image.src === entry.cardImageSrc)
    if (!found) throw new Error(`services/${entry.slug}: cardImageSrc ${entry.cardImageSrc} matches no image`)
    return found
  }
  const ownWork = works.find((work) => work.serviceSlug === entry.slug)
  return ownWork?.after ?? entry.images[0] ?? null
}
