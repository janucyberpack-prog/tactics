import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../services/auth';
import { useToast } from '../components/Toast';
import { SEO } from '../components/SEO';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
      showToast('Password reset link sent to your inbox.', 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to send reset email. Please verify your address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 bg-[#050505] text-[#f1f0ed]">
      <SEO title="Reset Password — Mental Tactic" description="Recover your Mental Tactic access." />

      <div className="max-w-md w-full bg-[#090909] p-8 sm:p-10 border border-[#222] space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#ce354b]">
            Account Recovery
          </span>
          <h1 className="font-serif text-3xl font-normal text-white uppercase tracking-tight m-0">
            Reset Password
          </h1>
          <p className="text-xs text-[#888] font-light leading-relaxed">
            Enter your email to receive a secure link to reset your credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#1a080a] border border-[#b51f35]/40 text-xs text-[#ce354b] font-medium leading-relaxed">
            {error}
          </div>
        )}

        {sent ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-[#ce354b] mx-auto" />
            <h3 className="font-serif text-2xl text-white font-normal m-0">Reset Link Dispatched</h3>
            <p className="text-xs text-[#888] leading-relaxed max-w-xs mx-auto">
              Check your inbox at <span className="text-white font-medium">{email}</span> and follow the instructions to choose a new password.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#ce354b] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                Account Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#888] hover:text-white uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
