import { Container, Heading } from '@/components/ui'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Страница не найдена',
  path: '/404',
  noindex: true,
})

export default function NotFound() {
  return (
    <Container as="section" className="flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="max-w-md text-center">
        <p className="font-display text-5xl font-bold text-gold">404</p>
        <Heading level={1} className="mt-6">
          Страница не найдена
        </Heading>
        <p className="mt-4 text-base text-text-muted">
          Возможно, адрес введён с ошибкой или страница была удалена.
        </p>
      </div>
    </Container>
  )
}
