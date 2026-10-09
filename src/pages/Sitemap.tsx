import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FolderTree,
  ExternalLink,
  Download,
  Copy,
  Check,
  Globe,
  Code2,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { subscribeToPublishedPosts, INITIAL_SEED_POSTS } from '../services/posts';
import { buildDynamicSitemapXml, downloadSitemap, STATIC_SITEMAP_ROUTES, SITE_DOMAIN } from '../utils/sitemap';
import { Post } from '../types';

export const Sitemap: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'xml'>('directory');
  const [copied, setCopied] = useState(false);

  const fallbackPosts: Post[] = useMemo(() => {
    return INITIAL_SEED_POSTS.map((seed) => ({
      id: seed.slug,
      ...seed,
      createdAt: null as any,
      updatedAt: null as any,
      publishedAt: null as any
    }));
  }, []);

  // Subscribe to live Firestore published articles with fallback to initial seed
  useEffect(() => {
    const unsubscribe = subscribeToPublishedPosts(
      (livePosts) => {
        if (livePosts && livePosts.length > 0) {
          setPosts(livePosts);
        } else {
          setPosts(fallbackPosts);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Sitemap live sync fallback:', err);
        setPosts(fallbackPosts);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fallbackPosts]);

  // Ensure full catalog is represented
  const allPosts = useMemo(() => {
    if (posts.length >= 9) return posts;
    const combined = [...posts];
    const existingSlugs = new Set(combined.map((p) => p.slug));
    for (const seed of fallbackPosts) {
      if (!existingSlugs.has(seed.slug)) {
        combined.push(seed);
      }
    }
    return combined;
  }, [posts, fallbackPosts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    allPosts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allPosts]);

  // Build current dynamic XML representation
  const xmlString = useMemo(() => {
    return buildDynamicSitemapXml(allPosts);
  }, [allPosts]);

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(xmlString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy XML:', e);
    }
  };

  const handleDownload = () => {
    downloadSitemap(allPosts);
  };

  const formatDate = (val: any) => {
    if (!val) return 'Daily';
    if (val.toDate && typeof val.toDate === 'function') {
      return val.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return 'Daily';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f1f0ed] pb-24">
      <SEO
        title="Sitemap & Site Architecture — Mental Tactic"
        description="Comprehensive index and directory of all articles, cognitive guides, research papers, and static resources published on Mental Tactic."
        url={`${SITE_DOMAIN}/sitemap`}
      />

      {/* Hero Header */}
      <section className="pt-28 pb-14 border-b border-[#1c1c1c] bg-[#070707]">
        <div className="site-container">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161616] border border-[#262626] text-[10px] uppercase font-mono tracking-wider text-[#b51f35] mb-4">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Google Search Index & Site Architecture</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#f1f0ed] mb-4 leading-tight">
              Sitemap & Directory
            </h1>
            <p className="text-sm sm:text-base text-[#929290] leading-relaxed max-w-2xl">
              An authoritative, structured index of all published research, cognitive frameworks,
              and public pages on Mental Tactic. Updated continuously for readers and search crawlers.
            </p>
          </div>

          {/* Quick Metrics & Links Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1e1e1e]">
              <span className="text-[10px] uppercase tracking-wider text-[#727270] block font-mono">
                Indexed Articles
              </span>
              <span className="text-xl font-serif text-[#f1f0ed] mt-1 block">
                {loading ? '...' : allPosts.length}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1e1e1e]">
              <span className="text-[10px] uppercase tracking-wider text-[#727270] block font-mono">
                Core Routes
              </span>
              <span className="text-xl font-serif text-[#f1f0ed] mt-1 block">
                {STATIC_SITEMAP_ROUTES.length}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1e1e1e]">
              <span className="text-[10px] uppercase tracking-wider text-[#727270] block font-mono">
                Crawl Frequency
              </span>
              <span className="text-xl font-serif text-[#f1f0ed] mt-1 block">
                Daily
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1e1e1e]">
              <span className="text-[10px] uppercase tracking-wider text-[#727270] block font-mono">
                Google Indexing
              </span>
              <span className="text-xl font-serif text-emerald-400 mt-1 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Active
              </span>
            </div>
          </div>

          {/* Action Feeds & View Switcher */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#1a1a1a]">
            {/* View Selector Tabs */}
            <div className="inline-flex p-1 bg-[#121212] rounded-lg border border-[#222222]">
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'directory'
                    ? 'bg-[#1f1f1f] text-[#f1f0ed] shadow-sm'
                    : 'text-[#828280] hover:text-[#f1f0ed]'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Visual Directory</span>
              </button>
              <button
                onClick={() => setActiveTab('xml')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'xml'
                    ? 'bg-[#1f1f1f] text-[#f1f0ed] shadow-sm'
                    : 'text-[#828280] hover:text-[#f1f0ed]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw XML Feed</span>
              </button>
            </div>

            {/* Direct Crawler Links & Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#a1a1a0] hover:text-[#f1f0ed] bg-[#101010] hover:bg-[#181818] border border-[#222222] rounded-md transition-colors"
                title="Direct link to XML Sitemap"
              >
                <Globe className="w-3 h-3 text-[#b51f35]" />
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#a1a1a0] hover:text-[#f1f0ed] bg-[#101010] hover:bg-[#181818] border border-[#222222] rounded-md transition-colors"
                title="Search Crawler Directives"
              >
                <FileText className="w-3 h-3" />
                <span>/robots.txt</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <button
                onClick={handleCopyXml}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#a1a1a0] hover:text-[#f1f0ed] bg-[#101010] hover:bg-[#181818] border border-[#222222] rounded-md transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#b51f35] hover:bg-[#cf253e] rounded-md shadow transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Download .xml</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pt-10">
        <div className="site-container">
          {activeTab === 'directory' ? (
            <div className="space-y-12">
              {/* 1. Core Pages Section */}
              <div>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#1b1b1b]">
                  <h2 className="font-serif text-lg text-[#f1f0ed] font-medium">Core Platform Routes</h2>
                  <span className="text-[11px] font-mono text-[#727270] uppercase">
                    5 Primary Entry Points
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Link
                    to="/"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1b1b1b] hover:border-[#b51f35]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#b51f35]">Priority: 1.0</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">Home</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        Main gateway, curated featured essays, interactive cognitive tools, and newsletter.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/</span>
                  </Link>

                  <Link
                    to="/journal"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1b1b1b] hover:border-[#b51f35]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#b51f35]">Priority: 0.9</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">Journal & Research Index</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        Complete searchable archive of evidence-informed articles and mental models.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/journal</span>
                  </Link>

                  <Link
                    to="/about"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1b1b1b] hover:border-[#b51f35]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#727270]">Priority: 0.6</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">About & Mission</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        The editorial philosophy, peer-reviewed commitment, and cognitive doctrine.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/about</span>
                  </Link>

                  <Link
                    to="/contact"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1b1b1b] hover:border-[#b51f35]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#727270]">Priority: 0.5</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">Contact & Inquiries</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        Direct communication channel for readers, academic feedback, and collaborations.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/contact</span>
                  </Link>

                  <Link
                    to="/saved"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1b1b1b] hover:border-[#b51f35]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#727270]">Priority: 0.4</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">Saved Articles</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        Personal offline reading list and saved cognitive frameworks.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/saved</span>
                  </Link>

                  <Link
                    to="/sitemap"
                    className="p-4 rounded-xl bg-[#0b0b0b] border border-[#b51f35]/30 hover:border-[#b51f35] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#b51f35]">Priority: 0.7</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#f1f0ed] transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm text-[#f1f0ed] mb-1">Sitemap (Current)</h3>
                      <p className="text-xs text-[#80807e] line-clamp-2">
                        Structured directory, Google indexing status, and XML machine feed.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#555] mt-3 block">/sitemap</span>
                  </Link>
                </div>
              </div>

              {/* 2. Research Categories */}
              <div>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#1b1b1b]">
                  <h2 className="font-serif text-lg text-[#f1f0ed] font-medium">Category Hubs</h2>
                  <span className="text-[11px] font-mono text-[#727270] uppercase">
                    Topic Collections
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/journal?category=${encodeURIComponent(cat)}`}
                      className="px-3.5 py-2 rounded-lg bg-[#0e0e0e] border border-[#202020] hover:border-[#b51f35] transition-colors text-xs text-[#c2c2c0] hover:text-white flex items-center gap-2 group"
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono text-[#666] group-hover:text-[#b51f35] transition-colors">
                        ({allPosts.filter((p) => p.category === cat).length})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. Published Articles Complete Listing */}
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#1b1b1b]">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-lg text-[#f1f0ed] font-medium">All Published Articles</h2>
                    <span className="text-[11px] font-mono text-[#727270] uppercase">
                      Updated Daily ({allPosts.length} Entries)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline-block">
                    ● Canonical XML Synced
                  </span>
                </div>

                <div className="divide-y divide-[#151515] border border-[#1b1b1b] rounded-xl overflow-hidden bg-[#090909]">
                  {allPosts.map((post, index) => {
                    const slug = post.slug || post.id;
                    const dateStr = formatDate(post.publishedAt || post.createdAt);
                    return (
                      <div
                        key={post.id || post.slug || index}
                        className="p-4 sm:p-5 hover:bg-[#0e0e0e] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#b51f35] bg-[#b51f35]/10 px-2 py-0.5 rounded">
                              {post.category || 'Mindfulness'}
                            </span>
                            <span className="text-[11px] font-mono text-[#666] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dateStr}
                            </span>
                            {post.readingTime && (
                              <span className="text-[11px] font-mono text-[#666] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readingTime} min read
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/journal/${slug}`}
                            className="font-serif text-sm sm:text-base text-[#e5e5e3] group-hover:text-[#b51f35] transition-colors font-medium block"
                          >
                            {post.title}
                          </Link>

                          {post.excerpt && (
                            <p className="text-xs text-[#7e7e7c] line-clamp-1 mt-1">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                          <span className="text-[11px] font-mono text-[#555] hidden md:inline-block">
                            /journal/{slug}
                          </span>
                          <Link
                            to={`/journal/${slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#202020] border border-[#222] text-xs text-[#cfcecb] hover:text-white transition-colors"
                          >
                            <span>Read</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* XML Code Feed View */
            <div className="rounded-xl border border-[#222222] bg-[#090909] overflow-hidden">
              <div className="px-4 py-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-xs text-[#888] ml-2">
                    sitemap.xml (Googlebot Compliant Schema 0.9)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyXml}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#aaa] hover:text-white bg-[#181818] rounded border border-[#2a2a2a] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-white bg-[#b51f35] hover:bg-[#cf253e] rounded transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
                <pre className="font-mono text-xs leading-relaxed text-[#c4c4c2] whitespace-pre">
                  {xmlString}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
