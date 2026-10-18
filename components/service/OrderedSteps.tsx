import { IconBadge, type Tone } from '@/components/ui'

export function OrderedSteps({ steps, tone }: { steps: readonly string[]; tone: Tone }) {
  if (steps.length === 0) return null

  return (
    <ol className="mt-8 grid gap-5 sm:grid-cols-2">
      {steps.map((step, index) => (
        <li key={step} className="flex items-start gap-4">
          <IconBadge variant="outline" tone={tone}>
            {index + 1}
          </IconBadge>
          <span className="pt-2.5 text-base leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  )
}
