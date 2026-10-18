import type { Service, ServiceGroupId } from '../content/schema'

/**
 * Groups on the services hub are derived from the explicit `group` field on
 * each service, not from the slug prefix: a problem page like
 * "udalenie-zapaha-mochi" carries no prefix that would place it correctly.
 */
export type ServiceGroup = {
  id: ServiceGroupId
  label: string
  services: Service[]
}

const GROUP_DEFINITIONS: ReadonlyArray<{ id: ServiceGroupId; label: string }> = [
  { id: 'himchistka', label: 'Химчистка' },
  { id: 'ozonirovanie', label: 'Озонирование' },
  { id: 'problem', label: 'Решение конкретных проблем' },
]

export function groupServices(entries: readonly Service[]): ServiceGroup[] {
  return GROUP_DEFINITIONS.map((definition) => ({
    ...definition,
    services: entries.filter((entry) => entry.group === definition.id),
  })).filter((group) => group.services.length > 0)
}

/** The first sentence of the lead paragraph, used as the card summary. */
export function firstSentence(text: string): string {
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(text.trim())
  return (match?.[0] ?? text).trim()
}
