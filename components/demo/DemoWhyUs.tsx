import type { DemoWhyUsItem } from '@/content/demo/schema'
import { CheckIcon, DiamondIcon, ShieldIcon, StarIcon } from './icons'

const ITEM_ICONS = [DiamondIcon, ShieldIcon, CheckIcon, StarIcon]

/**
 * One row, as in the reference: bold two-line heading on the left, four
 * items to its right, each a large gold outline icon over a small uppercase
 * label. The icons are decorative, so plain `--gold` on cream is fine here —
 * the text-on-light contrast rule covers the labels, which are `text-dark`.
 */
export function DemoWhyUs({ heading, items }: { heading: string; items: readonly DemoWhyUsItem[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.2fr)] lg:items-center lg:gap-10">
      <h2 id="why-us" className="max-w-[15rem] font-display text-xl font-extrabold uppercase leading-tight lg:text-[1.4rem]">
        {heading}
      </h2>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {items.map((item, index) => {
          const ItemIcon = ITEM_ICONS[index % ITEM_ICONS.length] ?? DiamondIcon
          return (
            <li key={item.title}>
              <ItemIcon aria-hidden="true" className="h-10 w-10 text-gold" strokeWidth={1.2} />
              <h3 className="mt-4 max-w-[12rem] font-display text-[11px] font-semibold uppercase leading-relaxed tracking-[0.1em]">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-text-dark/80">{item.description}</p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
