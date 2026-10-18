import Link from 'next/link'
import type { DecisionRow } from '@/content/schema'
import { hasService } from '@/content/services'
import { routes } from '@/lib/routes'

/**
 * Invariant: every row links to a page that exists. `pnpm seo:check` fails
 * the build if a row's `targetSlug` has no matching service, so filtering
 * here is a safety net, not the primary guard.
 */
export function DecisionTable({ rows }: { rows: readonly DecisionRow[] }) {
  const available = rows.filter((row) => hasService(row.targetSlug))

  if (available.length === 0) return null

  return (
    <>
      {/* Below sm: a horizontally-scrolling table is a bad pattern on a
          phone — half of visitors never notice there's more to the right —
          so mobile gets a task → service card list instead of the table. */}
      <ul className="mt-8 grid gap-3 sm:hidden">
        {available.map((row) => (
          <li key={row.targetSlug}>
            <Link
              href={routes.service(row.targetSlug)}
              className="block rounded-2xl border border-current/15 p-5 transition-colors active:border-gold"
            >
              <p className="text-sm opacity-70">{row.problem}</p>
              <p className="mt-2 flex items-center gap-2 font-display font-semibold text-gold">
                {row.label}
                <span aria-hidden="true">→</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-current/15 sm:block">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-current/15">
              <th scope="col" className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.15em] opacity-70">
                Что случилось
              </th>
              <th scope="col" className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.15em] opacity-70">
                Что нужно
              </th>
            </tr>
          </thead>
          <tbody>
            {available.map((row) => (
              <tr key={row.targetSlug} className="border-b border-current/10 last:border-b-0">
                <td className="px-5 py-4 align-top">{row.problem}</td>
                <td className="px-5 py-4 align-top">
                  <Link
                    href={routes.service(row.targetSlug)}
                    className="font-display font-semibold text-gold hover:underline"
                  >
                    {row.label}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
