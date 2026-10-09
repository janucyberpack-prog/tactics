import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { submitContactMessage } from '../services/interactions';
import { useToast } from '../components/Toast';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await submitContactMessage(name, email, message);
      setSubmitted(true);
      showToast(res.message, 'success');
    } catch (err: any) {
      setError(err.message || 'Unable to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] py-16 md:py-24 text-[#f1f0ed]">
      <SEO
        title="Correspondence — Mental Tactic"
        description="Connect with the editorial team of Mental Tactic."
      />

      <div className="site-container max-w-3xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#ce354b]">
            Correspondence
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-normal uppercase tracking-tight">
            Reach Out to the Editors
          </h1>
          <p className="text-xs sm:text-sm text-[#888] leading-relaxed font-light">
            Inquire about research collaborations, suggest topics for editorial coverage, or share your observations.
          </p>
        </div>

        <div className="bg-[#090909] border border-[#222] p-8 sm:p-10">
          {error && (
            <div className="p-3.5 bg-[#1a080a] border border-[#b51f35]/40 text-xs text-[#ce354b] font-medium leading-relaxed mb-6">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#ce354b] mx-auto" />
              <h3 className="font-serif text-2xl text-white font-normal">Message Received</h3>
              <p className="text-xs text-[#888] max-w-sm mx-auto leading-relaxed">
                Thank you for your note. Our editors review incoming correspondence weekly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-4 px-6 py-2.5 border border-[#333] hover:border-[#b51f35] text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                  Your Name
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="marcus@sanctuary.org"
                    className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs pl-10 pr-4 py-3 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Share your thoughts or inquiry..."
                  className="w-full bg-[#121212] border border-[#262626] focus:border-[#b51f35] text-white text-xs p-3.5 outline-none resize-none leading-relaxed transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#b51f35] hover:bg-[#ce354b] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Transmitting...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Transmit Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
