import type { ReactNode } from 'react'
import { goldTextClass, type Tone } from './tone'

type HeadingProps = {
  /** Invariant 5: exactly one `h1` per page, enforced by seo-check. */
  level: 1 | 2 | 3
  children: ReactNode
  id?: string
  className?: string
  eyebrow?: ReactNode
  /** Background the heading sits on. Only affects the `eyebrow` color. */
  tone?: Tone
}

/**
 * Sizes come from the fluid clamp() scale in globals.css (`--text-h1` etc,
 * 320px → 1440px) instead of per-breakpoint classes, so there's one
 * continuous size rather than a jump at `sm`/`lg`.
 */
const levelClasses: Record<HeadingProps['level'], string> = {
  1: 'text-h1 font-bold tracking-tight uppercase',
  2: 'text-h2 font-bold tracking-tight uppercase',
  3: 'text-h3 font-semibold tracking-wide',
}

export function Heading({ level, children, id, className = '', eyebrow, tone = 'dark' }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'

  return (
    <div className={className || undefined}>
      {eyebrow ? (
        <p className={`mb-3 font-display text-xs uppercase tracking-[0.25em] ${goldTextClass(tone)}`}>
          {eyebrow}
        </p>
      ) : null}
      <Tag id={id} className={levelClasses[level]}>
        {children}
      </Tag>
    </div>
  )
}
