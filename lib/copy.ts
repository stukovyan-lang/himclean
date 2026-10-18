import { isSiteLive } from '../content/schema'
import type {
  FaqItem,
  FaqPageContent,
  FaqSection,
  HomePage,
  HowItWorksPage,
  Service,
  SiteConfig,
} from '../content/schema'

/**
 * City substitution.
 *
 * Copy in `content/` never spells the city out. It carries tokens instead, so
 * the same texts survive a change of city and stay consistent with the NAP in
 * `content/site.ts` (invariant 3).
 *
 *   {city}    nominative, e.g. "Полоцк"
 *   {cityIn}  prepositional, e.g. "Полоцке", used after "в" / "во"
 */

export const CITY_TOKEN = '{city}'
export const CITY_IN_TOKEN = '{cityIn}'

/** Visible marker so an unfilled city cannot be mistaken for finished copy. */
export const DEV_CITY_LABEL = '__ГОРОД__'

/**
 * A live site always has a city, because `isSiteLive` requires one. So the
 * marker only ever shows on a draft: locally, or on a Vercel preview opened
 * with PREVIEW_UNLOCK. A raw `{cityIn}` on a page shown to the client would
 * be worse than a marker that plainly reads as unfinished.
 */
function resolve(site: SiteConfig, value: string | null): string | null {
  if (value) return value
  return isSiteLive(site) ? null : DEV_CITY_LABEL
}

export function renderCopy(text: string, site: SiteConfig): string {
  const nominative = resolve(site, site.city)
  const prepositional = resolve(site, site.cityPrepositional ?? site.city)

  let result = text
  if (nominative !== null) result = result.split(CITY_TOKEN).join(nominative)
  if (prepositional !== null) result = result.split(CITY_IN_TOKEN).join(prepositional)
  return result
}

/**
 * A pending question has no confirmed answer yet, so there is nothing to
 * render on the site and nothing to city-substitute in it. Every render/audit
 * pass over a `FaqItem[]` goes through these two so that stays true in one
 * place, not at every call site.
 */
export function renderFaqItem(item: FaqItem, site: SiteConfig): FaqItem {
  return {
    ...item,
    question: renderCopy(item.question, site),
    answer: item.answer !== undefined ? renderCopy(item.answer, site) : undefined,
  }
}

export function faqItemStrings(
  item: FaqItem,
  field: string,
): Array<{ field: string; value: string }> {
  const strings = [{ field: `${field}.question`, value: item.question }]
  if (item.answer !== undefined) strings.push({ field: `${field}.answer`, value: item.answer })
  return strings
}

/** Renders every user-visible string of a service in one pass. */
export function renderService(service: Service, site: SiteConfig): Service {
  const render = (text: string) => renderCopy(text, site)

  return {
    ...service,
    h1: render(service.h1),
    metaTitle: render(service.metaTitle),
    metaDescription: render(service.metaDescription),
    leadParagraph: render(service.leadParagraph),
    reasons: service.reasons?.map(render),
    whatWeDo: service.whatWeDo.map(render),
    includes: service.includes.map(render),
    limitations: service.limitations.map(render),
    keyFacts: service.keyFacts.map(render),
    faq: service.faq.map((item) => renderFaqItem(item, site)),
    images: service.images.map((image) => ({ ...image, alt: render(image.alt) })),
  }
}

/** Every string of a service that reaches the page or the metadata. */
export function serviceStrings(service: Service): Array<{ field: string; value: string }> {
  return [
    { field: 'h1', value: service.h1 },
    { field: 'metaTitle', value: service.metaTitle },
    { field: 'metaDescription', value: service.metaDescription },
    { field: 'leadParagraph', value: service.leadParagraph },
    ...(service.reasons ?? []).map((value, index) => ({ field: `reasons[${index}]`, value })),
    ...service.whatWeDo.map((value, index) => ({ field: `whatWeDo[${index}]`, value })),
    ...service.includes.map((value, index) => ({ field: `includes[${index}]`, value })),
    ...service.limitations.map((value, index) => ({ field: `limitations[${index}]`, value })),
    ...service.keyFacts.map((value, index) => ({ field: `keyFacts[${index}]`, value })),
    ...service.faq.flatMap((item, index) => faqItemStrings(item, `faq[${index}]`)),
    ...service.images.map((image, index) => ({ field: `images[${index}].alt`, value: image.alt })),
  ]
}

/** Renders every user-visible string of the home page in one pass. */
export function renderHome(home: HomePage, site: SiteConfig): HomePage {
  const render = (text: string) => renderCopy(text, site)

  return {
    ...home,
    metaTitle: render(home.metaTitle),
    metaDescription: render(home.metaDescription),
    h1: render(home.h1),
    subtitle: render(home.subtitle),
    leadParagraph: render(home.leadParagraph),
    decisionTable: home.decisionTable.map((row) => ({
      ...row,
      problem: render(row.problem),
      label: render(row.label),
    })),
    processSteps: home.processSteps.map(render),
    faq: home.faq.map((item) => renderFaqItem(item, site)),
    contactsTitle: render(home.contactsTitle),
  }
}

/** Every string of the home page that reaches the page or the metadata. */
export function homeStrings(home: HomePage): Array<{ field: string; value: string }> {
  return [
    { field: 'metaTitle', value: home.metaTitle },
    { field: 'metaDescription', value: home.metaDescription },
    { field: 'h1', value: home.h1 },
    { field: 'subtitle', value: home.subtitle },
    { field: 'leadParagraph', value: home.leadParagraph },
    ...home.decisionTable.flatMap((row, index) => [
      { field: `decisionTable[${index}].problem`, value: row.problem },
      { field: `decisionTable[${index}].label`, value: row.label },
    ]),
    ...home.processSteps.map((value, index) => ({ field: `processSteps[${index}]`, value })),
    ...home.faq.flatMap((item, index) => faqItemStrings(item, `faq[${index}]`)),
    { field: 'contactsTitle', value: home.contactsTitle },
  ]
}

/** Renders every user-visible string of `/kak-my-rabotaem` in one pass. */
export function renderHowItWorks(page: HowItWorksPage, site: SiteConfig): HowItWorksPage {
  const render = (text: string) => renderCopy(text, site)

  return {
    ...page,
    metaTitle: render(page.metaTitle),
    metaDescription: render(page.metaDescription),
    h1: render(page.h1),
    leadParagraph: render(page.leadParagraph),
    processSteps: page.processSteps.map(render),
    priceFactors: page.priceFactors.map(render),
    whyNoPhonePrice: render(page.whyNoPhonePrice),
    prepareForVisit: page.prepareForVisit.map(render),
    faq: page.faq.map((item) => renderFaqItem(item, site)),
  }
}

/** Every string of `/kak-my-rabotaem` that reaches the page or the metadata. */
export function howItWorksStrings(page: HowItWorksPage): Array<{ field: string; value: string }> {
  return [
    { field: 'metaTitle', value: page.metaTitle },
    { field: 'metaDescription', value: page.metaDescription },
    { field: 'h1', value: page.h1 },
    { field: 'leadParagraph', value: page.leadParagraph },
    ...page.processSteps.map((value, index) => ({ field: `processSteps[${index}]`, value })),
    ...page.priceFactors.map((value, index) => ({ field: `priceFactors[${index}]`, value })),
    { field: 'whyNoPhonePrice', value: page.whyNoPhonePrice },
    ...page.prepareForVisit.map((value, index) => ({ field: `prepareForVisit[${index}]`, value })),
    ...page.faq.flatMap((item, index) => faqItemStrings(item, `faq[${index}]`)),
  ]
}

/** Renders every user-visible string of `/faq` in one pass. */
export function renderFaqPageContent(page: FaqPageContent, site: SiteConfig): FaqPageContent {
  const render = (text: string) => renderCopy(text, site)
  const renderSection = (section: FaqSection): FaqSection => ({
    ...section,
    label: render(section.label),
    questions: section.questions.map((item) => renderFaqItem(item, site)),
  })

  return {
    ...page,
    metaTitle: render(page.metaTitle),
    metaDescription: render(page.metaDescription),
    h1: render(page.h1),
    leadParagraph: render(page.leadParagraph),
    sections: page.sections.map(renderSection),
  }
}

/** Every string of `/faq` that reaches the page or the metadata. */
export function faqPageContentStrings(page: FaqPageContent): Array<{ field: string; value: string }> {
  return [
    { field: 'metaTitle', value: page.metaTitle },
    { field: 'metaDescription', value: page.metaDescription },
    { field: 'h1', value: page.h1 },
    { field: 'leadParagraph', value: page.leadParagraph },
    ...page.sections.flatMap((section, sectionIndex) => [
      { field: `sections[${sectionIndex}].label`, value: section.label },
      ...section.questions.flatMap((item, itemIndex) =>
        faqItemStrings(item, `sections[${sectionIndex}].questions[${itemIndex}]`),
      ),
    ]),
  ]
}

/**
 * Whether a plain `FaqItem[]` (a service's, the home page's, or
 * `/kak-my-rabotaem`'s) has at least one question worth rendering. A block
 * made entirely of pending questions must stay off the page — heading
 * included — exactly like an empty one.
 */
export function hasPublishedFaqItem(items: readonly FaqItem[]): boolean {
  return items.some((item) => !item.pending && item.answer !== undefined)
}

/** All published (non-pending) questions across every section, in order. */
export function publishedFaqItems(page: FaqPageContent): Array<FaqItem & { answer: string }> {
  return page.sections.flatMap((section) =>
    section.questions.filter(
      (item): item is FaqItem & { answer: string } => !item.pending && item.answer !== undefined,
    ),
  )
}

/**
 * Length budgeting.
 *
 * A title is measured against the longest city form the site can substitute,
 * not against whatever happens to render today. Otherwise a title that fits
 * in the nominative would silently overflow in the prepositional.
 */
export const REFERENCE_CITY_LENGTH = 16

export function measurementCityLength(site: SiteConfig): number {
  const forms = [site.city, site.cityPrepositional].filter((form) => form !== null)
  if (forms.length === 0) return REFERENCE_CITY_LENGTH
  return Math.max(...forms.map((form) => form.length))
}

/** Length of the string after substituting a city of `cityLength` characters. */
export function measuredLength(text: string, cityLength: number): number {
  const filler = 'x'.repeat(cityLength)
  return text.split(CITY_TOKEN).join(filler).split(CITY_IN_TOKEN).join(filler).length
}

const UNRESOLVED_TOKEN = /\{[a-zA-Z]+\}/

export function hasUnresolvedToken(text: string): boolean {
  return UNRESOLVED_TOKEN.test(text)
}

export function hasDevCityLabel(text: string): boolean {
  return text.includes(DEV_CITY_LABEL)
}

/**
 * Russian needs the prepositional case after "в" / "во". A nominative
 * `{city}` there would read "в Полоцк" instead of "в Полоцке".
 */
const PREPOSITION_BEFORE_CITY = /(^|[^\p{L}])во?\s+\{city\}/iu

export function needsPrepositionalCity(text: string): boolean {
  return PREPOSITION_BEFORE_CITY.test(text)
}
