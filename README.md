# Portfolio statique React + Vite

Le site actif se trouve dans `my-portfolio/`. Il fonctionne sans backend, sans base de données et sans variable d’environnement.

## Lancer et construire

```bash
cd my-portfolio
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

## Modifier les contenus

Les fichiers `src/data/` conservent les données communes aux deux langues et les descriptions originales :

- `profile.json` : nom, coordonnées, liens GitHub/LinkedIn/WhatsApp, portrait et CV. `phones` est une liste d’objets avec `country_code` (`CM` ou `FR`), `display` (numéro affiché) et `href` (lien `tel:` avec indicatif international).
- `skills.json` : compétences, catégories, niveaux, pourcentages, ordre et visibilité (`is_active`).
- `projects.json` : projets, technologies, images, galeries et liens de démonstration/code.
- `experiences.json` : parcours professionnel et dates.
- `educations.json` : établissements, périodes, formation actuelle (`is_current`) et années académiques (`academic_years`).
- `certifications.json` : certifications réelles à ajouter.

Les images et documents sont dans `public/media/`. Pour ajouter une image `public/media/projets/exemple.jpg`, renseigner `/media/projets/exemple.jpg` dans les données. Pour une galerie, ajouter des objets `{ "id": 1, "url": "/media/projets/exemple.jpg" }` à `gallery_images`.

Les traductions sont centralisées dans `src/locales/` :

- `fr.json` et `en.json` : navigation, boutons, messages, erreurs, libellés accessibles, expressions animées et métadonnées SEO.
- `content.fr.json` et `content.en.json` : présentation, quatre domaines de compétences et descriptions des projets/parcours/certifications. Les projets, expériences, formations et certifications sont associés à leur `id` d’origine.

Pour ajouter un projet, créer son entrée avec un ID unique dans `projects.json`, puis une entrée avec le même ID dans `projects` de **chacun** des deux fichiers `content.*.json`. Renseigner `title`, `description`, `problem`, `needs`, `design`, `features` et `progress_note`. Les URL, technologies et images restent uniquement dans les données communes. Appliquer le même principe aux expériences (`position`, `description`, `context`) et aux certifications (`title`, `description`). Pour une formation, ajouter les données communes dans `educations.json`, puis une entrée du même ID dans `educations` de chaque fichier de contenu, avec `title`, `description_paragraphs` (liste de paragraphes) et `diplomas` (liste des diplômes obtenus, vide pour une formation en cours). Modifier les textes de présentation et les domaines professionnels dans les deux fichiers de contenu. Les autoévaluations doivent rester identiques entre FR et EN.

Les périodes confirmées sont Génie Logiciel à l’IAI Cameroun de 2023 à 2026 (années 2023–2024, 2024–2025 et 2025–2026), puis Master 1 MIAGE, parcours NUMRES, à l’Université Côte d'Azur depuis 2026, actuellement en cours. Les trois diplômes IAI sont le DTS, la Licence professionnelle en Génie Logiciel et le Diplôme d’Ingénieur des Travaux Informatiques ; aucune date d’obtention ni attribution à une année particulière n’est renseignée. Le stage académique chez CREM SOLUTION conserve ses dates de juillet à septembre 2025 et sa description, complétée par un contexte Génie Logiciel/IoT.

Exécuter `npm test` après chaque modification : il vérifie les clés et paramètres de traduction, la couverture des contenus, les autoévaluations et les médias. Il signale les traductions absentes avant le déploiement. Le français est la langue de la première visite ; la préférence FR/EN est mémorisée localement, avec une bascule immédiate sans rechargement.

## Contact

Le formulaire prépare un brouillon dans l’application de messagerie du visiteur avec `mailto:`. Le visiteur doit envoyer le message depuis cette application. Aucun message n’est enregistré sur le site. L’adresse se configure dans `profile.json`.

Les téléphones sont +237 690 483 357 (`tel:+237690483357`) pour le Cameroun et +33 7 67 00 44 94 (`tel:+33767004494`) pour la France. Le WhatsApp principal utilise le numéro français : `whatsapp_number` vaut `33767004494` et ouvre `https://wa.me/33767004494`. `github_url` pointe vers `https://github.com/most-wilfried` ; les liens de dépôts propres aux projets restent dans `projects.json`. LinkedIn reste à renseigner.

## Déployer sur Vercel

Le frontend possède son propre dépôt Git `most-wilfried/portfolio-front`. Pour ce dépôt, choisir **Vite**, la racine du dépôt (`.`), `npm run build` et `dist`. Aucune variable API/DB n’est nécessaire.

Voir le [guide détaillé pour réutiliser le projet Vercel existant et publier cette version](DEPLOIEMENT_VERCEL.md).

## État de la récupération

La connexion à l’ancienne base Aiven échoue car son nom d’hôte ne se résout plus. Les cinq routes de l’ancienne API publique sont également inaccessibles. Il ne s’agit donc pas d’un export confirmé de la base.

Les informations initiales ont été récupérées depuis le CV local, les compétences du seeder et les images locales. Le nouveau positionnement MIAGE/NUMRES, les quatre domaines et les autoévaluations UML (80 %), Merise (50 %) et Kanban (52 %) viennent des informations fournies par le propriétaire. Les 12 compétences techniques existantes restent présentes avec leurs valeurs d’origine (85/65/40), à confirmer. L’IA, les agents et n8n sont explicitement présentés comme des apprentissages et explorations.

GameZone utilise désormais les technologies précisées par le propriétaire : Flutter Desktop, SQLite et ESP32. Les dates, liens de dépôts GitHub/démonstration et niveaux réels d’avancement des projets restent à compléter ; les descriptions distinguent le périmètre des fonctionnalités finalisées. Le profil GitHub, les deux téléphones et WhatsApp sont renseignés d’après les informations du propriétaire ; LinkedIn reste vide. Les certifications sont laissées vides faute de justificatif réel. Aucune traduction du contenu actuellement affiché n’est manquante.

Les images et le CV locaux sont conservés dans `public/media/`. Les coordonnées, le nom CREM SOLUTION et la rubrique formation du PDF du CV sont actualisés : MIAGE en cours depuis 2026, IAI 2023–2026 avec trois années et trois diplômes sans dates d’obtention. Les anciennes formations en économie et le baccalauréat sont conservés. Le PDF reste en français ; sa photo, sa présentation et les autres contenus sont conservés. Une version anglaise pourra être ajoutée ultérieurement. Les anciennes variantes de portrait restent disponibles.

L’ancien backend, ses fichiers de configuration et les anciens déploiements ont été déplacés dans `../portfolio-legacy-2026-10-10/`, hors du projet actif, pour permettre une récupération ultérieure. Ils ne sont pas nécessaires au site statique. La base distante n’a pas été modifiée ni supprimée.

Pour terminer la récupération exacte, fournir un export des tables publiques ou rétablir un accès à la base/API. Il restera ensuite à comparer et remplacer les JSON statiques ; aucun compte administrateur ni message privé ne doit être publié.

## Interface et animations

Le frontend conserve React et Motion déjà installés, sans nouvelle bibliothèque. L’introduction présente le vrai portrait avec une révélation organique, un léger flottement et une inclinaison au pointeur. Le nom apparaît mot par mot. Les mouvements du portrait et des sections suivent la position du défilement et sont réversibles. Chaque titre et carte possède son déclenchement d’apparition pour ne pas masquer les longues sections.

`src/components/Hero.jsx` gère l’introduction ; `ProfessionalPhrases.jsx` affiche les expressions bilingues avec une pause et conserve la phrase courante lors d’une bascule FR/EN ; `SkillDomains.jsx` présente les quatre domaines ; `BackgroundTimeline.jsx` distingue formations et expériences, avec des années et diplômes visibles ; `MotionPrimitives.jsx` fournit les révélations et cartes ; `src/hooks/usePointerTilt.js` gère l’inclinaison. Les styles sont dans `src/immersive.css`, `src/navigation-motion.css`, `src/floating-controls.css` et `src/parcours-timeline.css`.

`FloatingActions.jsx` affiche le retour en haut après 500 pixels de défilement, dans un dock en bas à droite qui respecte les zones de sécurité mobile. Les liens de messagerie s’effacent au footer. Le bouton restaure le focus au contenu ; son libellé est bilingue. Les préférences `prefers-reduced-motion` sont respectées, y compris lors d’un changement pendant la visite ; les effets au pointeur sont réservés aux appareils avec souris. Le menu et la galerie prennent en charge le clavier et la restauration du focus.

Vérifications : `npm test` (neuf tests de contenu/i18n/médias/contacts/parcours), `npm run lint` et `npm run build`. Contrôles navigateur dans Chrome headless : bascules FR/EN et persistance, contenus des sections, expressions animées, métadonnées, galerie ouverte, validation et messages du formulaire, menu/clavier, retour en haut et absence de chevauchement au footer, largeurs de 320 à 1440 pixels et animations réduites. La refonte précédente a aussi vérifié le défilement réversible, le portrait au pointeur, les thèmes et les barres de compétences. Aucune nouvelle dépendance n’a été ajoutée pour cette évolution.
