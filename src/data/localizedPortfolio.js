import { profile, skills, projects, experiences, certifications, educations } from './portfolio';
import fr from '../locales/content.fr.json';
import en from '../locales/content.en.json';

const dictionaries = { fr, en };

export function getLocalizedPortfolio(language) {
  const dictionary = dictionaries[language] || dictionaries.fr;
  const localize = (items, translations) => items.map((item) => ({ ...item, ...translations[item.id] }));
  return {
    profile: { ...profile, ...dictionary.profile },
    skills,
    skillGroups: dictionary.skillGroups,
    projects: localize(projects, dictionary.projects),
    experiences: localize(experiences, dictionary.experiences),
    certifications: localize(certifications, dictionary.certifications),
    educations: localize(educations, dictionary.educations),
  };
}
