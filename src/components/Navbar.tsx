import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, User as UserIcon, Shield, LogOut, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { getPublishedPosts } from '../services/posts';
import { Post } from '../types';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState('home');

  const isHome = location.pathname === '/';

  // Track active section for indicator line on homepage
  useEffect(() => {
    if (!isHome) return;

    const sections = ['home', 'features', 'articles', 'tools', 'about'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionId);
          return;
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Handle Search Modal data fetching
  useEffect(() => {
    if (!searchModalOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const posts = await getPublishedPosts();
        const q = searchQuery.toLowerCase();
        const matches = posts.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags?.some(t => t.toLowerCase().includes(q))
        );
        setSearchResults(matches.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchModalOpen, searchQuery]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out.', 'info');
      setProfileDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    navigate(`/journal?category=All notes&search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { label: 'Home', href: isHome ? '#home' : '/', id: 'home' },
    { label: 'Features', href: isHome ? '#features' : '/#features', id: 'features' },
    { label: 'Articles', href: isHome ? '#articles' : '/journal', id: 'articles' },
    { label: 'Tools', href: isHome ? '#tools' : '/#tools', id: 'tools' },
    { label: 'About', href: isHome ? '#about' : '/about', id: 'about' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 h-[76px] border-b border-white/[0.13] bg-[#050505]/95 backdrop-blur-[18px]">
        <nav className="site-container h-full flex items-center justify-between" aria-label="Main navigation">
          {/* Left: Brand Logo & Wordmark */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-white transition-opacity hover:opacity-90 shrink-0"
            aria-label="Mental Tactic home"
          >
            {/* Brain-inspired brand mark from reference */}
            <svg className="w-[31px] h-[31px] text-[#f1f0ed]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M20 7v26M20 10c-4.3-5.3-12-2.3-10.3 4.4-5.4 2.6-3.1 10 1.1 10.4-1 5.4 5.1 8.6 9.2 4.4M20 10c4.3-5.3 12-2.3 10.3 4.4 5.4 2.6 3.1 10-1.1 10.4 1 5.4-5.1 8.6-9.2 4.4"
                stroke="currentColor"
                strokeWidth="1.35"
              />
              <path
                d="M10.2 14.7c2.7.2 4.1 1.5 4.4 3.8M29.8 14.7c-2.7.2-4.1 1.5-4.4 3.8M10.6 24.5c2.4-1.3 4.4-.9 5.7.9M29.4 24.5c-2.4-1.3-4.4-.9-5.7.9"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle cx="20" cy="20" r="18" stroke="#b51f35" strokeWidth="0.7" strokeDasharray="2 4" />
            </svg>
            <span className="font-serif text-[17px] font-semibold tracking-[0.14em] uppercase text-[#f1f0ed] select-none">
              Mental Tactic
            </span>
          </Link>

          {/* Center: Compact uppercase navigation */}
          <ul className="hidden md:flex items-stretch justify-center gap-9 h-full m-0 p-0 list-none">
            {navLinks.map(link => {
              const isActive = isHome ? activeSection === link.id : location.pathname === link.href;
              return (
                <li key={link.label} className="flex items-center">
                  <a
                    href={link.href}
                    className={`relative flex items-center h-full px-1 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
                      isActive ? 'text-[#f1f0ed]' : 'text-[#8e8d89] hover:text-[#f1f0ed]'
                    }`}
                  >
                    {link.label}
                    {/* Red active indicator line from reference */}
                    <span
                      className={`absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#b51f35] transition-all duration-200 ${
                        isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right: Minimal Search & Menu & Auth Actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              type="button"
              className="w-10 h-10 grid place-items-center rounded text-[#aaa] hover:text-[#ce354b] hover:bg-[#121212] transition-colors"
              aria-label="Search articles"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.2" stroke="currentColor" strokeWidth="1.5" />
                <path d="m15.5 15.5 4.1 4.1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Authenticated User / Account Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 h-9 px-3 border border-[#262626] rounded text-[#d2d1ce] hover:border-[#b51f35] hover:text-white text-xs transition-colors"
                  aria-label="User menu"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#ce354b]" />
                  <span className="hidden sm:inline max-w-[80px] truncate text-[11px] uppercase tracking-wider font-semibold">
                    {profile?.displayName || 'User'}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-[#252525] rounded-sm py-2 shadow-2xl z-50 text-xs"
                  >
                    <Link
                      to="/account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-[#aaa] hover:text-white hover:bg-[#151515] uppercase tracking-wider text-[10px]"
                    >
                      Profile & Settings
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-[#aaa] hover:text-white hover:bg-[#151515] uppercase tracking-wider text-[10px]"
                    >
                      Saved Articles
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-[#ce354b] hover:text-white hover:bg-[#151515] uppercase tracking-wider text-[10px] font-semibold"
                      >
                        Admin CMS Studio
                      </Link>
                    )}
                    <div className="border-t border-[#222] my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[#ce354b] hover:bg-[#151515] uppercase tracking-wider text-[10px]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-[0.16em] uppercase text-[#aaa] hover:text-[#f1f0ed] px-3 py-1.5 border border-[#222] hover:border-[#b51f35] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden w-10 h-10 grid place-items-center text-[#aaa] hover:text-[#ce354b] hover:bg-[#121212] transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 8h16M8 16h12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[76px] bottom-0 z-40 bg-[#050505]/98 backdrop-blur-xl flex flex-col justify-between p-8 border-b border-[#252525] md:hidden">
          <ul className="flex flex-col gap-6 list-none p-0 m-0">
            {navLinks.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-3xl font-light text-[#f1f0ed] hover:text-[#ce354b] transition-colors block"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-8 border-t border-[#222] flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-widest text-[#aaa] py-2"
                >
                  My Profile ({profile?.displayName || 'User'})
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-widest text-[#aaa] py-2"
                >
                  Saved Articles
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs uppercase tracking-widest text-[#ce354b] py-2 font-bold"
                  >
                    Admin CMS Studio
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-xs uppercase tracking-widest text-[#ce354b] py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 text-xs uppercase tracking-widest font-bold border border-[#b51f35] text-white hover:bg-[#b51f35]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 text-xs uppercase tracking-widest font-bold bg-[#141414] border border-[#333] text-white"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#252525] rounded-none p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSearchModalOpen(false)}
              className="absolute top-5 right-5 text-[#888] hover:text-white"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[9px] font-bold tracking-[0.24em] text-[#ce354b] uppercase mb-2">
              Mental Tactic Search
            </div>

            <form onSubmit={handleSearchSubmit} className="relative mt-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ideas, psychological patterns, articles..."
                className="w-full bg-[#121212] border border-[#282828] focus:border-[#b51f35] text-white px-4 py-3.5 pr-10 text-sm outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 divide-y divide-[#1c1c1c] max-h-72 overflow-y-auto">
                {searchResults.map(post => (
                  <Link
                    key={post.id}
                    to={`/journal/${post.slug}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="block py-3 hover:bg-[#121212] px-2 transition-colors group"
                  >
                    <div className="text-[9px] uppercase tracking-wider text-[#ce354b] font-bold">
                      {post.category} · {post.readingTime} min read
                    </div>
                    <div className="text-sm font-serif text-[#f1f0ed] group-hover:text-white mt-0.5">
                      {post.title}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <p className="text-xs text-[#777] mt-4 text-center py-4">
                No matching notes found for "{searchQuery}". Press Enter to view full archive.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
