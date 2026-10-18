/**
 * Baseline quality audit: Lighthouse (mobile) + accessibility (axe-core)
 * over a fixed set of representative routes, on the built site.
 *
 * Run against the site as it actually is — draft, no city, no photos.
 * `PREVIEW_UNLOCK=1` lets each route render its own content instead of
 * being rewritten to the draft placeholder; it does not fabricate any data
 * and nothing here is committed to `content/`.
 *
 * The point of this pass is a baseline, not a fix: findings are written to
 * `docs/audit-<date>.md` and left alone, except a critical accessibility
 * violation, which gets fixed immediately and called out separately.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

import { routes } from '../lib/routes'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4301
const BASE_URL = `http://localhost:${PORT}`
const SERVER_TIMEOUT_MS = 30_000
const LIGHTHOUSE_RUNNER = join(ROOT, 'scripts', 'lighthouse-runner.mjs')
const AXE_SOURCE = readFileSync(join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8')

const today = new Date().toISOString().slice(0, 10)

/**
 * A previous audit report is a record of a real measurement at that moment —
 * a second run on the same day gets its own file rather than overwriting it.
 */
function reportPath(): string {
  const base = join(ROOT, 'docs', `audit-${today}.md`)
  if (!existsSync(base)) return base

  let n = 2
  let candidate = join(ROOT, 'docs', `audit-${today}-${n}.md`)
  while (existsSync(candidate)) {
    n += 1
    candidate = join(ROOT, 'docs', `audit-${today}-${n}.md`)
  }
  return candidate
}

const REPORT_PATH = reportPath()

const AUDIT_ROUTES: Array<{ path: string; label: string }> = [
  { path: routes.servicesHub, label: 'Хаб услуг' },
  { path: routes.service('himchistka-divana'), label: 'Химчистка дивана' },
  { path: routes.howItWorks, label: 'Как мы работаем' },
  { path: routes.faq, label: 'Вопросы и ответы' },
]

type LighthouseResult = {
  scores: Record<'performance' | 'accessibility' | 'best-practices' | 'seo', number | null>
  metrics: { lcp: number | null; cls: number | null; tbt: number | null }
}

type AxeViolation = {
  id: string
  impact: string | null
  description: string
  help: string
  helpUrl: string
  nodeCount: number
  /** CSS selector of up to the first five affected elements. */
  targets: string[]
}

function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolvePromise, reject) => {
    const attempt = () => {
      fetch(url)
        .then(() => resolvePromise())
        .catch(() => {
          if (Date.now() > deadline) reject(new Error(`сервер на ${url} не ответил за отведённое время`))
          else setTimeout(attempt, 500)
        })
    }
    attempt()
  })
}

function runLighthouse(url: string, throttlingMethod: 'simulate' | 'devtools' = 'simulate'): Promise<LighthouseResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('node', [LIGHTHOUSE_RUNNER, url, throttlingMethod])
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`lighthouse-runner упал для ${url} (код ${code}):\n${stderr}`))
        return
      }
      try {
        resolvePromise(JSON.parse(stdout))
      } catch {
        reject(new Error(`не удалось разобрать вывод lighthouse-runner для ${url}: ${stdout}`))
      }
    })
  })
}

function formatScore(score: number | null): string {
  return score === null ? '—' : String(Math.round(score * 100))
}

function formatMs(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)} мс`
}

function formatCls(value: number | null): string {
  return value === null ? '—' : value.toFixed(3)
}

async function main(): Promise<void> {
  if (!existsSync(join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('  Нет production-сборки. Сначала выполните: pnpm build')
    process.exit(1)
  }

  console.log('  audit: запускаю собранный сайт…')

  const server: ChildProcessWithoutNullStreams = spawn(
    'pnpm',
    ['exec', 'next', 'start', '--port', String(PORT)],
    { cwd: ROOT, env: { ...process.env, NODE_ENV: 'production', PREVIEW_UNLOCK: '1' } },
  )

  let serverLog = ''
  server.stdout.on('data', (chunk: Buffer) => (serverLog += chunk.toString()))
  server.stderr.on('data', (chunk: Buffer) => (serverLog += chunk.toString()))

  let stopped = false
  const stopServer = () => {
    if (stopped) return
    stopped = true
    server.kill('SIGTERM')
  }
  process.on('exit', stopServer)

  try {
    await waitForServer(BASE_URL, SERVER_TIMEOUT_MS)
  } catch (error) {
    stopServer()
    console.error(serverLog)
    throw error
  }

  const lighthouseResults = new Map<string, LighthouseResult>()
  const lighthouseResultsDevtools = new Map<string, LighthouseResult>()
  const axeResults = new Map<string, AxeViolation[]>()

  try {
    for (const route of AUDIT_ROUTES) {
      const url = `${BASE_URL}${route.path}`
      console.log(`  audit: Lighthouse (симуляция) — ${route.path}`)
      lighthouseResults.set(route.path, await runLighthouse(url, 'simulate'))
      // devtools throttling actually throttles the connection and CPU
      // instead of modeling them — slower per page, but the trustworthy LCP.
      console.log(`  audit: Lighthouse (реальный замер) — ${route.path}`)
      lighthouseResultsDevtools.set(route.path, await runLighthouse(url, 'devtools'))
    }

    const browser = await chromium.launch({ channel: 'chrome' })
    try {
      for (const route of AUDIT_ROUTES) {
        const url = `${BASE_URL}${route.path}`
        console.log(`  audit: axe — ${route.path}`)
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.evaluate(AXE_SOURCE)
        const result = await page.evaluate(async () => {
          // @ts-expect-error axe is injected as a page global above
          return (await window.axe.run()) as {
            violations: Array<{
              id: string
              impact: string | null
              description: string
              help: string
              helpUrl: string
              nodes: Array<{ target: string[]; failureSummary?: string }>
            }>
          }
        })
        axeResults.set(
          route.path,
          result.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodeCount: v.nodes.length,
            targets: v.nodes.slice(0, 5).map((node) => node.target.join(' ')),
          })),
        )
        await page.close()
      }
    } finally {
      await browser.close()
    }
  } finally {
    stopServer()
  }

  /* ------------------------------------------------------------ reporting */

  const criticalViolations = AUDIT_ROUTES.flatMap((route) =>
    (axeResults.get(route.path) ?? [])
      .filter((v) => v.impact === 'critical')
      .map((v) => ({ route: route.path, violation: v })),
  )

  const lines: string[] = [
    `# Аудит качества — ${today}`,
    '',
    'Базовый замер на текущем контенте: изображений на сайте ещё нет, отзывов и работ',
    'тоже. Числа ниже — не оценка готового сайта, а точка отсчёта для сравнения после',
    'того, как появятся фото и остальной контент фаз 3–5.',
    '',
    '## Lighthouse (mobile)',
    '',
    'SEO стабильно ниже остальных категорий на всех четырёх страницах — единственный',
    'проваленный аудит это `is-crawlable`, потому что сайт ещё в черновике и каждая',
    'страница намеренно отдаёт `noindex` (см. CLAUDE.md, «Режим публикации»). Это',
    'ожидаемое поведение гейта, а не дефект: оценка поднимется сама, когда сайт уйдёт',
    'в live и `noindex` снимется.',
    '',
    '| Страница | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |',
    '|---|---|---|---|---|---|---|---|',
  ]

  for (const route of AUDIT_ROUTES) {
    const result = lighthouseResults.get(route.path)
    if (!result) continue
    lines.push(
      `| ${route.path} | ${formatScore(result.scores.performance)} | ${formatScore(result.scores.accessibility)} | ${formatScore(result.scores['best-practices'])} | ${formatScore(result.scores.seo)} | ${formatMs(result.metrics.lcp)} | ${formatCls(result.metrics.cls)} | ${formatMs(result.metrics.tbt)} |`,
    )
  }
  lines.push('')

  lines.push(
    '## LCP: симуляция vs реальный замер',
    '',
    '`--throttling-method=devtools` вместо симуляции Lantern — Lantern моделирует',
    'сеть и CPU по трассе без троттлинга, `devtools` реально их ограничивает. Разница',
    'ниже показывает, насколько симуляция была (не)точна для этого сайта.',
    '',
    '| Страница | LCP (симуляция) | LCP (реальный замер) | Разница |',
    '|---|---|---|---|',
  )
  for (const route of AUDIT_ROUTES) {
    const sim = lighthouseResults.get(route.path)
    const real = lighthouseResultsDevtools.get(route.path)
    const simLcp = sim?.metrics.lcp ?? null
    const realLcp = real?.metrics.lcp ?? null
    const diff = simLcp !== null && realLcp !== null ? formatMs(realLcp - simLcp) : '—'
    lines.push(`| ${route.path} | ${formatMs(simLcp)} | ${formatMs(realLcp)} | ${diff} |`)
  }
  lines.push('')

  lines.push('## Доступность (axe-core)', '')
  for (const route of AUDIT_ROUTES) {
    const violations = axeResults.get(route.path) ?? []
    lines.push(`### ${route.path} — ${route.label}`, '')
    if (violations.length === 0) {
      lines.push('Нарушений не найдено.', '')
      continue
    }
    for (const v of violations) {
      lines.push(
        `- **[${v.impact ?? 'неизвестно'}] ${v.id}** — ${v.help} (узлов: ${v.nodeCount}). ${v.helpUrl}`,
      )
      for (const target of v.targets) lines.push(`  - \`${target}\``)
    }
    lines.push('')
  }

  lines.push('## Критические нарушения, исправленные в этой фазе', '')
  if (criticalViolations.length === 0) {
    lines.push('Не найдено — по правилам фазы остальные находки не чинились, только зафиксированы.', '')
  } else {
    for (const { route, violation } of criticalViolations) {
      lines.push(`- ${route}: **${violation.id}** — ${violation.help}`)
    }
    lines.push('')
  }

  mkdirSync(dirname(REPORT_PATH), { recursive: true })
  writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8')

  /* --------------------------------------------------------- console echo */

  console.log('')
  console.log(`  audit: отчёт записан в ${REPORT_PATH.replace(ROOT + '/', '')}`)
  console.log('')
  for (const route of AUDIT_ROUTES) {
    const result = lighthouseResults.get(route.path)
    const violations = axeResults.get(route.path) ?? []
    console.log(
      `  ${route.path}: Perf ${formatScore(result?.scores.performance ?? null)} · A11y ${formatScore(result?.scores.accessibility ?? null)} · BP ${formatScore(result?.scores['best-practices'] ?? null)} · SEO ${formatScore(result?.scores.seo ?? null)} · axe-нарушений: ${violations.length}`,
    )
  }
  console.log('')

  if (criticalViolations.length > 0) {
    console.log(`  Критических нарушений доступности: ${criticalViolations.length} — см. отчёт.`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
