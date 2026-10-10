import { useMotionPreference } from '../hooks/useMotionPreference';
import { useEffect, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEnvelope,
  FaGithub,
  FaImages,
  FaLinkedin,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';
import { motion as Motion } from 'framer-motion';
import { getTechIcon } from '../constants/iconMap';
import { useTranslation } from '../i18n';
import FloatingActions from '../components/FloatingActions';
import Hero from '../components/Hero';
import SkillDomains from '../components/SkillDomains';
import PhoneContacts from '../components/PhoneContacts';
import BackgroundTimeline from '../components/BackgroundTimeline';
import { MotionSection, RevealHeading, RevealCard, InteractiveProject } from '../components/MotionPrimitives';

const footerLinks = [
  { href: '#home', key: 'nav.home' },
  { href: '#about', key: 'nav.about' },
  { href: '#skills', key: 'nav.skills' },
  { href: '#projects', key: 'nav.projects' },
  { href: '#experience', key: 'nav.experience' },
  { href: '#contact', key: 'nav.contact' },
];

function projectPreviewStyle(project) {
  const title = project.title || 'Project';
  const seed = title.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const hueA = seed % 360;
  const hueB = (hueA + 92) % 360;

  return {
    '--project-hue-a': hueA,
    '--project-hue-b': hueB,
  };
}

function projectTypeLabel(projectType, t) {
  const knownTypes = ['académique', 'personnel', 'professionnel'];
  return knownTypes.includes(projectType) ? t(`projectType.${projectType}`) : projectType;
}

function projectStatusLabel(status, t) {
  const knownStatuses = ['terminé', 'en cours'];
  return knownStatuses.includes(status) ? t(`status.${status}`) : status;
}

export default function Home() {
  const { language, t, content: { profile, projects, certifications } } = useTranslation();
  const sortedProjects = [...projects].sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const reduced = useMotionPreference();
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [validation, setValidation] = useState({});
  const [galleryState, setGalleryState] = useState(null);
  const galleryProject = galleryState ? { ...projects.find((project) => project.id === galleryState.id), galleryImages: galleryState.images } : null;
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryPanel = useRef(null);

  useEffect(() => {
    if (!galleryState) {
      return undefined;
    }

    const previousFocus = document.activeElement;
    document.body.classList.add('nav-lock');
    galleryPanel.current?.querySelector('button')?.focus({ preventScroll: true });

    const handleGalleryKeys = (event) => {
      if (event.key === 'Tab') {
        const items = galleryPanel.current?.querySelectorAll('button, a[href]');
        if (items?.length) {
          const first = items[0];
          const last = items[items.length - 1];
          const inside = galleryPanel.current.contains(document.activeElement);
          if (event.shiftKey && (document.activeElement === first || !inside)) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && (document.activeElement === last || !inside)) { event.preventDefault(); first.focus(); }
        }
      }
      if (event.key === 'Escape') {
        setGalleryState(null);
        setGalleryIndex(0);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setGalleryIndex((index) => (index - 1 + galleryState.images.length) % galleryState.images.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setGalleryIndex((index) => (index + 1) % galleryState.images.length);
      }
    };

    window.addEventListener('keydown', handleGalleryKeys);

    return () => {
      document.body.classList.remove('nav-lock');
      window.removeEventListener('keydown', handleGalleryKeys);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [galleryState]);

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const errors = {};
    for (const name of ['name', 'email', 'subject', 'message']) {
      if (!contact[name].trim()) errors[name] = 'contact.validation.required';
    }
    if (contact.email.trim() && event.currentTarget.elements.email.validity.typeMismatch) {
      errors.email = 'contact.validation.email';
    }
    setValidation(errors);
    setStatus(null);
    if (Object.keys(errors).length) {
      event.currentTarget.elements[Object.keys(errors)[0]].focus();
      return;
    }
    if (!profile.email) {
      setStatus('contact.unavailable');
      return;
    }
    const body = `${contact.message.trim()}\n\n${t('contact.name')}: ${contact.name.trim()}\n${t('contact.email')}: ${contact.email.trim()}\n\n${t('contact.signature')}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(contact.subject.trim())}&body=${encodeURIComponent(body)}`;
    setStatus('contact.draftOpened');
  };

  const updateContact = (name, value) => {
    setContact((current) => ({ ...current, [name]: value }));
    setValidation((current) => ({ ...current, [name]: null }));
    setStatus(null);
  };

  const renderTechTags = (technologies) => {
    if (!technologies?.length) {
      return null;
    }

    return (
      <div className="tech-tags">
        {technologies.map((tech) => (
          <span key={tech} className="tag">
            {getTechIcon(tech)}
            <span>{tech}</span>
          </span>
        ))}
      </div>
    );
  };

  const openGallery = (project, galleryImages) => {
    setGalleryState({ id: project.id, images: galleryImages });
    setGalleryIndex(0);
  };

  const closeGallery = () => {
    setGalleryState(null);
    setGalleryIndex(0);
  };

  const showPreviousImage = () => {
    if (!galleryProject?.galleryImages?.length) {
      return;
    }
    setGalleryIndex((index) => (index - 1 + galleryProject.galleryImages.length) % galleryProject.galleryImages.length);
  };

  const showNextImage = () => {
    if (!galleryProject?.galleryImages?.length) {
      return;
    }
    setGalleryIndex((index) => (index + 1) % galleryProject.galleryImages.length);
  };

  const handleFooterLink = (event, href) => {
    if (!href.startsWith('#')) {
      return;
    }

    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  const normalizedWhatsApp = profile.whatsapp_number ? String(profile.whatsapp_number).replace(/\D/g, '') : '';
  const whatsappUrl = normalizedWhatsApp ? `https://wa.me/${normalizedWhatsApp}` : null;
  const emailUrl = profile.email ? `mailto:${profile.email}` : null;

  return (
    <main className="page-shell">
      <Hero />

      <MotionSection id="about" number="01">
        <div className="section-content">
          <RevealHeading>{t('about.title')}</RevealHeading>
          <p className="current-study"><span>{t('about.currentStudy')}</span>{profile.current_study}</p>
          <div className="about-narrative">{profile.about_paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <div className="about-grid">
            <article>
              <h3>{t('about.journey')}</h3>
              <p>{profile.journey}</p>
            </article>
            <article>
              <h3>{t('about.goals')}</h3>
              <p>{profile.goals}</p>
            </article>
          </div>
          {profile.cv_url ? (
            <a className="about-cv-link" href={profile.cv_url} target="_blank" rel="noreferrer">
              <FaDownload /> {t('about.downloadCv')}
            </a>
          ) : null}
        </div>
      </MotionSection>

      <MotionSection className="section section-alt" id="skills" number="02">
        <div className="section-content">
          <div className="section-header">
            <RevealHeading>{t('skills.title')}</RevealHeading>
            <div>
              <h3 className="section-kicker">{t('skills.subtitle')}</h3>
              <p>{t('skills.description')}</p>
            </div>
          </div>
          <SkillDomains />
        </div>
      </MotionSection>

      <MotionSection id="projects" number="03">
        <div className="section-header">
          <RevealHeading>{t('projects.title')}</RevealHeading>
          <p>{t('projects.description')}</p>
        </div>
        <div className="project-grid">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project, index) => {
              const projectType = project.project_type || 'personnel';
              const statusLabel = project.status;
              const galleryImages = [
                project.image_url ? { id: 'main', url: project.image_url } : null,
                ...(project.gallery_images || []),
              ].filter(Boolean);

              return (
                <InteractiveProject key={project.id} index={index} style={projectPreviewStyle(project)}>
                  <span className="project-timeline-dot" aria-hidden="true" />
                  <div className="project-media">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} loading="lazy" decoding="async" />
                    ) : (
                      <div className="project-fallback" aria-label={t('projects.fallback')}>
                        <span>{project.title?.slice(0, 2) || 'PR'}</span>
                      </div>
                    )}
                  </div>
                  <div className="project-overlay project-showcase-content">
                    <div className="project-meta-row">
                      <span>{projectTypeLabel(projectType, t)}</span>
                      {project.year ? <span>{project.year}</span> : null}
                      {statusLabel ? <span>{projectStatusLabel(statusLabel, t)}</span> : null}
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-method">
                      <dl>
                        {['problem', 'needs', 'design'].map((field) => project[field] ? <div key={field}><dt>{t(`projects.${field}`)}</dt><dd>{project[field]}</dd></div> : null)}
                      </dl>
                      {project.features?.length ? <div><h4>{t('projects.features')}</h4><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div> : null}
                    </div>
                    {renderTechTags(project.technologies)}
                    {project.progress_note ? <p className="project-progress"><strong>{t('projects.progress')}</strong>{project.progress_note}</p> : null}
                    <div className="card-actions">
                      {project.github_url ? (
                        <a href={project.github_url} target="_blank" rel="noreferrer">
                          <FaGithub /> {t('projects.github')}
                        </a>
                      ) : null}
                      {project.demo_url ? (
                        <a href={project.demo_url} target="_blank" rel="noreferrer">
                          {t('projects.demo')} <FaArrowRight />
                        </a>
                      ) : null}
                      {galleryImages.length > 0 ? (
                        <button type="button" onClick={() => openGallery(project, galleryImages)}>
                          <FaImages /> {t('projects.images')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </InteractiveProject>
              );
            })
          ) : (
            <p className="empty-state">{t('projects.empty')}</p>
          )}
        </div>
      </MotionSection>

      {galleryProject ? (
        <div className="gallery-modal" role="dialog" aria-modal="true" aria-label={galleryProject.title}>
          <button className="gallery-backdrop" tabIndex={-1} type="button" onClick={closeGallery} aria-label={t('gallery.close')} />
          <Motion.div
            ref={galleryPanel}
            className="gallery-panel gallery-carousel-panel"
            initial={reduced ? false : { opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gallery-header">
              <h3>{galleryProject.title}</h3>
              <button type="button" onClick={closeGallery} aria-label={t('gallery.close')}>
                <FaTimes />
              </button>
            </div>
            <div className="gallery-carousel">
              <button type="button" className="gallery-arrow" onClick={showPreviousImage} aria-label={t('gallery.previous')}>
                <FaChevronLeft />
              </button>
              <a
                className="gallery-carousel-image"
                href={galleryProject.galleryImages[galleryIndex]?.url}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={galleryProject.galleryImages[galleryIndex]?.url}
                  alt={t('gallery.imageAlt', { name: galleryProject.title, number: galleryIndex + 1 })}
                />
              </a>
              <button type="button" className="gallery-arrow" onClick={showNextImage} aria-label={t('gallery.next')}>
                <FaChevronRight />
              </button>
            </div>
            <div className="gallery-thumbs">
              {galleryProject.galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image.id || image.url}
                  className={index === galleryIndex ? 'active' : ''}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={t('gallery.imageButton', { name: galleryProject.title, number: index + 1 })}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
            <p className="gallery-counter">
              {t('gallery.counter', { number: galleryIndex + 1, total: galleryProject.galleryImages.length })}
            </p>
          </Motion.div>
        </div>
      ) : null}

      <MotionSection className="section section-alt" id="experience" number="04">
        <div className="section-header">
          <RevealHeading>{t('experience.title')}</RevealHeading>
          <p>{t('experience.description')}</p>
        </div>
        <BackgroundTimeline />
      </MotionSection>

      <MotionSection id="certifications" number="05">
        <div className="section-header">
          <RevealHeading>{t('certifications.title')}</RevealHeading>
          <p>{t('certifications.description')}</p>
        </div>
        <div className="certification-grid">
          {certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <RevealCard key={cert.id} className="cert-card" index={index}>
                {cert.file_url && !String(cert.file_url).toLowerCase().endsWith('.pdf') ? (
                  <img src={cert.file_url} alt={cert.title} loading="lazy" decoding="async" />
                ) : null}
                <h3>{cert.title}</h3>
                <p>{cert.issuer}</p>
                <span>{new Date(cert.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                {cert.url ? (
                  <a href={cert.url} target="_blank" rel="noreferrer">{t('certifications.view')}</a>
                ) : null}
                {cert.file_url ? (
                  <a href={cert.file_url} target="_blank" rel="noreferrer">{t('certifications.file')}</a>
                ) : null}
                <p>{cert.description}</p>
              </RevealCard>
            ))
          ) : (
            <p className="empty-state">{t('certifications.empty')}</p>
          )}
        </div>
      </MotionSection>

      <MotionSection className="section section-alt" id="contact" number="06">
        <div className="section-header">
          <RevealHeading>{t('contact.title')}</RevealHeading>
          <p>{t('contact.description')}</p>
        </div>
        <div className="contact-layout">
          <aside className="contact-aside">
            <h3>{t('contact.asideTitle')}</h3>
            <p>{t('contact.asideText')}</p>
            <h4>{t('contact.phone')}</h4>
            <PhoneContacts />
            <div className="contact-links">
              {profile.email ? <a href={`mailto:${profile.email}`}><FaEnvelope /> {profile.email}</a> : null}
              {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a> : null}
              {profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer"><FaGithub /> GitHub</a> : null}
              {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><FaLinkedin /> LinkedIn</a> : null}
            </div>
          </aside>
          <form onSubmit={handleContactSubmit} className="contact-form" noValidate>
            <p>{t('contact.mailHint')}</p>
            <div className="form-grid">
              <label>
                {t('contact.name')}
                <input
                  name="name"
                  value={contact.name}
                  aria-invalid={!!validation.name}
                  aria-describedby={validation.name ? 'error-name' : undefined}
                  onChange={(e) => updateContact('name', e.target.value)}
                  required
                />
              {validation.name ? <span id="error-name" className="field-error">{t(validation.name)}</span> : null}
              </label>
              <label>
                {t('contact.email')}
                <input
                  type="email"
                  name="email"
                  value={contact.email}
                  aria-invalid={!!validation.email}
                  aria-describedby={validation.email ? 'error-email' : undefined}
                  onChange={(e) => updateContact('email', e.target.value)}
                  required
                />
              {validation.email ? <span id="error-email" className="field-error">{t(validation.email)}</span> : null}
              </label>
              <label className="full-width">
                {t('contact.subject')}
                <input
                  name="subject"
                  value={contact.subject}
                  aria-invalid={!!validation.subject}
                  aria-describedby={validation.subject ? 'error-subject' : undefined}
                  onChange={(e) => updateContact('subject', e.target.value)}
                  required
                />
              {validation.subject ? <span id="error-subject" className="field-error">{t(validation.subject)}</span> : null}
              </label>
              <label className="full-width">
                {t('contact.message')}
                <textarea
                  name="message"
                  value={contact.message}
                  aria-invalid={!!validation.message}
                  aria-describedby={validation.message ? 'error-message' : undefined}
                  onChange={(e) => updateContact('message', e.target.value)}
                  required
                />
              {validation.message ? <span id="error-message" className="field-error">{t(validation.message)}</span> : null}
              </label>
            </div>
            <button type="submit" className="button button-primary">{t('contact.send')}</button>
            {status ? <p className="form-status" role="status">{t(status)}</p> : null}
          </form>
        </div>
      </MotionSection>

      <footer className="portfolio-footer">
        <div className="footer-brand-block">
          <strong>{t('brand')}</strong>
          <p>{profile.professional_title}</p>
          <div className="footer-socials">
            {profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a> : null}
            {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a> : null}
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a> : null}
            {emailUrl ? <a href={emailUrl} aria-label={t('hero.email')}><FaEnvelope /></a> : null}
          </div>
        </div>
        <nav className="footer-nav" aria-label={t('nav.footer')}>
          {footerLinks.map((link) => (
            <a key={link.key} href={link.href} onClick={(event) => handleFooterLink(event, link.href)}>
              {t(link.key)}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          {profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null}
          <PhoneContacts variant="compact" />
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} {t('brand')}. {t('footer.rights')}
        </p>
      </footer>

      <FloatingActions whatsappNumber={profile.whatsapp_number} email={profile.email} />
    </main>
  );
}
