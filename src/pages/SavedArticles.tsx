import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedPosts, removeSavedPost } from '../services/posts';
import { SavedPost } from '../types';
import { useToast } from '../components/Toast';
import { SEO } from '../components/SEO';
import { CardSkeleton } from '../components/Skeletons';

export const SavedArticles: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSaved = async () => {
      setLoading(true);
      try {
        const data = await getSavedPosts(user.uid);
        setSavedPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user, navigate]);

  const handleRemove = async (postId: string, title: string) => {
    if (!user) return;
    try {
      await removeSavedPost(user.uid, postId);
      setSavedPosts(savedPosts.filter(p => p.postId !== postId));
      showToast(`Removed "${title}" from saved.`, 'info');
    } catch (err) {
      showToast('Unable to remove article.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] py-16 md:py-24 text-[#f1f0ed]">
      <SEO title="Saved Articles — Mental Tactic" description="Your saved articles and mental tactics." />

      <div className="site-container">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#ce354b] mb-3">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Collection</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white font-normal uppercase tracking-tight m-0">
            Saved Articles
          </h1>
          <p className="mt-4 text-[#888] text-sm font-light leading-relaxed">
            Your personal archive of selected reading and practical models.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-24 bg-[#090909] border border-[#222]">
            <Bookmark className="w-8 h-8 text-[#555] mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-white font-normal mb-2">No Saved Articles Yet</h3>
            <p className="text-xs text-[#888] max-w-sm mx-auto mb-6">
              When an essay or tactic catches your eye, tap the bookmark icon to keep it here for quiet review.
            </p>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#b51f35] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#b51f35] transition-colors"
            >
              Browse Articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((item, idx) => (
              <article
                key={item.id}
                className="bg-[#0a0a0a] border border-[#222] hover:border-[#b51f35] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[1.16/1] overflow-hidden bg-[#121212]">
                    <img
                      src={item.postCoverImage}
                      alt={item.postTitle}
                      className="w-full h-full object-cover filter grayscale contrast-110 brightness-75"
                    />
                    <button
                      onClick={() => handleRemove(item.postId, item.postTitle)}
                      className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-[#b51f35] text-white border border-white/20 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <span className="text-[8px] font-bold tracking-widest uppercase text-[#ce354b]">
                      {item.postCategory}
                    </span>
                    <Link to={`/journal/${item.postSlug}`} className="block mt-2">
                      <h3 className="font-serif text-xl text-white font-normal hover:text-[#ce354b] transition-colors line-clamp-2">
                        {item.postTitle}
                      </h3>
                    </Link>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#1a1a1a] flex justify-between items-center text-[9px] uppercase tracking-wider text-[#777]">
                  <span>Saved</span>
                  <Link
                    to={`/journal/${item.postSlug}`}
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#ce354b] font-bold"
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
