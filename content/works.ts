import { workSchema, type Work } from './schema'

/**
 * The client's own before/after pairs (sent 2026-09-29; sources in
 * `assets/works/`, built by `scripts/process-work-photos.mjs`). Two separate
 * shots per pair, same piece of furniture in the same room. `material` and
 * `soiling` describe only what is visible in the frames — no fabric names or
 * stain causes the client didn't state.
 *
 * Order matters: the home page previews the first `HOME_WORKS_PREVIEW`, and
 * `/raboty` and the service pages keep this order. The mattress and the
 * U-shaped sofa lead — the client's pick (2026-10-01) as the most obvious
 * before/after — then the next most obvious pair, then the chairs, so the
 * home preview isn't four sofas in a row. Second batch of photos: 2026-10-06;
 * third (car interiors, cropped out of phone screenshots): 2026-10-08.
 */
export const HOME_WORKS_PREVIEW = 4

/**
 * Single frames of the same object ("Диван" + "Тот же диван разложенный"):
 * galleries keep each group in one row, side by side, instead of letting the
 * grid split it across rows (client, 2026-10-16). By `src`.
 */
export const RELATED_FRAMES: readonly (readonly string[])[] = [
  ['/works/divan-kirpich.webp', '/works/divan-kirpich-razlozhen.webp'],
  ['/works/divan-polukruglyj.webp', '/works/divan-polukruglyj-krupno.webp'],
]

/** Splits a list of frames into single frames and related groups, in order. */
export function groupRelatedFrames<T>(items: readonly T[], srcOf: (item: T) => string): T[][] {
  const result: T[][] = []
  const used = new Set<number>()
  items.forEach((item, index) => {
    if (used.has(index)) return
    const group = RELATED_FRAMES.find((g) => g.includes(srcOf(item)))
    if (!group) {
      result.push([item])
      return
    }
    const members = items
      .map((other, otherIndex) => ({ other, otherIndex }))
      .filter(({ other }) => group.includes(srcOf(other)))
    members.forEach(({ otherIndex }) => used.add(otherIndex))
    result.push(members.map(({ other }) => other))
  })
  return result
}

const frame = (name: string, alt: string, width: number, height: number) => ({
  src: `/works/${name}.webp`,
  alt,
  width,
  height,
})

export const works: Work[] = workSchema.array().parse([
  {
    id: 'matras',
    material: 'Матрас',
    soiling: 'Большое жёлтое пятно',
    serviceSlug: 'himchistka-matrasov',
    before: frame('matras-do', 'Светлый матрас на кровати с большим жёлтым пятном до химчистки', 900, 1200),
    after: frame('matras-posle', 'Тот же матрас после химчистки, пятна не видно', 900, 1200),
  },
  {
    id: 'divan-p-obraznyj',
    material: 'П-образный диван, тёмно-серая обивка',
    soiling: 'Пыль и светлые следы по всей поверхности',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-p-obraznyj-do', 'Тёмно-серый П-образный диван до химчистки, пыль и светлые следы на сиденьях', 600, 800),
    after: frame('divan-p-obraznyj-posle', 'Тот же тёмно-серый П-образный диван после химчистки, у стены с картой мира', 900, 1200),
  },
  {
    id: 'divan-stezhka',
    material: 'Диван, светлая стёганая спинка и тёмное сиденье',
    soiling: 'Грязные разводы по всему сиденью',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-stezhka-do', 'Диван со светлой стёганой спинкой до химчистки: сиденье в грязных разводах и пятнах', 900, 1200),
    after: frame('divan-stezhka-posle', 'Тот же диван со стёганой спинкой после химчистки, сиденье ровного тёмного цвета', 900, 1200),
  },
  {
    id: 'stulya-velyur',
    material: 'Стулья, бирюзовый велюр',
    soiling: 'Светлые пятна на сиденьях',
    serviceSlug: 'himchistka-kresel',
    before: frame('stulya-velyur-do', 'Бирюзовые велюровые стулья с каретной стяжкой до чистки, светлые пятна на сиденье', 900, 1200),
    after: frame('stulya-velyur-posle', 'Те же бирюзовые велюровые стулья после чистки, сиденья без пятен', 900, 1200),
  },
  {
    id: 'divan-sinij',
    material: 'Угловой диван, синий велюр',
    soiling: 'Пятна и разводы по всей оттоманке',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-sinij-do', 'Синий велюровый угловой диван до химчистки: пятна и разводы на оттоманке и сиденьях', 900, 1200),
    after: frame('divan-sinij-posle', 'Тот же синий угловой диван после химчистки, цвет велюра ровный и насыщенный', 900, 1200),
  },
  {
    id: 'divan-flomaster',
    material: 'Угловой диван, коричневая обивка',
    soiling: 'Сиденья изрисованы',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-flomaster-do', 'Коричневый угловой диван до химчистки: все сиденья изрисованы белыми линиями', 900, 1200),
    after: frame('divan-korichnevyj-2', 'Коричневый угловой диван после чистки, под ним расстелены синие полотенца', 900, 1200),
  },
  {
    id: 'divan-seryj-uglovoj',
    material: 'Угловой диван, светло-серая обивка',
    soiling: 'Разводы и пятна на сиденьях и оттоманке',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-seryj-uglovoj-do', 'Светло-серый угловой диван до химчистки: жёлтые разводы на сиденьях и оттоманке', 900, 1200),
    after: frame('divan-seryj-uglovoj-posle', 'Тот же светло-серый угловой диван после химчистки, обивка ровного цвета', 900, 1200),
  },
  {
    id: 'divan-seryj-polosy',
    material: 'Угловой диван, серая обивка с тёмными полосами',
    soiling: 'Разводы на сиденье',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-seryj-polosy-do', 'Серый угловой диван с тёмными полосами до чистки, на сиденье видны разводы', 900, 1200),
    after: frame('divan-seryj-polosy-posle', 'Тот же серый угловой диван после чистки, у дивана синие полотенца и распылитель', 900, 1200),
  },
  {
    id: 'divan-korichnevyj',
    material: 'Угловой диван, коричневая обивка',
    soiling: 'Тёмные пятна и разводы на оттоманке',
    serviceSlug: 'himchistka-divana',
    before: frame('divan-korichnevyj-do', 'Коричневый угловой диван до химчистки, тёмные пятна на оттоманке', 900, 1200),
    after: frame('divan-korichnevyj-posle', 'Та же коричневая оттоманка после химчистки, цвет обивки ровный', 900, 1200),
  },
  {
    id: 'kuhonnyj-ugolok',
    material: 'Кухонный уголок, серая обивка',
    soiling: 'Пятна и затёртости на сиденьях',
    serviceSlug: 'himchistka-divana',
    before: frame('kuhonnyj-ugolok-do', 'Серый кухонный уголок до химчистки, пятна и затёртости на сиденьях', 900, 1200),
    after: frame('kuhonnyj-ugolok-posle', 'Тот же серый кухонный уголок после химчистки, сиденья чистые', 900, 1200),
  },
  {
    id: 'kuhonnyj-ugolok-2',
    material: 'Кухонный уголок, светлая обивка',
    soiling: 'Пожелтевшее сиденье',
    serviceSlug: 'himchistka-divana',
    before: frame('kuhonnyj-ugolok-2-do', 'Светлый кухонный уголок до чистки, сиденье заметно пожелтело', 1200, 900),
    after: frame('kuhonnyj-ugolok-2-posle', 'Тот же светлый кухонный уголок после чистки, сиденье снова светлое', 1200, 900),
  },
  {
    id: 'matras-2',
    material: 'Матрас',
    soiling: 'Пятна по всей поверхности',
    serviceSlug: 'himchistka-matrasov',
    before: frame('matras-2-do', 'Матрас на деревянной кровати до химчистки: тёмные пятна ближе к центру', 900, 1200),
    after: frame('matras-2-posle', 'Тот же матрас на деревянной кровати после химчистки, поверхность светлая', 900, 1200),
  },
  {
    id: 'matras-3',
    material: 'Матрас',
    soiling: 'Жёлтые пятна',
    serviceSlug: 'himchistka-matrasov',
    before: frame('matras-3-do', 'Матрас у серого мягкого изголовья до химчистки, на поверхности жёлтые пятна', 900, 1200),
    after: frame('matras-3-posle', 'Тот же матрас у серого изголовья после химчистки, поверхность белая', 719, 959),
  },
  {
    id: 'avto-salon-skoda',
    material: 'Салон автомобиля, передние сиденья',
    soiling: 'Грязь и мусор на полу и коврах',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-salon-skoda-do', 'Передняя часть салона серого автомобиля до химчистки: грязный пол и коврики', 899, 1200),
    after: frame('avto-salon-skoda-posle', 'Тот же салон после химчистки: чистые коврики, сиденья и пороги', 899, 1200),
  },
  {
    id: 'avto-salon-opel',
    material: 'Салон автомобиля, водительское место',
    soiling: 'Грязный пол у педалей',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-salon-opel-do', 'Водительское место белого автомобиля до химчистки, на полу у педалей грязь', 899, 1200),
    after: frame('avto-salon-opel-posle', 'Салон того же белого автомобиля после химчистки, пол и сиденья чистые', 899, 1200),
  },
  {
    id: 'avto-salon-vw',
    material: 'Салон автомобиля, место водителя',
    soiling: 'Грязь на полу под рулём',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-salon-vw-do', 'Место водителя Volkswagen до химчистки: пол под рулём в грязи', 899, 1200),
    after: frame('avto-salon-vw-posle', 'Место водителя того же Volkswagen после химчистки, коврик и пол чистые', 899, 1200),
  },
  {
    id: 'avto-zadnij-divan',
    material: 'Задний диван автомобиля, тканевая обивка',
    soiling: 'Пыль и пятна на сиденье',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-zadnij-divan-do', 'Задний диван автомобиля до химчистки, на ткани пыль и пятна', 899, 1200),
    after: frame('avto-zadnij-divan-posle', 'Тот же задний диван после химчистки, обивка ровного тёмного цвета', 899, 1200),
  },
  {
    id: 'avto-sidene',
    material: 'Сиденье водителя, тканевая обивка',
    soiling: 'Затёртости и пыль',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-sidene-do', 'Тканевое сиденье водителя крупным планом до чистки: затёртости и пыль', 899, 1200),
    after: frame('avto-sidene-posle', 'То же тканевое сиденье после чистки, ткань чистая и ровная', 899, 1200),
  },
  {
    id: 'avto-bagazhnik',
    material: 'Багажник универсала',
    soiling: 'Грязь и пятна на обивке пола',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-bagazhnik-do', 'Багажник белого универсала до химчистки: пятна и грязь на полу', 1166, 874),
    after: frame('avto-bagazhnik-posle', 'Тот же багажник после химчистки, ворс пола чистый', 1166, 874),
  },
  {
    id: 'avto-kovrik',
    material: 'Пол у места водителя',
    soiling: 'Песок и мусор на ворсе',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-kovrik-do', 'Пол у места водителя до химчистки: песок, мусор и пятна на ворсе', 900, 1200),
    after: frame('avto-kovrik-posle', 'Тот же пол у места водителя после химчистки, ворс чистый', 900, 1200),
  },
  {
    id: 'avto-pol-szadi',
    material: 'Пол за передним сиденьем',
    soiling: 'Пыль и мусор у порога',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-pol-szadi-do', 'Пол за передним сиденьем до химчистки, у порога пыль и мусор', 900, 1200),
    after: frame('avto-pol-szadi-posle', 'Тот же пол за передним сиденьем после химчистки, коврик и порог чистые', 900, 1200),
  },
  {
    id: 'avto-pol-bez-sidenij',
    material: 'Пол салона, сиденья сняты',
    soiling: 'Слой грязи и пыли на ковролине',
    serviceSlug: 'himchistka-avtosalona',
    before: frame('avto-pol-bez-sidenij-do', 'Пол салона со снятыми передними сиденьями до химчистки: ковролин в грязи и пыли', 900, 1200),
    after: frame('avto-pol-bez-sidenij-posle', 'Тот же пол салона после химчистки: ковролин чистый, сиденье ещё не установлено', 900, 1200),
  },
] satisfies Work[])
