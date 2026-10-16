# Implementation Plan: Fix "Failed: Invalid server SSL certificate" on https://www.mentaltactic.site/

## Root Cause Analysis
1. **SSL Hostname Mismatch on `www.mentaltactic.site`**:
   - Google Search Console property is set to `https://www.mentaltactic.site/`.
   - Running SSL inspection against `www.mentaltactic.site:443` reveals:
     - `subject: CN=t.sni-820-default.ssl.fastly.net` (Fastly default fallback certificate).
     - The SSL certificate does **not** match `www.mentaltactic.site`.
   - Running SSL inspection against `mentaltactic.site:443` (apex without `www`) reveals:
     - `subject: CN=mentaltactic.site` (Valid SSL certificate issued by Certainly).
   - This occurs because in **Appwrite Sites**, only the apex domain `mentaltactic.site` was registered and provisioned for SSL, but `www.mentaltactic.site` was not yet registered as a custom domain in Appwrite, causing Fastly to serve the unauthenticated default certificate and Google Search Console to block page fetching with `Failed: Invalid server SSL certificate`.

2. **Domain URL Consistency in Sitemaps**:
   - Because the Google Search Console property is `https://www.mentaltactic.site/`, all sitemap `<loc>` tags must begin with `https://www.mentaltactic.site/` to prevent subsequent "URL not allowed for a Sitemap at this location" errors.

---

## Action Plan

### 1. Codebase Alignment for `www.mentaltactic.site`
- **Files**: `.env`, `.env.example`, `scripts/generate-sitemap.mjs`, `src/utils/sitemap.ts`
- **Action**:
  - Update primary domain configuration to `https://www.mentaltactic.site`.
  - Re-run sitemap generation so all 15 URLs (`/`, `/journal`, `/about`, `/contact`, and all published articles) use `https://www.mentaltactic.site/`.
  - Synchronize `public/robots.txt` and `dist/robots.txt` with:
    ```
    Sitemap: https://www.mentaltactic.site/sitemap.xml
    Sitemap: https://www.mentaltactic.site/sitemap
    Host: https://www.mentaltactic.site
    ```

### 2. Appwrite Sites & DNS Configuration (Action for User)
To resolve the SSL certificate on `www.mentaltactic.site`:
1. Log in to **Appwrite Cloud Console** -> Go to **Sites** -> Select **Mental Tactic**.
2. Click **Settings** -> **Domains**.
3. Click **Add Domain** and enter: `www.mentaltactic.site`.
4. Appwrite will verify the existing CNAME (`appwrite.network`) and immediately trigger automatic SSL certificate provisioning (via Certainly / Let's Encrypt).
5. Once the status turns to **Verified / Active**, the certificate for `www.mentaltactic.site` will be valid.
*(Alternative: If you prefer using `https://mentaltactic.site/` without `www`, simply add a property in Google Search Console for `https://mentaltactic.site/` where the SSL certificate is already 100% active and verified right now).*

### 3. Local & Build Verification
- Execute `npm run build` to re-generate the sitemap and build assets with `https://www.mentaltactic.site`.
- Verify with `npm run lint` and `curl` tests on the local dev server.
