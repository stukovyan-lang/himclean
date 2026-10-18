/**
 * Small inline-SVG line-icon set for the demo mockup, matching the client's
 * reference screenshot (thin stroke icons, not emoji glyphs). Every icon is
 * purely decorative — used next to a text label that already carries the
 * meaning — so callers wrap them in `aria-hidden` (matches the project's
 * existing IconBadge convention).
 */
import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4c-8 0-14 5-14 13 8 0 14-5 14-13Z" />
      <path d="M6 17c3-4 6-7 12-11" />
    </svg>
  )
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  )
}

export function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9 8 4h8l3 5-7 11Z" />
      <path d="M5 9h14M9 4l-1.5 5L12 20l4.5-11L15 4" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.2" />
    </svg>
  )
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l2.4 5.1 5.6.7-4.1 3.9 1 5.6-4.9-2.7-4.9 2.7 1-5.6-4.1-3.9 5.6-.7Z" />
    </svg>
  )
}

export function HouseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  )
}

export function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  )
}

export function PercentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19 19 5" />
      <circle cx="7" cy="7" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
    </svg>
  )
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z" />
      <path d="M19 15.5c.3 1.3.9 1.9 2.2 2.2-1.3.3-1.9.9-2.2 2.2-.3-1.3-.9-1.9-2.2-2.2 1.3-.3 1.9-.9 2.2-2.2Z" />
    </svg>
  )
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17l-3 1 1-3a7.5 7.5 0 1 1 2 2Z" />
      <path d="M9.5 9.8c0 3 2.7 5.7 5.7 5.7.5 0 .9-.6.6-1.1l-.8-1.3c-.2-.4-.7-.5-1.1-.3l-.7.4a4.6 4.6 0 0 1-2.4-2.4l.4-.7c.2-.4.1-.9-.3-1.1L9.6 8.2c-.5-.3-1.1.1-1.1.6Z" />
    </svg>
  )
}

export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4 3 11l5.5 1.8M20 4l-3 15-6.3-5M20 4 8.5 12.8m0 0V17l2.7-2.6" />
    </svg>
  )
}

export function ViberIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c-4.4 0-8 2.9-8 6.5 0 2 1.1 3.8 2.8 5V19l3-2c.7.1 1.4.2 2.2.2 4.4 0 8-2.9 8-6.5S16.4 3 12 3z" />
      <path d="M9.4 8.3c.3-.3.7-.3.9 0l.6 1c.1.3 0 .5-.2.7l-.4.3c.4.9 1.1 1.6 2 2l.3-.4c.2-.2.5-.3.7-.1l1 .6c.3.2.3.6 0 .9-.5.6-1.3.8-2.1.5-1.9-.7-3.1-2-3.7-3.7-.2-.8 0-1.3.9-1.8z" />
    </svg>
  )
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
    </svg>
  )
}

export function ArmchairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <path d="M5 12a1.5 1.5 0 0 0-1.5 1.5V16a1.5 1.5 0 0 0 1.5 1.5h14A1.5 1.5 0 0 0 19.5 16v-2.5A1.5 1.5 0 0 0 18 12" />
      <path d="M6 17.5V19M18 17.5V19" />
    </svg>
  )
}
