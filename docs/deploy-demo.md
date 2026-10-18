> **Устарело (2026-10-11).** Демо-макет стал основным сайтом, отдельные
> демо- и preview-проекты больше не нужны. Актуальная инструкция по
> выкладке — `docs/handover.md`. Файл оставлен как история решений.

# Деплой демо-макета

Инструкция для отдельного Vercel-проекта, не для основного `himclean`.
Никаких деплоев в рамках этой задачи не выполнялось — учётных данных для
нового проекта нет, только команды ниже.

## Почему отдельный проект, а не переменная на существующем

`DEMO_MODE=1` — это дополнительный обход того же гейта, что и
`PREVIEW_UNLOCK`, поэтому теоретически его можно было бы включить как
Preview-переменную на уже существующем проекте `himclean`. Отдельный проект
безопаснее по двум причинам:

- ссылка на демо не должна путаться со ссылкой на настоящий клиентский
  preview (`PREVIEW_UNLOCK=1`, см. предыдущую фазу) — это разные вещи,
  показывающие разный контент с одного и того же исходного кода;
- у демо-проекта не должно быть шанса случайно получить продакшен-алиас
  основного сайта.

## Шаги

1. Создать новый проект в Vercel из ветки `demo/client-preview` этого
   репозитория (не `main`).
2. В Project Settings → Environment Variables добавить:

   ```
   DEMO_MODE=1
   ```

   для окружений **Preview** и **Production** нового проекта — обе нужны,
   потому что в этом отдельном проекте «продакшен» и есть ссылка для показа
   клиенту, никакого реального сайта здесь нет.
3. Остальные переменные (`NEXT_PUBLIC_SITE_URL`, коды верификации,
   `YANDEX_METRIKA_ID`) не нужны: демо всегда `noindex`, `nofollow`,
   `robots.txt` отдаёт `Disallow: /` целиком, `sitemap.xml` и `llms.txt`
   недоступны — незачем.
4. Задеплоить (`vercel deploy` из корня `himclean/` с привязкой к новому
   проекту, или через git-интеграцию Vercel на ветку `demo/client-preview`).
5. Как и для клиентского preview из предыдущей фазы: если в организации
   Vercel включена SSO-защита деплоев по умолчанию, для показа клиенту без
   аккаунта в команде её нужно снять на уровне нового проекта
   (`ssoProtection: null` через API или Project Settings → Deployment
   Protection) — ссылка всё равно останется `noindex`/`nofollow`.

## Проверка после деплоя

```bash
curl -sI https://<demo-project>.vercel.app/ | grep -i x-robots-tag
curl -s https://<demo-project>.vercel.app/robots.txt
curl -s -o /dev/null -w '%{http_code}\n' https://<demo-project>.vercel.app/sitemap.xml
curl -s -o /dev/null -w '%{http_code}\n' https://<demo-project>.vercel.app/llms.txt
```

Ожидается: `x-robots-tag: noindex, nofollow`, `robots.txt` с
`Disallow: /`, `sitemap.xml` и `llms.txt` — не 200 (пустой sitemap или 404).

## Изображения

В среде разработки не нашлось генератора изображений — ни локального CLI,
ни MCP-сервера, ни skill. `public/demo/` сейчас заполнен брендированными
SVG-заглушками (`node scripts/generate-demo-placeholders.mjs` их
воспроизводит), с настоящим описательным `alt` в `content/demo/*.ts`, как у
реальной фотографии. Ниже — промпты для генерации настоящих изображений тем
инструментом, который будет под рукой; после генерации приводите к
указанным размерам, конвертируйте в WebP и кладите в `public/demo/` с теми
же именами файлов, что уже использует `content/demo/`, чтобы код не менять.

Стиль везде единый: фотореализм, тёплый тёмно-коричневый свет, низкий
контраст, без текста на самом изображении.

### Герой и карточки услуг

1. **hero.svg → hero.webp**, 2400×1400 — `warm modern living room, large
   beige velvet sofa, dark brown and cream palette, soft evening light
   through window, plants, low contrast, cinematic, photorealistic`
2. **service-himchistka.svg**, 1200×900 — `close-up of professional
   upholstery extractor cleaning a beige fabric sofa, water droplets,
   shallow depth of field, warm light`
3. **service-avto.svg**, 1200×900 — `clean modern car interior, dark
   leather and fabric seats, dashboard, warm ambient light, photorealistic`
4. **service-ozon.svg**, 1200×900 — `professional ozone generator on the
   floor of an empty bright room, faint mist, warm light`
5. **ozone-bg.svg**, 2400×1350 — тот же генератор озона, план шире, для
   фона секции с затемнением: `wide shot of a bright room with a
   professional ozone generator on the floor, faint mist, warm evening
   light, photorealistic`
6. **og.svg**, 1200×630 — `dark brown background, elegant golden accents,
   clean interior with a sofa, space for text on the left`

### Работы — 6 пар до/после (`public/demo/works/`)

Общий приём для каждой пары: одинаковый ракурс и кадрирование в обоих
кадрах, меняется только состояние предмета.

7. **divan-velur-kofe-before / -after**, 1200×800 — `identical framing of
   the same beige velvet sofa cushion, one with visible coffee stains and
   dull worn fabric, one perfectly clean and fresh, photorealistic, warm
   light`
8. **matras-pot-before / -after**, 1200×800 — `identical framing of the
   same mattress with a knit cover, one with visible yellow sweat stains,
   one perfectly clean and fresh, bright bedroom, warm light,
   photorealistic`
9. **kover-pesok-before / -after**, 1200×800 — `identical framing of the
   same light short-pile carpet, one with visible sand and flattened dirty
   pile, one with lifted clean pile, warm light, photorealistic`
10. **avtosalon-gryaz-before / -after**, 1200×800 — `identical framing of
    the same fabric car seat, one with visible dirt stains and wear, one
    perfectly clean, warm ambient light, photorealistic`
11. **kreslo-sherst-before / -after**, 1200×800 — `identical framing of the
    same woven-fabric armchair, one covered in pet hair, one perfectly
    clean, warm light, photorealistic`
12. **divan-rogozhka-deti-before / -after**, 1200×800 — `identical framing
    of the same woven-fabric sofa cushion, one with bright juice stains
    and marker scribbles, one perfectly clean, warm light, photorealistic`
