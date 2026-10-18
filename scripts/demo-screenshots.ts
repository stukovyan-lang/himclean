/**
 * Same approach as `scripts/screenshots.ts`, pointed at the demo routes
 * instead: boots the already-built site and screenshots every demo route at
 * two viewports into `docs/demo-screenshots/`.
 *
 * A separate script rather than reusing `scripts/screenshots.ts`: that one
 * boots with `PREVIEW_UNLOCK=1` and walks `ALL_ROUTES` (the real site's
 * routes) — neither matches what the demo mockup needs to show.
 *
 * Unlike `PREVIEW_UNLOCK` (a pure middleware routing decision, so any build
 * serves it correctly at runtime), `DEMO_MODE` changes which component a
 * static page renders — that choice is baked in at `next build`, not at
 * `next start`. The build this script starts must already have been built
 * with `DEMO_MODE=1` (`DEMO_MODE=1 pnpm build`, see CLAUDE.md's
 * "Демо-режим"); this script also sets it on the server it starts, for
 * `middleware.ts`'s own runtime check. It verifies the build actually has
 * demo content before screenshotting anything, so a forgotten rebuild fails
 * loudly instead of silently producing screenshots of 404 pages.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = join(ROOT, 'docs', 'demo-screenshots')
const PORT = 4303
const BASE_URL = `http://localhost:${PORT}`
const SERVER_TIMEOUT_MS = 30_000

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const DEMO_ROUTE_PATHS = ['/', '/raboty', '/otzyvy', '/o-nas', '/kontakty']

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

async function main(): Promise<void> {
  if (!existsSync(join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('  Нет production-сборки. Сначала выполните: pnpm build')
    process.exit(1)
  }

  rmSync(OUTPUT_DIR, { recursive: true, force: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log('  demo-screenshots: запускаю собранный сайт в DEMO_MODE=1…')

  const server: ChildProcessWithoutNullStreams = spawn(
    'pnpm',
    ['exec', 'next', 'start', '--port', String(PORT)],
    { cwd: ROOT, env: { ...process.env, NODE_ENV: 'production', DEMO_MODE: '1' } },
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

    // `/kontakty` only renders (instead of a 404) when the build itself was
    // made with `DEMO_MODE=1` — see the header comment. Catch a forgotten
    // rebuild here rather than silently screenshotting 404 pages.
    const probe = await fetch(`${BASE_URL}/kontakty`)
    if (probe.status === 404) {
      throw new Error(
        'Сборка сделана без DEMO_MODE=1 — демо-страницы не существуют. Выполните: DEMO_MODE=1 pnpm build',
      )
    }
  } catch (error) {
    stopServer()
    console.error(serverLog)
    throw error
  }

  const browser = await chromium.launch({ channel: 'chrome' })
  let fileCount = 0

  try {
    for (const path of DEMO_ROUTE_PATHS) {
      const page = await browser.newPage()
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
        const file = join(OUTPUT_DIR, `${routeToFilename(path)}-${viewport.name}.png`)
        await page.screenshot({ path: file, fullPage: true })
        fileCount += 1
      }
      await page.close()
    }
  } finally {
    await browser.close()
    stopServer()
  }

  console.log(
    `  demo-screenshots: ${fileCount} файлов в docs/demo-screenshots/ (${DEMO_ROUTE_PATHS.length} маршрутов × ${VIEWPORTS.length} вьюпорта)`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
