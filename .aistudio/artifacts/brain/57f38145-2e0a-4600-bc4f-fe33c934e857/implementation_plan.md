# Resolution Plan: Switch to https://mentaltactic.site Property in Google Search Console

Resolve the **"Failed: Invalid server SSL certificate"** and **"URL is not available to Google"** errors by directing Google Search Console to the verified apex property `https://mentaltactic.site/`, where SSL and HTTP 200 responses are already active and healthy.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Live testing confirms that **`https://mentaltactic.site`** (apex domain) is fully working, unblocked on Appwrite, and returning HTTP 200 with an authentic SSL certificate. The inspection error **"Failed: Invalid server SSL certificate"** was caused because Google Search Console inspected **`https://www.mentaltactic.site`**, which lacks an SSL certificate on Appwrite.

- **Confirmed Decision**: Switch to the **`https://mentaltactic.site/`** property in Google Search Console.
- **Verification Status**:
  - `https://mentaltactic.site/` -> **HTTP/2 200 OK** (SSL: Valid, Certainly)
  - `https://mentaltactic.site/robots.txt` -> **HTTP/2 200 OK** (`text/plain`)
  - `https://mentaltactic.site/sitemap.xml` -> **HTTP/2 200 OK** (`text/xml`)

---

## 1. Domain Status Comparison

```
┌──────────────────────────────────────────────┐
│  Request: https://mentaltactic.site/         │
│  SSL Certificate: Valid (Certainly CA)       │
│  HTTP Status: HTTP/2 200 OK                  │
│  Status: READY FOR GOOGLE SEARCH CONSOLE     │
└──────────────────────────────────────────────┘
                       vs
┌──────────────────────────────────────────────┐
│  Request: https://www.mentaltactic.site/     │
│  SSL Certificate: Mismatch (Fastly default) │
│  HTTP Status: SSL Handshake Failed           │
│  GSC Result: "Invalid server SSL cert"       │
└──────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Action Plan

### Step 1: Open or Add the Apex Property in Google Search Console
1. Open [Google Search Console](https://search.google.com/search-console).
2. Look at the top-left dropdown where your current property is selected (currently showing `https://www.mentaltactic.site/`).
3. Click the dropdown:
   - If **`https://mentaltactic.site/`** is already in your list, select it.
   - If not, click **+ Add property** -> Under **URL prefix**, enter:
     ```
     https://mentaltactic.site/
     ```
   - Click **Continue**. (Verification will auto-succeed if you have DNS records or Google Analytics tag `G-NJYNZ5D2ES` already in the HTML).

### Step 2: Test Live URL in the New Property
1. In the search bar at the top ("Inspect any URL in 'https://mentaltactic.site/'"), enter:
   ```
   https://mentaltactic.site/
   ```
2. Click **Test Live URL**.
3. Google will now report:
   - **Page fetch**: Successful (200 OK)
   - **SSL certificate**: Valid
   - **Crawl allowed?**: Yes
   - **URL is available to Google**

### Step 3: Submit the Sitemap
1. In the left navigation, click **Sitemaps**.
2. Under "Add a new sitemap", enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. Result:
   - Type: **Sitemap**
   - Status: **Success**
   - Discovered pages: **15**

---

## 3. Verification Checklist

- [x] Appwrite site unblocked (`x-appwrite-project-id: 6ac67f07002f98d4948b` active)
- [x] `https://mentaltactic.site/robots.txt` live check returns HTTP 200 OK
- [x] `https://mentaltactic.site/sitemap.xml` live check returns HTTP 200 OK with pure XML
- [ ] User selects `https://mentaltactic.site/` property in Google Search Console
- [ ] User tests live URL and confirms 0 SSL errors
- [ ] User submits `sitemap.xml` with status Success
