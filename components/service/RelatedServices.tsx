import Link from 'next/link'
import { findService } from '@/content/services'
import { site } from '@/content/site'
import { renderCopy } from '@/lib/copy'
import { routes } from '@/lib/routes'

/** Cards beyond this stop competing for the reader's attention. */
const MAX_CARDS = 4

/** Slugs without a page yet are skipped silently, never rendered as dead links. */
export function RelatedServices({ slugs }: { slugs: readonly string[] }) {
  const related = slugs
    .map(findService)
    .filter((entry) => entry !== undefined)
    .slice(0, MAX_CARDS)

  if (related.length === 0) return null

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {related.map((entry) => (
        <li key={entry.slug}>
          <Link
            href={routes.service(entry.slug)}
            className="block rounded-2xl border border-current/20 p-5 transition-colors hover:border-gold active:border-gold"
          >
            <span className="font-display text-base font-semibold tracking-wide">
              {renderCopy(entry.h1, site)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
