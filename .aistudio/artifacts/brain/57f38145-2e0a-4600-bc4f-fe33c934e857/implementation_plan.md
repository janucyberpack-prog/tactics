# Resolution Plan: Unblock Appwrite Deployment & Fix Google Search Console Sitemap Fetching

Resolve the Google Search Console errors (**"Not Fetched - Blocked due to other 4xx issue"** on `robots.txt` and **"Couldn't fetch"** on sitemaps) by diagnosing and unblocking the Appwrite site deployment, aligning all sitemap and canonical URLs to the apex domain `https://mentaltactic.site`, and verifying clean HTTP 200 responses.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The primary obstacle preventing Google Search Console from fetching `robots.txt` and `sitemap.xml` is that Appwrite Cloud is currently returning **HTTP 403 Forbidden** (`{"type":"router_deployment_blocked","message":"The deployment is blocked","code":403}`) on all requests to `mentaltactic.site`. Because Googlebot cannot read `robots.txt` due to a 4xx error, it immediately refuses to fetch any sitemaps.

- **Confirmed Decision 1 (Hosting)**: Unblock and redeploy the site in Appwrite Console (Project ID: `6ac67f07002f98d4948b`).
- **Confirmed Decision 2 (Domain)**: Standardize on apex domain without www (`https://mentaltactic.site`) where SSL is verified and active.
- **Action Required by User in Appwrite Console**: Follow the quick steps in Section 3 to activate/redeploy the deployment and clear the router block.

---

## 1. Root Cause Breakdown

```
Google Search Console Crawl Request
                │
                ▼
   GET https://mentaltactic.site/robots.txt
                │
                ▼
    Appwrite Edge Router (Fastly / Swoole)
                │
       [Deployment Blocked]
                ▼
         HTTP 403 Forbidden
    {"type":"router_deployment_blocked"}
                │
                ▼
Googlebot halts crawl immediately:
- "Blocked due to other 4xx issue" on robots.txt
- "Couldn't fetch" on all sitemaps
```

1. **`router_deployment_blocked` (HTTP 403)**:
   - When Appwrite encounters an unhealthy build, paused site, or resource/storage limit threshold, the edge router serves HTTP 403 `{"type":"router_deployment_blocked","message":"The deployment is blocked","code":403}`.
   - Per Google's webmaster guidelines, if `robots.txt` returns an HTTP 4xx error (specifically 403 Forbidden), Google assumes crawler access is prohibited or down, halting sitemap processing.

2. **Subdomain SSL Mismatch**:
   - `www.mentaltactic.site` was serving the Fastly fallback certificate (`subjectAltName does not match www.mentaltactic.site`), triggering `Failed: Invalid server SSL certificate`.
   - The apex domain `https://mentaltactic.site` has a fully valid, active SSL certificate issued by Certainly.

---

## 2. Technical Architecture & Sitemap Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Codebase & Build Pipeline                      │
│                                                                 │
│  .env: VITE_SITE_DOMAIN="https://mentaltactic.site"             │
│  appwrite.json: projectId="6ac67f07002f98d4948b"                │
│                                                                 │
│  npm run build                                                  │
│     │                                                           │
│     ├──> scripts/generate-sitemap.mjs                           │
│     │       ├── Fetches published articles from Firestore       │
│     │       ├── Emits /public/sitemap.xml (15 clean URLs)       │
│     │       ├── Emits /dist/sitemap.xml                         │
│     │       └── Generates robots.txt referencing apex sitemap   │
│     │                                                           │
│     └──> vite build (Bundles static SPA into /dist)             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Appwrite Cloud                            │
│                                                                 │
│  Sites Service -> Mental Tactic (6ac67f07002f98d4948b)          │
│  Custom Domain: mentaltactic.site (Active SSL)                  │
│                                                                 │
│  Response for /robots.txt:  HTTP 200 (text/plain)               │
│  Response for /sitemap.xml: HTTP 200 (application/xml)          │
│  Response for /sitemap:     HTTP 200 / 301 to /sitemap.xml      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Search Console                        │
│                                                                 │
│  Property: https://mentaltactic.site/ (URL prefix)              │
│  robots.txt: Fetched successfully (200 OK)                      │
│  sitemap.xml: Fetched successfully (Status: Success, 15 pages)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Implementation

### Step 1: Codebase Alignment to Apex Domain
- **`.env` & `.env.example`**: Set `VITE_SITE_DOMAIN="https://mentaltactic.site"`.
- **`appwrite.json`**: Populate `"projectId": "6ac67f07002f98d4948b"`.
- **`scripts/generate-sitemap.mjs`**: Ensure default fallback and canonical generation use `https://mentaltactic.site`.
- **`public/robots.txt`**:
  ```
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /admin/
  Disallow: /admin/*
  Disallow: /login

  Sitemap: https://mentaltactic.site/sitemap.xml
  Sitemap: https://mentaltactic.site/sitemap
  Host: https://mentaltactic.site
  ```
- **Execute Build**: Run `npm run build` to generate the latest static bundle and sitemap.

### Step 2: Unblock and Redeploy in Appwrite Console (User Action)
To clear the `router_deployment_blocked` (HTTP 403):
1. Navigate to **[Appwrite Cloud Console](https://cloud.appwrite.io/)** and open your project **Mental Tactic** (`6ac67f07002f98d4948b`).
2. In the left sidebar, click **Sites** and select **Mental Tactic**.
3. Under the **Deployments** tab:
   - Check if the latest deployment failed, got stuck, or is deactivated.
   - If a deployment exists, click its options icon (`...`) and click **Activate**.
   - If failed or out of date, click **Create Deployment** (or trigger a push via your connected GitHub repository).
   - Check the **Settings -> Usage / Storage** tab to ensure the project has not hit the 2 GB free limit (delete older inactive deployments if needed).
4. Verify custom domain:
   - Go to **Sites -> Settings -> Domains**.
   - Ensure `mentaltactic.site` has a green checkmark (**Active**).

### Step 3: Verification & Resubmission in Google Search Console
1. **Live Check via curl**:
   - `curl -I https://mentaltactic.site/robots.txt` must return `HTTP/2 200` with `content-type: text/plain`.
   - `curl -I https://mentaltactic.site/sitemap.xml` must return `HTTP/2 200` with `content-type: application/xml`.
2. **Google Search Console**:
   - In GSC property selector (top left), switch to or select the property: `https://mentaltactic.site/` (or the Domain property `mentaltactic.site`).
   - Go to **Settings -> Crawling -> robots.txt** or **Page Indexing**. Check that robots.txt is fetched with 200 OK.
   - Under **Sitemaps**, enter `sitemap.xml` and click **Submit**.
   - GSC will fetch the 15 discovered URLs and report Status: **Success**.

---

## 4. Verification Checklist

- [ ] `.env` updated with `VITE_SITE_DOMAIN="https://mentaltactic.site"`
- [ ] `appwrite.json` configured with correct project settings
- [ ] `scripts/generate-sitemap.mjs` executed and verified producing 15 URLs starting with `https://mentaltactic.site/`
- [ ] Appwrite deployment unblocked and serving 200 OK
- [ ] Google Search Console robots.txt and sitemap verified
