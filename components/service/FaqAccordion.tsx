import { goldTextClass, type Tone } from '@/components/ui'
import type { FaqItem } from '@/content/schema'

/**
 * Invariant 4: built on native `details`, so every answer is in the server
 * HTML and readable with JavaScript disabled. The accordion is a visual
 * affordance, never a content gate. No client component, no hydration cost.
 *
 * A pending question — no client-confirmed answer yet — is filtered out
 * here, once, so every call site can pass the full array without remembering
 * to do it themselves.
 */
type PublishedFaqItem = FaqItem & { answer: string }

function isPublished(item: FaqItem): item is PublishedFaqItem {
  return !item.pending && item.answer !== undefined
}

export function FaqAccordion({ items, tone }: { items: readonly FaqItem[]; tone: Tone }) {
  const published = items.filter(isPublished)

  if (published.length === 0) return null

  return (
    <div className="mt-8 divide-y divide-current/15 border-y border-current/15">
      {published.map((item) => (
        <details key={item.question} className="group py-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-base font-semibold tracking-wide transition-colors active:opacity-70">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className={`mt-0.5 shrink-0 transition-transform duration-200 group-open:rotate-45 ${goldTextClass(tone)}`}
            >
              +
            </span>
          </summary>
          {/* .accordion-panel (globals.css): keeps the answer in the layout
              at every state and animates the reveal via grid-template-rows —
              see the rule's own comment for why this needs `!important`. */}
          <div className="accordion-panel">
            <p className="max-w-prose pb-1 text-base leading-relaxed opacity-80">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
