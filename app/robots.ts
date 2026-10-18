import type { MetadataRoute } from 'next'
import { isSiteLive } from '@/content/schema'
import { site, siteUrl } from '@/content/site'

/**
 * AI crawlers are allowed explicitly. Most starter templates block them by
 * default, which is a direct loss of visibility in AI answers — the client's
 * stated priority number one.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
]

const SEARCH_CRAWLERS = ['Googlebot', 'Bingbot', 'YandexBot']

export default function robots(): MetadataRoute.Robots {
  if (!isSiteLive(site)) {
    // Draft: nothing may be indexed, by anyone.
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dev/'] },
      ...[...AI_CRAWLERS, ...SEARCH_CRAWLERS].map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/dev/'],
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
