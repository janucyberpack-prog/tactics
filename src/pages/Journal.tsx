import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { CardSkeleton } from '../components/Skeletons';
import { SEO } from '../components/SEO';
import { subscribeToPublishedPosts } from '../services/posts';
import { Post } from '../types';

const CATEGORIES = [
  'All notes',
  'Rest & Renewal',
  'Mindfulness',
  'Emotional Agility',
  'Neuroscience',
  'Daily Rituals',
  'Behavior',
  'Mental Strength'
];

export const Journal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All notes';
  const queryParam = searchParams.get('search') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Live real-time Firestore synchronization for Journal
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPublishedPosts(
      (livePosts) => {
        setPosts(livePosts);
        setLoading(false);
      },
      (err) => {
        console.warn('Journal real-time sync warning:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All notes' || cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const isAll = selectedCategory === 'All notes' || selectedCategory === 'All';
      const matchesCategory =
        isAll ||
        post.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        post.tags?.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase()));

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen py-16 md:py-24 bg-[#050505] text-[#f1f0ed]">
      <SEO
        title="Journal Archive — Mental Tactic"
        description="Browse essays and mental tactics on human behavior, social psychology, and cognitive resilience."
      />

      <div className="site-container">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="flex items-center gap-3 text-[#ce354b] text-[10px] font-bold tracking-[0.26em] uppercase mb-4">
            <span className="w-8 h-[1px] bg-[#b51f35] inline-block" />
            <span>Selected Writing</span>
          </p>
          <h1 className="font-serif text-[clamp(44px,5.5vw,78px)] font-normal text-white uppercase tracking-tight m-0 leading-[0.94]">
            The Journal <em className="text-[#999895] italic font-normal">Archive.</em>
          </h1>
          <p className="mt-5 text-[#888] text-sm font-light leading-relaxed max-w-lg">
            Evidence-informed inquiries into the human condition. Frameworks, observations, and principles for navigating modern complexity.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-14 p-6 bg-[#090909] border border-[#222] flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between">
          {/* Search Field */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search concepts, behaviors, keywords..."
              className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-11 pr-10 py-3 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors shrink-0 border ${
                    active
                      ? 'bg-[#b51f35] border-[#b51f35] text-white'
                      : 'border-[#262626] text-[#888] hover:text-white hover:border-[#444] bg-[#0c0c0c]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#222] bg-[#080808]">
            <p className="text-sm text-[#777] mb-4">No matching articles found in this category.</p>
            <button
              onClick={() => {
                setSelectedCategory('All notes');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 border border-[#b51f35] text-[#ce354b] text-[10px] uppercase font-bold tracking-widest hover:bg-[#b51f35] hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <ArticleCard key={post.id} post={post} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
