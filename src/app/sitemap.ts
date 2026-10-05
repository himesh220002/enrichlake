import type { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/lib/site/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const now = new Date();
  const staticRoutes = ['', '/dashboard', '/about', '/contact', '/privacy', '/terms'].map((path) => ({
    url: `${siteUrl}${path || '/'}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  const toolRoutes = ALL_TOOLS.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  return [...staticRoutes, ...toolRoutes];
}
