import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Trash2, CheckCircle2, Clock, Search, Send, Check } from 'lucide-react';
import { getAllContactMessages, toggleMessageRead, deleteContactMessage } from '../../services/interactions';
import { ContactMessage } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getAllContactMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load contact messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    try {
      await toggleMessageRead(id, nextRead);
      setMessages(messages.map(m => m.id === id ? { ...m, read: nextRead } : m));
      showToast(nextRead ? 'Message marked as read.' : 'Message marked as unread.', 'info');
    } catch (err) {
      showToast('Could not update status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteContactMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      showToast('Message deleted.', 'info');
    } catch (err) {
      showToast('Could not delete message.', 'error');
    }
  };

  const filtered = messages.filter(m => {
    const isRead = Boolean(m.read);
    const matchesFilter = filter === 'all' || (filter === 'unread' ? !isRead : isRead);
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title="Reader Inquiries — Mental Tactic CMS" description="Review messages, questions, and reader correspondence." />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
                Reader Correspondence
              </h1>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Reflections, partnership inquiries, and questions submitted from the contact form.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'unread' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'read' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Read ({messages.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Messages List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500 animate-pulse">
              Loading correspondence records from Firestore...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#0a0a0a] rounded-2xl p-12 text-center border border-zinc-800 shadow-sm space-y-2">
              <p className="font-serif text-lg text-zinc-200">No correspondence found.</p>
              <p className="text-xs text-zinc-500">
                {filter === 'unread' ? 'All inquiries have been addressed.' : 'Reader inquiries will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(msg => {
                const isRead = Boolean(msg.read);

                return (
                  <div
                    key={msg.id}
                    className={`bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border transition-all ${
                      isRead ? 'border-zinc-800/80 opacity-80' : 'border-zinc-700 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-serif text-sm ${
                          isRead ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {msg.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200 flex items-center gap-2">
                            <span>{msg.name}</span>
                            {!isRead && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-900">
                                New
                              </span>
                            )}
                          </div>
                          <a
                            href={`mailto:${msg.email}?subject=Re: Mental Tactic Inquiry`}
                            className="text-xs text-zinc-400 hover:underline font-mono"
                          >
                            {msg.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRead(msg.id, isRead)}
                          className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{isRead ? 'Mark Unread' : 'Mark Read'}</span>
                        </button>

                        <a
                          href={`mailto:${msg.email}?subject=Re: Mental Tactic`}
                          className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </a>

                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-1.5 rounded-full hover:bg-red-950/50 text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                      {msg.message}
                    </div>

                    <div className="pt-3 text-[11px] text-zinc-500 font-mono">
                      Received: {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
