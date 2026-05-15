import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
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

  const handleNavClick = (event, path) => {
    if (!path.startsWith('/#')) {
      return;
    }

    event.preventDefault();
    const target = document.querySelector(path.replace('/', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', path);
  };

  return (
    <header className="app-header">
      <div className="brand">{t('brand')}</div>
      <nav className="main-nav">
        {NAV_LINKS.map((link) => (
          <a
            key={link.labelKey}
            href={link.path}
            onClick={(event) => handleNavClick(event, link.path)}
          >
            {t(link.labelKey)}
          </a>
        ))}
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
      </div>
    </header>
  );
}

function AdminAccess() {
  const location = useLocation();

  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <footer className="site-footer">
      <a href="/admin" aria-label="Accès administration">admin</a>
    </footer>
  );
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
