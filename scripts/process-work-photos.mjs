#!/usr/bin/env node
/**
 * Builds `public/works/*.webp` from the client's own work photos in
 * `assets/works/` (committed — they are not re-fetchable). Run by hand
 * (`node scripts/process-work-photos.mjs`), not part of the build.
 *
 * Sources were normalised once from the client's drop (HEIC/PNG → JPEG, EXIF
 * rotation applied, long edge ≤ 2000px). Here: long edge 1200px, Lanczos3,
 * WebP q88, never enlarged; colour and sharpness untouched. Phone-portrait
 * 9:16 frames that belong to a before/after pair are centre-cut to 3:4 so
 * the two halves of a pair sit in a sensible card.
 */

import { mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'assets', 'works')
const OUT = join(ROOT, 'public', 'works')
const LONG_EDGE = 1200
const QUALITY = 88

const TALL_PAIR_FRAMES = new Set([
  'stulya-velyur-do',
  'stulya-velyur-posle',
  'divan-korichnevyj-do',
  'divan-korichnevyj-posle',
  'divan-seryj-polosy-do',
  'divan-seryj-polosy-posle',
  'avto-kovrik-do',
  'avto-kovrik-posle',
  'avto-pol-szadi-do',
  'avto-pol-szadi-posle',
  'matras-3-do',
  'matras-3-posle',
])

async function main() {
  mkdirSync(OUT, { recursive: true })

  for (const file of readdirSync(SRC).sort()) {
    // .jpg, .JPG, .jpeg alike — phones and Windows save all three, and a
    // skipped file used to surface only as a missing image on the site.
    if (!/\.jpe?g$/i.test(file)) continue
    const name = file.replace(/\.jpe?g$/i, '')
    const source = join(SRC, file)

    let pipeline = sharp(source)
    if (TALL_PAIR_FRAMES.has(name)) {
      const { width = 0, height = 0 } = await sharp(source).metadata()
      const cropHeight = Math.round((width * 4) / 3)
      pipeline = pipeline.extract({ left: 0, top: Math.round((height - cropHeight) / 2), width, height: cropHeight })
    }

    const info = await pipeline
      .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
      .webp({ quality: QUALITY })
      .toFile(join(OUT, `${name}.webp`))
    console.log(`  works/${name}.webp ${info.width}×${info.height}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
