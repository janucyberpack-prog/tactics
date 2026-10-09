import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';
// @ts-ignore
import { generateSitemap } from './scripts/generate-sitemap.mjs';

function sitemapXmlPlugin(): Plugin {
  return {
    name: 'sitemap-xml-handler',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0];

        // Clean 301 redirect /sitemap -> /sitemap.xml (prevents any browser auto-downloads)
        if (pathname === '/sitemap' || pathname === '/sitemap/') {
          res.writeHead(301, {
            Location: '/sitemap.xml',
            'Cache-Control': 'public, max-age=3600'
          });
          return res.end();
        }

        if (pathname === '/sitemap.xml') {
          const xHost = (req.headers['x-forwarded-host'] || '').toString().trim();
          const rawHost = xHost || (req.headers.host || '').toString().trim();
          const urlObj = new URL(req.url || '/', 'http://localhost');
          const overrideDomain = urlObj.searchParams.get('domain');

          let currentOrigin = process.env.VITE_SITE_DOMAIN || process.env.SITE_URL || 'https://mental-tactic-65c43.web.app';
          if (overrideDomain) {
            currentOrigin = overrideDomain.replace(/\/+$/, '');
          } else if (xHost) {
            const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
            currentOrigin = `${proto}://${xHost}`;
          } else if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('127.0.0.1') && !rawHost.includes('0.0.0.0')) {
            const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
            currentOrigin = `${proto}://${rawHost}`;
          }

          // Dynamically query published posts and generate real-time XML
          generateSitemap(currentOrigin)
            .then((xml: string) => {
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(xml);
            })
            .catch(() => {
              const filePath = path.resolve('public', 'sitemap.xml');
              if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf-8');
                content = content.replace(/https:\/\/mental-tactic-65c43\.web\.app/g, currentOrigin);
                res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                return res.end(content);
              }
              res.statusCode = 404;
              res.end();
            });
          return;
        }

        if (pathname === '/robots.txt') {
          const filePath = path.resolve('public', 'robots.txt');
          if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8');
            const xHost = (req.headers['x-forwarded-host'] || '').toString().trim();
            const rawHost = xHost || (req.headers.host || '').toString().trim();
            let currentOrigin = 'https://mental-tactic-65c43.web.app';
            if (xHost) {
              const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
              currentOrigin = `${proto}://${xHost}`;
            } else if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('127.0.0.1') && !rawHost.includes('0.0.0.0')) {
              const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
              currentOrigin = `${proto}://${rawHost}`;
            }

            content = content.replace(/https:\/\/mental-tactic-65c43\.web\.app/g, currentOrigin);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
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
