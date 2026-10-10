import profile from './profile.json';
import allSkills from './skills.json';
import projects from './projects.json';
import experiences from './experiences.json';
import certifications from './certifications.json';

const skills = allSkills.filter((skill) => skill.is_active !== false)
  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

export { profile, skills, projects, experiences, certifications };
