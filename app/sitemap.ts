import type { MetadataRoute } from 'next';
import { listerSlugsPublies } from '@/lib/donnees';
import { SITE_URL } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/bibliotheque`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/nous-rejoindre`, changeFrequency: 'monthly', priority: 0.8 },
  ];
  const ressources = await listerSlugsPublies();
  return [
    ...fixes,
    ...ressources.map((r) => ({
      url: `${SITE_URL}/bibliotheque/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
