# Implementation Plan: Google Search Console Sitemap & Routing Alignment for mentaltactic.site

## User Answers & Requirements Alignment
- **Verified GSC Domain**: `https://mentaltactic.site/` (resolves the 19 "URL not allowed" errors caused by the previous `mental-tactic-65c43.web.app` mismatch).
- **Sitemap Behavior**: Serve pure XML with `Content-Type: application/xml; charset=utf-8` directly at both `/sitemap` and `/sitemap.xml`.
- **Target Deployment**: Vercel static deployment (requires zero-config static routing without conflicting rewrites or accidental fallback to `index.html`).

---

## Root Causes of Search Console Errors
1. **"This url is not allowed for a Sitemap at this location" (19 instances)**:
   - Google Search Console property is registered as `https://mentaltactic.site/`.
   - The sitemap previously hardcoded `https://mental-tactic-65c43.web.app/`. Google rejects cross-domain URLs unless cross-domain validation is pre-configured.
   - Sitemaps contained parameterized URLs (e.g., `/journal?category=Mindfulness`), which Google flags as canonical conflicts.
2. **"Your Sitemap appears to be an HTML page"**:
   - When requests hit `/sitemap`, Vercel's SPA catch-all rule rewrote to `index.html` instead of serving XML.
   - Vite and static hosts treated extensionless `/sitemap` requests either as a SPA page or an octet-stream download.

---

## Planned Code Changes

### 1. Domain Configuration & Environment Sync
- **Files**: `.env`, `.env.example`, `scripts/generate-sitemap.mjs`, `src/utils/sitemap.ts`
- **Action**: Set the primary canonical domain to `https://mentaltactic.site`.
- Implement adaptive fallback to honor `VITE_SITE_DOMAIN`, `SITE_URL`, or `VERCEL_PROJECT_PRODUCTION_URL` during build.

### 2. Dual XML Route Generation (`/sitemap.xml` & `/sitemap`)
- **Files**: `scripts/generate-sitemap.mjs`, `package.json`
- **Action**:
  - Automatically fetch all published articles from Firestore via the REST endpoint `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts`.
  - Filter exclusively for `status === 'published'` and valid `slug` fields.
  - Calculate realistic `lastmod` dates in W3C format using `updatedAt` or `publishedAt` (no synthetic today dates for unchanged posts).
  - Include canonical indexable routes only: `/`, `/journal`, `/about`, `/contact`, and `/journal/:slug` (remove all query string URLs).
  - Output files to `public/sitemap.xml`, `dist/sitemap.xml`, and root `sitemap.xml`.
  - Output an identical XML copy to `dist/sitemap` and `public/sitemap.xml` so Vercel can serve pure XML whether requested at `/sitemap.xml` or `/sitemap`.

### 3. Vercel Static Routing & Header Configuration
- **File**: `vercel.json`
- **Action**:
  - Set `"cleanUrls": false` to prevent Vercel from stripping file extensions.
  - Set explicit headers for `/sitemap.xml` and `/sitemap`:
    - `Content-Type: application/xml; charset=utf-8`
    - `Cache-Control: public, max-age=3600, s-maxage=3600`
  - Set explicit header for `/robots.txt`:
    - `Content-Type: text/plain; charset=utf-8`
  - Add explicit rewrites:
    - `/sitemap.xml` -> `/sitemap.xml`
    - `/sitemap` -> `/sitemap.xml` (or serve `sitemap` XML directly)
    - `/robots.txt` -> `/robots.txt`
    - Catch-all SPA rewrite exclusively targeting routes that are NOT `sitemap`, `sitemap.xml`, `robots.txt`, `favicon.ico`, or `assets/`.

### 4. Dev Server Middleware Alignment
- **File**: `vite.config.ts`
- **Action**:
  - Configure `sitemapXmlPlugin` so requests to both `/sitemap` and `/sitemap.xml` immediately return pure XML with `Content-Type: application/xml; charset=utf-8` and `200 OK`.
  - Ensure local development and production previews accurately mirror Vercel behavior.

### 5. Robots.txt Synchronization
- **Files**: `public/robots.txt`, `dist/robots.txt`, `robots.txt`
- **Action**:
  - Include `Sitemap: https://mentaltactic.site/sitemap.xml`
  - Include `Sitemap: https://mentaltactic.site/sitemap`
  - Include `Host: https://mentaltactic.site`

### 6. Admin Panel Live Sync & Verification
- **File**: `src/pages/admin/AdminSettings.tsx`
- **Action**:
  - Default domain to `https://mentaltactic.site` with instant live XML copy and download capabilities.

---

## Verification Plan

### Automated Build & Lint Verification
1. Run `npm run build` to execute `scripts/generate-sitemap.mjs && vite build`.
2. Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.

### Local Endpoint Verification via cURL
1. `curl -i http://localhost:3000/sitemap.xml` -> verify `HTTP 200`, `Content-Type: application/xml; charset=utf-8`, and first line `<?xml version="1.0" encoding="UTF-8"?>`.
2. `curl -i http://localhost:3000/sitemap` -> verify `HTTP 200`, `Content-Type: application/xml; charset=utf-8`, and first line `<?xml version="1.0" encoding="UTF-8"?>`.
3. `curl -s http://localhost:3000/robots.txt` -> verify `https://mentaltactic.site/sitemap.xml` directive.
4. Verify every `<loc>` in the generated XML begins with `https://mentaltactic.site/`.
