import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Globe,
  FileCode2,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changeAdminPassword, resetPassword, BOOTSTRAP_ADMIN_EMAIL } from '../../services/auth';
import { seedInitialPostsIfEmpty, getPublishedPosts } from '../../services/posts';
import { buildDynamicSitemapXml, downloadSitemap, SITE_DOMAIN } from '../../utils/sitemap';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);

  const handleDownloadLiveSitemap = async () => {
    setSitemapLoading(true);
    try {
      const posts = await getPublishedPosts();
      downloadSitemap(posts);
      showToast('Live sitemap.xml generated and downloaded.', 'success');
    } catch (err: any) {
      showToast('Failed to generate live sitemap.', 'error');
    } finally {
      setSitemapLoading(false);
    }
  };

  const handleCopySitemapXml = async () => {
    try {
      const posts = await getPublishedPosts();
      const xml = buildDynamicSitemapXml(posts);
      await navigator.clipboard.writeText(xml);
      setCopiedXml(true);
      showToast('Dynamic sitemap XML copied to clipboard.', 'success');
      setTimeout(() => setCopiedXml(false), 2500);
    } catch {
      showToast('Could not copy XML.', 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await changeAdminPassword(newPassword);
      showToast('Administrator password updated successfully via Firebase Auth.', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        showToast('Please re-login to verify identity before updating password.', 'error');
      } else {
        showToast(err.message || 'Failed to update administrator password.', 'error');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setResetEmailSent(true);
      showToast(`Password reset link dispatched to ${user.email}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email.', 'error');
    }
  };

  const handleSeedArticles = async () => {
    setSeedLoading(true);
    try {
      await seedInitialPostsIfEmpty();
      showToast('Database verified. Articles active in Firestore.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Unable to seed articles.', 'error');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title="Admin Settings & Security — Mental Tactic" description="Administrator authentication, password management, and database tools." />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Header */}
          <div className="pb-6 border-b border-zinc-800">
            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
              Settings & Security
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Manage administrator authentication, credentials, and platform infrastructure.
            </p>
          </div>

          {/* Administrator Profile Card */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-zinc-100">Administrator Profile</h3>
                <p className="text-xs text-zinc-500">Authenticated Firebase Administrator</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Administrator Email
                </div>
                <div className="font-mono text-xs text-zinc-200 font-semibold truncate">
                  {user?.email || BOOTSTRAP_ADMIN_EMAIL}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Role Authorization
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-900">
                    {profile?.role || 'admin'}
                  </span>
                  <span className="text-xs text-zinc-400">Full Superuser Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form (Secure Firebase Auth) */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-red-400" />
                <h3 className="font-serif text-xl text-zinc-100">Change Administrator Password</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Update your administrator password through Firebase Authentication's secure encryption flow.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Updating Password...' : 'Save New Password'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="px-4 py-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Send Reset Link to Email
                </button>
              </div>

              {resetEmailSent && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password reset email has been dispatched.</span>
                </div>
              )}
            </form>
          </div>

          {/* Database & Seed Operations */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-red-400" />
                <h3 className="font-serif text-xl text-zinc-100">Database Maintenance</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Verify Firestore collections, replenish curated sample articles, and synchronize indexes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-zinc-200">Verify & Seed Initial Articles</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Populate foundational essays on psychology, focus, emotional agility, and mental tactics if collection is empty.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSeedArticles}
                disabled={seedLoading}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>{seedLoading ? 'Verifying...' : 'Verify Articles'}</span>
              </button>
            </div>
          </div>

          {/* Google Search Indexing, Sitemaps & Robots.txt */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-400" />
                <h3 className="font-serif text-xl text-zinc-100">Google Search Indexing & Sitemaps</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Automatic XML sitemaps, news feeds, and crawling directives calibrated for daily post indexing by Googlebot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sitemaps Status */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-red-400" /> XML Sitemap
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900">
                    Active & Crawlable
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-300 break-all select-all">
                  /sitemap.xml
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="/sitemap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View /sitemap
                  </a>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View sitemap.xml
                  </a>
                  <a
                    href="/sitemap-news.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View sitemap-news.xml
                  </a>
                </div>
              </div>

              {/* Robots.txt Status */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-red-400" /> Robots.txt
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900">
                    Googlebot Allowed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Allows indexing of articles, images, and public routes while shielding admin & user data.
                </p>
                <div className="pt-1">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View robots.txt
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-zinc-200">Daily Sitemap Synchronizer</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Fetch all current Firestore posts, generate a fresh XML sitemap, and download or submit to Google.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySitemapXml}
                  className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedXml ? 'Copied XML!' : 'Copy Live XML'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLiveSitemap}
                  disabled={sitemapLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>{sitemapLoading ? 'Building...' : 'Download Live Sitemap'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
