# GestCom

Catalogue de prix mobile pour petites boutiques (téléphones et accessoires). Le gérant enregistre ses articles avec photo, catégorie et prix ; les vendeurs retrouvent un prix en quelques secondes, sans appeler le gérant.

**Stack** : Expo SDK 58 (React Native 0.88), Expo Router, NativeWind 4 (Tailwind 3), lucide-react-native, Reanimated 4, Zustand + AsyncStorage. Android 9 minimum (`minSdkVersion 28`).

## Démarrer

Prérequis : **Node.js ≥ 22.13** (exigé par le SDK 58).

```bash
npm install
npx expo start          # puis « a » pour Android, ou scanner le QR code avec Expo Go
npx expo run:android    # build de développement natif
```

Vérifications : `npm run typecheck` et `npx eslint src`.

## Écrans

| Écran | Route | Accès |
| --- | --- | --- |
| Création de la boutique (1er lancement) | `(auth)/register` | public |
| Connexion | `(auth)/login` | public |
| Tableau de bord | `(tabs)/index` | gérant |
| Magasin : recherche, filtre par catégorie, tri | `(tabs)/magasin` | tous |
| Catégories (création, couleur, icône) | `(tabs)/categories` | tous (édition : gérant) |
| Réglages | `(tabs)/reglages` | tous |
| Fiche article | `article/[id]` | tous |
| Ajout / modification d'article | `article/form` | gérant |
| Équipe et accès | `equipe` | gérant |
| Changer de mot de passe | `mot-de-passe` | tous |

## Rôles

- **Gérant** : gère articles, catégories et comptes de l'équipe. Voit quels articles les vendeurs consultent le plus.
- **Vendeur** : consulte le magasin et les prix, sans rien pouvoir modifier.

## Données

Tout est stocké **sur l'appareil** (AsyncStorage). Les photos sont copiées dans le stockage permanent de l'app. Les mots de passe sont hachés (SHA-256 + sel).

Limite actuelle : pas de synchronisation entre téléphones. Pour que le gérant et les vendeurs partagent le catalogue sur plusieurs appareils, il faudra un backend (prochaine étape).

## Arborescence

```
src/
  app/          routes Expo Router (écrans)
  components/   UI réutilisable (Button, Input, Sheet, TabBar, ArticleCard…)
  lib/          formatage FCFA, thème, icônes, photos, sécurité
  store/        état global persistant (useApp) et types
```
