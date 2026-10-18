/**
 * The approved design (2026-10-11 handover).
 *
 * The site's current look — the redesigned home page, `/raboty`, `/otzyvy`,
 * `/o-nas`, `/kontakty`, the header/footer in `components/demo/` — started
 * as a client mockup behind a `DEMO_MODE=1` environment variable. The client
 * approved it, so it is now simply the site: this flag is always on and no
 * environment variable is needed. The names (`DEMO_MODE`, `components/demo/`,
 * `content/demo/`) are historical, not a sign that anything here is a mockup.
 *
 * Set `DEMO_MODE=0` only to see the original pre-redesign pages (the old
 * home page and `components/layout/` chrome), e.g. while comparing.
 */
export const DEMO_MODE = process.env.DEMO_MODE !== '0'
