import React, { useEffect, useState } from 'react';
import { Mail, Copy, Check, Download, Trash2, Search, RefreshCw, Send } from 'lucide-react';
import { getAllSubscribers, deleteSubscriber } from '../../services/interactions';
import { NewsletterSubscription } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const data = await getAllSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load newsletter subscribers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleCopyAll = () => {
    if (subscribers.length === 0) return;
    const emailList = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    showToast(`${subscribers.length} email addresses copied to clipboard.`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Email,Status,SubscribedAt"].concat(
        subscribers.map(s => `"${s.email}","${s.status || 'active'}","${s.subscribedAt ? new Date(s.subscribedAt.seconds * 1000).toISOString() : ''}"`)
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mental-tactic-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV exported successfully.', 'success');
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Unsubscribe and remove ${email}?`)) return;
    try {
      await deleteSubscriber(id);
      setSubscribers(subscribers.filter(s => s.id !== id));
      showToast('Subscriber removed.', 'info');
    } catch (err) {
      showToast('Could not remove subscriber.', 'error');
    }
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title="Newsletter Subscribers — Mental Tactic CMS" description="Manage your audience and mailing list." />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
                Newsletter Audience
              </h1>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Subscribers receiving essays, psychological ideas, and weekly digests.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleCopyAll}
                disabled={subscribers.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Copied' : 'Copy All Emails'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={subscribers.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search toolbar */}
          <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscriber emails..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              {subscribers.length} Active Readers
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-zinc-500 animate-pulse">
                Fetching subscriber records from Firestore...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-sm font-serif text-zinc-300">No subscriber records yet.</p>
                <p className="text-xs text-zinc-500">
                  Visitors who subscribe through the footer or article reading forms will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="pb-4 font-semibold">Subscriber Email</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Subscribed Date</th>
                      <th className="pb-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filtered.map(sub => (
                      <tr key={sub.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 text-red-400 flex items-center justify-center border border-zinc-800">
                              <Mail className="w-4 h-4" />
                            </div>
                            <span className="font-mono text-xs text-zinc-200 font-medium">{sub.email}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/60 text-red-400 border border-red-900/50">
                            {sub.status || 'active'}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-xs text-zinc-500">
                          {sub.subscribedAt?.seconds
                            ? new Date(sub.subscribedAt.seconds * 1000).toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete(sub.id, sub.email)}
                            className="p-1.5 rounded-full hover:bg-red-950/50 text-red-400 transition-colors"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
