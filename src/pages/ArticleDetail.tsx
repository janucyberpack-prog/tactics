import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Bookmark, Share2, ArrowLeft, ArrowRight, MessageSquare, Trash2, Copy, Check, Send } from 'lucide-react';
import { SEO } from '../components/SEO';
import { ArticleSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getPostBySlug, getPublishedPosts, savePost, removeSavedPost, isPostSaved } from '../services/posts';
import { getCommentsForPost, addComment, deleteComment } from '../services/comments';
import { Post, Comment } from '../types';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await getPostBySlug(slug);
        setPost(found);

        const list = await getPublishedPosts();
        setAllPosts(list);

        if (found) {
          const coms = await getCommentsForPost(found.id);
          setComments(coms);

          if (user) {
            const hasSaved = await isPostSaved(user.uid, found.id);
            setSaved(hasSaved);
          }
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, user]);

  const handleToggleSave = async () => {
    if (!user || !post) {
      showToast('Please sign in to bookmark articles.', 'info');
      return;
    }

    try {
      if (saved) {
        await removeSavedPost(user.uid, post.id);
        setSaved(false);
        showToast('Removed from saved.', 'info');
      } else {
        await savePost(user.uid, post);
        setSaved(true);
        showToast('Saved to your collection.', 'success');
      }
    } catch (err) {
      showToast('Failed to update bookmark.', 'error');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    showToast('Link copied to clipboard.', 'info');
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !post || !newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const commentId = await addComment(post.id, newComment, profile);
      const newCommentObj: Comment = {
        id: commentId,
        postId: post.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      showToast('Reflection shared.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Unable to post reflection.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      showToast('Reflection removed.', 'info');
    } catch (err) {
      showToast('Unable to remove reflection.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-[#050505]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center bg-[#050505] text-[#f1f0ed]">
        <div className="max-w-md space-y-4">
          <h2 className="font-serif text-3xl font-normal">Article Not Found</h2>
          <p className="text-sm text-[#888]">
            This note may have moved or does not exist in the collection.
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#b51f35] text-white text-xs uppercase font-bold tracking-widest hover:bg-[#b51f35] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to articles
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article className="min-h-screen py-12 md:py-20 bg-[#050505] text-[#f1f0ed]">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />

      <div className="site-container max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#888] hover:text-[#ce354b] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6 text-center mb-14">
          <span className="inline-block text-[9px] font-bold tracking-[0.26em] uppercase text-[#ce354b]">
            {post.category || 'Behavior'}
          </span>

          <h1 className="font-serif text-[clamp(36px,5vw,66px)] font-normal text-white uppercase tracking-tight m-0 max-w-3xl mx-auto leading-[0.98]">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-[#999] leading-relaxed max-w-2xl mx-auto font-light">
            {post.excerpt}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between pt-6 border-t border-[#222] text-[10px] font-semibold tracking-wider text-[#777] uppercase">
            <div className="flex items-center gap-3">
              <span className="text-[#bbb]">{post.authorName || 'Mental Tactic'}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#ce354b]" />
                {post.readingTime} min read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSave}
                aria-label="Save note"
                className={`p-2 border border-[#262626] transition-colors ${
                  saved ? 'bg-[#b51f35] border-[#b51f35] text-white' : 'text-[#888] hover:text-white hover:border-[#b51f35]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                aria-label="Share article"
                className="p-2 border border-[#262626] text-[#888] hover:text-white hover:border-[#b51f35] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Artwork */}
        <div className="relative overflow-hidden mb-14 border border-[#222] bg-[#0c0c0c] max-h-[520px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover filter grayscale contrast-110 brightness-75"
          />
        </div>

        {/* Article Body */}
        <div className="max-w-2xl mx-auto">
          <div className="text-[16px] sm:text-[17px] leading-[1.85] text-[#ccc] space-y-7 font-light">
            {post.content.split('\n\n').map((paragraph, idx) => {
              // Markdown image: ![caption](url)
              const imgMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (imgMatch) {
                const caption = imgMatch[1];
                const src = imgMatch[2];
                return (
                  <figure key={idx} className="my-10 border border-[#262626] bg-[#090909] overflow-hidden">
                    <img
                      src={src}
                      alt={caption || post.title}
                      className="w-full max-h-[500px] object-cover filter grayscale contrast-110"
                      loading="lazy"
                    />
                    {caption && (
                      <figcaption className="text-center text-xs text-[#777] py-3 px-4 font-serif italic border-t border-[#1f1f1f]">
                        {caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-serif text-2xl sm:text-3xl font-normal text-white pt-6 m-0">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }

              if (paragraph.startsWith('* ') || paragraph.startsWith('1. ')) {
                const lines = paragraph.split('\n');
                return (
                  <ul key={idx} className="pl-6 border-l border-[#b51f35] my-6 space-y-2.5">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="text-[#bbb]">
                        {line.replace(/^(\* |\d+\. )/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              return <p key={idx} className="m-0">{paragraph}</p>;
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 mt-12 border-t border-[#222]">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 border border-[#262626] text-[9px] uppercase tracking-widest font-bold text-[#888] bg-[#0c0c0c]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-[#282828] p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222]">
                <h4 className="font-serif text-lg font-normal text-white m-0">Share Article</h4>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-xs text-[#888] hover:text-white uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-3.5 bg-[#121212] border border-[#262626] hover:border-[#b51f35] text-xs font-semibold text-white uppercase tracking-wider transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-[#ce354b]" /> Copy link
                  </span>
                  {shareCopied && <Check className="w-3.5 h-3.5 text-[#ce354b]" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prev & Next Article Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-14 py-8 border-y border-[#222] max-w-2xl mx-auto">
          {prevPost ? (
            <Link
              to={`/journal/${prevPost.slug}`}
              className="p-5 border border-[#222] bg-[#090909] hover:border-[#b51f35] transition-colors block group"
            >
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#ce354b] mb-1">
                ← Previous
              </div>
              <div className="font-serif text-base text-[#f1f0ed] group-hover:text-white line-clamp-1">
                {prevPost.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPost && (
            <Link
              to={`/journal/${nextPost.slug}`}
              className="p-5 border border-[#222] bg-[#090909] hover:border-[#b51f35] transition-colors text-right block group"
            >
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#ce354b] mb-1">
                Next →
              </div>
              <div className="font-serif text-base text-[#f1f0ed] group-hover:text-white line-clamp-1">
                {nextPost.title}
              </div>
            </Link>
          )}
        </div>

        {/* Reflections / Comments Section */}
        <section className="pt-4 space-y-6 max-w-2xl mx-auto">
          <h3 className="font-serif text-2xl font-normal text-white flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-[#ce354b]" />
            <span>Reflections ({comments.length})</span>
          </h3>

          {user ? (
            <form onSubmit={handleAddComment} className="p-6 bg-[#090909] border border-[#222] space-y-4">
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your perspective or reflection..."
                className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs p-3.5 outline-none resize-none leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="px-6 py-2.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40"
                >
                  Post Reflection
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-[#090909] border border-[#222] text-center">
              <p className="text-xs text-[#888] mb-3">Sign in to leave a reflection on this article.</p>
              <Link
                to="/login"
                className="px-5 py-2 border border-[#b51f35] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#b51f35] transition-colors inline-block"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 bg-[#090909] border border-[#1f1f1f]">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-semibold text-[#f1f0ed]">{comment.authorName}</span>
                  {(user?.uid === comment.authorId || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[#888] hover:text-[#ce354b] transition-colors"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="m-0 text-xs text-[#aaa] leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
};
