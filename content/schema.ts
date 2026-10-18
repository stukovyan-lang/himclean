import { z } from 'zod'

/**
 * Single source of truth for the shape of every piece of content.
 * Runtime validation happens once, at module load of `content/*`, so a broken
 * content file fails the build instead of rendering an empty page.
 */

/** Invariant 2: alt text is descriptive, unique and never decorative filler. */
export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z
    .string()
    .min(10, 'alt is too short to describe the frame')
    .max(125, 'alt is too long for assistive technology'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

/**
 * A question the client hasn't answered yet is real content too — it must
 * not be invented (invariant 1) and must not be lost. `pending: true` keeps
 * the question in the codebase without publishing a guess: seo-check routes
 * it into the client questionnaire instead of the page.
 */
export const faqItemSchema = z
  .object({
    question: z.string().min(8),
    /** Absent, or `true` while the answer awaits client confirmation. */
    pending: z.boolean().optional(),
    /**
     * Required once published. While `pending` is true this is the proposed
     * answer to show the client for confirmation, and may be omitted
     * entirely when there isn't even a draft to propose.
     */
    answer: z.string().min(1).optional(),
  })
  .refine((item) => item.pending === true || (item.answer !== undefined && item.answer.length >= 40), {
    message: 'a published question needs a real answer, not a teaser',
    path: ['answer'],
  })

const dayOfWeekSchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

export const openingHoursSchema = z.object({
  dayOfWeek: z.array(dayOfWeekSchema).min(1),
  opens: z.string().regex(/^\d{2}:\d{2}$/, 'use HH:MM'),
  closes: z.string().regex(/^\d{2}:\d{2}$/, 'use HH:MM'),
})

export const geoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

/**
 * Invariant 3: name, phone and address exist here and nowhere else.
 * Unknown client data stays `null`. Inventing a plausible value is a defect.
 */
export const siteConfigSchema = z.object({
  status: z.enum(['draft', 'live']),
  name: z.string().min(2),
  legalName: z.string().min(2).nullable(),
  city: z.string().min(2).nullable(),
  /** Prepositional case of the city, used after "в"/"во": Полоцк -> Полоцке. */
  cityPrepositional: z.string().min(2).nullable(),
  areaServed: z.array(z.string().min(2)),
  phoneE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'phone must be E.164, e.g. +375291234567')
    .nullable(),
  phoneDisplay: z.string().min(6).nullable(),
  whatsapp: z.string().min(1).nullable(),
  telegram: z.string().min(1).nullable(),
  viber: z.string().min(1).nullable(),
  email: z.email().nullable(),
  address: z.string().min(4).nullable(),
  openingHours: z.array(openingHoursSchema),
  geo: geoSchema.nullable(),
  sameAs: z.array(z.url()),
})

export const serviceSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase latin kebab-case'),
  /** 'service' = what we sell, 'problem' = the long-tail entity+problem page. */
  kind: z.enum(['service', 'problem']),
  /**
   * Explicit hub grouping. The slug prefix is not a reliable signal — problem
   * pages ("udalenie-zapaha-mochi") don't share a prefix with the service
   * they extend, so the hub reads this field instead of guessing from the URL.
   */
  group: z.enum(['himchistka', 'ozonirovanie', 'problem']),
  h1: z.string().min(8),
  /**
   * Raw values still carry `{city}` tokens, so the caps here are only a sanity
   * bound. The real 60/155 limits are enforced by seo-check on the rendered
   * string, after substitution.
   */
  metaTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(50).max(200),
  /** AEO: a self-contained answer in the first two or three sentences. */
  leadParagraph: z.string().min(120),
  /**
   * What the service is for, as short labels ("Запах табака", "Пролитое
   * молоко"). Rendered as chips right under the lead: the client's point is
   * that people look for their own problem first and read the process later.
   * Optional — only pages where "why would I need this" isn't obvious.
   */
  reasons: z.array(z.string().min(3)).optional(),
  whatWeDo: z.array(z.string().min(10)),
  includes: z.array(z.string().min(5)),
  limitations: z.array(z.string().min(10)),
  faq: z.array(faqItemSchema),
  images: z.array(imageSchema),
  /**
   * Photo for this service's card on the hub and the home page, by `src` of
   * an image that already exists in `content/works.ts` or some service's
   * `images`. Omitted = the service's own first "after" frame, then its own
   * first image (`lib/service-card.ts`). For pages with no photos of their
   * own, a representative real frame from a neighbouring service.
   */
  cardImageSrc: z.string().optional(),
  /** Sibling pages to link to. Slugs without a page are skipped silently. */
  relatedSlugs: z.array(z.string()),
  /** Internal analytics only. Never reaches the markup or the copy. */
  intentKeywords: z.array(z.string().min(3)),
  /**
   * Structured facts already stated in `leadParagraph` or `faq` — a drying
   * or processing time, restated as a short standalone line. AEO principle:
   * "факты в структурах, а не в прозе". Currently consumed by `llms.txt`;
   * empty when the approved copy doesn't state a clean number (a variable
   * outcome like drying time after a flood isn't a fact to restate).
   */
  keyFacts: z.array(z.string().min(5)),
  /** Claims the client has to confirm before this page may go live. */
  confirmRequired: z.array(z.string().min(10)),
})

export const workSchema = z.object({
  id: z.string().min(1),
  before: imageSchema,
  after: imageSchema,
  material: z.string().min(3),
  soiling: z.string().min(3),
  note: z.string().min(10).optional(),
  /** Service page this pair belongs to. Undefined = gallery page only. */
  serviceSlug: z.string().optional(),
})

export const reviewSchema = z.object({
  author: z.string().min(2),
  text: z.string().min(20),
  /** Where the review actually lives. Invariant 6: no invented sources. */
  source: z.enum(['google', 'yandex', '2gis', 'instagram', 'vk', 'direct']),
  sourceUrl: z.url().optional(),
  date: z.iso.date(),
})

export const seoConfigSchema = z.object({
  defaultTitle: z.string().min(10).max(60),
  defaultDescription: z.string().min(50).max(155).nullable(),
  titleTemplate: z.string().includes('%s'),
  ogImage: imageSchema.nullable(),
  locale: z.string().min(2),
})

/** One row of the home page's "what to pick" table. */
export const decisionRowSchema = z.object({
  problem: z.string().min(8),
  /** Short service label for the table, not necessarily the full h1. */
  label: z.string().min(4),
  targetSlug: z.string(),
})

/**
 * Copy for the home page. Lives in its own schema rather than reusing
 * `serviceSchema`: the home page is not a service, and its sections (a
 * decision table, process steps) have no equivalent on a service page.
 */
export const homePageSchema = z.object({
  /**
   * Raw values still carry `{city}` / `{cityIn}` tokens; see the comment on
   * `serviceSchema.metaTitle` for why the caps here are only a sanity bound.
   */
  metaTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(50).max(200),
  h1: z.string().min(8),
  subtitle: z.string().min(4),
  /** AEO: a self-contained answer in the first two or three sentences. */
  leadParagraph: z.string().min(120),
  decisionTable: z.array(decisionRowSchema),
  processSteps: z.array(z.string().min(10)),
  faq: z.array(faqItemSchema),
  contactsTitle: z.string().min(4),
  /** Claims the client has to confirm before the home page may go live. */
  confirmRequired: z.array(z.string().min(10)),
})

/**
 * Copy for `/kak-my-rabotaem` — the page that explains the process and why
 * there is no price list. Its own schema, not `serviceSchema`: it isn't a
 * service, and its sections (price factors, what to prepare) don't map onto
 * `whatWeDo`/`includes`/`limitations`.
 */
export const howItWorksPageSchema = z.object({
  metaTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(50).max(200),
  h1: z.string().min(8),
  leadParagraph: z.string().min(120),
  processSteps: z.array(z.string().min(10)),
  priceFactors: z.array(z.string().min(10)),
  whyNoPhonePrice: z.string().min(80),
  prepareForVisit: z.array(z.string().min(10)),
  faq: z.array(faqItemSchema),
  confirmRequired: z.array(z.string().min(10)),
})

/** One themed group of questions on `/faq`, with its own optional service links. */
export const faqSectionSchema = z.object({
  id: z.string().min(2),
  label: z.string().min(4),
  questions: z.array(faqItemSchema),
  /** Service slugs to link under this section. Empty when none apply. */
  relatedSlugs: z.array(z.string()),
})

export const faqPageContentSchema = z.object({
  metaTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(50).max(200),
  h1: z.string().min(8),
  leadParagraph: z.string().min(120),
  sections: z.array(faqSectionSchema),
})

export type SiteImage = z.infer<typeof imageSchema>
export type FaqItem = z.infer<typeof faqItemSchema>
export type OpeningHours = z.infer<typeof openingHoursSchema>
export type SiteConfig = z.infer<typeof siteConfigSchema>
export type Service = z.infer<typeof serviceSchema>
export type ServiceGroupId = Service['group']
export type Work = z.infer<typeof workSchema>
export type Review = z.infer<typeof reviewSchema>
export type SeoConfig = z.infer<typeof seoConfigSchema>
export type DecisionRow = z.infer<typeof decisionRowSchema>
export type HomePage = z.infer<typeof homePageSchema>
export type HowItWorksPage = z.infer<typeof howItWorksPageSchema>
export type FaqSection = z.infer<typeof faqSectionSchema>
export type FaqPageContent = z.infer<typeof faqPageContentSchema>

/**
 * The publication gate, exactly as specified: the site may go live only with a
 * city and a phone number. Everything else is content, not a blocker.
 */
export const REQUIRED_FOR_LIVE = ['city', 'phoneE164'] as const

export type RequiredForLive = (typeof REQUIRED_FOR_LIVE)[number]

export function missingRequiredFields(site: SiteConfig): RequiredForLive[] {
  return REQUIRED_FOR_LIVE.filter((field) => site[field] === null)
}

/**
 * While this is false the app serves one noindex page and an empty sitemap,
 * no matter what else exists in `content/`.
 */
export function isSiteLive(site: SiteConfig): boolean {
  return site.status === 'live' && missingRequiredFields(site).length === 0
}
