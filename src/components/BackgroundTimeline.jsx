import { FaBriefcase, FaGraduationCap, FaCheck } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import { RevealCard } from './MotionPrimitives';
import '../parcours-timeline.css';

function ExperienceDate({ value, language }) {
  return <time dateTime={value}>{new Date(`${value}T12:00:00`).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' },
  )}</time>;
}

export default function BackgroundTimeline() {
  const { language, t, content: { educations = [], experiences = [] } } = useTranslation();
  const orderedEducations = [...educations].sort((a, b) => b.start_year - a.start_year);
  const orderedExperiences = [...experiences].sort((a, b) => b.start_date.localeCompare(a.start_date));

  return (
    <div className="background-timeline">
      {orderedEducations.length > 0 && <div className="background-group education-group">
        <h3 className="background-group-title"><FaGraduationCap aria-hidden="true" />{t('education.title')}</h3>
        <div className="timeline background-track">
          {orderedEducations.map((education, index) => (
            <RevealCard key={education.id} className={`timeline-item background-card education-card${education.is_current ? ' current-education' : ''}`} index={index}>
              <div className="background-card-meta">
                <span className="timeline-date"><time dateTime={String(education.start_year)}>{education.start_year}</time><span aria-hidden="true"> — </span>
                  {education.is_current ? t('education.inProgress') : <time dateTime={String(education.end_year)}>{education.end_year}</time>}
                </span>
                <span className={`background-badge${education.is_current ? ' current-badge' : ''}`}>
                  <FaGraduationCap aria-hidden="true" />{t(education.is_current ? 'education.current' : 'experience.education')}
                </span>
              </div>
              <h4 className="background-card-title">{education.title}</h4>
              <p className="background-institution">{education.institution}</p>
              {education.institution_full_name && <p className="background-institution-detail">{education.institution_full_name}</p>}
              <div className="background-description">{education.description_paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              {education.academic_years?.length > 0 && <div className="background-years">
                <h5>{t('education.years')}</h5>
                <ul className="academic-year-list">{education.academic_years.map((year) => <li key={year.start_year}>
                  <time dateTime={String(year.start_year)}>{year.start_year}</time> — <time dateTime={String(year.end_year)}>{year.end_year}</time>
                </li>)}</ul>
              </div>}
              {education.diplomas?.length > 0 && <div className="background-diplomas">
                <h5>{t('education.diplomas')}</h5>
                <ul className="diploma-list">{education.diplomas.map((diploma) => <li key={diploma}><FaCheck aria-hidden="true" /><span>{diploma}</span></li>)}</ul>
              </div>}
            </RevealCard>
          ))}
        </div>
      </div>}

      {orderedExperiences.length > 0 && <div className="background-group professional-group">
        <h3 className="background-group-title"><FaBriefcase aria-hidden="true" />{t('experience.professional')}</h3>
        <div className="timeline background-track">
          {orderedExperiences.map((experience, index) => (
            <RevealCard key={experience.id} className="timeline-item background-card professional-card" index={index}>
              <div className="background-card-meta">
                <span className="timeline-date"><ExperienceDate value={experience.start_date} language={language} /><span aria-hidden="true"> — </span>
                  {experience.end_date ? <ExperienceDate value={experience.end_date} language={language} /> : t('experience.today')}
                </span>
                <span className="background-badge"><FaBriefcase aria-hidden="true" />{t('experience.professional')}</span>
              </div>
              <h4 className="background-card-title">{experience.position}</h4>
              <p className="background-institution">{experience.company}{experience.location ? ` · ${experience.location}` : ''}</p>
              <div className="background-description"><p>{experience.description}</p>{experience.context && <p>{experience.context}</p>}</div>
            </RevealCard>
          ))}
        </div>
      </div>}
      {!orderedEducations.length && !orderedExperiences.length && <p className="empty-state">{t('experience.empty')}</p>}
    </div>
  );
}
