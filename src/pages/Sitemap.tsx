import React, { useEffect } from 'react';

export const Sitemap: React.FC = () => {
  useEffect(() => {
    // Redirect to the supported XML sitemap format directly
    window.location.replace('/sitemap.xml');
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f1f0ed] flex flex-col items-center justify-center p-8">
      <div className="p-6 rounded-xl border border-[#222] bg-[#0c0c0c] max-w-md text-center">
        <div className="font-mono text-xs uppercase tracking-wider text-[#b51f35] mb-2">
          XML Sitemap
        </div>
        <h1 className="font-serif text-lg text-white mb-2">Loading Supported XML Sitemap</h1>
        <p className="text-xs text-[#888] mb-4">
          Redirecting to compliant Googlebot XML format at{' '}
          <code className="text-[#ccc] bg-[#161616] px-1 py-0.5 rounded">/sitemap.xml</code>
        </p>
        <a
          href="/sitemap.xml"
          className="inline-block px-4 py-2 bg-[#b51f35] text-white text-xs font-mono rounded hover:bg-[#cf253e] transition-colors"
        >
          View /sitemap.xml
        </a>
      </div>
    </div>
  );
};
