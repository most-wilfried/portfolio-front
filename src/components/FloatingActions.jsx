import { useEffect, useState } from 'react';
import { FaArrowUp, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { useTranslation } from '../i18n';
import '../floating-controls.css';

export default function FloatingActions({ whatsappNumber = null, email = null }) {
  const { t } = useTranslation();
  const reducedMotion = useMotionPreference();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const normalizedWhatsApp = whatsappNumber ? String(whatsappNumber).replace(/\D/g, '') : '';

  useEffect(() => {
    let frame = null;
    const updateVisibility = () => {
      frame = null;
      const nextVisible = window.scrollY > 500;
      setShowBackToTop((current) => current === nextVisible ? current : nextVisible);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateVisibility);
    };

    const footer = document.querySelector('.portfolio-footer');
    const footerObserver = footer && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting))
      : null;
    if (footerObserver) footerObserver.observe(footer);

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      footerObserver?.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.history.replaceState(null, '', '#home');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    const home = document.getElementById('home');
    if (home) {
      home.setAttribute('tabindex', '-1');
      home.focus({ preventScroll: true });
    }
  };

  return (
    <div className={`floating-actions floating-controls${footerVisible ? ' is-footer-visible' : ''}`}>
      {/* The same contact links are available in the footer; keep its reading area clear. */}
      {!footerVisible && (normalizedWhatsApp || email) ? (
        <div className="floating-controls-contact">
          {normalizedWhatsApp ? (
            <a
              className="floating-whatsapp"
              href={`https://wa.me/${normalizedWhatsApp}`}
              target="_blank"
              rel="noreferrer"
              aria-label={t('contact.whatsapp')}
              title={t('contact.whatsapp')}
            >
              <FaWhatsapp aria-hidden="true" />
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} aria-label={t('hero.email')} title={t('hero.email')}>
              <FaEnvelope aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}
      {showBackToTop ? (
        <button
          type="button"
          className="floating-back-top"
          onClick={scrollToTop}
          aria-label={t('footer.backTop')}
          title={t('footer.backTop')}
        >
          <FaArrowUp aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
