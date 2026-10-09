import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 bg-[#050505] text-[#f1f0ed]">
      <SEO title="Page Not Found — Mental Tactic" />

      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 border border-[#222] bg-[#0c0c0c] text-white flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7 text-[#ce354b]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ce354b]">
            Error 404
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-white uppercase tracking-tight m-0">
            Path Dissolved.
          </h1>
          <p className="text-xs sm:text-sm text-[#888] leading-relaxed max-w-sm mx-auto font-light">
            The resource you requested could not be found or has been reorganized. Return to the main grounds.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#b51f35] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#b51f35] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
