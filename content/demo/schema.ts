import { z } from 'zod'
import { imageSchema } from '../schema'

/**
 * Content shapes for the client-demo mockup only. Separate from
 * `content/schema.ts` on purpose: this data is fictional by design (invariant
 * 6 forbids inventing reviews and facts for the real site, but a demo openly
 * labelled as an example is a different thing), so it must never be mistaken
 * for, or merged into, the real content schemas.
 */

export const demoImageSchema = imageSchema

export const demoServiceCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(4),
  description: z.string().min(20),
  href: z.string().min(1),
  image: demoImageSchema,
  /** The middle card renders dark in the client mockup; the rest are light. */
  dark: z.boolean().optional(),
})

export const demoMarkerSchema = z.object({
  label: z.string().min(2),
})

export const demoWhyUsItemSchema = z.object({
  title: z.string().min(4),
  /** Optional: the client mockup's "why us" row is icon + label only, no body copy. */
  description: z.string().min(10).optional(),
})

export const demoHeroSchema = z.object({
  overline: z.string().min(4),
  headingLines: z.array(z.string().min(2)).length(3),
  /** Indexes into `headingLines` rendered in gold (the reference: lines 2 and 3). */
  goldLineIndexes: z.array(z.number().int().min(0).max(2)).min(1),
  subtitle: z.string().min(4),
  markers: z.array(demoMarkerSchema).min(1),
  badgeText: z.string().min(4),
  image: demoImageSchema,
})

export const demoResultsSchema = z.object({
  heading: z.string().min(4),
  points: z.array(z.string().min(4)).min(1),
  /** A finished before/after composite frame, shown as-is — see DemoResults.tsx. */
  image: demoImageSchema,
})

export const demoOzoneSchema = z.object({
  heading: z.string().min(4),
  paragraph: z.string().min(40),
  points: z.array(z.string().min(4)).min(1),
  image: demoImageSchema,
})

export const demoContactsCardSchema = z.object({
  heading: z.string().min(4),
  paragraph: z.string().min(20),
  subtitle: z.string().min(4),
})

export const demoHomeSchema = z.object({
  hero: demoHeroSchema,
  servicesHeading: z.string().min(4),
  servicesSubtitle: z.string().min(4),
  services: z.array(demoServiceCardSchema).min(1),
  results: demoResultsSchema,
  ozone: demoOzoneSchema,
  whyUsHeading: z.string().min(4),
  whyUs: z.array(demoWhyUsItemSchema).min(1),
  contactsCard: demoContactsCardSchema,
})

/**
 * A real before/after pair from the client. Two separate shots, not aligned
 * frame to frame, so they render side by side (`DemoWorkPair`), not in a
 * slider. `title` and `note` describe only what is visible in the frames.
 */
export const demoWorkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  note: z.string().min(3),
  before: demoImageSchema,
  after: demoImageSchema,
})

export const demoPhotoSchema = z.object({
  image: demoImageSchema,
  caption: z.string().min(4),
})

/**
 * A real review the client forwarded as a screenshot. The text is transcribed
 * so it exists in the HTML (invariant 4); the screenshot is the proof, with
 * names, numbers and avatars already removed at import. No author field on
 * purpose — the reviewers never agreed to be named on a website.
 */
export const demoReviewSchema = z.object({
  id: z.string().min(1),
  service: z.string().min(4),
  channel: z.enum(['telegram', 'instagram', 'viber', 'google']).optional(),
  text: z.string().min(20),
  screenshot: demoImageSchema,
})

export const demoAboutSchema = z.object({
  sections: z
    .array(z.object({ heading: z.string().min(4), paragraphs: z.array(z.string().min(40)).min(1) }))
    .min(1),
  factsHeading: z.string().min(4),
  facts: z.array(z.string().min(10)).min(1),
  photos: z.array(demoPhotoSchema).min(1),
})

export type DemoServiceCard = z.infer<typeof demoServiceCardSchema>
export type DemoWhyUsItem = z.infer<typeof demoWhyUsItemSchema>
export type DemoHero = z.infer<typeof demoHeroSchema>
export type DemoResults = z.infer<typeof demoResultsSchema>
export type DemoOzone = z.infer<typeof demoOzoneSchema>
export type DemoContactsCard = z.infer<typeof demoContactsCardSchema>
export type DemoHome = z.infer<typeof demoHomeSchema>
export type DemoWork = z.infer<typeof demoWorkSchema>
export type DemoReview = z.infer<typeof demoReviewSchema>
export type DemoPhoto = z.infer<typeof demoPhotoSchema>
export type DemoAbout = z.infer<typeof demoAboutSchema>
