import Link from 'next/link'
import type { Crumb } from '@/lib/schema'

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  if (items.length < 2) return null

  const trail = items.slice(0, -1)
  const current = items[items.length - 1]

  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((item) => (
          <li key={item.path} className="flex items-center gap-2">
            <Link href={item.path} className="inline-block py-3.5 transition-colors hover:text-gold active:text-gold">
              {item.name}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        {current ? <li aria-current="page">{current.name}</li> : null}
      </ol>
    </nav>
  )
}
