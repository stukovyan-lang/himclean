import Link from 'next/link'
import { Button, Heading, goldTextClass, type Tone } from '@/components/ui'
import { getContactChannels } from '@/lib/contacts'
import { routes } from '@/lib/routes'

type ContactCtaProps = {
  title: string
  /** Service pages point back to the process/pricing page from here. */
  showHowItWorksLink?: boolean
  tone?: Tone
}

/**
 * The site has no forms. Invariant 1: with no contacts in `content/site.ts`
 * this block does not render at all.
 */
export function ContactCta({ title, showHowItWorksLink = false, tone = 'dark' }: ContactCtaProps) {
  const channels = getContactChannels().filter((channel) => channel.id !== 'email')

  if (channels.length === 0) return null

  // On dark the hover brightens toward --gold-soft; on cream that would only
  // move further from the background, so the hover cue is opacity instead.
  const howItWorksLinkClass =
    tone === 'cream'
      ? `inline-flex min-h-11 items-center text-sm ${goldTextClass(tone)} underline underline-offset-4 hover:opacity-70 active:opacity-70`
      : 'inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4 hover:text-gold-soft active:text-gold-soft'

  return (
    <div className="rounded-3xl border border-gold/30 p-8 lg:p-12">
      <Heading level={2} id="cta" tone={tone}>
        {title}
      </Heading>
      <div className="mt-6 flex flex-wrap gap-4">
        {channels.map((channel, index) => (
          <Button
            key={channel.id}
            href={channel.href}
            size="lg"
            variant={index === 0 ? 'primary-gold' : 'ghost'}
            tone={tone}
          >
            {channel.label}
          </Button>
        ))}
      </div>
      {showHowItWorksLink ? (
        <p className="mt-6">
          <Link href={routes.howItWorks} className={howItWorksLinkClass}>
            Как проходит работа и из чего складывается цена
          </Link>
        </p>
      ) : null}
    </div>
  )
}
