import { useMotionPreference } from '../hooks/useMotionPreference';
import { useEffect, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaArrowUp,
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
import { profile, skills, projects, experiences, certifications } from '../data/portfolio';
import FloatingActions from '../components/FloatingActions';
import Hero from '../components/Hero';
import { MotionSection, RevealHeading, RevealCard, InteractiveProject } from '../components/MotionPrimitives';

const skillSections = [
  'Frontend',
  'Backend',
  'Frameworks',
  'Mobile',
  'IoT / Électronique',
  'Base de données',
  'Outils',
];

const footerLinks = [
  { href: '#home', key: 'nav.home' },
  { href: '#about', key: 'nav.about' },
  { href: '#skills', key: 'nav.skills' },
  { href: '#projects', key: 'nav.projects' },
  { href: '#experience', key: 'nav.experience' },
  { href: '#contact', key: 'nav.contact' },
];

function percentageFromSkill(skill) {
  if (Number.isFinite(Number(skill.percentage))) {
    return Math.max(0, Math.min(100, Number(skill.percentage)));
  }

  const level = String(skill.level || '').toLowerCase();

  if (level.includes('avanc')) {
    return 85;
  }

  if (level.includes('inter')) {
    return 65;
  }

  return 40;
}

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

const skillsByCategory = skillSections.map((category) => ({
  label: category,
  items: skills.filter((skill) => skill.category === category),
}));

const sortedProjects = [...projects].sort((a, b) => {
  const yearDiff = Number(b.year || 0) - Number(a.year || 0);
  return yearDiff || new Date(b.created_at || 0) - new Date(a.created_at || 0);
});

export default function Home() {
  const { language, t } = useTranslation();
  const reduced = useMotionPreference();
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryPanel = useRef(null);

  useEffect(() => {
    if (!galleryProject) {
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
        setGalleryProject(null);
        setGalleryIndex(0);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setGalleryIndex((index) => (index - 1 + galleryProject.galleryImages.length) % galleryProject.galleryImages.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setGalleryIndex((index) => (index + 1) % galleryProject.galleryImages.length);
      }
    };

    window.addEventListener('keydown', handleGalleryKeys);

    return () => {
      document.body.classList.remove('nav-lock');
      window.removeEventListener('keydown', handleGalleryKeys);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [galleryProject]);

  const handleContactSubmit = (event) => {
    event.preventDefault();
    if (!profile.email) {
      setStatus(t('contact.unavailable'));
      return;
    }
    const body = `${contact.message}\n\n${contact.name}\n${contact.email}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(body)}`;
    setStatus(t('contact.draftOpened'));
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
    setGalleryProject({ ...project, galleryImages });
    setGalleryIndex(0);
  };

  const closeGallery = () => {
    setGalleryProject(null);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
    window.history.replaceState(null, '', '#home');
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
          <p>
            {profile.about_intro}
          </p>
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
          <div className="skill-grid">
            {skillsByCategory.map(({ label, items }, index) => (
              <RevealCard key={label} className="skill-category" index={index}>
                <h3>{label}</h3>
                {items.length > 0 ? (
                  items.map((skill) => {
                    const percent = percentageFromSkill(skill);
                    return (
                    <Motion.div key={skill.id} className="skill-card" whileHover={reduced ? undefined : { x: 3 }}>
                      <span className="skill-icon">{getTechIcon(skill.icon || skill.name)}</span>
                      <div className="skill-details">
                        <div className="skill-card-header">
                          <strong>{skill.name}</strong>
                          <span>{percent}%</span>
                        </div>
                        <Motion.div className="skill-progress" role="progressbar"
                          aria-label={skill.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
                          initial={reduced ? false : 'hidden'} whileInView="visible"
                          viewport={{ once: false, amount: 0.65 }}
                        >
                          <Motion.span
                            style={{ width: `${percent}%`, transformOrigin: 'left' }}
                            variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                            transition={{ duration: reduced ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </Motion.div>
                      </div>
                    </Motion.div>
                    );
                  })
                ) : (
                  <p className="empty-state">{t('skills.empty')}</p>
                )}
              </RevealCard>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection id="projects" number="03">
        <div className="section-header">
          <RevealHeading>{t('projects.title')}</RevealHeading>
        </div>
        <div className="project-grid">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project, index) => {
              const projectType = project.project_type || project.category || 'personnel';
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
                    {renderTechTags(project.technologies)}
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
                  alt={`${galleryProject.title} ${galleryIndex + 1}`}
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
                  aria-label={`${galleryProject.title} ${index + 1}`}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
            <p className="gallery-counter">
              {galleryIndex + 1} / {galleryProject.galleryImages.length}
            </p>
          </Motion.div>
        </div>
      ) : null}

      <MotionSection className="section section-alt" id="experience" number="04">
        <div className="section-header">
          <RevealHeading>{t('experience.title')}</RevealHeading>
          <p>{t('experience.description')}</p>
        </div>
        <div className="timeline">
          {experiences.length > 0 ? (
            experiences.map((experience, index) => (
              <RevealCard key={experience.id} className="timeline-item" index={index}>
                <span className="timeline-date">
                  {new Date(experience.start_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
                  {' — '}
                  {experience.end_date
                    ? new Date(experience.end_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })
                    : t('experience.today')}
                </span>
                <h3>{experience.position}</h3>
                <p className="muted">{experience.company} · {experience.location}</p>
                <p>{experience.description}</p>
              </RevealCard>
            ))
          ) : (
            <p className="empty-state">{t('experience.empty')}</p>
          )}
        </div>
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
            <div className="contact-links">
              {profile.email ? <a href={`mailto:${profile.email}`}><FaEnvelope /> {profile.email}</a> : null}
              {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a> : null}
              {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><FaLinkedin /> LinkedIn</a> : null}
            </div>
          </aside>
          <form onSubmit={handleContactSubmit} className="contact-form">
            <p>{t('contact.mailHint')}</p>
            <div className="form-grid">
              <label>
                {t('contact.name')}
                <input
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  required
                />
              </label>
              <label>
                {t('contact.email')}
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  required
                />
              </label>
              <label className="full-width">
                {t('contact.subject')}
                <input
                  value={contact.subject}
                  onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                  required
                />
              </label>
              <label className="full-width">
                {t('contact.message')}
                <textarea
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                  required
                />
              </label>
            </div>
            <button type="submit" className="button button-primary">{t('contact.send')}</button>
            {status ? <p className="form-status" role="status">{status}</p> : null}
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
            {emailUrl ? <a href={emailUrl} aria-label="Email"><FaEnvelope /></a> : null}
          </div>
        </div>
        <nav className="footer-nav" aria-label="Navigation de pied de page">
          {footerLinks.map((link) => (
            <a key={link.key} href={link.href} onClick={(event) => handleFooterLink(event, link.href)}>
              {t(link.key)}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          {profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null}
          
          <button type="button" onClick={scrollToTop}>
            <FaArrowUp /> {t('footer.backTop')}
          </button>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} {t('brand')}. {t('footer.rights')}
        </p>
      </footer>

      <FloatingActions whatsappNumber={profile.whatsapp_number} email={profile.email} />
    </main>
  );
}
