import { seoConfigSchema, type SeoConfig } from './schema'
import { site } from './site'

/**
 * Verification tokens live in the environment (invariant 7), never here.
 */
export const seo: SeoConfig = seoConfigSchema.parse({
  defaultTitle: 'HimClean — химчистка мебели',
  // Fallback for pages without their own description. This field is not run
  // through renderCopy, so the city comes straight from content/site.ts.
  defaultDescription: `Химчистка мягкой мебели, матрасов и салонов авто, озонирование квартир и машин в ${site.cityPrepositional ?? site.city ?? 'вашем городе'} и окрестностях. Выезд на дом, работаем 24/7.`,
  titleTemplate: '%s — HimClean',
  // Link preview in messengers and social networks, built by
  // scripts/process-demo-images.mjs from the hero frame and the logo.
  ogImage: {
    src: '/og/himclean.jpg',
    alt: 'Логотип HimClean на фоне гостиной с бежевым угловым диваном',
    width: 1200,
    height: 630,
  },
  locale: 'ru_RU',
} satisfies SeoConfig)

export const verification = {
  google: process.env.GOOGLE_SITE_VERIFICATION ?? null,
  yandex: process.env.YANDEX_VERIFICATION ?? null,
}
