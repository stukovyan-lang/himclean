import { services } from '../services'
import { works } from '../works'
import { demoPhotoSchema, demoWorkSchema, type DemoPhoto, type DemoWork } from './schema'

/**
 * `/raboty` in the demo. The photos themselves are real-site content on
 * `main` — pairs in `content/works.ts`, single frames in each service's
 * `images` — so this file only reshapes them and adds captions; there is one
 * copy of every file (`public/works/`) and one alt per frame.
 */

export const demoWorks: DemoWork[] = demoWorkSchema.array().parse(
  works.map((work) => ({
    id: work.id,
    title: work.material,
    note: work.soiling,
    before: work.before,
    after: work.after,
  })),
)

/**
 * Captions for the single frames, keyed by file. Ozone captions name what
 * the service is for (client, 2026-09-30: "причину желательно указать") as a
 * general statement about the service — not as the diagnosis of that
 * particular car or flat, which nobody told us. A frame without a caption
 * fails the parse below, so a photo added to a service can't slip onto
 * `/raboty` unlabelled.
 */
const CAPTIONS: Record<string, string> = {
  '/works/divan-temnyj-uglovoj.webp': 'Угловой диван после химчистки',
  '/works/divan-kirpich.webp': 'Диван после химчистки',
  '/works/divan-kirpich-razlozhen.webp': 'Тот же диван в разложенном виде',
  '/works/divan-grafit-uglovoj.webp': 'Угловой диван после химчистки',
  '/works/divan-seryj-razlozhen.webp': 'Разложенный диван после чистки',
  '/works/divan-polukruglyj.webp': 'Полукруглый диван',
  '/works/divan-polukruglyj-krupno.webp': 'Тот же полукруглый диван крупнее',
  '/works/matras-v-processe.webp': 'Матрас во время химчистки',
  '/works/divan-svetlyj-v-processe.webp': 'Светлый диван во время чистки: правое сиденье уже очищено',
  '/works/divan-podushka-v-processe.webp': 'Диван во время чистки: левая подушка уже очищена',
  '/works/stul-zheltyj-v-processe.webp': 'Велюровый стул во время чистки: слева сиденье уже очищено',
  '/works/stulya-belye.webp': 'Стулья после химчистки',
  '/works/avto-kozha-v-processe.webp': 'Кожаное сиденье во время чистки: очищенная часть заметно светлее',
  '/works/avto-salon-nissan.webp': 'Салон автомобиля после химчистки',
  '/works/ozon-avto-krossover.webp': 'Озонирование кроссовера: генератор на штативе, шланг в салоне. От запаха табака и прежних владельцев',
  '/works/ozon-avto-bmw-shtativ.webp': 'Озонирование салона автомобиля. Помогает от запаха табака, пролитого молока и топлива',
  '/works/ozon-avto-passat.webp': 'Озонирование салона седана — от запаха табака, животных и прежних владельцев',
  '/works/ozon-avto-bmw-7.webp': 'Озонирование салона. Убирает запах прежних владельцев, животных, сырость из кондиционера',
  '/works/ozon-kvartira-datchik.webp': 'Озонирование квартиры: генератор Ozonbox и датчик воздуха. От запаха табака и животных',
  '/works/ozon-kuhnya-shtativ.webp': 'Кухня-гостиная: вентилятор разгоняет озон по всему помещению. От сырости и затхлости',
  '/works/ozon-dva-generatora.webp': 'Два генератора и вентиляторы — для большой площади. От стойких запахов и сырости',
  '/works/ozon-komnata-okno.webp': 'Озонирование комнаты с кожаной мебелью — от запаха табака и затхлости',
  '/works/ozon-komnata-shtativ.webp': 'Озонирование комнаты — от запаха прежних жильцов',
  '/works/ozon-divan-shlang.webp': 'Обработка дивана изнутри, через ящик для белья — от запаха животных и затхлости',
}

function photosOf(slugs: readonly string[]): DemoPhoto[] {
  const images = services.filter((service) => slugs.includes(service.slug)).flatMap((service) => service.images)
  return demoPhotoSchema.array().parse(images.map((image) => ({ image, caption: CAPTIONS[image.src] })))
}

export const demoWorkPhotos = photosOf(['himchistka-divana', 'himchistka-kresel', 'himchistka-matrasov', 'himchistka-avtosalona'])
export const demoOzonePhotos = photosOf(['ozonirovanie-avto', 'ozonirovanie-pomescheniy'])
