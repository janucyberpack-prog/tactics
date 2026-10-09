import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Bookmark, Shield, LogOut, Check, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfileBio } from '../services/auth';
import { getSavedPosts } from '../services/posts';
import { useToast } from '../components/Toast';
import { SEO } from '../components/SEO';

export const Account: React.FC = () => {
  const { user, profile, isAdmin, logout, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }

    const fetchSaved = async () => {
      try {
        const saved = await getSavedPosts(user.uid);
        setSavedCount(saved.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSaved();
  }, [user, profile, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfileBio(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim()
      });
      await refreshProfile();
      showToast('Profile updated.', 'success');
    } catch (err) {
      showToast('Unable to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-[#050505] py-16 md:py-24 text-[#f1f0ed]">
      <SEO title="Account Profile — Mental Tactic" description="Your account settings and saved collections." />

      <div className="site-container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ce354b]">
            User Settings
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-normal uppercase tracking-tight m-0">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#888] leading-relaxed font-light">
            Manage your credentials and access saved collections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Quick Stats & Role */}
          <div className="space-y-6">
            <div className="bg-[#090909] p-6 border border-[#222] text-center space-y-4">
              <div className="w-20 h-20 bg-[#141414] border border-[#282828] text-white text-2xl font-serif font-bold flex items-center justify-center mx-auto">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.displayName?.charAt(0) || 'U'
                )}
              </div>

              <div>
                <h3 className="font-serif text-xl text-white font-normal m-0">{profile.displayName}</h3>
                <p className="text-xs text-[#777] truncate mt-1">{profile.email}</p>
              </div>

              <div className="pt-2 flex justify-center">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                  isAdmin
                    ? 'border-[#b51f35] bg-[#b51f35]/20 text-[#ce354b]'
                    : 'border-[#333] bg-[#121212] text-[#aaa]'
                }`}>
                  {isAdmin ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-[#090909] p-6 border border-[#222] space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#888] mb-2">
                Quick Navigation
              </h4>

              <Link
                to="/saved"
                className="flex items-center justify-between p-3 bg-[#111] hover:bg-[#161616] border border-[#222] hover:border-[#b51f35] text-xs font-semibold text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#ce354b]" />
                  <span>Saved Articles</span>
                </div>
                <span className="px-2 py-0.5 bg-[#222] text-[10px] font-bold text-white">
                  {savedCount}
                </span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between p-3 bg-[#111] hover:bg-[#161616] border border-[#b51f35]/50 hover:border-[#b51f35] text-xs font-semibold text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ce354b]" />
                    <span>Admin Studio</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[#ce354b] font-bold">Open →</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-3 text-left text-xs text-[#ce354b] hover:bg-[#161616] border border-transparent hover:border-[#333] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-[#090909] p-8 border border-[#222]">
              <h3 className="font-serif text-2xl font-normal text-white mb-6">Edit Information</h3>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs px-4 py-3 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-[#101010] border border-[#1e1e1e] text-[#666] text-xs px-4 py-3 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                    Personal Bio / Focus Note
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="What areas of psychology and thought are you exploring right now?"
                    className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs p-4 outline-none resize-none leading-relaxed transition-colors"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-7 py-3 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
