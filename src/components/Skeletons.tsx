import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] border border-[#222] p-6 animate-pulse flex flex-col justify-between h-[420px]">
      <div>
        <div className="w-full h-52 bg-[#161616] mb-5" />
        <div className="h-3 w-20 bg-[#161616] mb-3" />
        <div className="h-6 w-5/6 bg-[#161616] mb-2" />
        <div className="h-4 w-full bg-[#161616] mb-1" />
        <div className="h-4 w-4/6 bg-[#161616]" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
        <div className="h-3 w-20 bg-[#161616]" />
        <div className="h-3 w-12 bg-[#161616]" />
      </div>
    </div>
  );
};

export const ArticleSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-3 w-24 bg-[#161616] mx-auto mb-6" />
      <div className="h-10 w-4/5 bg-[#161616] mx-auto mb-4" />
      <div className="h-5 w-3/5 bg-[#161616] mx-auto mb-8" />
      <div className="h-96 w-full bg-[#161616] mb-12" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-[#161616]" />
        <div className="h-4 w-full bg-[#161616]" />
        <div className="h-4 w-5/6 bg-[#161616]" />
        <div className="h-4 w-4/6 bg-[#161616]" />
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-6 py-12 animate-pulse">
      <div className="w-20 h-20 bg-[#161616] mx-auto mb-6" />
      <div className="h-7 w-40 bg-[#161616] mx-auto mb-3" />
      <div className="h-4 w-56 bg-[#161616] mx-auto mb-8" />
      <div className="bg-[#0a0a0a] border border-[#222] p-6 space-y-4">
        <div className="h-12 bg-[#161616]" />
        <div className="h-24 bg-[#161616]" />
      </div>
    </div>
  );
};
