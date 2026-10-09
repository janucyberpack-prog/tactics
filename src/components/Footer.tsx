import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-[#1f1f1f] pt-12 pb-8">
      <div className="site-container">
        {/* Footer Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 pb-9">
          {/* Left Brand */}
          <Link to="/" className="inline-flex items-center gap-3 w-max" aria-label="Mental Tactic home">
            <svg className="w-[31px] h-[31px] text-[#f1f0ed]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M20 7v26M20 10c-4.3-5.3-12-2.3-10.3 4.4-5.4 2.6-3.1 10 1.1 10.4-1 5.4 5.1 8.6 9.2 4.4M20 10c4.3-5.3 12-2.3 10.3 4.4 5.4 2.6 3.1 10-1.1 10.4 1 5.4-5.1 8.6-9.2 4.4"
                stroke="currentColor"
                strokeWidth="1.35"
              />
              <path
                d="M10.2 14.7c2.7.2 4.1 1.5 4.4 3.8M29.8 14.7c-2.7.2-4.1 1.5-4.4 3.8M10.6 24.5c2.4-1.3 4.4-.9 5.7.9M29.4 24.5c-2.4-1.3-4.4-.9-5.7.9"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle cx="20" cy="20" r="18" stroke="#b51f35" strokeWidth="0.7" strokeDasharray="2 4" />
            </svg>
            <span className="font-serif text-[17px] font-semibold tracking-[0.14em] uppercase text-[#f1f0ed]">
              Mental Tactic
            </span>
          </Link>

          {/* Center Links */}
          <ul className="flex flex-wrap items-center justify-start md:justify-center gap-7 list-none m-0 p-0 text-[9px] font-semibold tracking-[0.14em] uppercase text-[#727270]">
            <li>
              <Link to="/journal" className="hover:text-[#f1f0ed] transition-colors">
                Articles
              </Link>
            </li>
            <li>
              <a href="/#tools" className="hover:text-[#f1f0ed] transition-colors">
                Resources
              </a>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#f1f0ed] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#f1f0ed] transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/saved" className="hover:text-[#f1f0ed] transition-colors">
                Saved
              </Link>
            </li>
            <li>
              <Link to="/sitemap" className="hover:text-[#f1f0ed] transition-colors">
                Sitemap
              </Link>
            </li>
          </ul>

          {/* Right Socials */}
          <div className="flex items-center justify-start md:justify-end gap-2.5" aria-label="Social links">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-[31px] h-[31px] grid place-items-center border border-[#242424] text-[#727270] hover:text-[#f1f0ed] hover:border-[#b51f35] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" />
                <circle cx="10" cy="10" r="3" stroke="currentColor" />
                <circle cx="14.5" cy="5.5" r=".8" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="w-[31px] h-[31px] grid place-items-center border border-[#242424] text-[#727270] hover:text-[#f1f0ed] hover:border-[#b51f35] transition-colors"
              aria-label="X"
            >
              <svg className="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4 4 16" stroke="currentColor" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-[31px] h-[31px] grid place-items-center border border-[#242424] text-[#727270] hover:text-[#f1f0ed] hover:border-[#b51f35] transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 8v8M5 5v.2M9 16v-5.2C9 9 10.4 8 12 8s3 1 3 3v5M9 8v8" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-6 border-t border-[#1d1d1d] text-[8px] tracking-[0.14em] uppercase text-[#686866]">
          <span>© {new Date().getFullYear()} Mental Tactic. All rights reserved.</span>
          <span>Think clearly. Live deliberately.</span>
        </div>
      </div>
    </footer>
  );
};
