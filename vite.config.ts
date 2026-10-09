import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function sitemapXmlPlugin(): Plugin {
  return {
    name: 'sitemap-xml-handler',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (
          pathname === '/sitemap' ||
          pathname === '/sitemap/' ||
          pathname === '/sitemap.xml' ||
          pathname === '/sitemap-news.xml' ||
          pathname === '/robots.txt'
        ) {
          const fileName = pathname === '/sitemap-news.xml'
            ? 'sitemap-news.xml'
            : pathname === '/robots.txt'
              ? 'robots.txt'
              : 'sitemap.xml';
          const filePath = path.resolve('public', fileName);
          if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8');

            // Detect current host from Cloud Run / reverse proxy headers so Google Search Console
            // never flags 'URL not allowed' cross-domain mismatch
            const xHost = (req.headers['x-forwarded-host'] || '').toString().trim();
            const rawHost = xHost || (req.headers.host || '').toString().trim();
            const urlObj = new URL(req.url || '/', 'http://localhost');
            const overrideDomain = urlObj.searchParams.get('domain');

            let currentOrigin = 'https://mental-tactic-65c43.web.app';
            if (overrideDomain) {
              currentOrigin = overrideDomain.replace(/\/+$/, '');
            } else if (xHost) {
              const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
              currentOrigin = `${proto}://${xHost}`;
            } else if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('127.0.0.1') && !rawHost.includes('0.0.0.0')) {
              const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
              currentOrigin = `${proto}://${rawHost}`;
            }

            content = content.replace(/https:\/\/mental-tactic-65c43\.web\.app/g, currentOrigin);

            const contentType = fileName === 'robots.txt'
              ? 'text/plain; charset=utf-8'
              : 'application/xml; charset=utf-8';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'no-cache');
            return res.end(content);
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sitemapXmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
