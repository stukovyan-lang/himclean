/**
 * Boots the already-built site (`pnpm build` first), runs a mobile-first
 * audit across six viewports, and screenshots two of them per route into
 * `docs/screenshots/`.
 *
 * The server runs with `PREVIEW_UNLOCK=1` (see CLAUDE.md's "Превью до
 * публикации"), so every route renders its own real content instead of being
 * rewritten to the draft placeholder — the same mechanism a Vercel preview
 * deployment uses. The home page is the one exception: its draft-vs-live
 * choice is made inside the component itself, not by the middleware, so it
 * keeps showing the draft notice while `content/site.ts` has `status:
 * 'draft'`. That is expected, not a bug in this script.
 *
 * No browser MCP is used here on purpose — this is a repeatable local tool,
 * not an interactive session.
 *
 * The audit itself (horizontal scroll, touch-target size and spacing) runs
 * at all six viewports below and fails the process on any violation — it's
 * a gate, same spirit as contrast-check.ts, just for layout instead of
 * color. It stays out of `prebuild` because six viewports × every route is
 * too slow for every single build; `pnpm shot` is the deliberate, slower
 * command that runs it.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from 'playwright'

import { ALL_ROUTES } from '../lib/all-routes'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = join(ROOT, 'docs', 'screenshots')
const REPORT_PATH = join(ROOT, 'docs', 'mobile-audit.md')
const PORT = 4300
const BASE_URL = `http://localhost:${PORT}`
const SERVER_TIMEOUT_MS = 30_000

const MIN_TOUCH_TARGET = 44
const MIN_TOUCH_GAP = 8
// Rendering/subpixel rounding tolerance, not part of the spec's numbers.
const EPSILON = 0.5

const VIEWPORTS = [
  { name: '320', width: 320, height: 720 },
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844, screenshot: true },
  { name: '414', width: 414, height: 896 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900, screenshot: true },
] as const

const ROUTE_PATHS = ALL_ROUTES

function routeToFilename(path: string): string {
  if (path === '/') return 'home'
  return path.replace(/^\//, '').replace(/\//g, '-')
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

type ScrollFinding = {
  kind: 'scroll'
  route: string
  viewport: string
  scrollWidth: number
  clientWidth: number
  culprit: string | null
}

type TargetFinding = {
  kind: 'target-size'
  route: string
  viewport: string
  selector: string
  width: number
  height: number
}

type GapFinding = {
  kind: 'target-gap'
  route: string
  viewport: string
  selectorA: string
  selectorB: string
  gap: number
}

type Finding = ScrollFinding | TargetFinding | GapFinding

/**
 * In-page audit logic, as a plain JS source string rather than a TS
 * function passed to `page.evaluate`. tsx/esbuild-register instruments
 * every function it compiles with a `__name(...)` helper call (to preserve
 * `.name` through its transform); that helper only exists in the Node
 * process, so once Playwright re-stringifies a *compiled* function and ships
 * it into the browser, it throws `ReferenceError: __name is not defined` —
 * the same root cause documented in scripts/lighthouse-runner.mjs for
 * Lighthouse's own page-context eval. A source string is never run through
 * esbuild at all, so it's immune to this — Playwright hands it straight to
 * the browser's own JS engine.
 */
const AUDIT_SCRIPT = `(() => {
  const minTarget = ${MIN_TOUCH_TARGET};
  const minGap = ${MIN_TOUCH_GAP};
  const epsilon = ${EPSILON};

  const describe = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = el.classList.length > 0 ? '.' + Array.from(el.classList)[0] : '';
    const text = (el.textContent || '').trim().slice(0, 30);
    return tag + id + cls + (text ? ' "' + text + '"' : '');
  };

  const root = document.documentElement;
  const clientWidth = root.clientWidth;
  const scrollWidth = root.scrollWidth;

  let culprit = null;
  if (scrollWidth > clientWidth + epsilon) {
    let worst = 0;
    for (const el of document.body.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      const overflow = Math.max(rect.right - clientWidth, -rect.left);
      if (overflow > worst) {
        worst = overflow;
        culprit = describe(el);
      }
    }
  }

  const interactive = Array.from(document.body.querySelectorAll('a[href], button:not([disabled])'));
  // A target inside a position:fixed layer (the mobile call bar) sits over
  // whatever content scrolls beneath it, so its distance to a link in the
  // page depends only on the scroll position — not a layout spacing defect.
  const isFixed = (el) => {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      if (getComputedStyle(node).position === 'fixed') return true;
    }
    return false;
  };
  const visible = interactive
    .map((el) => ({ el: el, rect: el.getBoundingClientRect(), fixed: isFixed(el) }))
    .filter((entry) => entry.rect.width > 0 && entry.rect.height > 0);

  const targetIssues = [];

  for (const entry of visible) {
    const rect = entry.rect;
    if (rect.width < minTarget - epsilon || rect.height < minTarget - epsilon) {
      targetIssues.push({ kind: 'size', a: describe(entry.el), width: rect.width, height: rect.height });
    }
  }

  for (let i = 0; i < visible.length; i += 1) {
    for (let j = i + 1; j < visible.length; j += 1) {
      const a = visible[i];
      const b = visible[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.fixed !== b.fixed) continue;

      const dx = Math.max(a.rect.left - b.rect.right, b.rect.left - a.rect.right, 0);
      const dy = Math.max(a.rect.top - b.rect.bottom, b.rect.top - a.rect.bottom, 0);
      // Rects that overlap on both axes aren't "adjacent" (dx=dy=0 there
      // too) — only flag pairs that are genuinely side by side or stacked
      // on exactly one axis, which is what a "gap" means.
      const adjacentOnOneAxis = (dx === 0) !== (dy === 0);
      if (!adjacentOnOneAxis) continue;

      const gap = Math.max(dx, dy);
      if (gap < minGap - epsilon) {
        targetIssues.push({ kind: 'gap', a: describe(a.el), b: describe(b.el), gap: gap });
      }
    }
  }

  return { scrollWidth: scrollWidth, clientWidth: clientWidth, culprit: culprit, targetIssues: targetIssues };
})()`

/**
 * Finds the horizontal-scroll culprit (the element with the furthest right
 * edge past the viewport) and every touch-target size/spacing violation
 * among visible links and buttons — one round trip per route via
 * AUDIT_SCRIPT above.
 */
async function auditPage(page: Page): Promise<{
  scrollWidth: number
  clientWidth: number
  culprit: string | null
  targetIssues: Array<{ kind: 'size' | 'gap'; a: string; b?: string; width?: number; height?: number; gap?: number }>
}> {
  return page.evaluate(AUDIT_SCRIPT)
}

async function main(): Promise<void> {
  if (!existsSync(join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('  Нет production-сборки. Сначала выполните: pnpm build')
    process.exit(1)
  }

  rmSync(OUTPUT_DIR, { recursive: true, force: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log('  screenshots: запускаю собранный сайт…')

  const server: ChildProcessWithoutNullStreams = spawn(
    'pnpm',
    ['exec', 'next', 'start', '--port', String(PORT)],
    {
      cwd: ROOT,
      env: { ...process.env, NODE_ENV: 'production', PREVIEW_UNLOCK: '1' },
    },
  )

  let serverLog = ''
  server.stdout.on('data', (chunk: Buffer) => {
    serverLog += chunk.toString()
  })
  server.stderr.on('data', (chunk: Buffer) => {
    serverLog += chunk.toString()
  })

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

  const browser = await chromium.launch({ channel: 'chrome' })
  let fileCount = 0
  const findings: Finding[] = []

  try {
    for (const path of ROUTE_PATHS) {
      for (const viewport of VIEWPORTS) {
        // A fresh page per viewport, not one page resized in place. Resizing a
        // loaded page makes the browser re-pick srcset candidates and fire new
        // /_next/image requests, and navigating on over those (and over the
        // lazy images a full-page shot pulls in) left `next start` with image
        // requests that never completed — `networkidle` then hung on every
        // later image-heavy route (2026-10-08, once the work photos arrived).
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })

        const result = await auditPage(page)
        if (result.scrollWidth > result.clientWidth + EPSILON) {
          findings.push({
            kind: 'scroll',
            route: path,
            viewport: viewport.name,
            scrollWidth: result.scrollWidth,
            clientWidth: result.clientWidth,
            culprit: result.culprit,
          })
        }
        for (const issue of result.targetIssues) {
          if (issue.kind === 'size') {
            findings.push({
              kind: 'target-size',
              route: path,
              viewport: viewport.name,
              selector: issue.a,
              width: Math.round(issue.width ?? 0),
              height: Math.round(issue.height ?? 0),
            })
          } else {
            findings.push({
              kind: 'target-gap',
              route: path,
              viewport: viewport.name,
              selectorA: issue.a,
              selectorB: issue.b ?? '?',
              gap: Math.round((issue.gap ?? 0) * 10) / 10,
            })
          }
        }

        if ('screenshot' in viewport && viewport.screenshot) {
          const file = join(OUTPUT_DIR, `${routeToFilename(path)}-${viewport.name}.png`)
          await page.screenshot({ path: file, fullPage: true })
          // Let the lazy images the full-page shot scrolled into view finish
          // before the page goes away, rather than aborting them mid-flight.
          await page.waitForLoadState('networkidle')
          fileCount += 1
        }
        await page.close()
      }
    }
  } finally {
    await browser.close()
    stopServer()
  }

  /* ------------------------------------------------------------ reporting */

  const scrollFindings = findings.filter((f): f is ScrollFinding => f.kind === 'scroll')
  const sizeFindings = findings.filter((f): f is TargetFinding => f.kind === 'target-size')
  const gapFindings = findings.filter((f): f is GapFinding => f.kind === 'target-gap')

  const lines: string[] = [
    '# Мобильный аудит',
    '',
    `Маршрутов: ${ROUTE_PATHS.length}. Вьюпорты: ${VIEWPORTS.map((v) => v.name).join(', ')}px.`,
    '',
    '## Горизонтальный скролл',
    '',
  ]
  if (scrollFindings.length === 0) {
    lines.push('Не найдено ни на одном маршруте ни на одном вьюпорте.', '')
  } else {
    for (const f of scrollFindings) {
      lines.push(
        `- **${f.route}** @ ${f.viewport}px — scrollWidth ${f.scrollWidth} > clientWidth ${f.clientWidth}. Виновник: ${f.culprit ?? 'не определён'}`,
      )
    }
    lines.push('')
  }

  lines.push('## Тач-таргеты меньше 44×44', '')
  if (sizeFindings.length === 0) {
    lines.push('Не найдено.', '')
  } else {
    for (const f of sizeFindings) {
      lines.push(`- **${f.route}** @ ${f.viewport}px — ${f.selector}: ${f.width}×${f.height}px`)
    }
    lines.push('')
  }

  lines.push('## Тач-таргеты ближе 8px друг к другу', '')
  if (gapFindings.length === 0) {
    lines.push('Не найдено.', '')
  } else {
    for (const f of gapFindings) {
      lines.push(`- **${f.route}** @ ${f.viewport}px — ${f.selectorA} ↔ ${f.selectorB}: ${f.gap}px`)
    }
    lines.push('')
  }

  writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8')

  console.log(
    `  screenshots: ${fileCount} файлов в docs/screenshots/ (${ROUTE_PATHS.length} маршрутов × 2 вьюпорта со скриншотом)`,
  )
  console.log(`  screenshots: отчёт мобильного аудита — docs/mobile-audit.md`)
  console.log(
    `  screenshots: горизонтальный скролл — ${scrollFindings.length}, тач-таргеты < 44px — ${sizeFindings.length}, зазор < 8px — ${gapFindings.length}`,
  )

  if (findings.length > 0) {
    console.error('')
    console.error('  screenshots: мобильный аудит нашёл нарушения, см. docs/mobile-audit.md')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
