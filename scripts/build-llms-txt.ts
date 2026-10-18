/**
 * Generates `public/llms.txt` — a factual reference for AI crawlers, not a
 * marketing page. No adjectives, no calls to action: a URL, a fact, a link.
 *
 * Build-time only, from `content/`. While the site is a draft this deletes
 * any existing file instead of writing a placeholder, so the route 404s —
 * the same posture as `sitemap.ts` while `!isSiteLive(site)`.
 */

import './load-env'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { faqPageContent } from '../content/faq'
import { home, howItWork } from '../content/pages'
import { isSiteLive } from '../content/schema'
import { services } from '../content/services'
import { site, siteUrl } from '../content/site'
import { renderHome, renderService } from '../lib/copy'
import { routes } from '../lib/routes'
import { firstSentence } from '../lib/service-groups'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = join(ROOT, 'public', 'llms.txt')

function buildDocument(): string {
  const renderedHome = renderHome(home, site)
  const renderedServices = services.map((service) => renderService(service, site))

  const lines: string[] = [`# ${site.name}`, '']

  // Name and business essence, one line — reusing already-approved home page
  // copy rather than writing new marketing prose for this file.
  lines.push(`${renderedHome.h1}. ${renderedHome.subtitle}.`, '')

  // City and service area, only if known.
  if (site.city) lines.push(`Город: ${site.city}`)
  if (site.areaServed.length > 0) lines.push(`Зона выезда: ${site.areaServed.join(', ')}`)
  if (site.city || site.areaServed.length > 0) lines.push('')

  lines.push('## Услуги', '')
  for (const service of renderedServices) {
    const url = `${siteUrl}${routes.service(service.slug)}`
    lines.push(`- [${service.h1}](${url}): ${firstSentence(service.leadParagraph)}`)
  }
  lines.push('')

  const factLines = renderedServices.flatMap((service) =>
    service.keyFacts.map((fact) => `- ${service.h1}: ${fact}`),
  )
  if (factLines.length > 0) {
    lines.push('## Сроки', '', ...factLines, '')
  }

  lines.push(
    '## Подробнее',
    '',
    `- ${howItWork.h1}: ${siteUrl}${routes.howItWorks}`,
    `- ${faqPageContent.h1}: ${siteUrl}${routes.faq}`,
    '',
  )

  return lines.join('\n')
}

mkdirSync(dirname(OUTPUT), { recursive: true })

if (isSiteLive(site)) {
  writeFileSync(OUTPUT, buildDocument(), 'utf8')
  console.log('  llms.txt: записан (live)')
} else {
  if (existsSync(OUTPUT)) rmSync(OUTPUT)
  console.log('  llms.txt: не отдаётся (draft) — файл удалён/не создан')
}
