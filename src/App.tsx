import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Cursor } from './components/Cursor';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToAnchor } from './components/ScrollToAnchor';

// Public & User Pages
import { Home } from './pages/Home';
import { Journal } from './pages/Journal';
import { ArticleDetail } from './pages/ArticleDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Account } from './pages/Account';
import { SavedArticles } from './pages/SavedArticles';
import { NotFound } from './pages/NotFound';

// Admin CMS Studio Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminPosts } from './pages/admin/AdminPosts';
import { AdminPostEditor } from './pages/admin/AdminPostEditor';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSubscribers } from './pages/admin/AdminSubscribers';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLogin } from './pages/admin/AdminLogin';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Block and remove ads when navigating inside the admin panel
  React.useEffect(() => {
    if (isAdminPath) {
      document.body.classList.add('is-admin-panel');

      // Remove ad scripts, iframes, and injected popunder/overlay elements
      const purgeAdElements = () => {
        const adSelectors = [
          'script[src*="nap5k.com"]',
          'script[src*="5gvci.com"]',
          'script[src*="al5sm.com"]',
          'script[src*="3nbf4.com"]',
          'script[data-zone="11992349"]',
          'script[data-zone="11992357"]',
          'iframe[src*="nap5k.com"]',
          'iframe[src*="5gvci.com"]',
          'iframe[src*="al5sm.com"]',
          'iframe[src*="3nbf4.com"]',
          'div[id*="nap5k"]',
          'div[id*="5gvci"]',
          'div[id*="al5sm"]',
          'div[id*="3nbf4"]',
          'body > div:not(#root):not(.portal-root)',
          'body > iframe'
        ];

        adSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            try {
              el.remove();
            } catch {
              // Ignore removal errors
            }
          });
        });
      };

      purgeAdElements();

      // Guard window.open against ad network popups/popunders while in admin panel
      const originalWindowOpen = window.open;
      window.open = function (url?: string | URL, target?: string, features?: string) {
        const urlStr = String(url || '').toLowerCase();
        if (
          urlStr.includes('nap5k.com') ||
          urlStr.includes('5gvci.com') ||
          urlStr.includes('al5sm.com') ||
          urlStr.includes('3nbf4.com') ||
          urlStr.includes('propeller') ||
          urlStr.includes('monetag')
        ) {
          return null;
        }
        return originalWindowOpen.call(window, url, target, features);
      };

      // Watch for and promptly destroy any ad DOM nodes injected while in admin panel
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              const html = (node.outerHTML || '').toLowerCase();
              const isAd =
                html.includes('nap5k') ||
                html.includes('5gvci') ||
                html.includes('al5sm') ||
                html.includes('3nbf4') ||
                html.includes('11992349') ||
                html.includes('11992350') ||
                html.includes('11992357') ||
                (node.tagName === 'IFRAME' && node.parentElement === document.body) ||
                (node.parentElement === document.body && node.id !== 'root' && !node.classList.contains('portal-root'));

              if (isAd) {
                try {
                  node.remove();
                } catch {
                  // Ignore removal errors
                }
              }
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      observer.observe(document.head, { childList: true });

      return () => {
        document.body.classList.remove('is-admin-panel');
        window.open = originalWindowOpen;
        observer.disconnect();
      };
    } else {
      document.body.classList.remove('is-admin-panel');
    }
  }, [isAdminPath]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#f1f0ed] selection:bg-[#b51f35] selection:text-white">
      <Cursor />
      
      {/* Show public Navbar only when outside admin studio */}
      {!isAdminPath && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User Account Routes */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedArticles />
              </ProtectedRoute>
            }
          />

          {/* Admin Authentication Screen */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin CMS Studio Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPostEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPostEditor />
              </ProtectedRoute>
            }
          />

          {/* Admin Post Aliases for backwards-compatibility */}
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPostEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPostEditor />
              </ProtectedRoute>
            }
          />

          {/* Community & RBAC */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Subscribers Management */}
          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSubscribers />
              </ProtectedRoute>
            }
          />

          {/* Reader Inquiries */}
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireAdmin>
                <AdminMessages />
              </ProtectedRoute>
            }
          />

          {/* Platform Settings & Password Flow */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Show public Footer only when outside admin studio */}
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToAnchor />
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
