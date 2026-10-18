#!/usr/bin/env node
/**
 * Builds the WebP files the demo mockup serves from `public/demo/`. Run by
 * hand (`node scripts/process-demo-images.mjs`), not part of the build.
 *
 * Everything comes from `assets/incoming/` — client-supplied frames,
 * committed (they are not re-fetchable from anywhere):
 *
 * - the home page: hero, three service cards, results composite, ozone band
 *   (`clientFrames`). Only the hero is resampled up (Lanczos + light
 *   sharpen); see `cropUp`.
 * - `/otzyvy`, `/o-nas`: review screenshots and master photos
 *   (`clientGallery`). `/raboty` uses `public/works/` from `main`.
 *
 * The earlier synthetic Pexels before/after pairs are gone — the client sent
 * real ones.
 */

import { mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_CLIENT = join(ROOT, 'assets', 'incoming')
const OUT = join(ROOT, 'public', 'demo')
const QUALITY = 88

/** @param {string} path */
function outPath(path) {
  const full = join(OUT, path)
  mkdirSync(dirname(full), { recursive: true })
  return full
}

/** @param {{dir: string, src: string, out: string, width: number, height: number, position?: string, extract?: {left:number,top:number,width:number,height:number}}} spec */
async function crop({ dir, src, out, width, height, position, extract }) {
  let pipeline = sharp(join(dir, src))
  if (extract) pipeline = pipeline.extract(extract)
  const buffer = await pipeline
    .resize(width, height, { fit: 'cover', position: position ?? 'centre', withoutEnlargement: true })
    .toBuffer()
  await sharp(buffer).webp({ quality: QUALITY }).toFile(outPath(out))
  return buffer
}

/**
 * Feathered near-black patch (explicit gradient fades, not a blurred rect: a
 * Gaussian blur is clipped at the SVG's own bounds, so it thins along the
 * edge and lets the baked text's last line back through).
 * `solid` is the fully opaque block; `fadeTop`/`fadeRight` are the ramps.
 */
function patchSvg(width, height, { x0, y0, x1, y1, fadeTop, fadeRight }) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0a0a0a" stop-opacity="0" />
          <stop offset="1" stop-color="#0a0a0a" stop-opacity="1" />
        </linearGradient>
        <linearGradient id="right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#0a0a0a" stop-opacity="1" />
          <stop offset="1" stop-color="#0a0a0a" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="corner" cx="0" cy="1" r="1">
          <stop offset="0" stop-color="#0a0a0a" stop-opacity="1" />
          <stop offset="1" stop-color="#0a0a0a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect x="${x0}" y="${y0 - fadeTop}" width="${x1 - x0}" height="${fadeTop}" fill="url(#up)" />
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#0a0a0a" />
      <rect x="${x1}" y="${y0}" width="${fadeRight}" height="${y1 - y0}" fill="url(#right)" />
      <rect x="${x1}" y="${y0 - fadeTop}" width="${fadeRight}" height="${fadeTop}" fill="url(#corner)" />
    </svg>`,
  )
}

/**
 * Upscale with Lanczos3, then a light unsharp mask. The browser would stretch
 * a 1280px frame across a 1440px-wide (2880 device px) hero with bilinear
 * filtering, which is where most of the reported softness comes from;
 * resampling here with a better kernel, and re-sharpening what resampling
 * softens, is strictly better than leaving it to the browser. It cannot add
 * detail that isn't in the source — sharper originals are still the real fix.
 */
async function cropUp({ dir, src, out, width, height, position, extract, sigma = 0.9 }) {
  let pipeline = sharp(join(dir, src))
  if (extract) pipeline = pipeline.extract(extract)
  await pipeline
    .resize(width, height, { fit: 'cover', position: position ?? 'centre', kernel: 'lanczos3' })
    .sharpen({ sigma, m1: 0.8, m2: 1.6 })
    .webp({ quality: 90, effort: 5 })
    .toFile(outPath(out))
}

async function clientFrames() {
  const client = (spec) => crop({ dir: SRC_CLIENT, ...spec })

  // Hero: 1280 → 2400 across the full width of the page. Everything else is
  // shown at ≤ ~500 css px, so its native 1280 is already ≥ 2× — not resampled.
  await cropUp({ dir: SRC_CLIENT, src: 'hero.jpg', out: 'hero.webp', width: 2400, height: 1350, sigma: 1.0 })
  await client({ src: 'service-himchistka.jpg', out: 'service-himchistka.webp', width: 1280, height: 720 })
  await client({ src: 'service-ozon.jpg', out: 'service-ozon.webp', width: 1280, height: 720 })

  // The results frame is a finished before/after composite with its own
  // "ДО"/"ПОСЛЕ" labels and divider baked in (see DemoResults.tsx for why it
  // is a static image, not the slider). The drag-handle knob painted on the
  // divider read as a control that doesn't work, and the client asked for it
  // gone (2026-10-13). Each half of the knob is refilled from the strip right
  // beside it, row for row, so the cushion seam and the fabric carry on; the
  // divider line is then redrawn from a slice of itself just above the knob.
  {
    const src = join(SRC_CLIENT, 'results-before-after.jpg')
    const cx = 639
    const cy = 375
    // The knob is ~37px in radius plus a soft shadow to ~40: the patch is
    // fully opaque to 42px and fades out by 50, outside anything painted.
    const r = 50
    const top = cy - r
    const size = r * 2
    // Mirrored, not shifted: reflected about the knob's edge, the strip meets
    // the untouched pixels at that edge exactly, so no brightness step shows.
    const leftFill = await sharp(src).extract({ left: cx - r - r, top, width: r, height: size }).flop().toBuffer()
    const rightFill = await sharp(src).extract({ left: cx + r, top, width: r, height: size }).flop().toBuffer()
    const lineSlice = await sharp(src).extract({ left: cx - 2, top: top - 6, width: 5, height: 1 }).toBuffer()
    const line = await sharp(lineSlice).resize(5, size, { kernel: 'nearest' }).toBuffer()
    const fill = await sharp({ create: { width: size, height: size, channels: 3, background: '#000' } })
      .composite([
        { input: leftFill, left: 0, top: 0 },
        { input: rightFill, left: r, top: 0 },
        { input: line, left: r - 2, top: 0 },
      ])
      .png()
      .toBuffer()
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <defs><radialGradient id="m"><stop offset="0.84" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        <circle cx="${r}" cy="${r}" r="${r}" fill="url(#m)"/>
      </svg>`,
    )
    const patch = await sharp(fill).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
    const patched = await sharp(src).composite([{ input: patch, left: cx - r, top }]).toBuffer()
    await sharp(patched)
      .resize(1280, 720, { fit: 'cover', position: 'centre', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath('results.webp'))
  }

  // Car-ozone card. The client's banner (ozone-auto-banner.jpg, 2000×711) is
  // a finished render: heading, description and an icon row are in the
  // pixels. The card supplies its own text, so only the photo is wanted: the
  // right-hand region — dashboard, fog, the generator with its label facing
  // the camera — cropped to the card's 3:2. The icon row's lower-left part
  // still reaches into that crop (the "home" icon and its caption), so it is
  // painted out; the rest of the crop is clean.
  {
    const crop3x2 = { left: 1130, top: 105, width: 710, height: 473 }
    const patch = patchSvg(crop3x2.width, crop3x2.height, { x0: 0, y0: 400, x1: 330, y1: 473, fadeTop: 30, fadeRight: 60 })
    const base = await sharp(join(SRC_CLIENT, 'ozone-auto-banner.jpg')).extract(crop3x2).toBuffer()
    // Composite in its own step: within one sharp pipeline `resize` always
    // runs before `composite` whatever the call order, which would lay a
    // native-size patch over the already-enlarged image.
    const patched = await sharp(base).composite([{ input: patch }]).toBuffer()
    await sharp(patched)
      .resize(1065, 710, { kernel: 'lanczos3' })
      .sharpen({ sigma: 0.8, m1: 0.8, m2: 1.6 })
      .webp({ quality: 90, effort: 5 })
      .toFile(outPath('service-avto.webp'))
  }

  // Ozone section (ozone-section.jpg, 2000×672, generator turned to face the
  // camera). Also a finished render — heading, paragraph, button and an icon
  // row in the pixels — and the copy must be HTML (invariant 4). The strip
  // above the button/icon rows is kept at full width (wheel, dashboard, fog,
  // generator), and the baked heading + paragraph + button in its left third
  // are painted out; that corner is a dark door card and seat, under the
  // section's own left-side gradient, so the patch leaves no seam.
  {
    const strip = { left: 0, top: 0, width: 2000, height: 500 }
    const patch = patchSvg(strip.width, strip.height, { x0: 0, y0: 160, x1: 700, y1: 500, fadeTop: 55, fadeRight: 100 })
    const base = await sharp(join(SRC_CLIENT, 'ozone-section.jpg')).extract(strip).toBuffer()
    await sharp(base).composite([{ input: patch }]).webp({ quality: 90, effort: 5 }).toFile(outPath('ozone-bg.webp'))
  }

  // og.webp: the hero photo at 1200×630 with a left-side dark gradient so
  // share-card text stays legible regardless of what sits under it.
  const base = await sharp(join(SRC_CLIENT, 'hero.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .toBuffer()
  const gradient = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#2B2521" stop-opacity="0.92" />
          <stop offset="55%" stop-color="#2B2521" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#2B2521" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#g)" />
    </svg>`,
  )
  await sharp(base)
    .composite([{ input: gradient }])
    .webp({ quality: QUALITY })
    .toFile(outPath('og.webp'))

  // Share card for every page (seo.ogImage): the same frame plus the client's
  // logo on the dark left side. JPEG, not WebP — some messengers still don't
  // render WebP link previews. Written outside public/demo/, to public/og/.
  const withGradient = await sharp(base).composite([{ input: gradient }]).toBuffer()
  const logo = await sharp(join(ROOT, 'public', 'brand', 'logo.webp')).resize({ width: 440 }).toBuffer()
  const { height: logoHeight = 0 } = await sharp(logo).metadata()
  mkdirSync(join(ROOT, 'public', 'og'), { recursive: true })
  await sharp(withGradient)
    .composite([{ input: logo, left: 80, top: Math.round((630 - logoHeight) / 2) }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(ROOT, 'public', 'og', 'himclean.jpg'))
}

/**
 * `/o-nas` master photos and `/otzyvy` review screenshots (sources in
 * `assets/incoming/about|reviews`; reviews were redacted at import — see
 * docs/demo-image-credits.md). Work photos are not here: they are real-site
 * content on `main` (`assets/works/` → `public/works/`, built by
 * `scripts/process-work-photos.mjs`), and `/raboty` reuses those files.
 */
async function clientGallery() {
  const jobs = [
    ...readdirSync(join(SRC_CLIENT, 'about')).map((f) => ['about', f, 'o-nas', 1200]),
    ...readdirSync(join(SRC_CLIENT, 'reviews')).map((f) => ['reviews', f, 'otzyvy', 1280]),
  ]
  for (const [dir, file, outDir, longEdge] of jobs) {
    // .jpg, .JPG, .jpeg alike — phones and Windows save all three, and a
    // skipped file used to surface only as a missing image on the site.
    if (!/\.jpe?g$/i.test(file)) continue
    const name = file.replace(/\.jpe?g$/i, '')
    const info = await sharp(join(SRC_CLIENT, dir, file))
      .resize(longEdge, longEdge, { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
      .webp({ quality: QUALITY })
      .toFile(outPath(`${outDir}/${name}.webp`))
    console.log(`    ${outDir}/${name}.webp ${info.width}×${info.height}`)
  }
}

async function main() {
  await clientFrames()
  await clientGallery()
  console.log('  process-demo-images: готово, public/demo/*.webp обновлены')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
