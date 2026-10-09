import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_DOMAIN = process.env.VITE_SITE_DOMAIN || 'https://mental-tactic-65c43.web.app';
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'mental-tactic-65c43';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const STATIC_ROUTES = [
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

async function fetchFirestorePosts() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map((doc) => {
      const f = doc.fields || {};
      const slug = f.slug?.stringValue || '';
      const title = f.title?.stringValue || '';
      const status = f.status?.stringValue || 'published';
      const coverImage = f.coverImage?.stringValue || '';
      const updatedAt = f.updatedAt?.timestampValue || f.publishedAt?.timestampValue || f.createdAt?.timestampValue || '';
      return { slug, title, status, coverImage, updatedAt };
    }).filter(p => p.status === 'published' && p.slug);
  } catch (err) {
    console.warn('[sitemap-generator] Firestore REST fetch skipped:', err.message);
    return [];
  }
}

function parseSeedPostsFromCode() {
  try {
    const postsFilePath = path.join(rootDir, 'src', 'services', 'posts.ts');
    if (!fs.existsSync(postsFilePath)) return [];
    const code = fs.readFileSync(postsFilePath, 'utf-8');
    
    // Extract slug and title matches from INITIAL_SEED_POSTS
    const regex = /title:\s*["']([^"']+)["'],\s*slug:\s*["']([^"']+)["']/g;
    const list = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      list.push({
        title: match[1],
        slug: match[2],
        status: 'published',
        updatedAt: '2026-10-09'
      });
    }
    return list;
  } catch {
    return [];
  }
}

export async function generateSitemap(domain = DEFAULT_DOMAIN) {
  const cleanDomain = domain.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const livePosts = await fetchFirestorePosts();
  const seedPosts = parseSeedPostsFromCode();

  // Combine and deduplicate
  const seenSlugs = new Set();
  const allPosts = [];

  for (const post of livePosts) {
    if (!seenSlugs.has(post.slug)) {
      seenSlugs.add(post.slug);
      allPosts.push(post);
    }
  }

  for (const seed of seedPosts) {
    if (!seenSlugs.has(seed.slug)) {
      seenSlugs.add(seed.slug);
      allPosts.push(seed);
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

  // Static core routes
  xml += `  <!-- Core Navigation Pages -->\n`;
  for (const route of STATIC_ROUTES) {
    const loc = route.path ? `${cleanDomain}/${route.path}` : `${cleanDomain}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Published articles
  xml += `\n  <!-- Published Articles (${allPosts.length} entries) -->\n`;
  for (const post of allPosts) {
    const loc = `${cleanDomain}/journal/${post.slug}`;
    const lastmod = post.updatedAt ? post.updatedAt.split('T')[0] : today;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
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

  // Ensure public directory exists
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xml, 'utf-8');
  console.log(`[sitemap-generator] Wrote ${publicSitemapPath} (${allPosts.length} posts indexed).`);

  // If dist already exists, keep it in sync
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, xml, 'utf-8');
    console.log(`[sitemap-generator] Wrote ${distSitemapPath}`);
  }

  return xml;
}

// Run immediately if executed via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap().catch(console.error);
}
