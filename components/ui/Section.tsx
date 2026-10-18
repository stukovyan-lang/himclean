import type { ReactNode } from 'react'
import { Container } from './Container'
import type { Tone } from './tone'

type SectionProps = {
  children: ReactNode
  tone?: Tone
  id?: string
  labelledBy?: string
  className?: string
  /** Set false to lay out the section edge to edge. */
  contained?: boolean
}

const toneClasses: Record<Tone, string> = {
  dark: 'bg-bg-dark text-text-light',
  cream: 'bg-bg-cream text-text-dark',
}

/** Vertical rhythm: 48px mobile, 64px tablet, 96px desktop. */
export function Section({
  children,
  tone = 'dark',
  id,
  labelledBy,
  className = '',
  contained = true,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-section-sm md:py-section-md lg:py-section-lg ${toneClasses[tone]} ${className}`.trim()}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  )
}
