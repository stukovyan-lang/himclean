import Image from 'next/image'
import type { DemoReview } from '@/content/demo/schema'
import { demoSite } from '@/content/demo/site'

const CHANNEL_LABELS: Record<NonNullable<DemoReview['channel']>, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  viber: 'Viber',
  google: 'Google',
}

/**
 * Real reviews: the transcribed text is the content (it has to be in the
 * HTML — invariant 4); the left frame is the proof. Every card has the same
 * 3:4 frame so they line up — the client asked for the reviews "в рамке
 * выровнять" (2026-10-16) — and cards in a row share one height.
 *
 * - Messenger reviews: the redacted screenshot fills the frame, the full
 *   one opens on tap.
 * - Google Maps reviews: a tile linking to the live profile, where the
 *   review itself can be checked. Their screenshots are wide, short strips
 *   that turned into blurry word fragments in a 3:4 frame; the files stay in
 *   `public/demo/otzyvy/` as the record of what was published.
 *
 * Below `sm` the frame sits beside the heading so the text gets the full
 * card width; from `sm` it is a column on the left.
 *
 * Single context: always on `Section tone="cream"` (`/otzyvy`), so muted
 * text uses `opacity-70`, not `opacity-60` — CLAUDE.md's "Контраст текста"
 * (opacity-60 is 3.9:1 on cream, opacity-70 is 5.3:1).
 */
export function DemoReviewsGrid({ reviews }: { reviews: readonly DemoReview[] }) {
  return (
    <ul className="grid gap-6 lg:grid-cols-2">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="grid content-start grid-cols-[5rem_minmax(0,1fr)] sm:grid-rows-[auto_1fr] gap-x-4 gap-y-4 rounded-2xl border border-current/15 p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-6 sm:p-6"
        >
          {review.channel === 'google' && demoSite.googleMapsUrl ? (
            <a
              href={demoSite.googleMapsUrl}
              target="_blank"
              rel="noopener"
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 self-start rounded-lg border border-current/15 bg-white px-2 text-center transition-opacity hover:opacity-85 active:opacity-70 sm:row-span-2"
            >
              {/* No stars: reviews carry no rating field, and a hard-coded
                  five would misstate the next 4★ review (invariant 6). */}
              <span className="font-display text-[11px] font-semibold leading-tight sm:text-sm">Google Карты</span>
              <span className="text-[10px] opacity-70 sm:text-xs">открыть отзыв</span>
              <span className="sr-only"> (открыть отзывы на Google Картах)</span>
            </a>
          ) : (
            <a
              href={review.screenshot.src}
              target="_blank"
              rel="noopener"
              className="relative block aspect-[3/4] self-start overflow-hidden rounded-lg border border-current/15 bg-black transition-opacity hover:opacity-85 active:opacity-70 sm:row-span-2"
            >
              <Image
                src={review.screenshot.src}
                alt={review.screenshot.alt}
                fill
                quality={85}
                sizes="(min-width: 640px) 160px, 80px"
                className="object-cover object-top"
              />
              <span className="sr-only"> (открыть скриншот целиком)</span>
            </a>
          )}
          <div className="self-center sm:self-start">
            <h2 className="font-display text-base font-semibold tracking-wide">{review.service}</h2>
            <p className="mt-1 text-xs opacity-70">
              {review.channel === 'google'
                ? 'Отзыв на Google Картах'
                : review.channel
                  ? `Отзыв из ${CHANNEL_LABELS[review.channel]}`
                  : 'Отзыв клиента'}
            </p>
          </div>
          <blockquote className="col-span-2 text-base leading-relaxed opacity-90 sm:col-span-1 sm:col-start-2">
            <p>{review.text}</p>
          </blockquote>
        </li>
      ))}
    </ul>
  )
}
