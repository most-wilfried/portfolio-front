import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(root, 'src');
const readJson = (path) => JSON.parse(readFileSync(join(sourceRoot, path), 'utf8'));
const languages = ['fr', 'en'];
const ui = Object.fromEntries(languages.map((language) => [language, readJson(`locales/${language}.json`)]));
const content = Object.fromEntries(languages.map((language) => [language, readJson(`locales/content.${language}.json`)]));
const original = {
  profile: readJson('data/profile.json'),
  projects: readJson('data/projects.json'),
  experiences: readJson('data/experiences.json'),
  certifications: readJson('data/certifications.json'),
  educations: readJson('data/educations.json'),
};

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

function assertText(value, path) {
  assert.equal(typeof value, 'string', `${path} must be a translated string`);
  assert.ok(value.trim().length > 0, `${path} must not be empty`);
}

function assertTextList(value, path) {
  assert.ok(Array.isArray(value), `${path} must be a list`);
  value.forEach((text, index) => assertText(text, `${path}[${index}]`));
}

function placeholders(text) {
  return [...text.matchAll(/\{\{\s*([\w]+)\s*\}\}/g)].map((match) => match[1]).sort();
}

test('French and English UI dictionaries cover the same keys and interpolation values', () => {
  assert.deepEqual(Object.keys(ui.en).sort(), Object.keys(ui.fr).sort());
  for (const key of Object.keys(ui.fr)) {
    for (const language of languages) assertText(ui[language][key], `${language}.${key}`);
    assert.deepEqual(placeholders(ui.en[key]), placeholders(ui.fr[key]), `${key} has inconsistent placeholders`);
  }
});

test('every static translation call in application source has both translations', () => {
  const missing = [];
  let checked = 0;
  for (const file of filesIn(sourceRoot).filter((path) => ['.js', '.jsx'].includes(extname(path)))) {
    const source = readFileSync(file, 'utf8');
    // Literal keys only: computed keys and interpolated template literals are checked by content tests.
    for (const match of source.matchAll(/\bt\(\s*(['"`])([^'"`\n]+)\1\s*(?=[,)])/g)) {
      const key = match[2];
      if (match[1] === '`' && key.includes('${')) continue;
      checked += 1;
      for (const language of languages) {
        if (!Object.hasOwn(ui[language], key)) missing.push(`${relative(root, file)}: ${language}.${key}`);
      }
    }
  }
  assert.ok(checked > 0, 'The scan must find actual translation calls');
  assert.deepEqual(missing, [], `Missing UI translations:\n${missing.join('\n')}`);
});

test('professional identity preserves the name and requested titles in both languages', () => {
  const name = 'TCHOUTA Guy Wilfried';
  assert.equal(original.profile.full_name, name);
  for (const language of languages) {
    assert.equal(ui[language].brand, name);
    assert.ok(!Object.hasOwn(content[language].profile, 'full_name'), 'The name must not be overridden by a translation');
  }
  assert.equal(content.fr.profile.professional_title, 'Analyse, conception & réalisation de solutions numériques');
  assert.equal(content.en.profile.professional_title, 'Analysis, Design & Development of Digital Solutions');
});

test('profile and every existing project, experience, certification and education have complete bilingual content', () => {
  const profileFields = ['professional_title', 'professional_subtitle', 'short_description', 'journey', 'goals', 'current_study'];
  const collectionFields = {
    projects: ['title', 'description', 'problem', 'needs', 'design', 'progress_note'],
    experiences: ['position', 'description', 'context'],
    certifications: ['title', 'description'],
    educations: ['title'],
  };
  for (const language of languages) {
    const dictionary = content[language];
    for (const field of profileFields) assertText(dictionary.profile[field], `${language}.profile.${field}`);
    assertTextList(dictionary.profile.about_paragraphs, `${language}.profile.about_paragraphs`);
    assert.equal(dictionary.profile.about_paragraphs.length, 4, 'The four requested biography paragraphs must be retained');
    for (const [collection, fields] of Object.entries(collectionFields)) {
      const ids = original[collection].map((item) => String(item.id)).sort();
      assert.equal(new Set(ids).size, ids.length, `${collection} has duplicate source IDs`);
      assert.deepEqual(Object.keys(dictionary[collection]).sort(), ids, `${language}.${collection} must cover source IDs exactly`);
      for (const id of ids) {
        const entry = dictionary[collection][id];
        for (const field of fields) assertText(entry[field], `${language}.${collection}.${id}.${field}`);
        if (collection === 'projects') {
          assertTextList(entry.features, `${language}.${collection}.${id}.features`);
          assert.ok(entry.features.length > 0, `Project ${id} must document its scope`);
        }
        if (collection === 'educations') {
          assertTextList(entry.description_paragraphs, `${language}.${collection}.${id}.description_paragraphs`);
          assert.ok(entry.description_paragraphs.length > 0, `Education ${id} must describe the programme`);
          assertTextList(entry.diplomas, `${language}.${collection}.${id}.diplomas`);
          const other = content[language === 'fr' ? 'en' : 'fr'].educations[id];
          assert.deepEqual(Object.keys(entry).sort(), Object.keys(other).sort(), `Education ${id} must expose identical fields in both languages`);
          assert.equal(entry.description_paragraphs.length, other.description_paragraphs.length, `Education ${id} must retain all paragraphs in both languages`);
          assert.equal(entry.diplomas.length, other.diplomas.length, `Education ${id} must retain all diplomas in both languages`);
        }
      }
    }
  }
  // Different prose prevents an English overlay accidentally copied from French from passing coverage checks.
  for (const field of profileFields) assert.notEqual(content.en.profile[field], content.fr.profile[field], `profile.${field} needs an English version`);
  for (const collection of Object.keys(collectionFields)) {
    for (const item of original[collection]) {
      const french = content.fr[collection][item.id];
      const english = content.en[collection][item.id];
      if (collection === 'educations') {
        assert.notEqual(english.title, french.title, `educations.${item.id}.title needs an English version`);
        french.description_paragraphs.forEach((paragraph, index) => {
          assert.notEqual(english.description_paragraphs[index], paragraph, `educations.${item.id}.description_paragraphs[${index}] needs an English version`);
        });
        french.diplomas.forEach((diploma, index) => {
          assert.notEqual(english.diplomas[index], diploma, `educations.${item.id}.diplomas[${index}] needs an English version`);
        });
      } else {
        assert.notEqual(english.description, french.description, `${collection}.${item.id}.description needs an English version`);
        if (collection === 'experiences') assert.notEqual(english.context, french.context, `experiences.${item.id}.context needs an English version`);
      }
    }
  }
});

test('localized overlays only replace prose, preserving original URLs, media, technologies and identifiers', () => {
  const allowed = {
    profile: ['professional_title', 'professional_subtitle', 'short_description', 'about_paragraphs', 'journey', 'goals', 'current_study'],
    projects: ['title', 'description', 'problem', 'needs', 'design', 'features', 'progress_note'],
    experiences: ['position', 'description', 'context'],
    certifications: ['title', 'description'],
    educations: ['title', 'description_paragraphs', 'diplomas'],
  };
  for (const language of languages) {
    for (const [collection, fields] of Object.entries(allowed)) {
      const entries = collection === 'profile' ? [['profile', content[language].profile]] : Object.entries(content[language][collection]);
      for (const [id, entry] of entries) {
        for (const field of Object.keys(entry)) {
          assert.ok(fields.includes(field), `${language}.${collection}.${id}.${field} could overwrite invariant source data`);
        }
      }
    }
  }
});

test('contact data use the confirmed country phone numbers, French WhatsApp and personal GitHub profile', () => {
  assert.ok(!Object.hasOwn(original.profile, 'phone'), 'The obsolete combined phone field must be removed');
  assert.deepEqual(original.profile.phones, [
    { country_code: 'CM', display: '+237 690 483 357', href: 'tel:+237690483357' },
    { country_code: 'FR', display: '+33 7 67 00 44 94', href: 'tel:+33767004494' },
  ]);
  assert.equal(original.profile.whatsapp_number, '33767004494');
  assert.equal(original.profile.github_url, 'https://github.com/most-wilfried');
});

test('academic history retains the confirmed IAI years and three diplomas, with MIAGE currently in progress', () => {
  assert.deepEqual(original.educations.map((education) => education.id), ['miage', 'iai']);
  const miage = original.educations.find((education) => education.id === 'miage');
  assert.equal(miage.institution, "Université Côte d'Azur");
  assert.equal(miage.start_year, 2026);
  assert.equal(miage.end_year, null);
  assert.equal(miage.is_current, true);
  const iai = original.educations.find((education) => education.id === 'iai');
  assert.equal(iai.institution, 'IAI Cameroun');
  assert.equal(iai.institution_full_name, "Institut Africain d'Informatique – Représentation du Cameroun");
  assert.equal(iai.start_year, 2023);
  assert.equal(iai.end_year, 2026);
  assert.equal(iai.is_current, false);
  assert.deepEqual(iai.academic_years, [
    { start_year: 2023, end_year: 2024 },
    { start_year: 2024, end_year: 2025 },
    { start_year: 2025, end_year: 2026 },
  ]);
  assert.deepEqual(content.fr.educations.iai.diplomas, [
    'Diplôme de Technicien Supérieur (DTS)',
    'Licence professionnelle en Génie Logiciel',
    'Diplôme d’Ingénieur des Travaux Informatiques',
  ]);
  assert.deepEqual(content.en.educations.iai.diplomas, [
    'Higher Technician Diploma (DTS)',
    'Professional Bachelor’s Degree in Software Engineering',
    'Diploma in Computer Engineering Technology',
  ]);
  for (const language of languages) {
    const education = content[language].educations.miage;
    assert.match(education.title, /Master 1 MIAGE/);
    assert.match(education.title, /NUMRES/);
    assert.deepEqual(education.diplomas, [], 'An ongoing Master must not be presented as an awarded diploma');
    assert.equal(content[language].educations.iai.description_paragraphs.length, 3);
  }
});

test('the four professional domains retain identical scope and exact self-assessments in both languages', () => {
  const ids = ['analysis', 'management', 'technical', 'ai'];
  for (const language of languages) {
    const groups = content[language].skillGroups;
    assert.deepEqual(groups.map((group) => group.id), ids);
    for (const group of groups) {
      assertText(group.title, `${language}.${group.id}.title`);
      assertText(group.description, `${language}.${group.id}.description`);
      assertTextList(group.practices, `${language}.${group.id}.practices`);
      assert.ok(Array.isArray(group.assessments), `${language}.${group.id}.assessments must be a list`);
      const other = content[language === 'fr' ? 'en' : 'fr'].skillGroups.find((item) => item.id === group.id);
      assert.deepEqual(group.assessments, other.assessments, `${group.id} scores must not change with language`);
      assert.equal(group.practices.length, other.practices.length, `${group.id} must retain all practices in both languages`);
      assert.notEqual(group.description, other.description, `${group.id} needs translated explanatory prose`);
    }
    assert.deepEqual(groups.flatMap((group) => group.assessments), [
      { name: 'UML', percentage: 80 },
      { name: 'Merise', percentage: 50 },
      { name: 'Kanban', percentage: 52 },
    ]);
    const ai = groups.find((group) => group.id === 'ai');
    assertTextList(ai.learning, `${language}.ai.learning`);
    assert.ok(ai.learning.length > 0, 'AI exploration must remain labeled as learning');
    assert.equal(ai.learning.length, content[language === 'fr' ? 'en' : 'fr'].skillGroups.find((group) => group.id === 'ai').learning.length);
    assert.deepEqual(ai.assessments, [], 'Exploration must not be presented as a scored expert skill');
    for (let index = 0; index < 4; index += 1) assertText(ui[language][`hero.action.${index}`], `${language}.hero.action.${index}`);
  }
});

test('all local media referenced by source JSON exist in public and remain deployable without a backend', () => {
  const media = new Set();
  function collect(value) {
    if (typeof value === 'string' && value.startsWith('/media/')) media.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  }
  for (const file of filesIn(sourceRoot).filter((path) => extname(path) === '.json')) {
    collect(JSON.parse(readFileSync(file, 'utf8')));
  }
  assert.ok(media.size > 0, 'The test must check actual portrait, CV and project assets');
  const publicRoot = join(root, 'public');
  for (const url of media) {
    const path = resolve(publicRoot, `.${decodeURIComponent(url.split(/[?#]/)[0])}`);
    assert.ok(!relative(publicRoot, path).startsWith('..'), `${url} must resolve within public`);
    assert.ok(statSync(path).isFile(), `${url} must point to a deployed asset`);
  }
});
