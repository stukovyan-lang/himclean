#!/usr/bin/env node
/**
 * Turns the client's logo (a JPEG on a dark textured ground,
 * `assets/brand/himclean-logo.jpg`) into transparent WebPs for the header.
 * Run by hand, not part of the build.
 *
 * Keying: the logo is white + gold on near-black, so alpha is recovered from
 * brightness — `p = a·fg + (1−a)·bg`, solved per pixel for `a` against the
 * measured ground colour, and the colour un-premultiplied. Composited back
 * onto any dark surface (the site's headers all are) this reproduces the
 * original, without the JPEG's lighter square around it. It would NOT work on
 * a light ground; the header is never light.
 *
 * Two outputs:
 *   logo.webp           the full lockup (armchair + wordmark + tagline)
 *   logo-wordmark.webp  wordmark + tagline only — for small sizes, where the
 *                       armchair's ~3px strokes drop below a pixel and turn to
 *                       mush. The chair's legs run down into the wordmark, so
 *                       gold is removed from the wordmark band before cropping.
 */

import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'assets', 'brand', 'himclean-logo.jpg')
const OUT = join(ROOT, 'public', 'brand')

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height } = info

// Ground colour: median of a 120×120 corner patch, per channel.
const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
const patch = [[], [], []]
for (let y = 10; y < 130; y++) for (let x = 10; x < 130; x++) for (let c = 0; c < 3; c++) patch[c].push(data[(y * width + x) * 3 + c])
const bg = patch.map(median)
const bgMax = Math.max(...bg)
const FG_MAX = 238
const FLOOR = bgMax + 12 // below this the pixel is ground (texture, soft shadow)

const rgba = Buffer.alloc(width * height * 4)
for (let i = 0; i < width * height; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]
  const maxc = Math.max(r, g, b)
  let a = maxc <= FLOOR ? 0 : Math.min(1, (maxc - bgMax) / (FG_MAX - bgMax))
  if (a < 0.04) a = 0
  const o = i * 4
  if (a === 0) continue
  rgba[o] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * bg[0]) / a)))
  rgba[o + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * bg[1]) / a)))
  rgba[o + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * bg[2]) / a)))
  rgba[o + 3] = Math.round(a * 255)
}

function bbox(buf, w, h, y0 = 0, y1 = h) {
  let x0 = w, x1 = 0, ty0 = h, ty1 = 0
  for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) {
    if (buf[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y }
  }
  return { left: x0, top: ty0, width: x1 - x0 + 1, height: ty1 - ty0 + 1 }
}

const pad = 10
const grow = (b) => ({ left: Math.max(0, b.left - pad), top: Math.max(0, b.top - pad), width: Math.min(width - Math.max(0, b.left - pad), b.width + 2 * pad), height: Math.min(height - Math.max(0, b.top - pad), b.height + 2 * pad) })

// Full lockup.
const full = grow(bbox(rgba, width, height))
await sharp(rgba, { raw: { width, height, channels: 4 } }).extract(full).webp({ quality: 92, alphaQuality: 100 }).toFile(join(OUT, 'logo.webp'))

// Wordmark band: find where the white wordmark starts — the first row, scanning
// down from the middle of the lockup, that has a long run of near-white pixels.
let wordTop = 0
for (let y = Math.floor(height * 0.35); y < height; y++) {
  let white = 0
  for (let x = 0; x < width; x++) {
    const o = (y * width + x) * 4
    if (rgba[o + 3] > 200 && rgba[o] > 225 && rgba[o + 1] > 225 && rgba[o + 2] > 215) white++
  }
  if (white > 60) { wordTop = y; break }
}
const word = Buffer.from(rgba)
const bandEnd = Math.floor(height * 0.6)
for (let y = 0; y < bandEnd; y++) for (let x = 0; x < width; x++) {
  const o = (y * width + x) * 4
  if (word[o + 3] > 0 && word[o] - word[o + 2] > 45) word[o + 3] = 0 // gold in the wordmark band = chair legs
}
const wm = grow(bbox(word, width, height, Math.max(0, wordTop - 6), height))
await sharp(word, { raw: { width, height, channels: 4 } }).extract(wm).webp({ quality: 92, alphaQuality: 100 }).toFile(join(OUT, 'logo-wordmark.webp'))

console.log(JSON.stringify({ bg, wordTop, full: { w: full.width, h: full.height }, wordmark: { w: wm.width, h: wm.height } }))
