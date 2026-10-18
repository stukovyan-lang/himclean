import { goldTextClass, type Tone } from '@/components/ui'

type FactListProps = {
  items: readonly string[]
  /** 'plus' reads as "included", 'minus' as an honest limitation. */
  marker: 'plus' | 'minus'
  tone: Tone
}

const markers = { plus: '+', minus: '—' } as const

export function FactList({ items, marker, tone }: FactListProps) {
  if (items.length === 0) return null

  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span aria-hidden="true" className={`mt-1 shrink-0 font-display ${goldTextClass(tone)}`}>
            {markers[marker]}
          </span>
          <span className="text-base leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
