/**
 * Build-time guard for the project invariants.
 *
 * Three independent outputs:
 *   1. Violations — our own defects (missing alt, duplicate slug, placeholder
 *      text, several h1 on a page). These always fail the build, draft or live.
 *   2. Warnings — our own copy running close to a length limit. Printed, never
 *      fails the build: a title at 58/60 is worth a look, not a blocker.
 *   3. Client checklist — data the client has not supplied yet. While the site
 *      is a draft this is printed as a checklist and never fails the build.
 */

import './load-env'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { faqPageContent } from '../content/faq'
import { home, howItWork, staticPageMeta } from '../content/pages'
import { reviews } from '../content/reviews'
import { isSiteLive, missingRequiredFields, type SiteImage } from '../content/schema'
import { seo } from '../content/seo'
import { services } from '../content/services'
import { site, siteUrl } from '../content/site'
import { works } from '../content/works'
import {
  DEV_CITY_LABEL,
  REFERENCE_CITY_LENGTH,
  faqPageContentStrings,
  hasDevCityLabel,
  hasUnresolvedToken,
  homeStrings,
  howItWorksStrings,
  measuredLength,
  measurementCityLength,
  needsPrepositionalCity,
  publishedFaqItems,
  renderFaqPageContent,
  renderHome,
  renderHowItWorks,
  renderService,
  serviceStrings,
} from '../lib/copy'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SCANNED_DIRS = ['app', 'components', 'content', 'lib']
const SOURCE_EXTENSIONS = ['.ts', '.tsx']

const PLACEHOLDER_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'lorem', pattern: /\blorem\b/i },
  { label: 'ipsum', pattern: /\bipsum\b/i },
  { label: 'placeholder', pattern: /placeholder/i },
  { label: 'TODO', pattern: /\bTODO\b/ },
  { label: 'текст здесь', pattern: /текст\s+здесь/i },
  { label: 'ваш текст', pattern: /ваш\s+текст/i },
]

const ALT_MIN = 10
const ALT_MAX = 125
const TITLE_MAX = 60
const DESCRIPTION_MAX = 155
/** Soft thresholds: a title or description this long is worth trimming. */
const TITLE_WARN = 55
const DESCRIPTION_WARN = 145

const violations: string[] = []
const warnings: string[] = []
const checklist: string[] = []

function fail(message: string): void {
  violations.push(message)
}

function warn(message: string): void {
  warnings.push(message)
}

function todo(message: string): void {
  checklist.push(message)
}

/** Checks one title/description pair against the error and warning thresholds. */
function checkMetaLength(origin: string, title: string, description: string, cityLength: number): void {
  const titleLength = measuredLength(title, cityLength)
  if (titleLength > TITLE_MAX) {
    fail(`${origin}: metaTitle is ${titleLength} characters with a ${cityLength}-character city, limit is ${TITLE_MAX}`)
  } else if (titleLength > TITLE_WARN) {
    warn(`${origin}: metaTitle is ${titleLength} characters with a ${cityLength}-character city, close to the ${TITLE_MAX} limit`)
  }

  const descriptionLength = measuredLength(description, cityLength)
  if (descriptionLength > DESCRIPTION_MAX) {
    fail(
      `${origin}: metaDescription is ${descriptionLength} characters with a ${cityLength}-character city, limit is ${DESCRIPTION_MAX}`,
    )
  } else if (descriptionLength > DESCRIPTION_WARN) {
    warn(
      `${origin}: metaDescription is ${descriptionLength} characters with a ${cityLength}-character city, close to the ${DESCRIPTION_MAX} limit`,
    )
  }
}

/* ------------------------------------------------------------------ files */

function walk(dir: string): string[] {
  const absolute = join(ROOT, dir)
  let entries: string[]
  try {
    entries = readdirSync(absolute)
  } catch {
    return []
  }

  return entries.flatMap((entry) => {
    const full = join(absolute, entry)
    if (statSync(full).isDirectory()) return walk(relative(ROOT, full))
    return SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)) ? [full] : []
  })
}

/** Comments are documentation, not shipped copy: they are exempt from the scans. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart()
      if (trimmed.startsWith('//')) return ''
      return line.replace(/(^|[\s{([,])\/\/(?!\/).*$/, '$1')
    })
    .join('\n')
}

const sourceFiles = SCANNED_DIRS.flatMap(walk)
const sourceById = new Map<string, string>()

for (const file of sourceFiles) {
  sourceById.set(file, stripComments(readFileSync(file, 'utf8')))
}

/* --------------------------------------------------- placeholder wording */

for (const [file, source] of sourceById) {
  for (const { label, pattern } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(source)) {
      fail(`${relative(ROOT, file)}: placeholder wording "${label}" must not ship`)
    }
  }
}

/* -------------------------------------------------------------- alt texts */

const seenAlts = new Map<string, string>()

function checkImage(image: SiteImage, origin: string): void {
  const alt = image.alt?.trim() ?? ''

  // A photo listed in content/ but never built into public/ ships as a
  // broken image — e.g. a source saved as .JPEG that a script skipped.
  if (image.src.startsWith('/') && !existsSync(join(ROOT, 'public', image.src))) {
    fail(`${origin}: image file public${image.src} does not exist`)
  }

  if (alt.length === 0) {
    fail(`${origin}: image "${image.src}" has no alt text`)
    return
  }
  if (alt.length < ALT_MIN) {
    fail(`${origin}: alt "${alt}" is shorter than ${ALT_MIN} characters`)
  }
  if (alt.length > ALT_MAX) {
    fail(`${origin}: alt for "${image.src}" is ${alt.length} characters, limit is ${ALT_MAX}`)
  }

  const previous = seenAlts.get(alt.toLowerCase())
  if (previous) {
    fail(`${origin}: alt "${alt}" is already used in ${previous}`)
  } else {
    seenAlts.set(alt.toLowerCase(), origin)
  }
}

for (const service of services) {
  service.images.forEach((image, index) => checkImage(image, `services/${service.slug}[${index}]`))
}

for (const work of works) {
  checkImage(work.before, `works/${work.id}/before`)
  checkImage(work.after, `works/${work.id}/after`)
}

if (seo.ogImage) checkImage(seo.ogImage, 'seo/ogImage')

/** JSX images must carry a literal alt attribute; icons use aria-hidden instead. */
const IMAGE_TAG = /<(Image|img)\b[^>]*>/g

for (const [file, source] of sourceById) {
  for (const match of source.matchAll(IMAGE_TAG)) {
    const tag = match[0]
    if (!/\salt\s*=/.test(tag)) {
      fail(`${relative(ROOT, file)}: <${match[1]}> without an alt attribute`)
    }
    const literal = /\salt\s*=\s*"([^"]*)"/.exec(tag)
    if (literal && literal[1] !== undefined) {
      const value = literal[1].trim()
      if (value.length < ALT_MIN) {
        fail(`${relative(ROOT, file)}: alt "${value}" is shorter than ${ALT_MIN} characters`)
      }
      if (value.length > ALT_MAX) {
        fail(`${relative(ROOT, file)}: alt is ${value.length} characters, limit is ${ALT_MAX}`)
      }
    }
  }
}

/* -------------------------------------------------------------- single h1 */

function resolveImport(fromFile: string, specifier: string): string | null {
  let base: string
  if (specifier.startsWith('@/')) base = join(ROOT, specifier.slice(2))
  else if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier)
  else return null

  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((ext) => `${base}${ext}`),
    ...SOURCE_EXTENSIONS.map((ext) => join(base, `index${ext}`)),
  ]

  return candidates.find((candidate) => sourceById.has(candidate)) ?? null
}

/**
 * Component names used as `if (...) return <Name ... />` — an early-return
 * guard whose branch ends the function right there, so it never coexists
 * with whatever the function returns afterwards. `app/page.tsx` is the one
 * page that genuinely renders two alternative root components (the draft
 * placeholder or the real content, chosen by `isSiteLive`), and summing both
 * of their h1s would be a false positive, not a real second `h1`.
 */
function earlyReturnGuardedNames(source: string): Set<string> {
  const names = new Set<string>()
  for (const match of source.matchAll(/if\s*\([^)]*\)\s*return\s*<(\w+)\b/g)) {
    if (match[1]) names.add(match[1])
  }
  return names
}

/** A component module's exported name, by this project's own naming convention. */
function moduleExportName(specifier: string): string {
  const base = specifier.split('/').pop() ?? specifier
  return base.replace(/\.(tsx?|jsx?)$/, '')
}

function countH1(file: string, visited = new Set<string>()): number {
  if (visited.has(file)) return 0
  visited.add(file)

  const source = sourceById.get(file)
  if (!source) return 0

  let count = (source.match(/<h1[\s>]/g) ?? []).length
  count += (source.match(/level=\{1\}/g) ?? []).length

  const guardedNames = earlyReturnGuardedNames(source)

  for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
    const specifier = match[1]
    if (!specifier) continue
    if (guardedNames.has(moduleExportName(specifier))) continue
    const target = resolveImport(file, specifier)
    if (target) count += countH1(target, visited)
  }

  return count
}

const pageFiles = [...sourceById.keys()].filter(
  (file) => /\/app\/.*\/page\.tsx$/.test(file) || file.endsWith('/app/page.tsx') || file.endsWith('/app/not-found.tsx'),
)

for (const page of pageFiles) {
  const count = countH1(page)
  if (count > 1) {
    fail(`${relative(ROOT, page)}: ${count} h1 elements, exactly one is allowed`)
  }
}

/* ------------------------------------------------------------ service SEO */

const slugs = new Set<string>()
const live = isSiteLive(site)
const cityLength = measurementCityLength(site)

// A live build without its real domain still "works" — and puts
// http://localhost:3000 into every canonical link, sitemap.xml, robots.txt,
// JSON-LD and llms.txt. Vercel preview deployments are exempt: they are
// noindex anyway and their URL is not known before the build.
if (live && process.env.VERCEL_ENV !== 'preview') {
  const placeholder = /localhost|127\.0\.0\.1|example\.com/.test(siteUrl)
  if (!siteUrl.startsWith('https://') || placeholder) {
    fail(
      `NEXT_PUBLIC_SITE_URL is "${siteUrl}" — set it to the site's own https:// domain (Vercel: Project → Settings → Environment Variables; a server: .env.production)`,
    )
  }
}

for (const service of services) {
  if (slugs.has(service.slug)) fail(`services: duplicate slug "${service.slug}"`)
  slugs.add(service.slug)

  // Lengths are measured against the longest city form the site can produce,
  // so a title that fits in the nominative cannot overflow in the prepositional.
  checkMetaLength(`services/${service.slug}`, service.metaTitle, service.metaDescription, cityLength)

  const rendered = renderService(service, site)

  // City tokens must resolve. While the city is unknown the dev label is the
  // expected state, so it is a checklist item rather than a defect.
  for (const { field, value } of serviceStrings(rendered)) {
    const origin = `services/${service.slug}.${field}`

    if (hasUnresolvedToken(value)) {
      if (live) fail(`${origin}: unresolved token in "${value.slice(0, 60)}"`)
      else todo(`Нерезолвленный токен в ${origin}`)
    }

    if (hasDevCityLabel(value)) {
      if (live) fail(`${origin}: ${DEV_CITY_LABEL} must never reach a live page`)
    }
  }

  for (const { field, value } of serviceStrings(service)) {
    if (needsPrepositionalCity(value)) {
      todo(
        `services/${service.slug}.${field}: «в {city}» требует предложного падежа, нужен токен {cityIn}`,
      )
    }
  }

  for (const claim of service.confirmRequired) {
    todo(`Подтвердить у клиента — ${claim}  (services/${service.slug})`)
  }
}

/* ---------------------------------------------------- static page content */

/**
 * The same three checks the services loop runs above — unresolved tokens,
 * a leaked dev-city marker, and a prompt to confirm claims — applied to a
 * static page's content. Shared here so home, `/kak-my-rabotaem` and `/faq`
 * don't each hand-roll the same three loops.
 */
function auditPageStrings(
  origin: string,
  renderedStrings: ReadonlyArray<{ field: string; value: string }>,
  rawStrings: ReadonlyArray<{ field: string; value: string }>,
  confirmRequired: readonly string[],
): void {
  for (const { field, value } of renderedStrings) {
    const fieldOrigin = `${origin}.${field}`

    if (hasUnresolvedToken(value)) {
      if (live) fail(`${fieldOrigin}: unresolved token in "${value.slice(0, 60)}"`)
      else todo(`Нерезолвленный токен в ${fieldOrigin}`)
    }

    if (hasDevCityLabel(value)) {
      if (live) fail(`${fieldOrigin}: ${DEV_CITY_LABEL} must never reach a live page`)
    }
  }

  for (const { field, value } of rawStrings) {
    if (needsPrepositionalCity(value)) {
      todo(`${origin}.${field}: «в {city}» требует предложного падежа, нужен токен {cityIn}`)
    }
  }

  for (const claim of confirmRequired) {
    todo(`Подтвердить у клиента — ${claim}  (${origin})`)
  }
}

// Every row must point at a page that actually exists — the home page is the
// one place in the codebase where a broken link would be a defect, not a
// future service waiting to be written.
for (const row of home.decisionTable) {
  if (!slugs.has(row.targetSlug)) {
    fail(`home.decisionTable: row "${row.problem}" points at "${row.targetSlug}", which has no page`)
  }
}

auditPageStrings('home', homeStrings(renderHome(home, site)), homeStrings(home), home.confirmRequired)

auditPageStrings(
  'kak-my-rabotaem',
  howItWorksStrings(renderHowItWorks(howItWork, site)),
  howItWorksStrings(howItWork),
  howItWork.confirmRequired,
)

// Same defect class as the decision table above: a section linking to a
// slug that doesn't exist.
for (const section of faqPageContent.sections) {
  for (const slug of section.relatedSlugs) {
    if (!slugs.has(slug)) {
      fail(`faq.sections[${section.id}].relatedSlugs: "${slug}" has no page`)
    }
  }
}

auditPageStrings(
  'faq',
  faqPageContentStrings(renderFaqPageContent(faqPageContent, site)),
  faqPageContentStrings(faqPageContent),
  [],
)

if (publishedFaqItems(faqPageContent).length === 0) {
  todo('Хотя бы один ответ на /faq должен быть подтверждён, иначе страница пуста  (content/faq.ts)')
}

for (const page of staticPageMeta) {
  checkMetaLength(page.id, page.metaTitle, page.metaDescription, cityLength)
}

if (seo.defaultTitle.length > TITLE_MAX) {
  fail(`seo: defaultTitle is ${seo.defaultTitle.length} characters, limit is ${TITLE_MAX}`)
}
if (seo.defaultDescription && seo.defaultDescription.length > DESCRIPTION_MAX) {
  fail(`seo: defaultDescription is ${seo.defaultDescription.length} characters, limit is ${DESCRIPTION_MAX}`)
}

/* ------------------------------------------------- duplicate lead sentences */

/**
 * Two service pages competing with the same opening answer is the classic way
 * to lose both of them. Repetition inside `limitations` and `faq` is fine and
 * often correct, so only lead paragraphs are compared.
 */
const SENTENCE_MIN = 20

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim().replace(/\s+/g, ' ').toLowerCase())
    .filter((sentence) => sentence.length >= SENTENCE_MIN)
}

const seenSentences = new Map<string, string>()

for (const service of services) {
  for (const sentence of sentences(service.leadParagraph)) {
    const previous = seenSentences.get(sentence)
    if (previous && previous !== service.slug) {
      fail(
        `services/${service.slug}: leadParagraph repeats a sentence from services/${previous} — "${sentence.slice(0, 70)}"`,
      )
    } else {
      seenSentences.set(sentence, service.slug)
    }
  }
}

// Every static page's own lead paragraph joins the same pool: each one
// competes for the same "direct answer" spot as every service page.
const staticLeadParagraphs: Array<{ id: string; text: string }> = [
  { id: 'home', text: home.leadParagraph },
  { id: 'kak-my-rabotaem', text: howItWork.leadParagraph },
  { id: 'faq', text: faqPageContent.leadParagraph },
]

const STATIC_PAGE_IDS = new Set(staticLeadParagraphs.map((page) => page.id))

/** `services/x` for a service slug, or the bare page id for a static page. */
function leadParagraphOrigin(id: string): string {
  return STATIC_PAGE_IDS.has(id) ? id : `services/${id}`
}

for (const { id, text } of staticLeadParagraphs) {
  for (const sentence of sentences(text)) {
    const previous = seenSentences.get(sentence)
    if (previous && previous !== id) {
      fail(
        `${leadParagraphOrigin(id)}: leadParagraph repeats a sentence from ${leadParagraphOrigin(previous)} — "${sentence.slice(0, 70)}"`,
      )
    } else {
      seenSentences.set(sentence, id)
    }
  }
}

/* --------------------------------------------------------- client backlog */

const FIELD_LABELS: Record<string, string> = {
  city: 'Город базирования',
  phoneE164: 'Телефон в формате +375XXXXXXXXX',
  phoneDisplay: 'Телефон в виде для показа',
  areaServed: 'Зона выезда: список населённых пунктов',
  openingHours: 'Часы работы по дням недели',
  legalName: 'Юрлицо или ИП для подвала и JSON-LD',
  address: 'Адрес или пометка, что офиса нет',
  whatsapp: 'Номер WhatsApp',
  telegram: 'Ник или номер Telegram',
  email: 'Почта для связи',
  geo: 'Координаты для карточки LocalBusiness',
  sameAs: 'Ссылки на профили: Google, Яндекс, 2GIS, соцсети',
}

const CLIENT_FIELDS = [
  'city',
  'phoneE164',
  'phoneDisplay',
  'areaServed',
  'openingHours',
  // legalName is not asked for: the client is self-employed, there is no
  // legal entity name (content/site.ts). Add it back if that changes.
  'address',
  'whatsapp',
  'telegram',
  'email',
  'geo',
  'sameAs',
] as const

for (const field of CLIENT_FIELDS) {
  const value = site[field]
  const empty = value === null || (Array.isArray(value) && value.length === 0)
  if (empty) todo(`${FIELD_LABELS[field] ?? field}  (site.${field})`)
}

if (seo.defaultDescription === null) todo('Описание сайта для мета-тега  (seo.defaultDescription)')
if (seo.ogImage === null) todo('Картинка для соцсетей 1200×630  (seo.ogImage)')
if (site.cityPrepositional === null) {
  todo(
    `Город в предложном падеже, например Полоцк → Полоцке  (site.cityPrepositional). Пока города нет, длины считаются по эталону в ${REFERENCE_CITY_LENGTH} символов`,
  )
}
if (services.length === 0) todo('Тексты услуг: состав работ, ограничения, вопросы  (content/services.ts)')
if (works.length === 0) todo('Фото работ парами до/после с описанием материала  (content/works.ts)')
if (reviews.length === 0) todo('Подтверждённые отзывы со скринами с карт  (content/reviews.ts)')

/* -------------------------------------------------------------- reporting */

const blocking = missingRequiredFields(site)

console.log('')
console.log('  HimClean · seo-check')
console.log(`  Режим: ${live ? 'live' : 'draft'} (site.status = ${site.status})`)
console.log('')

if (!live) {
  console.log('  Сайт отдаёт страницу-заглушку, sitemap пустой, индексация закрыта.')
  if (blocking.length > 0) {
    console.log(`  Для перехода в live не хватает: ${blocking.join(', ')}`)
  }
  console.log('')
}

if (warnings.length > 0) {
  console.log(`  Предупреждения (не роняют сборку): ${warnings.length}`)
  for (const item of warnings) console.log(`   ! ${item}`)
  console.log('')
}

if (checklist.length > 0) {
  console.log(`  Данные от клиента — не закрыто пунктов: ${checklist.length}`)
  for (const item of checklist) console.log(`   [ ] ${item}`)
  console.log('')
} else {
  console.log('  Данные от клиента: всё заполнено.')
  console.log('')
}

if (violations.length > 0) {
  console.error(`  Нарушения инвариантов: ${violations.length}`)
  for (const item of violations) console.error(`   x ${item}`)
  console.error('')
  process.exit(1)
}

console.log('  Инварианты: нарушений нет.')
console.log('')
