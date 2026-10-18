import { notFound } from 'next/navigation'
import { Footer, Header, MobileCallBar } from '@/components/layout'
import { Button, Container, Heading, IconBadge, Section } from '@/components/ui'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Дизайн-система',
  path: '/dev/design-system',
  noindex: true,
})

const palette = [
  { token: '--bg-dark', value: '#2B2521', usage: 'основной фон', swatch: 'bg-bg-dark' },
  { token: '--bg-cream', value: '#F4EFE8', usage: 'светлые секции', swatch: 'bg-bg-cream' },
  { token: '--gold', value: '#D9A961', usage: 'акцент, кнопки', swatch: 'bg-gold' },
  { token: '--gold-soft', value: '#E7C892', usage: 'ховеры', swatch: 'bg-gold-soft' },
  { token: '--text-light', value: '#FFFFFF', usage: 'основной текст', swatch: 'bg-text-light' },
  { token: '--text-muted', value: '#B9AFA6', usage: 'вторичный текст', swatch: 'bg-text-muted' },
] as const

const rhythm = [
  { breakpoint: 'mobile', value: '48px' },
  { breakpoint: 'tablet', value: '64px' },
  { breakpoint: 'desktop', value: '96px' },
] as const

/** Internal preview surface. Never reachable in production. */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <>
      <Container as="div" className="py-12">
        <Heading level={1} eyebrow="HimClean · внутренняя страница">
          Дизайн-система
        </Heading>
        <p className="mt-4 max-w-2xl text-base text-text-muted">
          Палитра, типографика и базовые компоненты. Страница доступна только в разработке и
          закрыта от индексации.
        </p>
      </Container>

      <Section tone="dark" labelledBy="palette">
        <Heading level={2} id="palette">
          Палитра
        </Heading>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palette.map((color) => (
            <li
              key={color.token}
              className="flex items-center gap-4 rounded-2xl border border-gold/15 p-4"
            >
              <span
                aria-hidden="true"
                className={`h-14 w-14 shrink-0 rounded-xl border border-white/10 ${color.swatch}`}
              />
              <span className="min-w-0">
                <span className="block font-display text-sm tracking-wide text-text-light">
                  {color.token}
                </span>
                <span className="block text-sm text-text-muted">{color.value}</span>
                <span className="block text-xs text-text-muted">{color.usage}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="cream" labelledBy="typography">
        <Heading level={2} id="typography">
          Типографика
        </Heading>
        <div className="mt-8 space-y-6">
          <p className="font-display text-4xl font-bold uppercase tracking-tight lg:text-5xl">
            Химчистка дивана
          </p>
          <p className="font-display text-2xl font-bold uppercase tracking-tight lg:text-3xl">
            Озонирование автомобиля
          </p>
          <p className="font-display text-lg font-semibold tracking-wide">
            Сколько сохнет мебель после химчистки
          </p>
          <p className="max-w-2xl text-base leading-relaxed">
            Основной текст набирается Manrope. Строка держит комфортную длину, межстрочный
            интервал рассчитан на длинные абзацы описаний и ответов в блоке вопросов.
          </p>
          <p className="max-w-2xl text-sm">
            Мелкий текст: подписи, сноски, вторичная информация в карточках работ.
          </p>
        </div>
      </Section>

      <Section tone="dark" labelledBy="components">
        <Heading level={2} id="components">
          Компоненты
        </Heading>

        <Heading level={3} className="mt-8">
          Кнопки
        </Heading>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button href="#" variant="primary-gold" size="lg">
            Позвонить
          </Button>
          <Button href="#" variant="primary-gold" size="md">
            Написать в WhatsApp
          </Button>
          <Button href="#" variant="ghost" size="lg">
            Посмотреть работы
          </Button>
          <Button href="#" variant="ghost" size="md">
            Подробнее
          </Button>
        </div>

        <Heading level={3} className="mt-10">
          Значки
        </Heading>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <IconBadge variant="gold">1</IconBadge>
          <IconBadge variant="outline">2</IconBadge>
          <IconBadge variant="gold">3</IconBadge>
        </div>

        <Heading level={3} className="mt-10">
          Вертикальный ритм
        </Heading>
        <ul className="mt-4 space-y-2 text-sm text-text-muted">
          {rhythm.map((step) => (
            <li key={step.breakpoint}>
              {step.breakpoint}: {step.value}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="cream" labelledBy="layout-parts">
        <Heading level={2} id="layout-parts">
          Шапка и подвал
        </Heading>
        <p className="mt-4 max-w-2xl text-base">
          Навигация и контакты приходят из content. Пока данные клиента не заполнены, ссылки и
          кнопка звонка не рендерятся вовсе — это инвариант, а не пустое состояние.
        </p>
        {/* A scrollable box with real height, not `overflow-hidden`: the
            header is `position: sticky`, and clipping the ancestor would
            have silently broken that in this preview alone (sticky needs a
            scrolling context, not a clipped static one) without saying
            anything about the header on a real page. */}
        <div className="mt-8 h-[420px] overflow-y-auto rounded-2xl border border-text-dark/15">
          <Header />
          <div className="bg-bg-cream p-8 text-text-dark">
            <p className="max-w-md text-sm">
              Прокрутите эту рамку — шапка остаётся наверху и становится компактнее.
            </p>
          </div>
          <Footer />
        </div>
        <MobileCallBar />
      </Section>
    </>
  )
}
