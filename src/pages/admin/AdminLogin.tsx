import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { loginWithEmail, BOOTSTRAP_ADMIN_EMAIL } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const from = (location.state as any)?.from || '/admin';

  // If already logged in as admin, redirect to admin immediately
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const profile = await loginWithEmail(email, password);
      await refreshProfile();

      if (profile.role !== 'admin' && profile.email.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
        setErrorMsg('Authentication successful, but this account does not possess administrator privileges.');
        showToast('Administrator privileges required.', 'error');
        setLoading(false);
        return;
      }

      showToast('Welcome to Mental Tactic CMS Studio.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      let message = 'Unable to sign in. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'Administrator account not registered yet.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a few moments before trying again.';
      }
      setErrorMsg(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] py-16 px-6 flex flex-col justify-center items-center text-[#f1f0ed]">
      <SEO title="Admin Sign In — Mental Tactic" description="Sign in to the Mental Tactic editorial CMS studio." />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#888] hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <div className="w-14 h-14 bg-[#0e0e0e] border border-[#242424] text-[#ce354b] flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal uppercase tracking-tight m-0">
            CMS Studio Access
          </h1>
          <p className="text-xs text-[#888] max-w-xs mx-auto leading-relaxed font-light">
            Authorized administrator credentials required for publication management.
          </p>
        </div>

        <div className="bg-[#090909] p-8 sm:p-10 border border-[#222] space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-[#1a080a] border border-[#b51f35]/40 text-xs text-[#ce354b] font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mentaltactic.com"
                  className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-[#ce354b] hover:underline uppercase tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Admin Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] uppercase tracking-wider text-[#666]">
          Protected by Firebase Authentication & Role-Based Access Control
        </p>
      </div>
    </div>
  );
};
