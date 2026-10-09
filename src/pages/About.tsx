import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Shield, Heart, Sparkles, Feather } from 'lucide-react';
import { SEO } from '../components/SEO';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] py-16 md:py-24 text-[#f1f0ed]">
      <SEO
        title="Origins & Philosophy — Mental Tactic"
        description="The philosophy, ethics, and psychological architecture behind Mental Tactic."
      />

      <div className="site-container max-w-4xl mx-auto space-y-16">
        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.26em] text-[#ce354b]">
            <span className="w-8 h-[1px] bg-[#b51f35] inline-block" />
            Origins & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white font-normal leading-[1.05] uppercase tracking-tight">
            An antidote to the synthetic noise of the mind.
          </h1>
          <p className="text-base sm:text-lg text-[#999] leading-relaxed font-light pt-2">
            Modern interfaces are optimized to hijack cognitive attention. Mental Tactic is engineered to return autonomy, quiet discernment, and inner mastery.
          </p>
        </div>

        {/* Feature Image */}
        <div className="overflow-hidden border border-[#222] h-80 sm:h-96 bg-[#0a0a0a]">
          <img
            src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1400&q=80"
            alt="Misty quiet pines"
            className="w-full h-full object-cover filter grayscale brightness-75 contrast-110"
          />
        </div>

        {/* Longform Editorial Essay */}
        <div className="space-y-8 text-base sm:text-lg leading-[1.85] text-[#ccc] font-light">
          <p>
            We did not start Mental Tactic as another wellness brand peddling superficial fixes. We started it because we watched ourselves and the people we respect drowning in micro-interruptions, synthetic urgency, and chronic low-grade nervous system exhaustion.
          </p>

          <blockquote className="my-8 p-6 sm:p-8 bg-[#0a0a0a] border-l-2 border-[#b51f35] font-serif text-2xl text-white font-normal italic leading-snug">
            "Until you make the unconscious conscious, it will direct your life and you will call it fate."
          </blockquote>

          <h2 className="font-serif text-3xl font-normal text-white pt-4">
            The Three Foundational Principles
          </h2>

          <div className="space-y-6 pt-2">
            <div className="p-6 bg-[#090909] border border-[#222] space-y-2">
              <h3 className="font-serif text-xl text-white font-normal">1. Non-Extractive Design</h3>
              <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
                No algorithmic dopamine loops, no red notification badges designed to mimic neurological threat, and zero gamification of your stillness. When you finish reading an insight, we encourage you to step away and live deliberately.
              </p>
            </div>

            <div className="p-6 bg-[#090909] border border-[#222] space-y-2">
              <h3 className="font-serif text-xl text-white font-normal">2. Grounded Evidence over Pop Theories</h3>
              <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
                Every mental model must be anchored in behavioral neuroscience, evolutionary psychology, or enduring stoic philosophy that stands the test of real adversity.
              </p>
            </div>

            <div className="p-6 bg-[#090909] border border-[#222] space-y-2">
              <h3 className="font-serif text-xl text-white font-normal">3. Sovereign Sovereignty</h3>
              <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
                Your private reflections and journals belong entirely to you. Your inner journey is sacred ground, never user telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-10 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-xs uppercase tracking-widest text-[#777]">
            Ready to explore our work?
          </span>
          <Link
            to="/journal"
            className="px-7 py-3.5 border border-[#b51f35] text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#b51f35] transition-colors"
          >
            Explore the Journal
          </Link>
        </div>
      </div>
    </div>
  );
};
