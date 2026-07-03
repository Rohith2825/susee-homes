import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const en = new URL('/', base).toString();
  const ta = new URL('/ta', base).toString();

  return [
    {
      url: en,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { en, ta } },
    },
    {
      url: ta,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { en, ta } },
    },
  ];
}
