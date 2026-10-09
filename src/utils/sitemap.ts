import { Post } from '../types';

export const SITE_DOMAIN = 'https://mental-tactic-65c43.web.app';

export const STATIC_SITEMAP_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'journal', priority: '0.9', changefreq: 'daily' },
  { path: 'journal?category=Mindfulness', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Rest%20%26%20Renewal', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Emotional%20Agility', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Neuroscience', priority: '0.8', changefreq: 'daily' },
  { path: 'journal?category=Daily%20Rituals', priority: '0.8', changefreq: 'daily' },
  { path: 'about', priority: '0.6', changefreq: 'monthly' },
  { path: 'contact', priority: '0.5', changefreq: 'monthly' },
  { path: 'sitemap', priority: '0.7', changefreq: 'daily' }
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val.toDate && typeof val.toDate === 'function') {
    return val.toDate().toISOString().split('T')[0];
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
 * Dynamically builds a valid Google-compliant XML sitemap from live Firestore posts.
 */
export function buildDynamicSitemapXml(posts: Post[], baseUrl: string = SITE_DOMAIN): string {
  const domain = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

  // Static routes
  xml += `  <!-- Main Website Pages -->\n`;
  for (const route of STATIC_SITEMAP_ROUTES) {
    const loc = route.path ? `${domain}/${route.path}` : `${domain}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Published posts
  xml += `\n  <!-- Published Articles (Updated Daily) -->\n`;
  const publishedPosts = posts.filter(p => p.status === 'published');
  for (const post of publishedPosts) {
    const slug = post.slug || post.id;
    const loc = `${domain}/journal/${slug}`;
    const lastMod = formatDate(post.updatedAt || post.publishedAt || post.createdAt);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;

    if (post.coverImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(post.coverImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(post.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Initiates browser download of the generated sitemap.xml
 */
export function downloadSitemap(posts: Post[]): void {
  const xml = buildDynamicSitemapXml(posts);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
