/**
 * Generates `docs/client-questions.md` — the outstanding questions for the
 * client, in their language.
 *
 * The file is rewritten from scratch on every run and must never be edited by
 * hand: the source of truth is `content/`, and an answer is recorded by
 * filling the content in, not by ticking a line here.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { FaqItem } from '../content/schema'
import { faqPageContent } from '../content/faq'
import { home, howItWork } from '../content/pages'
import { reviews } from '../content/reviews'
import { seo } from '../content/seo'
import { services } from '../content/services'
import { site } from '../content/site'
import { works } from '../content/works'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = join(ROOT, 'docs', 'client-questions.md')

type Question = {
  /** Asked the way a person would ask it: no field names, no slugs. */
  text: string
  /** Short technical note, shown in parentheses. */
  note?: string
  /** True while the answer is still missing. */
  pending: boolean
}

function missing(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/* ------------------------------------------------------ blocks the launch */

const blocking: Question[] = [
  {
    text: 'В каком городе вы работаете? Напишите две формы: «Полоцк» и «работаем в Полоцке» — вторая нужна, чтобы текст на сайте был грамотным.',
    pending: missing(site.city) || missing(site.cityPrepositional),
  },
  {
    text: 'Основной телефон для звонков. Напишите его в международном виде, например +375 29 123-45-67.',
    pending: missing(site.phoneE164) || missing(site.phoneDisplay),
  },
  {
    text: 'В какие дни и часы вам можно звонить? Например: понедельник–суббота с 9:00 до 20:00.',
    pending: missing(site.openingHours),
  },
]

/* ----------------------------------------------- needed for certain pages */

const perPage: Question[] = [
  {
    text: 'Куда вы выезжаете кроме своего города? Перечислите населённые пункты.',
    pending: missing(site.areaServed),
  },
  {
    text: 'Есть ли адрес, по которому к вам может приехать клиент? Если вы работаете только с выездом, так и напишите — мы укажем это честно.',
    pending: missing(site.address),
  },
  {
    text: 'Есть ли на вашем номере WhatsApp и Telegram? Если номера разные, укажите оба.',
    pending: missing(site.whatsapp) || missing(site.telegram),
  },
  {
    text: 'Почта для связи, если вы ей пользуетесь.',
    pending: missing(site.email),
  },
  {
    text: 'Ссылки на ваши страницы в Google Картах, Яндекс Бизнесе, 2GIS и соцсетях. Названия и телефон там должны совпадать с сайтом до буквы.',
    pending: missing(site.sameAs),
  },
  {
    text: 'Фотографии работ: 10–20 штук, по возможности парами «до» и «после». К каждой паре одна строка — что за мебель и какое было загрязнение.',
    note: 'без подписей мы не сможем сделать описания к фото',
    pending: missing(works),
  },
  {
    text: 'Реальные отзывы: текст, имя человека, откуда он и скриншот с карт. Придумывать отзывы мы не будем.',
    pending: missing(reviews),
  },
  {
    text: 'Одно горизонтальное фото хорошего качества для превью сайта в мессенджерах и соцсетях.',
    pending: missing(seo.ogImage),
  },
]

/* -------------------------------------------------------- confirm wording */

const wording = [
  // Home page's `h1` carries a city token, so its label here is a fixed
  // string rather than the raw content field.
  ...home.confirmRequired.map((claim) => ({ page: 'Главная страница', slug: '/', claim })),
  ...howItWork.confirmRequired.map((claim) => ({ page: howItWork.h1, slug: '/kak-my-rabotaem', claim })),
  ...services.flatMap((service) =>
    service.confirmRequired.map((claim) => ({
      page: service.h1,
      slug: service.slug,
      claim,
    })),
  ),
]

/* --------------------------------------------------------- pending answers */

type PendingFaq = {
  page: string
  question: string
  draftAnswer: string | undefined
}

function collectPending(page: string, items: readonly FaqItem[]): PendingFaq[] {
  return items
    .filter((item) => item.pending)
    .map((item) => ({ page, question: item.question, draftAnswer: item.answer }))
}

const pendingFaq: PendingFaq[] = [
  ...collectPending('Главная страница', home.faq),
  ...collectPending(howItWork.h1, howItWork.faq),
  ...services.flatMap((service) => collectPending(service.h1, service.faq)),
  ...faqPageContent.sections.flatMap((section) =>
    collectPending(`/faq — ${section.label}`, section.questions),
  ),
]

/* -------------------------------------------------------------- rendering */

function renderSection(title: string, intro: string, questions: Question[]): string[] {
  const pending = questions.filter((question) => question.pending)
  if (pending.length === 0) return []

  const lines = [`## ${title}`, '', intro, '']
  for (const question of pending) {
    lines.push(`- [ ] ${question.text}${question.note ? ` _(${question.note})_` : ''}`)
  }
  lines.push('')
  return lines
}

const lines: string[] = [
  '# Вопросы по сайту HimClean',
  '',
  '<!-- Файл создаётся командой `pnpm questions` и перезаписывается целиком.',
  '     Руками не правьте: ответы вносятся в content/, а не сюда. -->',
  '',
  'Ниже то, чего нам не хватает, чтобы сайт заработал. Отвечать можно прямо',
  'списком, в свободной форме.',
  '',
]

lines.push(
  ...renderSection(
    'Блокирует запуск сайта',
    'Без этих трёх ответов сайт физически не может открыться: он показывает заглушку и закрыт от поисковиков.',
    blocking,
  ),
)

lines.push(
  ...renderSection(
    'Нужно для конкретных страниц',
    'Без этого сайт откроется, но отдельные блоки останутся пустыми. Пустой блок мы не рисуем и не заполняем выдуманным текстом.',
    perPage,
  ),
)

if (wording.length > 0) {
  lines.push('## Подтвердить формулировки', '')
  lines.push(
    'Мы написали тексты услуг по отраслевой практике. Подтвердите, что это',
    'верно для вас, или поправьте — иначе на сайте окажется обещание, которое',
    'вы не давали.',
    '',
  )

  let currentPage = ''
  for (const item of wording) {
    if (item.page !== currentPage) {
      if (currentPage !== '') lines.push('')
      currentPage = item.page
      lines.push(`**${item.page}** (${item.slug})`, '')
    }
    lines.push(`- [ ] ${item.claim}`)
  }
  lines.push('')
}

if (pendingFaq.length > 0) {
  lines.push('## Ответы, ожидающие подтверждения', '')
  lines.push(
    'На эти вопросы мы не отвечаем сами — инвариант проекта запрещает придумывать',
    'ответ. Вопрос уже стоит на странице в коде, но скрыт, пока вы не пришлёте',
    'ответ; тогда он откроется. Если у нас есть предположение, оно приведено —',
    'подтвердите его или пришлите свою формулировку.',
    '',
  )

  let currentPage = ''
  for (const item of pendingFaq) {
    if (item.page !== currentPage) {
      if (currentPage !== '') lines.push('')
      currentPage = item.page
      lines.push(`**${item.page}**`, '')
    }
    lines.push(`- [ ] ${item.question}`)
    if (item.draftAnswer) lines.push(`      _Предполагаемый ответ: ${item.draftAnswer}_`)
  }
  lines.push('')
}

const pendingCount =
  blocking.filter((question) => question.pending).length +
  perPage.filter((question) => question.pending).length +
  wording.length +
  pendingFaq.length

if (pendingCount === 0) {
  lines.push('Открытых вопросов нет.', '')
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, lines.join('\n'), 'utf8')

console.log(`  docs/client-questions.md: ${pendingCount} открытых пунктов`)
