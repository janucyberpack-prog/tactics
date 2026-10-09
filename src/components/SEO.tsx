import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
    category?: string;
  };
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Mental Tactic — evidence-informed psychology, practical tools, and ideas for a stronger mind.",
  image = "https://images.unsplash.com/photo-1583769929769-48339ffd75e8?auto=format&fit=crop&w=1200&q=80",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  noindex = false,
  article
}) => {
  const fullTitle = title
    ? (title.includes('Mental Tactic') ? title : `${title} — Mental Tactic`)
    : "Mental Tactic — Understand the Mind";

  useEffect(() => {
    document.title = fullTitle;

    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Standard & OpenGraph Meta
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Mental Tactic');

    // Twitter Card
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // Robots meta for Googlebot and crawlers
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
      setMetaTag('name', 'googlebot', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      setMetaTag('name', 'googlebot', 'index, follow, max-image-preview:large');
    }

    // Canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url.split('?')[0]); // Strip query params for clean canonical

    // JSON-LD Structured Data for Google Rich Snippets
    let jsonLdScript = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://mental-tactic-65c43.web.app';

    if (type === 'article' && article) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": fullTitle,
        "description": description,
        "image": [image],
        "datePublished": article.publishedTime || new Date().toISOString(),
        "dateModified": article.modifiedTime || article.publishedTime || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": article.author || "Mental Tactic Editorial Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Mental Tactic",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseOrigin}/favicon.ico`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      };
      jsonLdScript.textContent = JSON.stringify(articleSchema);
    } else {
      const webSiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mental Tactic",
        "url": `${baseOrigin}/`,
        "description": "Evidence-informed psychology, practical tools, and ideas for a stronger mind.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseOrigin}/journal?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      jsonLdScript.textContent = JSON.stringify(webSiteSchema);
    }
  }, [fullTitle, description, image, url, type, noindex, article]);

  return null;
};
