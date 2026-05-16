import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import { LanguageProvider, useTranslation } from './i18n';
import './App.css';

const NAV_LINKS = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/#about', labelKey: 'nav.about' },
  { path: '/#skills', labelKey: 'nav.skills' },
  { path: '/#projects', labelKey: 'nav.projects' },
  { path: '/#experience', labelKey: 'nav.experience' },
  { path: '/#certifications', labelKey: 'nav.certifications' },
  { path: '/#contact', labelKey: 'nav.contact' },
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-lock', menuOpen);

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('nav-lock');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const handleNavClick = (event, path) => {
    if (!path.startsWith('/#')) {
      setMenuOpen(false);
      return;
    }

    event.preventDefault();
    const target = document.querySelector(path.replace('/', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', path);
    setMenuOpen(false);
  };

  const navLinks = (
    <>
      {NAV_LINKS.map((link) => (
        <a
          key={link.labelKey}
          href={link.path}
          onClick={(event) => handleNavClick(event, link.path)}
        >
          {t(link.labelKey)}
        </a>
      ))}
    </>
  );

  return (
    <>
      <header className={menuOpen ? 'app-header menu-open' : 'app-header'}>
        <a className="brand" href="/" onClick={() => setMenuOpen(false)}>{t('brand')}</a>
        <nav className="main-nav desktop-nav">
          {navLinks}
        </nav>
        <div className="header-actions">
          <button
            className="icon-toggle"
            onClick={toggleLanguage}
            aria-label={t('language.switch')}
            title={t('language.switch')}
          >
            <FaGlobe />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            className="icon-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="mobile-nav-backdrop"
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
            />
            <Motion.nav
              className="mobile-nav-panel"
              initial={{ opacity: 0, x: 34, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 34, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mobile-nav-head">
                <span>{t('brand')}</span>
                <button type="button" className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
                  <span />
                  <span />
                </button>
              </div>
              <div className="mobile-nav-links">
                {navLinks}
              </div>
            </Motion.nav>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AdminAccess() {
  const location = useLocation();

  if (location.pathname === '/admin') {
    return null;
  }

  return null;
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navigation theme={theme} onToggleTheme={toggleTheme} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <AdminAccess />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
