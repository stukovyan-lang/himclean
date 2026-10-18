import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/content/site'

/**
 * The client's logo — wordmark + tagline (`public/brand/logo-wordmark.webp`,
 * built by `scripts/process-logo.mjs`). The full lockup with the armchair is
 * not used here: its ~3px strokes fall under a pixel at header size.
 *
 * The brand name in the alt comes from `content/site.ts` like every other
 * place the name appears.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 items-center transition-opacity hover:opacity-80 active:opacity-70 ${className}`.trim()}
    >
      <Image
        src="/brand/logo-wordmark.webp"
        alt={`${site.name} — химчистка мебели и озонирование, на главную`}
        width={950}
        height={355}
        priority
        quality={90}
        sizes="120px"
        className="h-11 w-auto"
      />
    </Link>
  )
}
