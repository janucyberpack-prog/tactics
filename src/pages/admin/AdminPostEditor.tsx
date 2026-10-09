import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Sparkles,
  Check,
  Clock,
  Trash2,
  AlertTriangle,
  Upload,
  HardDrive,
  Loader2,
  Plus
} from 'lucide-react';
import { createPost, updatePost, getPostById, deletePost } from '../../services/posts';
import { uploadPostImageToFirestore } from '../../services/media';
import { Post, PostStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PostImageUploader } from '../../components/admin/PostImageUploader';
import { SEO } from '../../components/SEO';

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80"
];

const CATEGORIES = [
  'Mindfulness',
  'Rest & Renewal',
  'Emotional Agility',
  'Neuroscience',
  'Daily Rituals'
];

export const AdminPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0]);
  const [status, setStatus] = useState<PostStatus>('published');
  const [featured, setFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(4);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const [isInlineUploading, setIsInlineUploading] = useState(false);

  // Helper to insert markdown image directly into essay content
  const handleInsertIntoContent = (markdownImg: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + markdownImg + content.substring(end);
      setContent(newContent);
      const words = newContent.trim().split(/\s+/).length;
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
    } else {
      const newContent = content ? `${content}\n\n${markdownImg}` : markdownImg;
      setContent(newContent);
      const words = newContent.trim().split(/\s+/).length;
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
    }
  };

  const handleInlineDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInlineUploading(true);
    try {
      const savedMedia = await uploadPostImageToFirestore(file, {
        postId: id,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        userId: user?.uid,
        userEmail: user?.email || undefined
      });

      const markdownImg = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${savedMedia.dataUrl})\n\n`;
      handleInsertIntoContent(markdownImg);
      showToast(`Image "${file.name}" saved to Firestore & inserted into essay body!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to upload image.', 'error');
    } finally {
      setIsInlineUploading(false);
      if (inlineFileInputRef.current) {
        inlineFileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const post = await getPostById(id);
          if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt);
            setContent(post.content);
            setCategory(post.category);
            setTagsInput(post.tags ? post.tags.join(', ') : '');
            setCoverImage(post.coverImage);
            setStatus(post.status);
            setFeatured(post.featured);
            setReadingTime(post.readingTime);
          }
        } catch (err) {
          showToast('Failed to load article for editing.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isEditing]);

  // Auto generate slug from title if new
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Recalculate reading time on content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const words = val.trim().split(/\s+/).length;
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      showToast('Please provide a title, URL slug, and article content.', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setLoading(true);
    try {
      if (isEditing && id) {
        await updatePost(id, {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          tags,
          coverImage,
          status,
          featured,
          readingTime
        });
        showToast('Article updated and saved to Firestore.', 'success');
      } else {
        await createPost({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          tags,
          coverImage,
          authorId: user?.uid || 'editorial',
          authorName: profile?.displayName || 'Elena Vance',
          authorPhoto: profile?.photoURL || '',
          status,
          featured,
          readingTime
        });
        showToast('New article published to Firestore collection.', 'success');
      }
      navigate('/admin/articles');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error saving article to Firestore.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deletePost(id);
      showToast('Article permanently deleted from Firestore.', 'info');
      navigate('/admin/articles');
    } catch (err: any) {
      console.error('Delete post error:', err);
      showToast('Failed to delete article. Check permissions.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title={isEditing ? 'Edit Article — CMS' : 'Write Article — CMS'} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="space-y-1">
              <Link
                to="/admin/articles"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Articles</span>
              </Link>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal">
                {isEditing ? 'Edit Article' : 'Compose Article'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-full border border-red-900/60 bg-red-950/60 text-xs font-semibold text-red-400 hover:bg-red-900/80 transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Permanently delete this article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>{previewMode ? 'Editor Mode' : 'Live Preview'}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Article'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Mode */}
          {previewMode ? (
            <div className="bg-[#0a0a0a] rounded-2xl p-8 sm:p-14 border border-zinc-800 shadow-sm max-w-3xl mx-auto space-y-8">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-red-950/60 text-red-400 border border-red-900/50">
                  {category}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime} min read
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl text-zinc-100 leading-tight">
                {title || 'Untitled Article'}
              </h1>
              {excerpt && (
                <p className="text-lg text-zinc-300 leading-relaxed italic border-l-2 border-red-600 pl-4">
                  {excerpt}
                </p>
              )}
              {coverImage && (
                <div className="w-full h-80 rounded-xl overflow-hidden border border-zinc-800">
                  <img src={coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-6 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans">
                {(content || 'Article content will appear here...').split('\n\n').map((para, idx) => {
                  const imgMatch = para.match(/^!\[(.*?)\]\((.*?)\)$/);
                  if (imgMatch) {
                    return (
                      <figure key={idx} className="my-6 rounded-xl overflow-hidden border border-zinc-800 bg-[#0e0e0e]">
                        <img src={imgMatch[2]} alt={imgMatch[1] || ''} className="w-full max-h-96 object-cover" />
                        {imgMatch[1] && (
                          <figcaption className="text-center text-xs text-zinc-500 py-2 px-4 italic">
                            {imgMatch[1]}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  if (para.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="font-serif text-2xl text-zinc-100 pt-2">
                        {para.replace('### ', '')}
                      </h3>
                    );
                  }
                  return <p key={idx}>{para}</p>;
                })}
              </div>
            </div>
          ) : (
            /* Form Mode */
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area (2 cols) */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Article Title
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Master the Mind and Overcome Noise"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-100 placeholder-zinc-500 font-serif focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        URL Slug
                      </label>
                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-500">
                        <span>/journal/</span>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="bg-transparent text-zinc-100 font-medium focus:outline-none w-full ml-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Excerpt / Summary
                      </label>
                      <textarea
                        rows={3}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="A concise hook that previews this article in cards and feeds..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Hidden inline device file input */}
                    <input
                      type="file"
                      ref={inlineFileInputRef}
                      onChange={handleInlineDeviceUpload}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Full Article Body
                        </label>
                        <button
                          type="button"
                          disabled={isInlineUploading}
                          onClick={() => inlineFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-800 transition-colors"
                          title="Choose an image from device storage and save to Firestore"
                        >
                          {isInlineUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                              <span>Saving to Firestore...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-red-500" />
                              <span>Add Image from Device</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        required
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Write your article here. Paragraph breaks are formatted automatically for readers..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 font-sans leading-relaxed"
                      />
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>Images uploaded from device storage are compressed and stored directly in Cloud Firestore.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Settings (1 col) */}
                <div className="space-y-6">
                  <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 shadow-sm space-y-5">
                    <h3 className="font-serif text-lg text-zinc-100">Publication Settings</h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as PostStatus)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Estimated Reading Time (min)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={readingTime}
                        onChange={(e) => setReadingTime(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Clarity, Mind, Focus, Psychology"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-zinc-900 border-zinc-700"
                      />
                      <label htmlFor="featured" className="text-xs font-medium text-zinc-300">
                        Feature on Homepage Grid
                      </label>
                    </div>
                  </div>

                  {/* Device Storage & Firestore Cover Artwork Selector */}
                  <PostImageUploader
                    currentCoverImage={coverImage}
                    onSelectCoverImage={setCoverImage}
                    onInsertIntoContent={handleInsertIntoContent}
                    presetImages={PRESET_IMAGES}
                    postId={id}
                  />
                </div>
              </div>
            </form>
          )}

          {/* Delete Article Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
              <div className="bg-[#0e0e0e] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-900/50">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-zinc-100">Delete Article?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-zinc-200">"{title || 'this article'}"</span>?
                  </p>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  This will remove the article from your Cloud Firestore database and take down its public URL. This action cannot be reversed.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
