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
        const url = req.url || '';
        const accept = req.headers.accept || '';
        if (
          url === '/sitemap?format=xml' ||
          url === '/sitemap.xml' ||
          (url === '/sitemap' && (accept.includes('application/xml') || accept.includes('text/xml')))
        ) {
          const filePath = path.resolve('public/sitemap.xml');
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.end(fs.readFileSync(filePath, 'utf-8'));
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
