import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Mental Tactic — evidence-informed psychology, practical tools, and ideas for a stronger mind.",
  image = "https://images.unsplash.com/photo-1583769929769-48339ffd75e8?auto=format&fit=crop&w=1200&q=80",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website"
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

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  }, [fullTitle, description, image, url, type]);

  return null;
};
