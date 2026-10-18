/**
 * Background tone shared across `Section` and every component that renders
 * gold text: `--gold` reads fine on `dark`, but drops to ~1.9:1 on `cream`
 * (WCAG AA needs 4.5:1). A component that can sit on either background must
 * take this prop and pick the right color through `goldTextClass` — never
 * hardcode `text-gold` in a component that isn't single-context.
 */
export type Tone = 'dark' | 'cream'

export function goldTextClass(tone: Tone): string {
  return tone === 'cream' ? 'text-gold-on-light' : 'text-gold'
}
