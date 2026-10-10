# Redéployer le portfolio sur Vercel

Le frontend local est un dépôt Git autonome : `my-portfolio/`, relié à `https://github.com/most-wilfried/portfolio-front.git`. Sa branche actuelle est `main`. Les changements réalisés dans cette session sont encore locaux ; ils n’ont pas été publiés par l’assistant sur GitHub ou Vercel. L’état actuel du projet Vercel n’a pas été vérifié depuis un compte connecté.

## 1. Retrouver le projet existant

Ouvrir https://vercel.com/dashboard et sélectionner le projet qui héberge déjà le portfolio. Dans **Settings > Git**, vérifier que le dépôt connecté est `most-wilfried/portfolio-front` et que la branche de production souhaitée est `main`.

Réutiliser ce projet et son domaine actuel. Si le projet n’apparaît pas, vérifier le compte et l’équipe sélectionnés ainsi que l’accès au projet existant.

## 2. Vérifier les paramètres

Dans **Settings > Build and Deployment**, vérifier :

| Paramètre | Valeur pour le dépôt `portfolio-front` |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | Racine du dépôt (`.` ou valeur vide par défaut) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | Détection automatique de npm |

`my-portfolio` est le nom du dossier local : dans ce dépôt autonome, ses fichiers sont déjà à la racine. Ne pas sélectionner un sous-dossier `my-portfolio` pour `portfolio-front`. Ce choix ne serait nécessaire que dans un autre dépôt contenant le dossier parent et `my-portfolio/` comme sous-dossier.

Le fichier `vercel.json` configure déjà la compilation et le dossier de sortie. L’application fonctionne sans variable API/DB. L’ancienne variable `VITE_API_URL` peut être retirée du projet Vercel ; elle n’est plus utilisée.

## 3. Envoyer cette version sur GitHub

Dans un terminal :

```bash
cd /home/most/Bureau/portfolio/my-portfolio
npm test
npm run lint
npm run build
git status
git add .
git commit -m "Reposition portfolio and complete French-English localization"
git push origin main
```

Ces commandes publient les changements. Elles sont fournies comme guide ; elles n’ont pas été exécutées par l’assistant pour le commit/push.

## 4. Suivre le déploiement

Si l’intégration Git et les déploiements automatiques sont activés, le push sur la branche de production déclenche une nouvelle mise en ligne. Dans **Deployments**, ouvrir le nouveau déploiement, vérifier qu’il correspond au nouveau commit et attendre l’état **Ready**. En cas d’échec, consulter les logs de compilation.

Le bouton **Redeploy** relance un déploiement à partir de sa source déjà publiée. Il n’envoie pas les changements présents uniquement sur ton ordinateur. Pour afficher cette nouvelle version, commencer par le commit et le push ci-dessus.

## 5. Vérifier le site

Ouvrir le domaine du projet et vérifier le portrait, les images de projets, le CV, les thèmes, les bascules FR → EN → FR, les contenus des projets et du parcours, les animations, le retour en haut et le menu mobile. Vérifier aussi la traduction des erreurs du formulaire. Celui-ci prépare un e-mail dans l’application de messagerie du visiteur ; ce dernier doit encore l’envoyer.

## Documentation officielle

- [Configurer la compilation et la racine du projet](https://vercel.com/docs/builds/configure-a-build)
- [Déploiements à partir de Git](https://vercel.com/docs/git)
- [Gérer et relancer un déploiement](https://vercel.com/docs/deployments/managing-deployments)
