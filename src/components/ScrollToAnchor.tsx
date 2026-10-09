import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToAnchor: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (hash) {
      const id = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const navHeight = 78;
          const rect = element.getBoundingClientRect();
          const targetTop = rect.top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior
          });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [pathname, hash]);

  return null;
};
