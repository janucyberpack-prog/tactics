import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { CardSkeleton } from '../components/Skeletons';
import { SEO } from '../components/SEO';
import { subscribeToPublishedPosts } from '../services/posts';
import { subscribeNewsletter } from '../services/interactions';
import { useToast } from '../components/Toast';
import { Post } from '../types';
import { X, BookOpen, PenLine, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { showToast } = useToast();

  // Active Tool Modal state
  const [activeToolModal, setActiveToolModal] = useState<'guide' | 'journal' | 'toolkit' | null>(null);

  // Journal tool state
  const [journalNote, setJournalNote] = useState('');
  const [journalPromptIndex, setJournalPromptIndex] = useState(0);

  const JOURNAL_PROMPTS = [
    'What belief did I protect today that may actually be holding me back?',
    'Where in my day did I mistake temporary discomfort for a genuine emergency?',
    'What is one situation where I can practice responding rather than reacting?',
    'What standard am I holding myself to that I would never demand of a friend?'
  ];

  // Subscribe to live Firestore published posts in real time
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPublishedPosts(
      (livePosts) => {
        setPosts(livePosts);
        setLoading(false);
      },
      (error) => {
        console.warn('Live posts sync warning:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    try {
      const res = await subscribeNewsletter(email);
      showToast(res.message, 'success');
      setEmail('');
    } catch (err: any) {
      showToast(err.message || "You are subscribed to Mental Tactic.", 'info');
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  // Get top 3 articles directly from live Firestore collection (no mock data)
  const featuredArticles = useMemo(() => {
    return posts.slice(0, 3);
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f1f0ed]">
      <SEO
        title="Mental Tactic — Understand the Mind"
        description="Explore human behavior, psychological patterns, and practical tools for clearer thinking and personal growth."
      />

      {/* 1. HERO SECTION (Split Screen) */}
      <section className="border-b border-[#252525] relative overflow-hidden scroll-mt-20" id="home">
        <div className="site-container min-h-[420px] lg:min-h-[576px] grid grid-cols-1 lg:grid-cols-[47%_53%] items-stretch">
          {/* Left Narrative Column */}
          <div className="relative z-10 flex flex-col justify-start pt-10 lg:pt-[76px] pb-6 lg:pb-8 pr-0 lg:pr-12">
            {/* Red Eyebrow Text with Accent Line */}
            <p className="flex items-center gap-3 text-[#ce354b] text-[10px] font-bold tracking-[0.26em] uppercase mb-5">
              <span className="w-[34px] h-[1px] bg-[#b51f35] inline-block shrink-0" aria-hidden="true" />
              <span>The science of self</span>
            </p>

            {/* Oversized Serif Headline */}
            <h1 className="max-w-[740px] m-0 font-serif text-[clamp(52px,5.1vw,84px)] font-normal tracking-[-0.02em] leading-[0.94] uppercase text-[#f1f0ed]">
              Understand the mind. <em className="text-[#9b9a96] italic font-normal">Master</em> yourself.
            </h1>

            {/* Concise Description */}
            <p className="max-w-[515px] mt-6 text-[#999895] text-[15px] font-light tracking-[0.015em] leading-[1.75]">
              Explore human behavior, psychological patterns, and practical tools for clearer thinking and personal growth.
            </p>

            {/* Dual Actions */}
            <div className="flex flex-wrap items-center gap-7 mt-8">
              <a
                href="#articles"
                className="inline-flex items-center justify-center min-h-[49px] px-7 border border-[#b51f35] text-white text-[10px] font-bold tracking-[0.19em] uppercase hover:bg-[#b51f35] transition-all duration-200"
              >
                Explore articles
              </a>
              <a
                href="#tools"
                className="inline-flex items-center gap-3 text-[#d2d1ce] hover:text-white text-[10px] font-bold tracking-[0.18em] uppercase group transition-colors"
              >
                <span className="w-[31px] h-[31px] rounded-full border border-[#343434] group-hover:border-[#b51f35] grid place-items-center transition-all group-hover:translate-x-1">
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="m3 2 6 4-6 4V2Z" fill="currentColor" />
                  </svg>
                </span>
                Discover tools
              </a>
            </div>
          </div>

          {/* Right Visual Column (Monochrome Sculpture + Crimson Light) */}
          <div className="relative min-w-0 min-h-[420px] lg:min-h-[576px] bg-[#080808] overflow-hidden">
            {/* Shading scrims */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, #050505 0%, transparent 24%), linear-gradient(0deg, rgba(5,5,5,0.82) 0%, transparent 32%), radial-gradient(circle at 72% 42%, transparent 12%, rgba(0, 0, 0, 0.3) 72%)'
              }}
            />

            {/* Subtle crimson laser lighting line */}
            <div
              className="absolute z-20 top-[14%] right-[8%] w-[1px] h-[40%]"
              style={{
                background: 'linear-gradient(#b51f35, transparent)',
                boxShadow: '0 0 24px rgba(181, 31, 53, 0.7)'
              }}
            />

            {/* Classical Sculpture Image */}
            <img
              src="https://images.unsplash.com/photo-1583769929769-48339ffd75e8?auto=format&fit=crop&w=1400&q=88"
              alt="Dramatically lit classical sculpture"
              className="w-full h-full object-cover object-[53%_38%] filter grayscale contrast-[1.16] brightness-[0.71] scale-[1.015]"
            />

            {/* Vertically arranged sequence words */}
            <div
              className="absolute z-30 top-1/2 right-[23px] flex items-center gap-5 text-white/50 text-[8px] font-semibold tracking-[0.35em] uppercase select-none pointer-events-none"
              style={{
                transform: 'translateY(-50%) rotate(90deg) translateX(50%)',
                transformOrigin: 'right center'
              }}
              aria-hidden="true"
            >
              <span>Observe</span>
              <i className="w-[26px] h-[1px] bg-white/30 not-italic inline-block" />
              <span>Understand</span>
              <i className="w-[26px] h-[1px] bg-white/30 not-italic inline-block" />
              <span>Grow</span>
            </div>

            {/* Figure label */}
            <span className="absolute z-30 right-[7%] bottom-[31px] text-white/40 font-serif italic text-[11px] tracking-[0.15em] select-none">
              Fig. 01 / The Self
            </span>
          </div>
        </div>
      </section>

      {/* 2. MAIN EDITORIAL CONTENT (Articles on Left + Resources on Right) */}
      <section className="py-24 lg:py-28 scroll-mt-20 border-b border-[#252525]" id="articles">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3.25fr)_minmax(270px,1fr)] gap-12 lg:gap-0">
            {/* Left Column: Featured Articles (Wide) */}
            <div className="min-w-0 pr-0 lg:pr-12">
              {/* Header */}
              <div className="flex items-end justify-between mb-8 pb-1">
                <div>
                  <span className="block mb-2.5 text-[#ce354b] text-[9px] font-bold tracking-[0.24em] uppercase">
                    Selected reading
                  </span>
                  <h2 className="m-0 font-serif text-[clamp(32px,3vw,47px)] font-normal tracking-[-0.01em] text-[#f1f0ed]">
                    Latest Insights
                  </h2>
                </div>
                <Link
                  to="/journal"
                  className="inline-flex items-center gap-2 pb-1.5 border-b border-[#393939] hover:border-[#b51f35] text-[#aaa] hover:text-white text-[9px] font-bold tracking-[0.18em] uppercase transition-colors"
                >
                  View all <span>→</span>
                </Link>
              </div>

              {/* Articles Grid / Live Data */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : featuredArticles.length > 0 ? (
                <div className={`grid grid-cols-1 ${featuredArticles.length === 1 ? 'sm:grid-cols-1 max-w-md' : featuredArticles.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-5`}>
                  {featuredArticles.map((article, idx) => (
                    <ArticleCard key={article.id} post={article} index={idx + 1} />
                  ))}
                </div>
              ) : (
                <div className="border border-[#222] bg-[#090909] p-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#b51f35] uppercase block mb-1">
                      Editorial Desk
                    </span>
                    <h3 className="font-serif text-xl text-white font-normal m-0 mb-1">
                      No published articles in Firestore yet.
                    </h3>
                    <p className="text-xs text-[#888] m-0">
                      Articles published in the Editorial Studio will appear here live in real-time.
                    </p>
                  </div>
                  <Link
                    to="/admin/articles/new"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#333] hover:border-[#b51f35] text-white text-[10px] font-bold tracking-[0.16em] uppercase transition-colors shrink-0"
                  >
                    Open CMS Desk
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Premium Resources (Narrower, Vertical Hairline Divider) */}
            <aside className="pl-0 lg:pl-11 border-t lg:border-t-0 lg:border-l border-[#252525] pt-10 lg:pt-0 scroll-mt-20" id="tools">
              <div>
                <span className="block mb-2 text-[#ce354b] text-[9px] font-bold tracking-[0.24em] uppercase">
                  Premium resources
                </span>
                <h2 className="m-0 font-serif text-[clamp(28px,2.2vw,38px)] font-normal text-[#f1f0ed]">
                  Tools for Your Mind
                </h2>
              </div>

              {/* 3 Resource Items */}
              <div className="grid grid-cols-1 gap-3 mt-8">
                {/* Resource 1 */}
                <button
                  type="button"
                  onClick={() => setActiveToolModal('guide')}
                  className="text-left grid grid-cols-[82px_1fr] gap-5 min-h-[112px] p-3 border border-[#252525] bg-[#090909] hover:bg-[#0d0d0d] hover:border-[#4c2027] transition-all group cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-[#171717]">
                    <img
                      src="https://images.unsplash.com/photo-1588318073352-d650b19fc7e0?auto=format&fit=crop&w=400&q=80"
                      alt="Psychology Guide"
                      className="w-full h-full object-cover filter grayscale brightness-50 contrast-125 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-2 border border-white/25 pointer-events-none" />
                  </div>
                  <div className="self-center min-w-0">
                    <span className="text-[#b51f35] text-[7px] font-bold tracking-[0.2em] uppercase block">
                      Digital field guide
                    </span>
                    <h3 className="m-0 mt-1.5 mb-2 font-serif text-[18px] font-normal text-[#f1f0ed] group-hover:text-white transition-colors">
                      Psychology Guide
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[#747472] group-hover:text-[#c9c8c4] text-[8px] font-semibold tracking-[0.14em] uppercase">
                      Explore resource <b className="font-normal">→</b>
                    </span>
                  </div>
                </button>

                {/* Resource 2 */}
                <button
                  type="button"
                  onClick={() => setActiveToolModal('journal')}
                  className="text-left grid grid-cols-[82px_1fr] gap-5 min-h-[112px] p-3 border border-[#252525] bg-[#090909] hover:bg-[#0d0d0d] hover:border-[#4c2027] transition-all group cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-[#171717]">
                    <img
                      src="https://images.unsplash.com/photo-1552912140-6b3c254f5214?auto=format&fit=crop&w=400&q=80"
                      alt="Reflection Journal"
                      className="w-full h-full object-cover filter grayscale brightness-50 contrast-125 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-2 border border-white/25 pointer-events-none" />
                  </div>
                  <div className="self-center min-w-0">
                    <span className="text-[#b51f35] text-[7px] font-bold tracking-[0.2em] uppercase block">
                      Guided workbook
                    </span>
                    <h3 className="m-0 mt-1.5 mb-2 font-serif text-[18px] font-normal text-[#f1f0ed] group-hover:text-white transition-colors">
                      Reflection Journal
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[#747472] group-hover:text-[#c9c8c4] text-[8px] font-semibold tracking-[0.14em] uppercase">
                      Explore resource <b className="font-normal">→</b>
                    </span>
                  </div>
                </button>

                {/* Resource 3 */}
                <button
                  type="button"
                  onClick={() => setActiveToolModal('toolkit')}
                  className="text-left grid grid-cols-[82px_1fr] gap-5 min-h-[112px] p-3 border border-[#252525] bg-[#090909] hover:bg-[#0d0d0d] hover:border-[#4c2027] transition-all group cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-[#171717]">
                    <img
                      src="https://images.unsplash.com/photo-1512580770426-cbed71c40e94?auto=format&fit=crop&w=400&q=80"
                      alt="Mindset Toolkit"
                      className="w-full h-full object-cover filter grayscale brightness-50 contrast-125 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-2 border border-white/25 pointer-events-none" />
                  </div>
                  <div className="self-center min-w-0">
                    <span className="text-[#b51f35] text-[7px] font-bold tracking-[0.2em] uppercase block">
                      Methods & models
                    </span>
                    <h3 className="m-0 mt-1.5 mb-2 font-serif text-[18px] font-normal text-[#f1f0ed] group-hover:text-white transition-colors">
                      Mindset Toolkit
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[#747472] group-hover:text-[#c9c8c4] text-[8px] font-semibold tracking-[0.14em] uppercase">
                      Explore resource <b className="font-normal">→</b>
                    </span>
                  </div>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 3. FEATURE STRIP (Four Minimalist Features with Vertical Separators) */}
      <section className="bg-[#070707] border-b border-[#252525] scroll-mt-20" id="features" aria-label="Key features">
        <div className="site-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="grid grid-cols-[38px_1fr] gap-4 min-h-[137px] p-[35px_30px] border-b sm:border-b-0 border-r border-[#252525] border-l lg:border-l border-[#252525] items-start">
              <div className="w-[34px] h-[34px] grid place-items-center text-[#c2c1bd]">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M11 16.5l3 3 7-8M16 2v3M16 27v3M2 16h3M27 16h3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <div>
                <h3 className="m-0 text-[10px] font-bold tracking-[0.15em] leading-[1.35] uppercase text-[#f1f0ed]">
                  Evidence-Informed Insights
                </h3>
                <p className="mt-1.5 text-[11px] text-[#686866] leading-[1.55]">
                  Ideas grounded in psychological research.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-[38px_1fr] gap-4 min-h-[137px] p-[35px_30px] border-b sm:border-b-0 border-r border-[#252525] items-start">
              <div className="w-[34px] h-[34px] grid place-items-center text-[#c2c1bd]">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M7 25 22.5 9.5l-3-3L4 22v3h3ZM18 8l3 3M17 24h11M17 19h7" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <div>
                <h3 className="m-0 text-[10px] font-bold tracking-[0.15em] leading-[1.35] uppercase text-[#f1f0ed]">
                  Practical Tools
                </h3>
                <p className="mt-1.5 text-[11px] text-[#686866] leading-[1.55]">
                  Frameworks designed for everyday life.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-[38px_1fr] gap-4 min-h-[137px] p-[35px_30px] border-b sm:border-b-0 border-r border-[#252525] items-start">
              <div className="w-[34px] h-[34px] grid place-items-center text-[#c2c1bd]">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <rect x="7" y="14" width="18" height="14" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M11 14V9a5 5 0 0 1 10 0v5M16 19v5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <div>
                <h3 className="m-0 text-[10px] font-bold tracking-[0.15em] leading-[1.35] uppercase text-[#f1f0ed]">
                  Private & Personal
                </h3>
                <p className="mt-1.5 text-[11px] text-[#686866] leading-[1.55]">
                  Your inner work remains entirely yours.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid grid-cols-[38px_1fr] gap-4 min-h-[137px] p-[35px_30px] border-r border-[#252525] items-start">
              <div className="w-[34px] h-[34px] grid place-items-center text-[#c2c1bd]">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M5 7.5c6-2 9 .3 11 3.5 2-3.2 5-5.5 11-3.5V25c-6-2-9 .3-11 3.5C14 25.3 11 23 5 25V7.5Z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M16 11v17" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <div>
                <h3 className="m-0 text-[10px] font-bold tracking-[0.15em] leading-[1.35] uppercase text-[#f1f0ed]">
                  Lifetime Learning
                </h3>
                <p className="mt-1.5 text-[11px] text-[#686866] leading-[1.55]">
                  A growing library for continued discovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUOTE BAND */}
      <section
        className="border-y border-[#252525] bg-[#080808] scroll-mt-20"
        style={{
          background: 'linear-gradient(90deg, rgba(181, 31, 53, 0.07), transparent 30%), #080808'
        }}
        id="about"
      >
        <div className="site-container">
          <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_170px] items-center min-h-[217px] py-10 gap-6">
            <span className="text-[#b51f35] text-[9px] font-bold tracking-[0.22em] uppercase">
              A thought to keep
            </span>
            <blockquote className="m-0 max-w-[790px] font-serif text-[clamp(24px,2.5vw,37px)] italic leading-[1.3] text-[#f1f0ed]">
              “Until you make the unconscious conscious, it will direct your life and you will call it fate.”
            </blockquote>
            <span className="hidden md:block justify-self-end text-[#212121] font-serif text-[120px] leading-[0.6] select-none" aria-hidden="true">
              ”
            </span>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER DISPATCH (Dark Luxury Aesthetic) */}
      <section className="py-24 border-b border-[#1f1f1f] bg-[#060606]" id="dispatch">
        <div className="site-container max-w-4xl mx-auto">
          <div className="border border-[#222] bg-[#0a0a0a] p-10 sm:p-14 relative overflow-hidden">
            {/* Subtle crimson accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b51f35] to-transparent" />

            <div className="text-center max-w-xl mx-auto space-y-4">
              <span className="text-[9px] font-bold tracking-[0.26em] text-[#ce354b] uppercase">
                Fortnightly Dispatch
              </span>
              <h2 className="font-serif text-[clamp(28px,3vw,42px)] font-normal text-white m-0">
                Sharper insights for your mental model.
              </h2>
              <p className="text-[#888] text-sm font-light leading-relaxed">
                Bi-weekly reflections on behavioral neuroscience, psychological cognitive frameworks, and practical mental tactics. Never spam.
              </p>

              <form onSubmit={handleSubscribe} className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-[#121212] border border-[#2a2a2a] focus:border-[#b51f35] text-white text-xs px-4 py-3.5 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-colors shrink-0 disabled:opacity-50"
                >
                  {subscribing ? 'Sending...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TOOL MODAL 1: Psychology Guide */}
      {activeToolModal === 'guide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#262626] p-7 sm:p-9 max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200">
            <button
              onClick={() => setActiveToolModal(null)}
              className="absolute top-6 right-6 text-[#777] hover:text-white"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[9px] font-bold tracking-[0.24em] text-[#ce354b] uppercase">
              Digital Field Guide
            </span>
            <h2 className="font-serif text-3xl font-normal text-white mt-1 mb-4">
              Core Psychology Architecture
            </h2>
            <p className="text-xs text-[#888] leading-relaxed mb-6">
              Essential mental mechanisms to identify, unpack, and master in daily high-stakes decision making.
            </p>

            <div className="space-y-4">
              <div className="p-4 border border-[#202020] bg-[#0e0e0e]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ce354b] mb-1">
                  01. The Default Mode Network (DMN)
                </h4>
                <p className="text-xs text-[#ccc] leading-relaxed m-0">
                  When not focused on an external task, the brain defaults to self-referential narratives, rumination, and past/future simulations. Deliberate sensory grounding disengages hyperactivity here.
                </p>
              </div>

              <div className="p-4 border border-[#202020] bg-[#0e0e0e]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ce354b] mb-1">
                  02. Cognitive Cognitive Reframing
                </h4>
                <p className="text-xs text-[#ccc] leading-relaxed m-0">
                  Separating raw sensory data from emotional interpretation. Asking: <em>"What objective evidence supports this reaction, and what alternative hypothesis fits equally well?"</em>
                </p>
              </div>

              <div className="p-4 border border-[#202020] bg-[#0e0e0e]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ce354b] mb-1">
                  03. The Internal Locus of Control
                </h4>
                <p className="text-xs text-[#ccc] leading-relaxed m-0">
                  Focusing nervous energy strictly on agency (deliberate effort, interpretation, ethical conduct) rather than exogenous outcomes (market reaction, opinions of peers).
                </p>
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-[#202020] flex justify-end">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-6 py-2.5 border border-[#333] hover:border-[#b51f35] text-xs uppercase tracking-wider font-bold text-white transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOOL MODAL 2: Reflection Journal */}
      {activeToolModal === 'journal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#262626] p-7 sm:p-9 max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200">
            <button
              onClick={() => setActiveToolModal(null)}
              className="absolute top-6 right-6 text-[#777] hover:text-white"
              aria-label="Close workbook"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[9px] font-bold tracking-[0.24em] text-[#ce354b] uppercase">
              Guided Workbook
            </span>
            <h2 className="font-serif text-3xl font-normal text-white mt-1 mb-2">
              Reflection Journal
            </h2>
            <p className="text-xs text-[#888] leading-relaxed mb-5">
              An unhurried space for private inquiry. Note down clear thoughts; entries remain strictly on your local device.
            </p>

            {/* Prompt Selector */}
            <div className="p-4 border border-[#222] bg-[#0e0e0e] mb-4">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#ce354b] mb-2">
                <span>Inquiry Prompt #{journalPromptIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => setJournalPromptIndex((journalPromptIndex + 1) % JOURNAL_PROMPTS.length)}
                  className="hover:text-white underline text-[9px]"
                >
                  Shuffle Prompt →
                </button>
              </div>
              <p className="font-serif italic text-base text-[#f1f0ed] m-0">
                "{JOURNAL_PROMPTS[journalPromptIndex]}"
              </p>
            </div>

            {/* Textarea */}
            <textarea
              rows={6}
              value={journalNote}
              onChange={e => setJournalNote(e.target.value)}
              placeholder="Record your observations here with honesty..."
              className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-[#b51f35] text-white text-sm p-4 outline-none resize-none leading-relaxed"
            />

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[10px] text-[#666]">
                {journalNote.length} characters written
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(journalNote);
                    showToast('Journal notes copied to clipboard.', 'success');
                  }}
                  disabled={!journalNote.trim()}
                  className="px-4 py-2 border border-[#333] hover:border-[#b51f35] text-xs uppercase tracking-wider font-bold text-white transition-colors disabled:opacity-30"
                >
                  Copy Notes
                </button>
                <button
                  onClick={() => setActiveToolModal(null)}
                  className="px-5 py-2 bg-[#b51f35] hover:bg-[#ce354b] text-xs uppercase tracking-wider font-bold text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOOL MODAL 3: Mindset Toolkit */}
      {activeToolModal === 'toolkit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#262626] p-7 sm:p-9 max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200">
            <button
              onClick={() => setActiveToolModal(null)}
              className="absolute top-6 right-6 text-[#777] hover:text-white"
              aria-label="Close toolkit"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[9px] font-bold tracking-[0.24em] text-[#ce354b] uppercase">
              Methods & Models
            </span>
            <h2 className="font-serif text-3xl font-normal text-white mt-1 mb-2">
              Mental Tactic Models
            </h2>
            <p className="text-xs text-[#888] leading-relaxed mb-6">
              Applied heuristics to stress-test your thinking during complexity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-[#222] bg-[#0e0e0e]">
                <span className="text-[8px] font-bold tracking-widest text-[#ce354b] uppercase block">
                  Model A
                </span>
                <h4 className="font-serif text-base text-white mt-1 mb-2 font-normal">
                  Inversion (Jacobi's Rule)
                </h4>
                <p className="text-xs text-[#999] leading-relaxed m-0">
                  Instead of asking "How do I succeed?", ask "What behaviors guarantee failure?" Eliminate them systematically.
                </p>
              </div>

              <div className="p-4 border border-[#222] bg-[#0e0e0e]">
                <span className="text-[8px] font-bold tracking-widest text-[#ce354b] uppercase block">
                  Model B
                </span>
                <h4 className="font-serif text-base text-white mt-1 mb-2 font-normal">
                  First-Principles Reduction
                </h4>
                <p className="text-xs text-[#999] leading-relaxed m-0">
                  Strip a challenge down to its rawest, undeniable physics. Rebuild your conclusion upwards without analogies.
                </p>
              </div>

              <div className="p-4 border border-[#222] bg-[#0e0e0e]">
                <span className="text-[8px] font-bold tracking-widest text-[#ce354b] uppercase block">
                  Model C
                </span>
                <h4 className="font-serif text-base text-white mt-1 mb-2 font-normal">
                  Second-Order Thinking
                </h4>
                <p className="text-xs text-[#999] leading-relaxed m-0">
                  Always ask: <em>"And then what?"</em> Short-term immediate relief frequently breeds medium-term compounding debt.
                </p>
              </div>

              <div className="p-4 border border-[#222] bg-[#0e0e0e]">
                <span className="text-[8px] font-bold tracking-widest text-[#ce354b] uppercase block">
                  Model D
                </span>
                <h4 className="font-serif text-base text-white mt-1 mb-2 font-normal">
                  4-7-8 Physiological Reset
                </h4>
                <p className="text-xs text-[#999] leading-relaxed m-0">
                  Inhale for 4 seconds, hold for 7, slow audible exhale for 8. Engages parasympathetic tone in under two minutes.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#202020] flex justify-end">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-6 py-2.5 border border-[#333] hover:border-[#b51f35] text-xs uppercase tracking-wider font-bold text-white transition-colors"
              >
                Close Toolkit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
