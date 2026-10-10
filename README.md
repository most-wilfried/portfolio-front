# Portfolio statique React + Vite

Le site actif se trouve dans `my-portfolio/`. Il fonctionne sans backend, sans base de données et sans variable d’environnement.

## Lancer et construire

```bash
cd my-portfolio
npm ci
npm run dev
npm run build
npm run preview
```

## Modifier les contenus

Les fichiers `src/data/` contiennent toutes les informations publiques :

- `profile.json` : présentation, coordonnées, liens GitHub/LinkedIn/WhatsApp, portrait et CV.
- `skills.json` : compétences, catégories, niveaux, pourcentages, ordre et visibilité (`is_active`).
- `projects.json` : projets, technologies, images, galeries et liens de démonstration/code.
- `experiences.json` : parcours professionnel et dates.
- `certifications.json` : certifications réelles à ajouter.

Les images et documents sont dans `public/media/`. Pour ajouter une image `public/media/projets/exemple.jpg`, renseigner `/media/projets/exemple.jpg` dans les données. Pour une galerie, ajouter des objets `{ "id": 1, "url": "/media/projets/exemple.jpg" }` à `gallery_images`. Les textes de l’interface sont dans `src/locales/fr.json` et `en.json` ; les contenus personnels sont actuellement en français.

## Contact

Le formulaire prépare un brouillon dans l’application de messagerie du visiteur avec `mailto:`. Le visiteur doit envoyer le message depuis cette application. Aucun message n’est enregistré sur le site. L’adresse se configure dans `profile.json`.

## Déployer sur Vercel

Importer le dépôt du frontend et choisir la racine `my-portfolio` si le dépôt contient le dossier parent (ou `.` si le dépôt est celui de `my-portfolio`). Le fichier `vercel.json` définit la commande `npm run build` et le dossier de sortie `dist`. Aucune variable API/DB ni fonction serveur n’est nécessaire. Le site n’a qu’une page, avec navigation par ancres.

## État de la récupération

La connexion à l’ancienne base Aiven échoue car son nom d’hôte ne se résout plus. Les cinq routes de l’ancienne API publique sont également inaccessibles. Il ne s’agit donc pas d’un export confirmé de la base.

Les informations disponibles ont été récupérées depuis le CV local, les compétences du seeder et les images locales. GameZone est identifié par son visuel ; sa date, son statut et ses liens restent à compléter. Les pourcentages de compétences correspondent aux niveaux du seeder (85/65/40), à confirmer. Les certifications sont laissées vides car aucun justificatif réel n’était disponible. Les images et le CV locaux ont tous été copiés dans `public/media/` ; les anciennes variantes de portrait sont conservées, et le portrait choisi pourra être remplacé.

L’ancien backend, ses fichiers de configuration et les anciens déploiements ont été déplacés dans `../portfolio-legacy-2026-10-10/`, hors du projet actif, pour permettre une récupération ultérieure. Ils ne sont pas nécessaires au site statique. La base distante n’a pas été modifiée ni supprimée.

Pour terminer la récupération exacte, fournir un export des tables publiques ou rétablir un accès à la base/API. Il restera ensuite à comparer et remplacer les JSON statiques ; aucun compte administrateur ni message privé ne doit être publié.

## Interface et animations

Le frontend conserve React et Motion déjà installés, sans nouvelle bibliothèque. L’introduction présente le vrai portrait avec une révélation organique, un léger flottement et une inclinaison au pointeur. Le nom apparaît mot par mot. Les mouvements du portrait et des sections suivent la position du défilement et sont réversibles. Chaque titre et carte possède son déclenchement d’apparition pour ne pas masquer les longues sections.

`src/components/Hero.jsx` gère l’introduction ; `MotionPrimitives.jsx` fournit les révélations et cartes ; `src/hooks/usePointerTilt.js` gère l’inclinaison. Les nouveaux styles sont dans `src/immersive.css` et `src/navigation-motion.css`. Les préférences `prefers-reduced-motion` sont respectées ; les effets au pointeur sont réservés aux appareils avec souris. Le menu et la galerie prennent en charge le clavier et la restauration du focus. Les coordonnées absentes ne sont pas remplacées par des coordonnées fictives.

Les vérifications de code et compilation se lancent avec `npm run lint` et `npm run build`.

Vérification navigateur effectuée dans Chrome headless : défilement aller/retour, inclinaison souris, titres et barres de compétences, navigation active, galerie et clavier, focus du menu mobile, modes clair/sombre, français/anglais, largeurs de 320 à 1440 pixels et préférence d’animations réduites activée avant ou pendant la visite. Aucune erreur JavaScript détectée. Le JavaScript de production passe d’environ 879 Ko à 428 Ko (138 Ko gzip), principalement grâce aux imports d’icônes ciblés.
