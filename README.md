# HimClean

Сайт химчистки мягкой мебели и озонирования (Полоцк, Новополоцк).
Next.js 15, TypeScript, Tailwind CSS v4.

- **Выкладка на хостинг и домен, правки контента** — [`docs/handover.md`](docs/handover.md)
- **Устройство проекта и правила для разработчика** — [`CLAUDE.md`](CLAUDE.md)

```bash
corepack enable    # Node 22 или 24 LTS
pnpm install
pnpm dev        # http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://ваш-домен.by pnpm build   # проверки + сборка; без домена сборка остановится
```

Переменные окружения — [`.env.example`](.env.example).
