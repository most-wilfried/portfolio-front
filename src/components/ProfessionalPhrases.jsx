import { useEffect, useState } from 'react';
import { motion as Motion, useAnimationControls } from 'framer-motion';
import { FaPause, FaPlay } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import { useMotionPreference } from '../hooks/useMotionPreference';

export default function ProfessionalPhrases() {
  const { t } = useTranslation();
  const reduced = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;
    let timer;
    controls.set({ opacity: 1, y: 0 });
    if (!reduced && !paused) {
      const cycle = async () => {
        await controls.start({ opacity: 0, y: -5, transition: { duration: 0.18 } });
        if (cancelled) return;
        setIndex((current) => (current + 1) % 4);
        await controls.start({ opacity: 1, y: 0, transition: { duration: 0.35 } });
        if (!cancelled) timer = window.setTimeout(cycle, 4500);
      };
      timer = window.setTimeout(cycle, 4500);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controls.stop();
    };
  }, [controls, paused, reduced]);

  return (
    <div className="professional-phrases" aria-label={t('hero.actionsLabel')}>
      <Motion.p animate={controls} data-phrase-index={index}>{t(`hero.action.${index}`)}</Motion.p>
      {!reduced ? <button type="button" className="phrase-toggle" onClick={() => setPaused((value) => !value)}
        aria-label={paused ? t('hero.resumeActions') : t('hero.pauseActions')}
        title={paused ? t('hero.resumeActions') : t('hero.pauseActions')}
        aria-pressed={paused}>
        {paused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
      </button> : null}
    </div>
  );
}
