import { demoHomeSchema, type DemoHome } from './schema'

/**
 * Copy and image references for the redesigned demo home page. Fictional
 * marketing copy written for a mockup that is explicitly labelled as a demo
 * everywhere it renders (see `components/demo/DemoBanner.tsx`) — invariant 1
 * ("no invented content") governs the real site in `content/`, not a page
 * that announces itself as an example on every screen.
 *
 * Still under the same experience-number ban as the real site: no years of
 * operation, no client counts, no awards — see CLAUDE.md's "Демо-режим".
 */
export const demoHome: DemoHome = demoHomeSchema.parse({
  hero: {
    overline: 'Чистота, которую вы чувствуете',
    headingLines: ['Профессиональная', 'Химчистка мебели', 'и озонирование'],
    goldLineIndexes: [1, 2],
    subtitle: 'Для дома, офиса и автомобиля',
    markers: [{ label: 'Чистота' }, { label: 'Безопасность' }, { label: 'Комфорт' }],
    badgeText: 'Свежесть за пределами видимого',
    image: {
      src: '/demo/hero.webp',
      alt: 'Тёмная гостиная с бежевым угловым диваном, круглым чёрным столиком и растением у стены',
      width: 2400,
      height: 1350,
    },
  },

  servicesHeading: 'Наши услуги',
  servicesSubtitle: 'Комплексный подход к чистоте вашего пространства',

  services: [
    {
      id: 'himchistka',
      title: 'Химчистка мягкой мебели',
      description: 'Диваны, кресла, стулья, матрасы',
      href: '/uslugi/himchistka-divana',
      dark: true,
      image: {
        src: '/demo/service-himchistka.webp',
        alt: 'Крупный план серо-бежевого велюрового дивана с подушкой, на фоне тёплый свет лампы',
        width: 1280,
        height: 720,
      },
    },
    {
      id: 'ozon-avto',
      title: 'Озонирование автомобилей',
      description: 'Удаление запахов, бактерий, плесени и аллергенов',
      href: '/uslugi/ozonirovanie-avto',
      dark: true,
      image: {
        src: '/demo/service-avto.webp',
        alt: 'Салон автомобиля в тумане озонирования: приборная панель и генератор озона Ozonbox на сиденье',
        width: 1065,
        height: 710,
      },
    },
    {
      id: 'ozon-pomeschenie',
      title: 'Озонирование помещений',
      description: 'Квартиры, дома, офисы, коммерческие помещения',
      href: '/uslugi/ozonirovanie-pomescheniy',
      dark: true,
      image: {
        src: '/demo/service-ozon.webp',
        alt: 'Генератор озона выпускает туман на ковре рядом с серым диваном в гостиной',
        width: 1280,
        height: 720,
      },
    },
  ],

  results: {
    heading: 'Результат, который говорит сам за себя',
    points: ['Удаляем сложные загрязнения', 'Возвращаем свежесть', 'Продлеваем срок службы мебели'],
    // A single composite frame from the client: left half soiled, right half
    // clean, labels and divider already in the pixels — see DemoResults.tsx.
    image: {
      src: '/demo/results.webp',
      alt: 'Диван до и после химчистки: слева затёртая обивка в пятнах, справа чистая и ровная',
      width: 1280,
      height: 720,
    },
  },

  ozone: {
    heading: 'Больше чем простая чистка',
    // Client's facts (2026-09-29) in place of the earlier placeholder
    // "до 99,9% бактерий" — a number nobody had confirmed.
    paragraph:
      'Озонирование убирает стойкие запахи, которые не берёт обычная уборка: табак, животные, сырость, затхлость, запах прежних жильцов.',
    points: [
      'Генераторы Ozonbox общей мощностью до 150 г/ч',
      'Время обработки — под объём помещения',
      'Обязательное проветривание после процедуры',
      'Квартиры, дома, офисы и автомобили',
    ],
    image: {
      src: '/demo/ozone-bg.webp',
      alt: 'Руль и приборная панель автомобиля в тумане озонирования, справа генератор озона на сиденье',
      width: 2000,
      height: 500,
    },
  },

  whyUsHeading: 'Почему выбирают HimClean',
  whyUs: [
    { title: 'Профессиональное оборудование' },
    { title: 'Безопасные средства' },
    { title: 'Опыт и реальные результаты' },
    { title: 'Честный сервис и забота о клиентах' },
  ],

  contactsCard: {
    heading: 'Остались вопросы? Мы всегда на связи',
    paragraph: 'Проконсультируем, подберём лучшее решение и рассчитаем стоимость',
    subtitle: 'Быстро. Удобно. Без обязательств.',
  },
} satisfies DemoHome)

export const demoOgImage = {
  src: '/demo/og.webp',
  alt: 'Тёмная гостиная с бежевым диваном в вечернем свете, слева затемнение под текст',
  width: 1200,
  height: 630,
}
