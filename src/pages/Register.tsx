import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { registerWithEmail, loginWithGoogle } from '../services/auth';
import { useToast } from '../components/Toast';
import { SEO } from '../components/SEO';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, name.trim());
      showToast('Account established. Welcome to Mental Tactic.', 'success');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Unable to register. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      showToast('Welcome to Mental Tactic.', 'success');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to continue with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 bg-[#050505] text-[#f1f0ed]">
      <SEO title="Create Account — Mental Tactic" description="Join Mental Tactic to save reflections and access mental tools." />

      <div className="max-w-md w-full bg-[#090909] p-8 sm:p-10 border border-[#222] space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#ce354b]">
            Establish Account
          </span>
          <h1 className="font-serif text-3xl font-normal text-white uppercase tracking-tight m-0">
            Join Mental Tactic
          </h1>
          <p className="text-xs text-[#888] font-light leading-relaxed">
            Create your account for articles, mental models, and saved notes.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#1a080a] border border-[#b51f35]/40 text-xs text-[#ce354b] font-medium leading-relaxed">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3.5 px-4 border border-[#262626] bg-[#121212] hover:bg-[#181818] hover:border-[#b51f35] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#222] w-full" />
          <span className="bg-[#090909] px-3 text-[10px] uppercase tracking-wider text-[#666] font-semibold absolute">
            or with email
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Marcus Aurelius"
                className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
              Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Establishing Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#777]">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#ce354b] font-bold uppercase tracking-wider hover:underline ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
