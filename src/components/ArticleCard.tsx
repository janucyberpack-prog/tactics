import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { savePost, removeSavedPost } from '../services/posts';
import { useToast } from './Toast';

interface ArticleCardProps {
  post: Post;
  index?: number;
  isInitiallySaved?: boolean;
  onSavedChange?: (postId: string, saved: boolean) => void;
  compact?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  index = 1,
  isInitiallySaved = false,
  onSavedChange,
  compact = false
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [savingLoading, setSavingLoading] = useState(false);

  const formattedIndex = String(index).padStart(2, '0');
  const defaultCover = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80";
  const displayCover = post.coverImage || defaultCover;
  const postUrl = `/journal/${post.slug || post.id}`;

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to bookmark articles.', 'info');
      return;
    }

    setSavingLoading(true);
    try {
      if (isSaved) {
        await removeSavedPost(user.uid, post.id);
        setIsSaved(false);
        showToast('Removed from saved.', 'info');
        onSavedChange?.(post.id, false);
      } else {
        await savePost(user.uid, post);
        setIsSaved(true);
        showToast('Saved to your collection.', 'success');
        onSavedChange?.(post.id, true);
      }
    } catch (err) {
      console.error(err);
      showToast('Unable to update bookmark.', 'error');
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <article className="group min-w-0 bg-[#0a0a0a] border-b border-[#292929] hover:border-[#b51f35] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <Link to={postUrl} className="block">
        {/* Cinematic Grayscale Cover Image */}
        <div className={`relative ${compact ? 'aspect-[16/10]' : 'aspect-[1.16/1]'} overflow-hidden bg-[#111111]`}>
          <img
            src={displayCover}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover filter grayscale contrast-[1.17] brightness-[0.66] group-hover:grayscale-[0.8] group-hover:brightness-[0.76] group-hover:scale-105 transition-all duration-700 ease-out"
          />
          {/* Subtle bottom shadow vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

          {/* Editorial Index Number */}
          <span className="absolute right-4 bottom-3 z-10 font-serif italic text-[11px] text-white/50">
            {formattedIndex}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleSave}
            disabled={savingLoading}
            aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-none border border-white/20 flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-[#b51f35] border-[#b51f35] text-white'
                : 'bg-black/60 text-white/70 hover:text-white hover:border-[#b51f35]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content Box */}
        <div className={`${compact ? 'p-4 sm:p-4.5 pb-3.5 min-h-[135px]' : 'p-6 pb-5 min-h-[190px]'} flex flex-col flex-1 justify-between`}>
          <div>
            <span className="text-[8px] font-bold tracking-[0.23em] text-[#c92b42] uppercase block">
              {post.category || 'Mindset'}
            </span>
            <h3 className={`${compact ? 'font-serif text-[16px] sm:text-[18px] text-[#f1f0ed] group-hover:text-white font-normal leading-[1.24] mt-2 mb-3 line-clamp-2 transition-colors' : 'font-serif text-[clamp(19px,1.55vw,25px)] text-[#f1f0ed] group-hover:text-white font-normal leading-[1.18] mt-3.5 mb-5 line-clamp-2 transition-colors'}`}>
              {post.title}
            </h3>
          </div>

          {/* Meta footer row */}
          <div className={`${compact ? 'pt-2.5' : 'pt-3.5'} border-t border-[#212121] flex items-center justify-between text-[8px] font-semibold tracking-[0.15em] text-[#6f6f6c] uppercase`}>
            <span>{post.readingTime || 7} min read</span>
            <svg
              className="w-3.5 h-3.5 text-[#6f6f6c] group-hover:text-[#ce354b] transition-colors"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
};
