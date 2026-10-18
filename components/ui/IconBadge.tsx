import type { ReactNode } from 'react'
import { goldTextClass, type Tone } from './tone'

type IconBadgeProps = {
  /** Decorative glyph. Invariant 2: icons are hidden from assistive tech. */
  children: ReactNode
  /** Visual style, not background context — see `tone` for that. */
  variant?: 'gold' | 'outline'
  /** Background the badge sits on. Only affects the `outline` variant's text. */
  tone?: Tone
  className?: string
}

export function IconBadge({ children, variant = 'gold', tone = 'dark', className = '' }: IconBadgeProps) {
  const variantClasses =
    variant === 'gold' ? 'bg-gold text-bg-dark' : `border border-gold/50 ${goldTextClass(tone)}`

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${variantClasses} ${className}`.trim()}
    >
      {children}
    </span>
  )
}
