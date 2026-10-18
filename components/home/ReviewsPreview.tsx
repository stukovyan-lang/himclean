import type { Review } from '@/content/schema'

const SOURCE_LABELS: Record<Review['source'], string> = {
  google: 'Google',
  yandex: 'Яндекс',
  '2gis': '2GIS',
  instagram: 'Instagram',
  vk: 'VK',
  direct: 'напрямую',
}

/**
 * Invariant 1 and 6: renders only real, client-confirmed reviews. The section
 * that wraps this component is itself gated on `reviews.length`, so an empty
 * array means the heading disappears too, not just this grid.
 */
export function ReviewsPreview({ reviews }: { reviews: readonly Review[] }) {
  if (reviews.length === 0) return null

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <li key={`${review.author}-${review.date}`} className="rounded-2xl border border-current/15 p-6">
          <p className="text-base leading-relaxed opacity-90">{review.text}</p>
          <p className="mt-4 font-display text-sm font-semibold tracking-wide">{review.author}</p>
          <p className="text-xs opacity-60">{SOURCE_LABELS[review.source]}</p>
        </li>
      ))}
    </ul>
  )
}
