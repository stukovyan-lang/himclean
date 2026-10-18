/**
 * Regression gate for text contrast: boots the built site and runs
 * axe-core's `color-contrast` rule over every route, failing the process on
 * any violation. Wired as `postbuild`, so `pnpm build` can't silently ship a
 * text color that doesn't meet WCAG AA on its own background — the mistake
 * this script exists to catch (--gold used as text on --bg-cream).
 *
 * This covers what axe can see: elements exposed to the accessibility tree.
 * A handful of gold glyphs in this codebase are `aria-hidden` (decorative
 * step numbers, FAQ toggle icons, list markers) and were fixed by hand in
 * the same pass as everything this script checks — axe doesn't evaluate
 * them (by design, `aria-hidden` content isn't perceivable information), so
 * their contrast isn't a machine-enforced invariant. Keep that in mind
 * before trusting a green run here as "every gold pixel is safe."
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

import { ALL_ROUTES } from '../lib/all-routes'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4302
const BASE_URL = `http://localhost:${PORT}`
const SERVER_TIMEOUT_MS = 30_000
const AXE_SOURCE = readFileSync(join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8')

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

type Finding = {
  route: string
  id: string
  target: string
  summary: string
}

async function main(): Promise<void> {
  // A plain server (VPS) usually has no Chrome either: SKIP_CONTRAST_CHECK=1
  // lets `pnpm build` finish there. Run `pnpm contrast:check` on a machine
  // with Chrome before shipping design changes.
  if (process.env.SKIP_CONTRAST_CHECK === '1') {
    console.log('  contrast-check: пропущено (SKIP_CONTRAST_CHECK=1)')
    return
  }

  if (process.env.VERCEL === '1') {
    console.log('  contrast-check: пропущено (сборка на Vercel — нет системного Chrome)')
    return
  }

  if (!existsSync(join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('  contrast-check: нет production-сборки, сначала pnpm build')
    process.exit(1)
  }

  console.log('  contrast-check: запускаю собранный сайт…')

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

  const findings: Finding[] = []

  try {
    await waitForServer(BASE_URL, SERVER_TIMEOUT_MS)

    const browser = await chromium.launch({ channel: 'chrome' })
    try {
      for (const path of ALL_ROUTES) {
        const page = await browser.newPage()
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
        await page.evaluate(AXE_SOURCE)
        const result = await page.evaluate(async () => {
          // @ts-expect-error axe is injected as a page global above
          return (await window.axe.run(document, { runOnly: ['color-contrast'] })) as {
            violations: Array<{
              id: string
              nodes: Array<{ target: string[]; failureSummary?: string }>
            }>
          }
        })
        for (const violation of result.violations) {
          for (const node of violation.nodes) {
            findings.push({
              route: path,
              id: violation.id,
              target: node.target.join(' '),
              summary: (node.failureSummary ?? '').replace(/\s+/g, ' ').trim(),
            })
          }
        }
        await page.close()
      }
    } finally {
      await browser.close()
    }
  } catch (error) {
    stopServer()
    console.error(serverLog)
    throw error
  }

  stopServer()

  if (findings.length > 0) {
    console.error(`  contrast-check: ${findings.length} нарушений color-contrast`)
    for (const f of findings) {
      console.error(`   x ${f.route}: ${f.id} — ${f.target}`)
      if (f.summary) console.error(`     ${f.summary}`)
    }
    process.exit(1)
  }

  console.log(`  contrast-check: нарушений не найдено (${ALL_ROUTES.length} маршрутов)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
