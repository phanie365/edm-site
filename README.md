# EDM République Villeurbanne — site vitrine

Le site de l'église de maison : présentation, informations pratiques, et une **bibliothèque** de prédications (vidéos YouTube) et de fiches PDF, à consulter et télécharger librement, sans inscription. Le contenu se gère depuis un **espace d'administration** privé (`/admin`).

Le site s'installe aussi, si on le souhaite, sur l'écran d'accueil d'un téléphone (PWA).

**Coût : 0 €.** Supabase (base de données et fichiers) et Vercel (hébergement) sont utilisés en offre gratuite.

---

## Sommaire

1. [Ce qu'il faut savoir](#1-ce-quil-faut-savoir)
2. [Créer le projet Supabase](#2-créer-le-projet-supabase)
3. [Créer la base de données](#3-créer-la-base-de-données)
4. [Créer le premier administrateur](#4-créer-le-premier-administrateur)
5. [Mettre en ligne (GitHub + Vercel)](#5-mettre-en-ligne-github--vercel)
6. [Le formulaire de contact (facultatif)](#6-le-formulaire-de-contact-facultatif)
7. [Utiliser l'administration](#7-utiliser-ladministration)
8. [Ajouter le site à l'écran d'accueil d'un téléphone](#8-ajouter-le-site-à-lécran-daccueil-dun-téléphone)
9. [Entretien](#9-entretien)
10. [Pour la personne qui s'occupe du code](#10-pour-la-personne-qui-soccupe-du-code)

---

## 1. Ce qu'il faut savoir

Trois comptes gratuits sont nécessaires :

| Service | Rôle | Lien |
|---|---|---|
| **GitHub** | garde le code du site | <https://github.com> |
| **Supabase** | garde les textes, les ressources, les PDF et les photos | <https://supabase.com> |
| **Vercel** | met le site en ligne (avec HTTPS) | <https://vercel.com> |

La mise en place prend environ 30 minutes, une seule fois. Ensuite, tout se fait depuis `/admin`.

> **Adresse :** le site est public et référencé sur Google. Pour une maison, vous pouvez n'indiquer que le quartier (« République, Villeurbanne ») et donner l'adresse exacte au premier contact.

---

## 2. Créer le projet Supabase

1. Sur <https://supabase.com>, cliquez sur **Start your project**, puis connectez-vous (avec GitHub, c'est le plus simple).
2. Cliquez sur **New project** et remplissez :
   - **Name** : `edm-republique`
   - **Database Password** : *Generate a password*, puis **notez-le** en lieu sûr
   - **Region** : *Europe (Paris)* ou *Central EU (Frankfurt)*
   - **Plan** : *Free*
3. Cliquez sur **Create new project**, puis patientez 1 à 2 minutes.

**Important : bloquer les inscriptions.** Allez dans **Authentication → Sign In / Providers**, section *User Signups*. **Désactivez** « Allow new users to sign up », puis enregistrez.

---

## 3. Créer la base de données

Les scripts sont dans le dossier **`supabase/migrations/`**. Pour chacun, **dans l'ordre** :

1. Dans Supabase, ouvrez **SQL Editor** puis **New query**.
2. Ouvrez le fichier sur votre ordinateur (avec le Bloc-notes, par exemple), copiez **tout** son contenu et collez-le.
3. Cliquez sur **Run**. Le message attendu est « Success ».

| Ordre | Fichier | Ce qu'il fait |
|---|---|---|
| 1 | `20261120000100_schema.sql` | les tables : ressources, fiches, catégories, réglages, pages |
| 2 | `20261120000200_securite.sql` | la sécurité : les visiteurs ne peuvent que lire le contenu publié |
| 3 | `20261120000300_stockage.sql` | les espaces de stockage des PDF et des photos |

> Les textes de présentation sont créés avec la mention **« Texte provisoire »**. Remplacez-les depuis l'admin (section 7). La bibliothèque est vide au départ : ajoutez vos ressources depuis l'admin.

---

## 4. Créer le premier administrateur

1. Dans Supabase, allez dans **Authentication → Users**, puis **Add user** → **Create new user**.
2. Saisissez votre email et un mot de passe solide (12 caractères ou plus), et cochez **Auto Confirm User**.
3. Ouvrez `supabase/creer_admin.sql`, remplacez `VOTRE-EMAIL@exemple.fr` par votre email, puis exécutez-le dans le **SQL Editor**.

Le résultat doit afficher votre email. Pour ajouter un autre administrateur, refaites les étapes 1 à 3 avec son email.

---

## 5. Mettre en ligne (GitHub + Vercel)

### a) Récupérer les clés Supabase

Dans Supabase, cliquez sur le bouton **Connect** (ou allez dans **Project Settings → API**) et notez :
- **Project URL**, de la forme `https://xxxx.supabase.co` ;
- la clé **anon** ou **publishable**.

> ⚠️ Ne copiez **jamais** la clé `service_role` / `secret` dans le site.

### b) Mettre le code sur GitHub

1. Sur GitHub, cliquez sur **+ → New repository**. Nommez-le `edm-site`, cochez **Private**, puis **Create repository**.
2. Envoyez le contenu du dossier, **sans** `node_modules`, `.next` ni `.env.local`.
   - Le plus simple : utilisez **GitHub Desktop** (<https://desktop.github.com>), qui ignore automatiquement ces dossiers grâce au fichier `.gitignore`.

### c) Importer dans Vercel

1. Sur <https://vercel.com>, cliquez sur **Sign Up**, choisissez **Hobby**, puis **Continue with GitHub**.
2. Cliquez sur **Add New… → Project**, puis **Import** à côté de `edm-site`. Vercel reconnaît Next.js tout seul.
3. Dans **Environment Variables**, ajoutez :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | votre Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | votre clé anon / publishable |
| `NEXT_PUBLIC_SITE_URL` | l'adresse du site, par exemple `https://edm-site.vercel.app` (sans `/` à la fin) |
| `CRON_SECRET` | une longue phrase inventée, sans espaces |

4. Cliquez sur **Deploy**. Environ une minute plus tard, le site est en ligne, en HTTPS. L'administration se trouve à `https://…/admin`.

> Si vous changez d'adresse (par exemple pour un nom de domaine), mettez à jour `NEXT_PUBLIC_SITE_URL`, puis allez dans **Deployments → ⋯ → Redeploy**.

### d) Éviter la mise en pause de Supabase

Un projet Supabase gratuit est **mis en pause après 7 jours sans activité**. Pour l'éviter, le site fait chaque jour vers 7 h une petite lecture automatique, protégée par `CRON_SECRET` (configurée dans `vercel.json`). Vous pouvez la vérifier dans Vercel : **Settings → Cron Jobs**.

---

## 6. Le formulaire de contact (facultatif)

La section **« Nous contacter »** se trouve sur la page **Nous rejoindre** (l'ancienne adresse `/contact` y mène aussi). Sans configuration, elle affiche l'email, le téléphone et le lien WhatsApp renseignés dans l'admin. Pour ajouter un **formulaire** :

1. Créez un compte gratuit sur <https://resend.com> et une **API Key**.
2. Pour envoyer depuis votre propre adresse, ajoutez votre nom de domaine dans Resend (rubrique *Domains*).
3. Dans Vercel, ajoutez ces variables :
   - `RESEND_API_KEY` : la clé Resend ;
   - `CONTACT_TO_EMAIL` : l'adresse qui reçoit les messages ;
   - `CONTACT_FROM_EMAIL` : l'expéditeur, par exemple `EDM République <contact@votre-domaine.fr>`.
4. Redéployez.

Le message « Votre message a bien été envoyé » ne s'affiche **que si Resend a confirmé l'envoi**. Le formulaire est protégé contre les robots de trois façons :
- un champ invisible, qu'un humain ne remplit pas ;
- un délai minimal de saisie ;
- une limite de messages par appareil.

---

## 7. Utiliser l'administration

Rendez-vous sur `/admin` et connectez-vous avec votre email et votre mot de passe. Sur téléphone, le menu s'ouvre avec le bouton ☰.

### Ressources (la bibliothèque)

1. Cliquez sur **Ajouter une ressource**. Seul le **titre** est obligatoire. Vous pouvez ajouter :
   - une description (une ligne vide sépare deux paragraphes, une ligne commençant par « - » crée une liste) ;
   - un lien YouTube (vérifié automatiquement) ;
   - des références bibliques ;
   - une catégorie ;
   - une date.
2. Cliquez sur **Créer la ressource**. Vous arrivez sur sa page, où vous pouvez :
   - **déposer des PDF** : glissez-les, ou cliquez sur *Choisir des PDF* (plusieurs à la fois, 25 Mo maximum chacun). Ils sont classés par nom de fichier : nommez-les `01-…`, `02-…` ;
   - **renommer** une fiche : modifiez le nom, puis cliquez ailleurs ;
   - **changer l'ordre** avec ↑ ↓, **remplacer** un PDF ou **supprimer** une fiche ;
   - ajouter une **image de couverture**. Sans image, la miniature YouTube est utilisée.
3. Cochez **Publier sur le site**, puis **Enregistrez**. Le changement est visible immédiatement sur le site.

Une ressource peut avoir une vidéo seule, des PDF seuls, ou les deux. Le site n'affiche que ce qui existe.

Dans la liste des ressources, **Publier / Retirer** permet de masquer une ressource sans la supprimer. **Supprimer la ressource** efface aussi ses PDF et son image.

### Catégories

Elles servent de filtres dans la bibliothèque (par exemple : Prédications, Enseignements, Sujets).
- **Ajouter :** saisissez le nom et validez.
- **Renommer :** modifiez le nom, puis cliquez ailleurs.
- **Supprimer :** les ressources concernées restent en ligne, simplement sans catégorie.

### Pages du site

Ce sont les textes de présentation de l'église (présentation, histoire, vision, valeurs, fonctionnement) et de **Nous rejoindre**. Sur l'accueil, la présentation et la vision apparaissent en résumé ; le bouton **« En savoir plus »** ouvre une fenêtre avec tous les textes. Un aperçu s'affiche à côté du texte pendant que vous écrivez. Si un texte est vide, sa section n'apparaît pas sur le site. Le badge « À compléter » signale les textes provisoires.

### Informations

Cette page regroupe :
- le nom de l'église et le message d'accueil ;
- les **4 points forts** de l'accueil ;
- la rencontre : jour, heure, adresse et précision (le bouton « Itinéraire » ouvre l'application de cartes du téléphone) ;
- l'email, le téléphone et le lien WhatsApp (`https://wa.me/33…`) ;
- les **photos du site** : l'accueil (une photo est fournie par défaut), le haut de la fenêtre « En savoir plus » et la page Nous rejoindre. Préférez des photos en format paysage, d'au moins 1600 px de large, pour qu'elles restent nettes.

> En cas d'erreur dans un formulaire, ce que vous avez tapé est conservé : corrigez le champ signalé en rouge et enregistrez à nouveau.

---

## 8. Ajouter le site à l'écran d'accueil d'un téléphone

C'est **facultatif** : le site fonctionne normalement dans le navigateur.

- **iPhone / iPad (Safari) :** touchez le bouton **Partager** (le carré avec une flèche), puis **Sur l'écran d'accueil**, puis **Ajouter**.
- **Android (Chrome) :** touchez le menu **⋮**, puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**).

**Hors connexion**, les pages déjà consultées restent lisibles. Pour les autres, une page « Vous êtes hors ligne » s'affiche. Les vidéos et les PDF nécessitent une connexion, sauf les PDF déjà **téléchargés** sur le téléphone. L'administration n'est jamais gardée en mémoire sur l'appareil.

---

## 9. Entretien

- **Sauvegarde :** l'offre gratuite de Supabase n'en fait pas automatiquement. Gardez vos PDF originaux sur votre ordinateur. Pour une copie des textes, ouvrez **Supabase → Table Editor**, choisissez une table, puis **Export → CSV**.
- **Projet en pause** (vous recevez un email de Supabase) : ouvrez Supabase et cliquez sur **Restore project**. Rien n'est perdu.
- **Changer le logo :** remplacez `public/assets/logo-lockup.png` et `public/assets/logo-mark.png` en gardant les mêmes noms, puis lancez `npm run icones -- --force` (voir section 10).

| Problème | Solution |
|---|---|
| « Email ou mot de passe incorrect » | Vérifiez l'email. Pour changer le mot de passe : Supabase → Authentication → Users → ⋯ → *Send password recovery*. |
| « Ce compte n'a pas accès à l'administration » | Exécutez `creer_admin.sql` avec cet email (section 4). |
| Le site affiche « Le contenu n'a pas pu être chargé » | Supabase est peut-être en pause (voir ci-dessus), ou les variables Vercel sont incorrectes. |
| Une ressource n'apparaît pas | Vérifiez qu'elle est **publiée**. |

---

## 10. Pour la personne qui s'occupe du code

**Technologies :** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Lucide, Zod, Supabase (PostgreSQL, Storage, Auth, `@supabase/ssr`). Node.js 20 ou plus récent.

### Lancer en local

```bash
npm install
cp .env.example .env.local      # puis renseignez les valeurs
npm run dev                     # http://localhost:3000
```

Avec un Supabase local (Docker requis) : `npx supabase start` applique les migrations et affiche l'URL et la clé à mettre dans `.env.local`. Les inscriptions sont désactivées : créez l'administrateur avec le Studio local, puis `creer_admin.sql`.

### Vérifications

```bash
npm run typecheck     # TypeScript strict
npm test              # tests unitaires (Vitest) : validations, YouTube, slugs, textes
npm run build         # compilation de production
SUPABASE_URL=… SUPABASE_ANON_KEY=… ADMIN_EMAIL=… ADMIN_PASSWORD=… USER_EMAIL=… USER_PASSWORD=… npm run test:rls
```

`test:rls` vérifie que les visiteurs et les comptes non administrateurs ne peuvent rien modifier ni déposer, et que l'administrateur peut tout faire. Il crée puis supprime ses propres données de test.

### Architecture

```
app/
  (site)/                 pages publiques : accueil (avec la fenêtre « En savoir plus »), bibliotheque (+ [slug]), nous-rejoindre (rencontres + section contact)
  admin/connexion         connexion
  admin/(espace)/         tableau de bord, ressources, catégories, pages, informations (protégé)
  admin/actions.ts        actions serveur : contrôle admin + validation Zod + RLS
  api/keepalive           tâche quotidienne anti-pause
  manifest.ts, robots.ts, sitemap.ts  (page hors ligne : public/hors-ligne.html)
components/               composants du site, de la bibliothèque et de l'admin
lib/                      accès aux données, schémas Zod, outils, dépôt de fichiers
proxy.ts                  rafraîchit la session et protège /admin (ex-« middleware »)
public/sw.js              service worker (pages publiques et fichiers statiques uniquement)
supabase/migrations/      schéma, RLS, stockage
tests/                    tests unitaires
```

**Choix techniques :**
- **Sécurité en trois couches :**
  - `proxy.ts` redirige vers la connexion si personne n'est connecté ;
  - chaque page et chaque action vérifie côté serveur que la personne est connectée et figure dans la table `admins` ;
  - les règles RLS de PostgreSQL et de Storage contrôlent à nouveau chaque écriture.

  Aucune clé secrète n'est utilisée par le site.
- **Fichiers :** le navigateur de l'admin dépose les fichiers directement dans Storage. Cela contourne la limite de 4,5 Mo des requêtes Vercel. Les fichiers sont vérifiés à trois niveaux :
  - dans le navigateur : type, taille et signature du fichier ;
  - dans Storage : types autorisés et taille maximale ;
  - côté serveur : chemin et existence du fichier, avant tout enregistrement.
- **Fraîcheur :** les pages publiques lisent Supabase à chaque visite. Une modification dans l'admin est donc visible immédiatement, sans délai de cache.
- **Recherche :** une fonction SQL `rechercher_ressources` cherche dans le titre, la description, les références bibliques et la catégorie, sans tenir compte des accents (`unaccent`).
- **YouTube :** seule la miniature est chargée. Le lecteur `youtube-nocookie` ne se charge qu'au clic.
- **PDF :** « Consulter » ouvre le PDF dans le lecteur du téléphone ou de l'ordinateur. « Télécharger » force l'enregistrement (`?download=` de Supabase). « Partager » utilise le partage natif du téléphone, ou copie le lien.

### Tests réalisés et limites

- **Automatisés :** 39 tests unitaires et 39 tests de sécurité de la base. Dans Chrome (moteur Chromium), 57 tests de parcours :
  - mobile 375 px, tablette 820 px, ordinateur 1366 px, sans défilement horizontal ;
  - navigation, menu mobile et clavier ;
  - recherche, filtres, YouTube à la demande, consultation et téléchargement des PDF ;
  - connexion admin (mauvais mot de passe, compte non admin) ;
  - création, modification et suppression d'une ressource, dépôt et suppression de fichiers ;
  - catégories, textes, informations ;
  - PWA installable et mode hors ligne.
- **Non testés sur de vrais appareils :** iPhone (Safari iOS), Android, iPad, ainsi que les navigateurs Firefox et Safari sur ordinateur. À vérifier à la main avant l'annonce :
  1. ouvrir un PDF puis le télécharger sur iPhone et sur Android ;
  2. ajouter le site à l'écran d'accueil et le rouvrir ;
  3. lire une vidéo ;
  4. utiliser le menu ☰ et la barre du bas ;
  5. se connecter à l'admin sur téléphone et y déposer un PDF depuis l'app Fichiers.
