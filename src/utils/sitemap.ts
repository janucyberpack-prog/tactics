import { Post } from '../types';
import { INITIAL_SEED_POSTS } from '../services/posts';

export const DEFAULT_SITE_DOMAIN = 'https://mental-tactic-65c43.web.app';

export function getSiteDomain(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (typeof process !== 'undefined' && process.env?.VITE_SITE_DOMAIN) {
    return process.env.VITE_SITE_DOMAIN;
  }
  return DEFAULT_SITE_DOMAIN;
}

export const SITE_DOMAIN = getSiteDomain();

export interface SitemapRoute {
  path: string;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastmod?: string;
}

export const STATIC_SITEMAP_ROUTES: SitemapRoute[] = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'journal', priority: '0.9', changefreq: 'daily' },
  { path: 'journal?category=Mindfulness', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Rest%20%26%20Renewal', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Emotional%20Agility', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Neuroscience', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Daily%20Rituals', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Behavior', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Mental%20Strength', priority: '0.8', changefreq: 'daily' },
  { path: 'about', priority: '0.6', changefreq: 'monthly' },
  { path: 'contact', priority: '0.5', changefreq: 'monthly' }
];

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function formatW3CDate(val: any): string {
  if (!val) {
    return new Date().toISOString().split('T')[0];
  }
  if (typeof val === 'object' && val !== null && typeof val.toDate === 'function') {
    return val.toDate().toISOString().split('T')[0];
  }
  if (typeof val === 'object' && val !== null && typeof val.toMillis === 'function') {
    return new Date(val.toMillis()).toISOString().split('T')[0];
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Builds a 100% Google-compliant XML sitemap from published posts and static routes.
 * Strictly adheres to sitemaps.org 0.9 schema, UTF-8 encoding, and image sitemap extension.
 */
export function buildDynamicSitemapXml(
  posts: Post[],
  baseUrl: string = getSiteDomain()
): string {
  const domain = (baseUrl || DEFAULT_SITE_DOMAIN).replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

  // Core Static Landing and Public Pages
  xml += `  <!-- Core Public Navigation Pages -->\n`;
  for (const route of STATIC_SITEMAP_ROUTES) {
    const loc = route.path ? `${domain}/${route.path}` : `${domain}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${route.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Published Articles (Deduplicated, Valid Slugs Only)
  xml += `\n  <!-- Evidence-Informed Published Articles -->\n`;

  // Merge posts with initial seed posts if list is sparse so sitemap is never empty
  const publishedList: Post[] = [];
  const seenSlugs = new Set<string>();

  const candidatePosts = Array.isArray(posts) && posts.length > 0 ? posts : [];
  for (const p of candidatePosts) {
    if (p.status === 'published' && p.slug && !seenSlugs.has(p.slug)) {
      seenSlugs.add(p.slug);
      publishedList.push(p);
    }
  }

  // Backfill with seed posts if needed
  for (const seed of INITIAL_SEED_POSTS) {
    if (seed.slug && !seenSlugs.has(seed.slug)) {
      seenSlugs.add(seed.slug);
      publishedList.push({
        id: seed.slug,
        ...seed,
        createdAt: null as any,
        updatedAt: null as any,
        publishedAt: null as any
      });
    }
  }

  for (const post of publishedList) {
    const slug = post.slug || post.id;
    const loc = `${domain}/journal/${slug}`;

    // Genuine modification date: prioritize updatedAt, then publishedAt, then createdAt
    const lastModDate = formatW3CDate(post.updatedAt || post.publishedAt || post.createdAt);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastModDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;

    if (post.coverImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(post.coverImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(post.title || '')}</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Initiates browser download of dynamic sitemap.xml on demand (from Admin Studio)
 */
export function downloadSitemap(posts: Post[], baseUrl: string = getSiteDomain()): void {
  const xml = buildDynamicSitemapXml(posts, baseUrl);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
