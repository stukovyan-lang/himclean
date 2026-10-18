import { NextResponse, type NextRequest } from 'next/server'
import { isSiteLive } from './content/schema'
import { site } from './content/site'

/**
 * Publication gate at the edge: while the site is a draft, production serves
 * the single placeholder page for every route. Development is untouched so
 * later phases can build and preview real pages before the switch to `live`.
 *
 * PREVIEW_UNLOCK=1 lifts the rewrite so a Vercel preview deployment can show
 * unfinished pages to the client. It is set on preview environments only and
 * must never exist in production. It does not make anything indexable: pages
 * still carry noindex and the sitemap stays empty until `status` is `live`.
 *
 * DEMO_MODE=1 lifts it too — a leftover from the client-demo deployment,
 * before the approved design became the site (CLAUDE.md, "Дизайн сайта").
 * With `status: 'live'` the gate is open anyway, so it only matters for a
 * draft.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return NextResponse.next()
  if (process.env.PREVIEW_UNLOCK === '1') return NextResponse.next()
  if (process.env.DEMO_MODE === '1') return NextResponse.next()
  if (isSiteLive(site)) return NextResponse.next()
  if (request.nextUrl.pathname === '/') return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|images/|og/|dev/).*)'],
}
