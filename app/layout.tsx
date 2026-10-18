import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { YandexMetrika } from '@/components/seo/YandexMetrika'
import { Footer, Header, MobileCallBar } from '@/components/layout'
// Imported from their own files, not the `components/demo` barrel: seo-check's
// h1 counter follows every `export ... from` re-export in an imported file, so
// a barrel that re-exports `DemoHero` (which has its own `<h1>`) would make
// every page that imports anything else from it look like it has two h1s.
import { DemoFooter } from '@/components/demo/DemoFooter'
import { DemoHeader } from '@/components/demo/DemoHeader'
import { DemoMobileCallBar } from '@/components/demo/DemoMobileCallBar'
import { isSiteLive } from '@/content/schema'
import { site } from '@/content/site'
import { DEMO_MODE } from '@/lib/demo'
import { buildRootMetadata } from '@/lib/metadata'
import { graph, organization, webSite } from '@/lib/schema'
import { manrope, montserratDisplay, unbounded } from './fonts'
import './globals.css'

export const metadata: Metadata = buildRootMetadata()

export const viewport: Viewport = {
  themeColor: '#2B2521',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const live = isSiteLive(site)

  // The approved design ships its own fixed-nav chrome (`components/demo/`);
  // the original `Header`/`Footer` only render with DEMO_MODE=0. Entity
  // JSON-LD (`Organization`, `WebSite`) is emitted on every page once live.
  return (
    // The approved design: Montserrat instead of Unbounded, and a near-black
    // ground instead of the brand brown (`.demo-theme` in globals.css).
    <html
      lang="ru"
      className={`${DEMO_MODE ? `${montserratDisplay.variable} demo-theme` : unbounded.variable} ${manrope.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {live ? <JsonLd data={graph([organization(), webSite()])} /> : null}
        {DEMO_MODE ? <DemoHeader /> : live ? <Header /> : null}
        <main className="flex-1">{children}</main>
        {DEMO_MODE ? <DemoFooter /> : live ? <Footer /> : null}
        {DEMO_MODE ? <DemoMobileCallBar /> : live ? <MobileCallBar /> : null}
        {live ? <YandexMetrika /> : null}
      </body>
    </html>
  )
}
