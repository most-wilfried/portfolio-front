import { useEffect, useMemo, useState } from 'react';
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
  FaMapMarkerAlt,
  FaTimes,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa';
import * as FramerMotion from 'framer-motion';
import { getTechIcon } from '../constants/iconMap';
import { useTranslation } from '../i18n';
import {
  fetchCertifications,
  fetchExperiences,
  fetchProfile,
  fetchProjects,
  fetchSkills,
  sendContactMessage,
} from '../services/api';
import FloatingActions from '../components/FloatingActions';

const defaultProfile = {
  full_name: 'Guy Wilfrid Tchouta',
  age: null,
  professional_title: 'Développeur Full Stack',
  location: null,
  short_description: 'Créateur d’expériences digitales modernes et maintenables avec React, Laravel et MySQL.',
  about_intro: 'Portfolio dynamique construit sur une architecture React + Laravel.',
  journey: 'Développement d’applications web modernes, mobiles et IoT.',
  goals: 'Construire des solutions propres, utiles et prêtes pour un environnement professionnel.',
  github_url: null,
  linkedin_url: null,
  whatsapp_number: null,
  email: null,
  phone: null,
  avatar_url: null,
  cv_url: null,
};

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
  { href: '/', key: 'nav.home' },
  { href: '/#about', key: 'nav.about' },
  { href: '/#skills', key: 'nav.skills' },
  { href: '/#projects', key: 'nav.projects' },
  { href: '/#experience', key: 'nav.experience' },
  { href: '/#contact', key: 'nav.contact' },
];

const Motion = FramerMotion.motion;

const sectionVariants = {
  hidden: { opacity: 0, y: 44, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function MotionSection({ children, className = 'section', id }) {
  return (
    <Motion.section
      id={id}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.18, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </Motion.section>
  );
}

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

export default function Home() {
  const { language, t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    fetchProfile().then((data) => setProfile({ ...defaultProfile, ...data })).catch(console.error);
    fetchSkills().then(setSkills).catch(console.error);
    fetchProjects().then(setProjects).catch(console.error);
    fetchExperiences().then(setExperiences).catch(console.error);
    fetchCertifications().then(setCertifications).catch(console.error);
  }, []);

  useEffect(() => {
    if (!galleryProject) {
      return undefined;
    }

    document.body.classList.add('nav-lock');

    const handleGalleryKeys = (event) => {
      if (event.key === 'Escape') {
        setGalleryProject(null);
        setGalleryIndex(0);
      }
      if (event.key === 'ArrowLeft') {
        setGalleryIndex((index) => (index - 1 + galleryProject.galleryImages.length) % galleryProject.galleryImages.length);
      }
      if (event.key === 'ArrowRight') {
        setGalleryIndex((index) => (index + 1) % galleryProject.galleryImages.length);
      }
    };

    window.addEventListener('keydown', handleGalleryKeys);

    return () => {
      document.body.classList.remove('nav-lock');
      window.removeEventListener('keydown', handleGalleryKeys);
    };
  }, [galleryProject]);

  const skillsByCategory = useMemo(() => {
    return skillSections.map((category) => ({
      label: category,
      items: skills.filter((skill) => skill.category === category),
    }));
  }, [skills]);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const yearDiff = Number(b.year || 0) - Number(a.year || 0);
      if (yearDiff !== 0) {
        return yearDiff;
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [projects]);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setStatus(t('contact.sending'));

    try {
      await sendContactMessage(contact);
      setStatus(t('contact.success'));
      setContact({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus(error?.message || t('contact.error'));
    }
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
    if (!href.startsWith('/#')) {
      return;
    }

    event.preventDefault();
    document.querySelector(href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const normalizedWhatsApp = profile.whatsapp_number ? String(profile.whatsapp_number).replace(/\D/g, '') : '';
  const whatsappUrl = normalizedWhatsApp ? `https://wa.me/${normalizedWhatsApp}` : null;
  const emailUrl = profile.email ? `mailto:${profile.email}` : null;
  const profileFacts = [
    profile.age ? `${profile.age} ${language === 'fr' ? 'ans' : 'years old'}` : null,
    profile.location ? <><FaMapMarkerAlt /> {profile.location}</> : null,
    profile.phone ? profile.phone : null,
  ].filter(Boolean);

  return (
    <main className="page-shell">
      <Motion.header
        className="hero-section hero-glow"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="hero-copy">
          <p className="eyebrow">{profile.professional_title}</p>
          <h1>{t('hero.greeting', { name: profile.full_name })}</h1>
          <p className="hero-description">
            {profile.short_description}
          </p>
          {profileFacts.length > 0 ? (
            <div className="profile-facts">
              {profileFacts.map((fact, index) => (
                <span key={index}>{fact}</span>
              ))}
            </div>
          ) : null}
          <div className="hero-actions">
            {profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" className="button button-primary">
              <FaGithub /> {t('hero.github')}
            </a> : null}
            {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="button button-secondary">
              <FaLinkedin /> {t('hero.linkedin')}
            </a> : null}
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="button button-secondary">
              <FaWhatsapp /> {t('hero.whatsapp')}
            </a> : null}
            {emailUrl ? <a href={emailUrl} className="button button-secondary">
              <FaEnvelope /> {t('hero.email')}
            </a> : null}
            {profile.cv_url ? <a href={profile.cv_url} target="_blank" rel="noreferrer" className="button button-secondary">
              <FaDownload /> {t('hero.cv')}
            </a> : null}
          </div>
        </div>
        <div className="hero-avatar">
          <div className="avatar-ring"></div>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Portrait de ${profile.full_name}`}
            />
          ) : (
            <div className="hero-avatar-placeholder" aria-label={`Portrait de ${profile.full_name}`}>
              <FaUser />
              <span>{profile.full_name}</span>
            </div>
          )}
        </div>
      </Motion.header>

      <MotionSection id="about">
        <div className="section-content">
          <h2>{t('about.title')}</h2>
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

      <MotionSection className="section section-alt" id="skills">
        <div className="section-content">
          <div className="section-header">
            <h2>{t('skills.title')}</h2>
            <div>
              <h3 className="section-kicker">{t('skills.subtitle')}</h3>
              <p>{t('skills.description')}</p>
            </div>
          </div>
          <Motion.div
            className="skill-grid"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.16 }}
          >
            {skillsByCategory.map(({ label, items }) => (
              <Motion.div key={label} className="skill-category" variants={cardVariants}>
                <h3>{label}</h3>
                {items.length > 0 ? (
                  items.map((skill) => {
                    const percent = percentageFromSkill(skill);
                    return (
                    <div key={skill.id} className="skill-card">
                      <span className="skill-icon">{getTechIcon(skill.icon || skill.name)}</span>
                      <div className="skill-details">
                        <div className="skill-card-header">
                          <strong>{skill.name}</strong>
                          <span>{percent}%</span>
                        </div>
                        <div className="skill-progress" aria-label={`${skill.name} ${percent}%`}>
                          <Motion.span
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            viewport={{ once: false, amount: 0.65 }}
                            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <p className="empty-state">{t('skills.empty')}</p>
                )}
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </MotionSection>

      <MotionSection id="projects">
        <div className="section-header">
          <h2>{t('projects.title')}</h2>
        </div>
        <Motion.div
          className="project-grid"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.16 }}
        >
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project) => {
              const projectType = project.project_type || project.category || 'personnel';
              const statusLabel = project.status || 'terminé';
              const galleryImages = [
                project.image_url ? { id: 'main', url: project.image_url } : null,
                ...(project.gallery_images || []),
              ].filter(Boolean);

              return (
                <Motion.article
                  key={project.id}
                  className="project-card project-showcase-card"
                  variants={cardVariants}
                  tabIndex={0}
                  style={projectPreviewStyle(project)}
                >
                  <span className="project-timeline-dot" aria-hidden="true" />
                  <div className="project-media">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} />
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
                      <span>{projectStatusLabel(statusLabel, t)}</span>
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
                </Motion.article>
              );
            })
          ) : (
            <p className="empty-state">{t('projects.empty')}</p>
          )}
        </Motion.div>
      </MotionSection>

      {galleryProject ? (
        <div className="gallery-modal" role="dialog" aria-modal="true" aria-label={galleryProject.title}>
          <button className="gallery-backdrop" type="button" onClick={closeGallery} aria-label="Fermer" />
          <Motion.div
            className="gallery-panel gallery-carousel-panel"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gallery-header">
              <h3>{galleryProject.title}</h3>
              <button type="button" onClick={closeGallery} aria-label="Fermer">
                <FaTimes />
              </button>
            </div>
            <div className="gallery-carousel">
              <button type="button" className="gallery-arrow" onClick={showPreviousImage} aria-label="Image précédente">
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
              <button type="button" className="gallery-arrow" onClick={showNextImage} aria-label="Image suivante">
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

      <MotionSection className="section section-alt" id="experience">
        <div className="section-header">
          <h2>{t('experience.title')}</h2>
          <p>{t('experience.description')}</p>
        </div>
        <Motion.div
          className="timeline"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.16 }}
        >
          {experiences.length > 0 ? (
            experiences.map((experience) => (
              <Motion.article key={experience.id} className="timeline-item" variants={cardVariants}>
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
              </Motion.article>
            ))
          ) : (
            <p className="empty-state">{t('experience.empty')}</p>
          )}
        </Motion.div>
      </MotionSection>

      <MotionSection id="certifications">
        <div className="section-header">
          <h2>{t('certifications.title')}</h2>
          <p>{t('certifications.description')}</p>
        </div>
        <Motion.div
          className="certification-grid"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.16 }}
        >
          {certifications.length > 0 ? (
            certifications.map((cert) => (
              <Motion.article key={cert.id} className="cert-card" variants={cardVariants}>
                {cert.file_url && !String(cert.file_url).toLowerCase().endsWith('.pdf') ? (
                  <img src={cert.file_url} alt={cert.title} />
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
              </Motion.article>
            ))
          ) : (
            <p className="empty-state">{t('certifications.empty')}</p>
          )}
        </Motion.div>
      </MotionSection>

      <MotionSection className="section section-alt" id="contact">
        <div className="section-header">
          <h2>{t('contact.title')}</h2>
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
            {status ? <p className="form-status">{status}</p> : null}
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
          <a href="/admin" className="footer-admin-link">Admin</a>
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
