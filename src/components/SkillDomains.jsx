import { motion as Motion } from 'framer-motion';
import { FaProjectDiagram, FaTasks, FaCode, FaRobot } from 'react-icons/fa';
import { getTechIcon } from '../constants/iconMap';
import { useTranslation } from '../i18n';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { RevealCard } from './MotionPrimitives';

const icons = { analysis: FaProjectDiagram, management: FaTasks, technical: FaCode, ai: FaRobot };
const levelKeys = { 'Avancé': 'advanced', 'Intermédiaire': 'intermediate', 'Débutant': 'beginner' };

function Assessment({ name, percentage, icon, caption }) {
  const { t } = useTranslation();
  const reduced = useMotionPreference();
  const hasScore = typeof percentage === 'number' && Number.isFinite(percentage);
  const value = hasScore ? Math.max(0, Math.min(100, percentage)) : null;
  return (
    <div className="skill-card">
      <span className="skill-icon">{getTechIcon(icon || name)}</span>
      <div className="skill-details">
        <div className="skill-card-header"><strong>{name}</strong><span>{hasScore ? `${value}%` : t('skills.noScore')}</span></div>
        {hasScore ? <Motion.div className="skill-progress" role="progressbar" aria-label={`${name} — ${t('skills.selfAssessment')}`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
          initial={reduced ? false : 'hidden'} animate={reduced ? 'visible' : 'hidden'}
          whileInView="visible" viewport={{ once: false, amount: 0.65 }}>
          <Motion.span style={{ width: `${value}%`, transformOrigin: 'left' }}
            variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }} transition={{ duration: reduced ? 0 : 0.85 }} />
        </Motion.div> : null}
        {caption ? <small className="skill-level">{caption}</small> : null}
      </div>
    </div>
  );
}

export default function SkillDomains() {
  const { t, content: { skillGroups, skills, projects } } = useTranslation();
  const knownNames = new Set(skills.map((skill) => skill.name.toLowerCase()));
  const projectTechnologies = [...new Set(projects.flatMap((project) => project.technologies || []))]
    .filter((name) => !knownNames.has(name.toLowerCase()));
  return (
    <>
      <p className="assessment-note">{t('footer.selfAssessmentDisclaimer')}</p>
      <div className="skills-professional-grid">
        {skillGroups.map((group, index) => {
          const Icon = icons[group.id] || FaCode;
          return (
            <RevealCard key={group.id} className={`skill-domain domain-${group.id}`} index={index}>
              <div className="domain-heading"><span className="domain-icon"><Icon aria-hidden="true" /></span><h3>{group.title}</h3></div>
              <p className="domain-description">{group.description}</p>
              {!!group.assessments?.length && <div className="domain-assessments">{group.assessments.map((skill) => <Assessment key={skill.name} {...skill} />)}</div>}
              {!!group.practices?.length && <><h4>{t('skills.practices')}</h4><ul className="domain-practices">{group.practices.map((practice) => <li key={practice}>{practice}</li>)}</ul></>}
              {group.id === 'technical' ? <>
                <h4>{t('skills.technical')}</h4>
                <div className="technical-skill-list">{skills.map((skill) => <Assessment key={skill.id} {...skill} caption={levelKeys[skill.level] ? t(`skillLevel.${levelKeys[skill.level]}`) : null} />)}</div>
                {!!projectTechnologies.length && <><h4>{t('skills.projectTechnologies')}</h4><div className="tech-tags">{projectTechnologies.map((tech) => <span className="tag" key={tech}>{getTechIcon(tech)}{tech}</span>)}</div></>}
              </> : null}
              {!!group.learning?.length && <><p className="learning-label">{t('skills.learning')}</p><ul className="domain-practices learning-list">{group.learning.map((practice) => <li key={practice}>{practice}</li>)}</ul></>}
            </RevealCard>
          );
        })}
      </div>
    </>
  );
}
