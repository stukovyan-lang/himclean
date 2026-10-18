import type { JsonLdNode } from '@/lib/schema'

type JsonLdProps = {
  data: JsonLdNode | null
}

/**
 * Renders nothing when there is no graph to emit, so a draft site never ships
 * an empty or half-filled structured-data block.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      // Content comes from typed factories over local modules, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
