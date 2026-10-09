import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Mail,
  MessageSquare,
  Plus,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
  TrendingUp,
  Globe,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { getAllPostsAdmin, deletePost } from '../../services/posts';
import { getAllUsers } from '../../services/auth';
import { getAllSubscribers, getAllContactMessages } from '../../services/interactions';
import { Post, UserProfile, NewsletterSubscription, ContactMessage } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminOverview: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [postsData, usersData, subsData, msgsData] = await Promise.all([
          getAllPostsAdmin().catch(() => []),
          getAllUsers().catch(() => []),
          getAllSubscribers().catch(() => []),
          getAllContactMessages().catch(() => [])
        ]);
        setPosts(postsData);
        setUsers(usersData);
        setSubscribers(subsData);
        setMessages(msgsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deletePost(postToDelete.id);
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      showToast(`"${postToDelete.title}" permanently deleted.`, 'info');
      setPostToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete article. Check permissions.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title="Editorial Studio — Dashboard" description="Mental Tactic CMS overview and publishing metrics." />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-red-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
                Editorial Studio
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-xl leading-relaxed">
                Publish articles, manage reader subscriptions, review correspondence, and oversee site content.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/articles/new"
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Write Article</span>
              </Link>
              <Link
                to="/"
                target="_blank"
                className="px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              to="/admin/articles"
              className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-[11px] text-zinc-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
              <div>
                <div className="text-3xl font-serif text-zinc-100">{posts.length}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Articles</div>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80 flex items-center justify-between">
                <span>{publishedCount} Published</span>
                <span>{draftCount} Drafts</span>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                  <Users className="w-5 h-5 text-zinc-300" />
                </div>
                <span className="text-[11px] text-zinc-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
              <div>
                <div className="text-3xl font-serif text-zinc-100">{users.length}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Users & Members</div>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                Registered profiles
              </div>
            </Link>

            <Link
              to="/admin/subscribers"
              className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                  <Mail className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-[11px] text-zinc-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
              <div>
                <div className="text-3xl font-serif text-zinc-100">{subscribers.length}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Subscribers</div>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                Newsletter readership
              </div>
            </Link>

            <Link
              to="/admin/messages"
              className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                  <MessageSquare className="w-5 h-5 text-zinc-300" />
                </div>
                {unreadMessagesCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                    {unreadMessagesCount} New
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-semibold">View →</span>
                )}
              </div>
              <div>
                <div className="text-3xl font-serif text-zinc-100">{messages.length}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Inquiries</div>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                {unreadMessagesCount} awaiting response
              </div>
            </Link>
          </div>

          {/* Quick Shortcuts & Database Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-2xl text-zinc-100">Recent Articles</h3>
                  <p className="text-xs text-zinc-500">Recently published and pending drafts</p>
                </div>
                <Link
                  to="/admin/articles"
                  className="text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <span>All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-500 animate-pulse">
                  Loading editorial data...
                </div>
              ) : posts.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-xs text-zinc-500">No articles found in collection.</p>
                  <Link
                    to="/admin/articles/new"
                    className="inline-block px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider"
                  >
                    Draft First Article
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {posts.slice(0, 5).map((post) => (
                        <tr key={post.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-800"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-zinc-200 max-w-xs truncate">{post.title}</div>
                                <div className="text-[11px] text-zinc-500 truncate">/journal/{post.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              post.status === 'published'
                                ? 'bg-red-950/60 text-red-400 border border-red-900/50'
                                : 'bg-zinc-900 text-zinc-500'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-3">
                            <Link
                              to={`/admin/articles/${post.id}/edit`}
                              className="text-xs font-semibold text-zinc-300 hover:text-white underline"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/journal/${post.slug}`}
                              target="_blank"
                              className="text-xs text-zinc-500 hover:text-zinc-300"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => setPostToDelete(post)}
                              className="text-xs text-red-400 hover:text-red-300 underline"
                              title="Delete reflection"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions & System Info */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 space-y-4">
                <h4 className="font-serif text-lg text-zinc-100">Editorial Shortcuts</h4>
                <div className="space-y-2">
                  <Link
                    to="/admin/articles/new"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-red-400" />
                      <span>Create New Article</span>
                    </div>
                    <span className="text-zinc-500">→</span>
                  </Link>

                  <Link
                    to="/admin/users"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span>Manage Roles & Permissions</span>
                    </div>
                    <span className="text-zinc-500">→</span>
                  </Link>

                  <Link
                    to="/admin/subscribers"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span>Export Subscriber List</span>
                    </div>
                    <span className="text-zinc-500">→</span>
                  </Link>

                  <Link
                    to="/admin/settings"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" />
                      <span>Admin Security & Password</span>
                    </div>
                    <span className="text-zinc-500">→</span>
                  </Link>
                </div>
              </div>

              {/* Database & Cloud Health */}
              <div className="bg-[#0e0e0e] text-[#f1f0ed] rounded-2xl p-6 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-400" />
                    <span className="font-serif text-base text-zinc-200">Firebase Cloud Status</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-400 font-sans">
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">Project</span>
                    <span className="font-mono text-[11px] text-zinc-300">mental-tactic-65c43</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">Database</span>
                    <span>Cloud Firestore</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Auth Engine</span>
                    <span>Firebase Auth (RBAC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Reflection Modal */}
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
                  This will remove the article from Cloud Firestore permanently.
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
                    onClick={handleDeletePost}
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
