import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit3,
  Trash2,
  Globe,
  EyeOff,
  Search,
  ExternalLink,
  Copy,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  getAllPostsAdmin,
  subscribeToAllPostsAdmin,
  deletePost,
  deleteMultiplePosts,
  updatePost,
  duplicatePost,
  bulkUpdateStatus
} from '../../services/posts';
import { Post, PostStatus } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

const CATEGORIES = [
  'All',
  'Mindfulness',
  'Rest & Renewal',
  'Emotional Agility',
  'Neuroscience',
  'Daily Rituals'
];

export const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Deletion modal states
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Duplicating state
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Multi-selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { showToast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPostsAdmin();
      setPosts(data);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load articles from Firestore.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllPostsAdmin(
      (livePosts) => {
        setPosts(livePosts);
        setLoading(false);
      },
      (err) => {
        console.error('Real-time admin sync error, falling back to manual fetch:', err);
        fetchPosts();
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTogglePublish = async (post: Post) => {
    const nextStatus: PostStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, { status: nextStatus });
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, status: nextStatus } : p)));
      showToast(`Article status updated to ${nextStatus}.`, 'success');
    } catch (err) {
      showToast('Unable to update article status.', 'error');
    }
  };

  // Single post deletion
  const handleDeleteSingle = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deletePost(postToDelete.id);
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      setSelectedIds(prev => prev.filter(id => id !== postToDelete.id));
      showToast(`"${postToDelete.title}" was permanently deleted.`, 'info');
      setPostToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      showToast('Failed to delete article. Check permissions.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk post deletion
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await deleteMultiplePosts(selectedIds);
      const count = selectedIds.length;
      setPosts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      showToast(`${count} article${count > 1 ? 's' : ''} permanently deleted.`, 'info');
    } catch (err: any) {
      console.error('Failed to bulk delete posts:', err);
      showToast('Failed to delete selected articles.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk status update
  const handleBulkStatusChange = async (targetStatus: PostStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateStatus(selectedIds, targetStatus);
      setPosts(prev =>
        prev.map(p => (selectedIds.includes(p.id) ? { ...p, status: targetStatus } : p))
      );
      showToast(`Updated ${selectedIds.length} article(s) to ${targetStatus}.`, 'success');
      setSelectedIds([]);
    } catch (err) {
      showToast('Failed to update articles.', 'error');
    }
  };

  // Duplicate post
  const handleDuplicate = async (post: Post) => {
    setDuplicatingId(post.id);
    try {
      await duplicatePost(post.id);
      await fetchPosts();
      showToast(`Created duplicate of "${post.title}".`, 'success');
    } catch (err) {
      showToast('Failed to duplicate article.', 'error');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Filter logic
  const filtered = posts.filter(post => {
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || post.category === categoryFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query) ||
      (post.authorName && post.authorName.toLowerCase().includes(query));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Checkbox helpers
  const allFilteredSelected =
    filtered.length > 0 && filtered.every(p => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.some(f => f.id === id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...filtered.map(p => p.id)]));
      setSelectedIds(newIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO
          title="Articles & Essays — Mental Tactic CMS"
          description="Manage all journal entries, publication states, and drafts."
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
                Journal Articles
              </h1>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Manage, edit, publish, duplicate, or delete your articles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPosts}
                disabled={loading}
                title="Refresh Articles List"
                className="p-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
              </button>

              <Link
                to="/admin/articles/new"
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Article</span>
              </Link>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, slug, category, or author..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Category Dropdown & Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
                {(['all', 'published', 'draft', 'archived'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors capitalize ${
                      statusFilter === status
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-[#0e0e0e] border border-zinc-800 text-[#f1f0ed] rounded-2xl px-5 py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedIds.length}
                </span>
                <span>article{selectedIds.length > 1 ? 's' : ''} selected</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkStatusChange('published')}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-red-400" />
                  <span>Publish</span>
                </button>
                <button
                  onClick={() => handleBulkStatusChange('draft')}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Unpublish</span>
                </button>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Articles Table */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-zinc-500 animate-pulse">
                Fetching journal collection...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <p className="text-sm font-serif text-zinc-300">
                  No articles found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setCategoryFilter('All');
                  }}
                  className="px-4 py-2 rounded-full border border-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="pb-4 w-10">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-zinc-500 hover:text-zinc-200 transition-colors"
                          title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                        >
                          {allFilteredSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="pb-4 font-semibold">Article</th>
                      <th className="pb-4 font-semibold">Category</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Reading Time</th>
                      <th className="pb-4 font-semibold">Author</th>
                      <th className="pb-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filtered.map(post => {
                      const isSelected = selectedIds.includes(post.id);
                      return (
                        <tr
                          key={post.id}
                          className={`hover:bg-zinc-900/60 transition-colors ${
                            isSelected ? 'bg-zinc-900/80' : ''
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-4 pr-3">
                            <button
                              type="button"
                              onClick={() => toggleSelectOne(post.id)}
                              className="text-zinc-500 hover:text-zinc-200 transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-red-500" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Article Info */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-800"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-zinc-200 truncate max-w-sm sm:max-w-md">
                                  {post.title}
                                </div>
                                <div className="text-[11px] text-zinc-500 truncate">
                                  /journal/{post.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 pr-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {post.category}
                            </span>
                          </td>

                          {/* Status toggle */}
                          <td className="py-4 pr-4">
                            <button
                              onClick={() => handleTogglePublish(post)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                                post.status === 'published'
                                  ? 'bg-red-950/60 text-red-400 border border-red-900/50 hover:bg-red-900/60'
                                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                              }`}
                              title="Click to toggle status"
                            >
                              {post.status === 'published' ? (
                                <Globe className="w-3 h-3 text-red-400" />
                              ) : (
                                <EyeOff className="w-3 h-3 text-zinc-500" />
                              )}
                              <span>{post.status}</span>
                            </button>
                          </td>

                          {/* Reading time */}
                          <td className="py-4 pr-4 text-xs text-zinc-500">
                            {post.readingTime} min
                          </td>

                          {/* Author */}
                          <td className="py-4 pr-4 text-xs text-zinc-500 truncate max-w-[120px]">
                            {post.authorName || 'Elena Vance'}
                          </td>

                          {/* Actions */}
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View live */}
                              <Link
                                to={`/journal/${post.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                                title="View Live Article"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(post)}
                                disabled={duplicatingId === post.id}
                                className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                                title="Duplicate Article"
                              >
                                <Copy
                                  className={`w-4 h-4 ${
                                    duplicatingId === post.id ? 'animate-spin text-red-500' : ''
                                  }`}
                                />
                              </button>

                              {/* Edit */}
                              <Link
                                to={`/admin/articles/${post.id}/edit`}
                                className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-200 transition-colors"
                                title="Edit Article"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>

                              {/* Delete */}
                              <button
                                onClick={() => setPostToDelete(post)}
                                className="p-1.5 rounded-full hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-colors"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Single Delete Confirmation Modal */}
          {postToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
              <div className="bg-[#0e0e0e] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-900/50">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-zinc-100">Delete Reflection?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-zinc-200">"{postToDelete.title}"</span>?
                  </p>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  This will remove the article and all associated data from Cloud Firestore. This action cannot be reversed.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => setPostToDelete(null)}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDeleteSingle}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {showBulkDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
              <div className="bg-[#0e0e0e] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-900/50">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-zinc-100">
                    Delete {selectedIds.length} Articles?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    This will permanently delete the {selectedIds.length} selected articles from Cloud Firestore.
                  </p>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  This operation cannot be undone. All selected articles will be removed from both public viewing and the admin studio.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    disabled={isBulkDeleting}
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isBulkDeleting}
                    onClick={handleBulkDelete}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isBulkDeleting
                        ? 'Deleting...'
                        : `Delete ${selectedIds.length} Article${selectedIds.length > 1 ? 's' : ''}`}
                    </span>
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
