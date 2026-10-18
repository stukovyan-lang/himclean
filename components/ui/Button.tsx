import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { goldTextClass, type Tone } from './tone'

type ButtonVariant = 'primary-gold' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** Background the button sits on. Only the `ghost` variant's text depends on it. */
  tone?: Tone
  className?: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display font-medium uppercase tracking-[0.12em] transition-colors duration-200 whitespace-nowrap'

// py-3.5 on both sizes, not just `lg`: at the `md` size's smaller `text-xs`
// mobile font, `py-2.5` alone comes in under the 44px touch-target floor.
const sizes: Record<ButtonSize, string> = {
  md: 'px-5 py-3.5 text-xs sm:text-sm',
  lg: 'px-7 py-3.5 text-sm sm:text-base',
}

/**
 * The site has no forms: every call to action is a link (`tel:`, messenger or
 * an internal route), so a plain anchor is the correct element.
 */
export function Button({
  href,
  children,
  variant = 'primary-gold',
  size = 'md',
  tone = 'dark',
  className = '',
  ...rest
}: ButtonProps) {
  // `hover:` already only applies where the input device supports hover
  // (Tailwind wraps it in `@media (hover: hover)`); `active:` is the actual
  // tap feedback on touch, so it's set independently rather than reusing
  // the hover color.
  const variantClasses =
    variant === 'primary-gold'
      ? 'bg-gold text-bg-dark hover:bg-gold-soft active:bg-gold-soft'
      : `border border-gold/60 ${goldTextClass(tone)} hover:border-gold hover:bg-gold/10 active:border-gold active:bg-gold/10`

  return (
    <a
      href={href}
      className={`${base} ${variantClasses} ${sizes[size]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </a>
  )
}
