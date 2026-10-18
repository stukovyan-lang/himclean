> **Устарело (2026-10-11).** Демо-макет стал основным сайтом, отдельные
> демо- и preview-проекты больше не нужны. Актуальная инструкция по
> выкладке — `docs/handover.md`. Файл оставлен как история решений.

# Preview deployment on Vercel

The site is a draft: `content/site.ts` has `status: 'draft'`, so production
would serve only the placeholder. A preview deployment with `PREVIEW_UNLOCK=1`
shows the real pages to the client while keeping every page `noindex` and the
sitemap empty.

There are no Vercel credentials on this machine, so the steps below are run by
hand.

```bash
cd himclean
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SITE_URL preview
vercel env add PREVIEW_UNLOCK preview
vercel deploy
```

`vercel env add` prompts for the value:

- `NEXT_PUBLIC_SITE_URL` — the preview origin, no trailing slash, for example
  `https://himclean-git-main-<account>.vercel.app`. It is only known after the
  first deploy, so run the first `vercel deploy`, copy the URL it prints, then
  set the variable and deploy again.
- `PREVIEW_UNLOCK` — `1`. Preview environment only. It must never be added to
  production.

After the deploy, check that the gate still holds:

```bash
curl -s <preview-url>/robots.txt
curl -s <preview-url>/sitemap.xml
curl -s <preview-url>/uslugi/himchistka-divana | grep -o 'name="robots" content="[^"]*"'
```

`robots.txt` must disallow everything, the sitemap must be empty, and the page
must report `noindex`.

Then run the Rich Results Test against
`<preview-url>/uslugi/himchistka-divana`:
https://search.google.com/test/rich-results

Expected result: `Service`, `FAQPage` and `BreadcrumbList` are detected.
`Service.provider` is absent until the client NAP is filled in, which is
correct and not an error.
