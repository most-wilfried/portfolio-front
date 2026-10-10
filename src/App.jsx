import { useMotionPreference } from './hooks/useMotionPreference';
import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
import { AnimatePresence, MotionConfig, motion as Motion, useScroll } from 'framer-motion';
import Home from './pages/Home';
import { LanguageProvider, useTranslation } from './i18n';
import './App.css';
import './navigation-motion.css';

const NAV_LINKS = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'certifications', labelKey: 'nav.certifications' },
  { id: 'contact', labelKey: 'nav.contact' },
];

function getInitialTheme() {
  const stored = localStorage.getItem('portfolio_theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Navigation({ theme, onToggleTheme }) {
  const { language, t, toggleLanguage } = useTranslation();
  const reducedMotion = useMotionPreference();
  const { scrollYProgress } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const panelRef = useRef(null);
  const closeLabel = language === 'fr' ? 'Fermer le menu' : 'Close menu';
  const navigationLabel = language === 'fr' ? 'Navigation principale' : 'Main navigation';

  useEffect(() => {
    let frameId = null;

    const updateActiveSection = () => {
      frameId = null;
      const readingLine = (headerRef.current?.getBoundingClientRect().height || 80) + Math.min(window.innerHeight * 0.2, 160);
      let nextSection = 'home';

      for (const link of NAV_LINKS) {
        const section = document.getElementById(link.id);
        if (section && section.getBoundingClientRect().top <= readingLine) {
          nextSection = link.id;
        }
      }

      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight > window.innerHeight && window.scrollY + window.innerHeight >= documentHeight - 8) {
        nextSection = 'contact';
      }

      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(document.body);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 1150px)');
    const closeOnDesktop = (event) => {
      if (!event.matches) setMenuOpen(false);
    };
    mobileViewport.addEventListener('change', closeOnDesktop);
    return () => mobileViewport.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousFocus = document.activeElement;
    const menuButton = menuButtonRef.current;
    document.body.classList.add('menu-nav-lock');
    const focusFrame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      const initialTarget = panel?.querySelector('[aria-current="location"]') || panel?.querySelector('button');
      (initialTarget || panel)?.focus({ preventScroll: true });
    });

    const handleMenuKeys = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]');
      if (!focusable?.length) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusInside = panelRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !focusInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !focusInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleMenuKeys);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.classList.remove('menu-nav-lock');
      window.removeEventListener('keydown', handleMenuKeys);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      } else {
        menuButton?.focus({ preventScroll: true });
      }
    };
  }, [menuOpen]);

  const handleNavClick = (event, id) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    }
    window.history.replaceState(null, '', `#${id}`);
    setMenuOpen(false);
  };

  const renderNavLinks = (placement) => NAV_LINKS.map((link) => {
    const active = activeSection === link.id;
    return (
      <a
        className={active ? 'nav-item is-active' : 'nav-item'}
        key={link.labelKey}
        href={`#${link.id}`}
        aria-current={active ? 'location' : undefined}
        onClick={(event) => handleNavClick(event, link.id)}
      >
        {active ? (
          <Motion.span
            aria-hidden="true"
            className="nav-active-indicator"
            layoutId={`nav-indicator-${placement}`}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
          />
        ) : null}
        <span className="nav-item-label">{t(link.labelKey)}</span>
      </a>
    );
  });

  return (
    <>
      <Motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <header ref={headerRef} className={menuOpen ? 'app-header menu-open' : 'app-header'}>
        <a className="brand" href="#home" onClick={(event) => handleNavClick(event, 'home')}>{t('brand')}</a>
        <nav className="main-nav desktop-nav" aria-label={navigationLabel}>
          {renderNavLinks('desktop')}
        </nav>
        <div className="header-actions">
          <button
            className="icon-toggle"
            type="button"
            onClick={toggleLanguage}
            aria-label={t('language.switch')}
            title={t('language.switch')}
          >
            <FaGlobe aria-hidden="true" />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            className="icon-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>
          <button
            ref={menuButtonRef}
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? closeLabel : language === 'fr' ? 'Ouvrir le menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'mobile-navigation' : undefined}
          >
            <span className="hamburger-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <Motion.div
            className="mobile-nav-layer"
            role="dialog"
            aria-modal="true"
            aria-label={navigationLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <button
              className="mobile-nav-backdrop"
              type="button"
              tabIndex={-1}
              aria-label={closeLabel}
              onClick={() => setMenuOpen(false)}
            />
            <Motion.nav
              ref={panelRef}
              id="mobile-navigation"
              className="mobile-nav-panel"
              aria-label={navigationLabel}
              tabIndex={-1}
              initial={{ opacity: 0, x: 34, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 34, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mobile-nav-head">
                <span>{t('brand')}</span>
                <button type="button" className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label={closeLabel}>
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </button>
              </div>
              <div className="mobile-nav-links">
                {renderNavLinks('mobile')}
              </div>
            </Motion.nav>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const prefersReduced = useMotionPreference();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <MotionConfig reducedMotion={prefersReduced ? 'always' : 'never'}>
      <LanguageProvider>
        <div className="app-shell">
          <Navigation theme={theme} onToggleTheme={toggleTheme} />
          <Home />
        </div>
      </LanguageProvider>
    </MotionConfig>
  );
}
