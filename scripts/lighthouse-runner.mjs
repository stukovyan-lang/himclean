/**
 * Runs one Lighthouse pass and prints its category scores as JSON on stdout.
 *
 * Plain Node, not tsx: Lighthouse's own page-context eval bundle breaks under
 * tsx/esbuild-register (`ReferenceError: __name is not defined` inside
 * `computeBenchmarkIndex`) — confirmed reproducible in isolation, unrelated
 * to this project's code. Spawned as a child process by scripts/audit.ts so
 * the rest of the audit tooling can stay in the project's usual tsx style.
 */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const [, , url, throttlingMethodArg] = process.argv
if (!url) {
  console.error('usage: node lighthouse-runner.mjs <url> [simulate|devtools]')
  process.exit(1)
}

// 'simulate' (Lantern) is lighthouse:default's own baseline — a modeled
// network/CPU trace, not a real one, and known to carry ~400ms run-to-run
// noise on this project (see docs/lcp comparisons in phase 4b/C). 'devtools'
// actually throttles the connection and CPU and measures the real result,
// slower to run but the trustworthy number for "is this actually fast".
const throttlingMethod = throttlingMethodArg === 'devtools' ? 'devtools' : 'simulate'

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] })

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    throttlingMethod,
    // formFactor 'mobile' is lighthouse:default's own baseline — not overridden.
  })

  if (!result) throw new Error(`Lighthouse returned no result for ${url}`)

  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([key, category]) => [key, category.score]),
  )

  const metrics = {
    lcp: result.lhr.audits['largest-contentful-paint']?.numericValue ?? null,
    cls: result.lhr.audits['cumulative-layout-shift']?.numericValue ?? null,
    tbt: result.lhr.audits['total-blocking-time']?.numericValue ?? null,
  }

  process.stdout.write(JSON.stringify({ scores, metrics }))
} finally {
  await chrome.kill()
}
