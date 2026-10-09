import React, { useEffect, useState } from 'react';
import { Search, Shield, UserCheck, ShieldAlert, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { getAllUsers, updateUserRole, BOOTSTRAP_ADMIN_EMAIL } from '../../services/auth';
import { UserProfile, UserRole } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import { SEO } from '../../components/SEO';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'user'>('all');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (err) {
      console.warn('Fallback users fetch:', err);
      showToast('Could not fetch user records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole, userEmail: string) => {
    if (userEmail.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() && newRole !== 'admin') {
      showToast('Primary administrator role cannot be demoted.', 'error');
      return;
    }

    setUpdatingUid(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      showToast(`User role updated to ${newRole}.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update user role in Firestore.', 'error');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || (
      (u.displayName && u.displayName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      u.uid.toLowerCase().includes(query)
    );
    return matchesRole && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="py-10 md:py-14">
        <SEO title="User Management & RBAC — Mental Tactic CMS" description="Manage user roles, editors, and community seekers." />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal tracking-tight">
                Community & Permissions
              </h1>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Oversee registered users, assign editor privileges, and enforce access control.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
              <span>Refresh Roster</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email, or UID..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800 w-full md:w-auto overflow-x-auto">
              {(['all', 'admin', 'editor', 'user'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                    roleFilter === role
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-zinc-500 animate-pulse">
                Loading community members from Firestore...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-sm font-serif text-zinc-300">No user profiles found.</p>
                <p className="text-xs text-zinc-500">New users will appear here once they create accounts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="pb-4 font-semibold">User Profile</th>
                      <th className="pb-4 font-semibold">Email</th>
                      <th className="pb-4 font-semibold">Assigned Role</th>
                      <th className="pb-4 font-semibold">Account UID</th>
                      <th className="pb-4 font-semibold text-right">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filtered.map(u => {
                      const isPrimaryAdmin = u.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

                      return (
                        <tr key={u.uid} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img
                                  src={u.photoURL}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-red-950 border border-red-800 text-red-300 flex items-center justify-center font-serif font-bold text-sm">
                                  {u.displayName?.charAt(0) || u.email?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                                  <span>{u.displayName || 'Reader'}</span>
                                  {isPrimaryAdmin && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-900">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500">
                                  {u.bio || 'Member'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 pr-4 text-xs font-mono text-zinc-400">
                            {u.email}
                          </td>

                          <td className="py-4 pr-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                              u.role === 'admin'
                                ? 'bg-red-950/60 text-red-400 border border-red-900/50'
                                : u.role === 'editor'
                                ? 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                                : 'bg-zinc-900 text-zinc-500'
                            }`}>
                              {u.role === 'admin' ? <Shield className="w-3 h-3 text-red-400" /> : <UserCheck className="w-3 h-3 text-zinc-400" />}
                              <span>{u.role || 'user'}</span>
                            </span>
                          </td>

                          <td className="py-4 pr-4 font-mono text-[11px] text-zinc-500 truncate max-w-[130px]">
                            {u.uid}
                          </td>

                          <td className="py-4 text-right">
                            {isPrimaryAdmin ? (
                              <span className="text-[11px] text-zinc-500 italic font-sans pr-2">
                                Protected Primary Admin
                              </span>
                            ) : (
                              <select
                                value={u.role || 'user'}
                                disabled={updatingUid === u.uid}
                                onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole, u.email)}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-red-600 disabled:opacity-50"
                              >
                                <option value="user">User</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Administrator</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
