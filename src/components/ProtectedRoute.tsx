import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileSkeleton } from './Skeletons';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] py-20 flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  const isAdminArea = location.pathname.startsWith('/admin');

  if (!user) {
    const targetRedirect = isAdminArea ? '/admin/login' : '/login';
    return <Navigate to={targetRedirect} state={{ from: location.pathname }} replace />;
  }

  // Strict administrator check: editors and regular users do not receive admin privileges
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center bg-[#050505]">
        <div className="max-w-md bg-[#0e0e0e] rounded-2xl p-8 border border-zinc-800 shadow-xl space-y-5">
          <div className="w-12 h-12 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center mx-auto border border-red-900/50">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-zinc-100">Administrator Access Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              You are signed in as <span className="font-medium text-zinc-200">{user.email}</span> with role <span className="font-semibold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">{profile?.role || 'user'}</span>.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans pt-1">
              Access to the Mental Tactic CMS Studio is restricted strictly to administrators. Editors and seekers cannot access administrator controls.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch to Admin</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

