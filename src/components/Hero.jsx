import { useMotionPreference } from '../hooks/useMotionPreference';
import { useRef } from 'react';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { FaArrowDown, FaArrowRight, FaDownload, FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt, FaUser, FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import { usePointerTilt } from '../hooks/usePointerTilt';
import ProfessionalPhrases from './ProfessionalPhrases';
import PhoneContacts from './PhoneContacts';

const ease = [0.22, 1, 0.36, 1];
const shape = '44% 56% 60% 40% / 45% 40% 60% 55%';

export default function Hero() {
  const { t, content: { profile } } = useTranslation();
  const ref = useRef(null);
  const reduced = useMotionPreference();
  const tilt = usePointerTilt(5);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const portraitRotate = useTransform(scrollYProgress, [0, 1], [0, -7]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const words = profile.full_name.split(' ');
  const whatsapp = profile.whatsapp_number ? String(profile.whatsapp_number).replace(/\D/g, '') : ''; 
  const facts = [
    profile.age ? t('hero.age', { age: profile.age }) : null,
    profile.location ? <><FaMapMarkerAlt /> {profile.location}</> : null,
  ].filter(Boolean);
  const goTo = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };
  return (
    <header ref={ref} id="home" className="hero-section immersive-hero">
      <div className="hero-grid-lines" aria-hidden="true" />
      <Motion.div className="hero-copy" style={reduced ? {} : { y: copyY }}>
        <Motion.p className="eyebrow" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6 }}>
          <span className="intro-dot" aria-hidden="true" />{profile.professional_title}
        </Motion.p>
        <p className="hero-salutation">{t('hero.intro')}</p>
        <h1 className="hero-name" aria-label={profile.full_name}>
          {words.map((word, index) => (
            <span className={`name-mask name-word-${index}`} key={`${word}-${index}`} aria-hidden="true">
              <Motion.span className="name-gradient" initial={reduced ? false : { y: '110%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: reduced ? 0 : 0.95, delay: reduced ? 0 : 0.12 + index * 0.16, ease }}>{word}</Motion.span>
            </span>
          ))}
        </h1>
        <Motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.6, ease }}>
          <p className="hero-professional-subtitle">{profile.professional_subtitle}</p>
          <p className="hero-description">{profile.short_description}</p>
          <ProfessionalPhrases />
          {facts.length ? <div className="profile-facts">{facts.map((fact, index) => <span key={index}>{fact}</span>)}</div> : null}
          <PhoneContacts variant="hero" />
          <div className="hero-actions">
            <a className="button button-primary" href="#projects" onClick={(e) => goTo(e, 'projects')}>{t('hero.explore')}<FaArrowRight /></a>
            {profile.cv_url ? <a href={profile.cv_url} target="_blank" rel="noreferrer" className="button button-secondary"><FaDownload />{t('hero.cv')}</a> : null}
          </div>
          <div className="hero-social-links">
            {profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer"><FaGithub />GitHub</a> : null}
            {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><FaLinkedin />LinkedIn</a> : null}
            {whatsapp ? <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label={t('contact.whatsapp')} title={t('contact.whatsapp')}><FaWhatsapp aria-hidden="true" />WhatsApp</a> : null}
            {profile.email ? <a href={`mailto:${profile.email}`}><FaEnvelope />{t('hero.email')}</a> : null}
          </div>
        </Motion.div>
      </Motion.div>
      <div className="portrait-stage">
        <Motion.div className="portrait-scroll" style={reduced ? {} : { y: portraitY, rotate: portraitRotate, scale: portraitScale }}>
          <Motion.div className="portrait-tilt" {...tilt}>
            <div className="portrait-orbit orbit-one" aria-hidden="true" />
            <div className="portrait-orbit orbit-two" aria-hidden="true" />
            <Motion.div className="portrait-float" animate={reduced ? {} : { y: [0, -9, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <Motion.div className="portrait-halo" aria-hidden="true" initial={reduced ? false : { scale: 0.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: reduced ? 0 : 1.25, ease }} />
              <Motion.div className="portrait-mask" initial={reduced ? false : { scale: 0.12, opacity: 0, borderRadius: '50%' }} animate={{ scale: 1, opacity: 1, borderRadius: shape }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.15, ease }}>
                {profile.avatar_url ? <Motion.img src={profile.avatar_url} alt={`${t('hero.portrait')} ${profile.full_name}`} width="420" height="480" fetchPriority="high" initial={reduced ? false : { opacity: 0, scale: 1.14 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.55, ease }} /> : <div className="portrait-placeholder"><FaUser /></div>}
              </Motion.div>
            </Motion.div>
            <Motion.span className="portrait-code code-one" aria-hidden="true" style={reduced ? {} : { y: orbitY }}>&lt;/&gt;</Motion.span>
            <span className="portrait-code code-two" aria-hidden="true">{'{ }'}</span>
            <div className="portrait-caption"><span>01 /</span>{t('hero.signature')}</div>
          </Motion.div>
        </Motion.div>
      </div>
      <a className="scroll-cue" href="#about" onClick={(e) => goTo(e, 'about')}><span className="scroll-line" aria-hidden="true" /><span>{t('hero.scroll')}</span><FaArrowDown /></a>
    </header>
  );
}
