#!/usr/bin/env node
/**
 * One-off generator for the demo mockup's placeholder frames. No image
 * generator was available in this environment (checked: no local CLI, no
 * MCP server, no skill — see docs/deploy-demo.md and the phase report), so
 * every photo the client mockup calls for is a branded SVG stand-in with a
 * caption naming the shot, plus a real generation prompt kept alongside it.
 *
 * Not part of the build — run by hand only, to (re)produce `public/demo/`.
 * Each entry's `alt` here is for the caption baked into the SVG, not the
 * page's actual alt text (that lives in `content/demo/*.ts`, written to
 * describe the eventual real photo, not this stand-in).
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'demo')

const DARK = '#2B2521'
const CREAM = '#F4EFE8'
const GOLD = '#D9A961'
const GOLD_ON_LIGHT = '#7A5A22'

/**
 * @param {{path: string, width: number, height: number, caption: string, tag?: string, tone?: 'dark'|'cream', focusX?: number}} spec
 * `focusX` (0–1, default 0.5) moves the caption cluster off-center — used for
 * frames that sit behind left-aligned page text, so the placeholder's own
 * caption doesn't collide with the real overlay text next to it.
 */
function frame({ path, width, height, caption, tag, tone = 'dark', focusX = 0.5 }) {
  const bg = tone === 'dark' ? DARK : CREAM
  const fg = tone === 'dark' ? GOLD : GOLD_ON_LIGHT
  const textColor = tone === 'dark' ? '#F4EFE8' : '#2B2521'
  const fontSize = Math.round(Math.min(width, height) * 0.045)
  const tagFontSize = Math.round(fontSize * 0.55)
  const cx = width * focusX
  // Before/after frames sit inside `BeforeAfterSlider`, which draws its own
  // drag handle at the exact center — push the caption down so the two
  // don't overlap. Frames without a `tag` aren't used in a slider.
  const cy = height * (tag ? 0.62 : 0.5)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <rect width="${width}" height="${height}" fill="${bg}" />
  <rect x="${width * 0.04}" y="${height * 0.04}" width="${width * 0.92}" height="${height * 0.92}" fill="none" stroke="${fg}" stroke-width="${Math.max(2, width * 0.003)}" stroke-opacity="0.55" />
  <circle cx="${cx}" cy="${cy - fontSize * 0.9}" r="${fontSize * 0.9}" fill="none" stroke="${fg}" stroke-width="${Math.max(2, width * 0.0025)}" />
  <path d="M ${cx - fontSize * 0.4} ${cy - fontSize * 0.9} l ${fontSize * 0.3} ${fontSize * 0.3} l ${fontSize * 0.5} -${fontSize * 0.6}" fill="none" stroke="${fg}" stroke-width="${Math.max(2, width * 0.003)}" stroke-linecap="round" stroke-linejoin="round" />
  ${tag ? `<text x="${cx}" y="${cy + fontSize * 0.55}" font-family="Arial, sans-serif" font-size="${tagFontSize}" letter-spacing="${tagFontSize * 0.18}" fill="${fg}" text-anchor="middle" font-weight="700">${escapeXml(tag.toUpperCase())}</text>` : ''}
  <text x="${cx}" y="${cy + fontSize * 1.5}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" font-weight="600">${escapeXml(caption)}</text>
  <text x="${width / 2}" y="${height - height * 0.05}" font-family="Arial, sans-serif" font-size="${tagFontSize}" fill="${textColor}" fill-opacity="0.55" text-anchor="middle">${width}×${height} — демо-макет, не фотография</text>
</svg>`

  const full = join(OUT, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, svg, 'utf8')
  return path
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const FRAMES = [
  {
    path: 'hero.svg',
    width: 2400,
    height: 1400,
    caption: 'Гостиная с диваном, героичный кадр',
    tone: 'dark',
    focusX: 0.78,
  },
  {
    path: 'service-himchistka.svg',
    width: 1200,
    height: 900,
    caption: 'Экстрактор чистит диван',
    tone: 'dark',
  },
  { path: 'service-avto.svg', width: 1200, height: 900, caption: 'Салон автомобиля', tone: 'dark' },
  { path: 'service-ozon.svg', width: 1200, height: 900, caption: 'Генератор озона в комнате', tone: 'dark' },
  {
    path: 'ozone-bg.svg',
    width: 2400,
    height: 1350,
    caption: 'Озонирование помещения, фон секции',
    tone: 'dark',
    focusX: 0.82,
  },
  { path: 'og.svg', width: 1200, height: 630, caption: 'HimClean — демо-макет', tone: 'dark' },

  { path: 'works/divan-velur-kofe-before.svg', width: 1200, height: 800, caption: 'Диван, велюр — пятна кофе', tag: 'до', tone: 'cream' },
  { path: 'works/divan-velur-kofe-after.svg', width: 1200, height: 800, caption: 'Диван, велюр — после чистки', tag: 'после', tone: 'dark' },

  { path: 'works/matras-pot-before.svg', width: 1200, height: 800, caption: 'Матрас — следы пота', tag: 'до', tone: 'cream' },
  { path: 'works/matras-pot-after.svg', width: 1200, height: 800, caption: 'Матрас — после чистки', tag: 'после', tone: 'dark' },

  { path: 'works/kover-pesok-before.svg', width: 1200, height: 800, caption: 'Ковёр — песок и пыль', tag: 'до', tone: 'cream' },
  { path: 'works/kover-pesok-after.svg', width: 1200, height: 800, caption: 'Ковёр — после чистки', tag: 'после', tone: 'dark' },

  { path: 'works/avtosalon-gryaz-before.svg', width: 1200, height: 800, caption: 'Салон авто — загрязнено', tag: 'до', tone: 'cream' },
  { path: 'works/avtosalon-gryaz-after.svg', width: 1200, height: 800, caption: 'Салон авто — после чистки', tag: 'после', tone: 'dark' },

  { path: 'works/kreslo-sherst-before.svg', width: 1200, height: 800, caption: 'Кресло — шерсть животных', tag: 'до', tone: 'cream' },
  { path: 'works/kreslo-sherst-after.svg', width: 1200, height: 800, caption: 'Кресло — после чистки', tag: 'после', tone: 'dark' },

  { path: 'works/divan-rogozhka-deti-before.svg', width: 1200, height: 800, caption: 'Диван, рогожка — детские пятна', tag: 'до', tone: 'cream' },
  { path: 'works/divan-rogozhka-deti-after.svg', width: 1200, height: 800, caption: 'Диван, рогожка — после чистки', tag: 'после', tone: 'dark' },
]

mkdirSync(OUT, { recursive: true })
for (const spec of FRAMES) frame(spec)

console.log(`  demo-placeholders: создано ${FRAMES.length} SVG в public/demo/`)
