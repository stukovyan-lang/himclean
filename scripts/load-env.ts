/**
 * Loads `.env*` files the way `next build` does, for the prebuild scripts.
 * They run under tsx, which reads no env files on its own — so on a server
 * where the domain lives in `.env.production`, `siteUrl` silently fell back
 * to localhost in llms.txt. Import this FIRST: ES imports run in order, and
 * `content/site.ts` reads `NEXT_PUBLIC_SITE_URL` the moment it is imported.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(resolve(dirname(fileURLToPath(import.meta.url)), '..'), false)
