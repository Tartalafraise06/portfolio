# Portfolio freelance — site vitrine + 3 démos

Portfolio statique (HTML / CSS / JS vanilla, sans build) pour démarcher des petites entreprises.

```
Portofolio/
├── index.html / style.css / script.js   → page portfolio principale
├── demo-restaurant/                      → « Chez Marcel » (bistro français)
├── demo-clinic/                          → « Balance Physio » (kinésithérapie)
├── demo-craftsman/                       → « Atelier Lumière » (ébéniste)
└── README.md
```

Tous les textes visibles sont en anglais. Les commentaires `<!-- À PERSONNALISER : ... -->` (HTML) et `/* À PERSONNALISER */` (CSS/JS) signalent les zones à modifier.
Astuce : recherchez `À PERSONNALISER` dans tout le dossier (Cmd+Shift+F dans VS Code).

---

## 1. Prévisualiser en local

**Option rapide** : double-cliquez sur `index.html` pour voir le design. ⚠️ En `file://`, le formulaire de contact (Formspree) ne peut pas envoyer : pour le tester, utilisez l'option ci-dessous ou le site en ligne.

**Option recommandée** (comportement identique à la mise en ligne) :

```bash
cd ~/Documents/Businesss/Portofolio
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>. `Ctrl+C` pour arrêter.

Pour tester le mobile : outils développeur du navigateur (Cmd+Option+I) → icône « appareil » → iPhone SE (375 px) et Galaxy (360 px).

---

## 2. Mettre en ligne gratuitement

### Option A — Netlify Drop (2 minutes, sans compte Git)

1. Allez sur <https://app.netlify.com/drop>.
2. Glissez-déposez **le dossier entier** `Portofolio` dans la zone.
3. Netlify vous donne une URL du type `https://xxxx.netlify.app` : le site est en ligne.
4. Créez un compte gratuit (sinon le site expire au bout d'une heure) → *Site configuration* → *Change site name* pour obtenir `votre-nom.netlify.app`.
5. Pour mettre à jour : onglet *Deploys* → glissez à nouveau le dossier.
6. (Optionnel) Domaine perso : *Domain management* → *Add a domain*.

> Formulaires avec Netlify : ajoutez `data-netlify="true"` et `name="contact"` sur la balise `<form>`, et retirez le `e.preventDefault()` dans `script.js` (voir commentaires). Les messages arrivent dans l'onglet *Forms* de Netlify.

### Option B — GitHub Pages

1. Créez un compte sur <https://github.com> puis un nouveau dépôt **public** (ex. `portfolio`).
2. Sur la page du dépôt : *Add file* → *Upload files* → glissez **le contenu** du dossier (index.html, style.css, script.js et les 3 dossiers `demo-…`) → *Commit changes*.
   - Ou en ligne de commande :
     ```bash
     cd ~/Documents/Businesss/Portofolio
     git init && git add . && git commit -m "Portfolio"
     git branch -M main
     git remote add origin https://github.com/VOTRE-PSEUDO/portfolio.git
     git push -u origin main
     ```
3. *Settings* → *Pages* → *Source : Deploy from a branch* → branche `main`, dossier `/ (root)` → *Save*.
4. Après 1 à 2 minutes, le site est disponible sur `https://VOTRE-PSEUDO.github.io/portfolio/`.
5. Astuce : nommer le dépôt `VOTRE-PSEUDO.github.io` donne l'URL racine `https://VOTRE-PSEUDO.github.io/`.

---

## 3. Placeholders à remplacer

### Page portfolio (`index.html`)
| Élément | Où | Valeur actuelle |
|---|---|---|
| Votre nom | `<title>`, `og:title`, logo, footer | `Lucas Guidet` (fait) |
| Email | section Contact | `hello@your-domain.com` |
| WhatsApp | section Contact (lien `wa.me` sans `+` ni espaces) | `33600000000` / `+33 6 00 00 00 00` |
| Prix des offres | section Services | €300 / €500 / €30/month |
| URL du site | `og:url` (et `og:image` à décommenter) | `https://your-domain.com/` |
| Mentions légales | footer | statut, n° d'immatriculation (SIRET/NIF), hébergeur |
| Envoi du formulaire | `script.js` (Formspree ou Netlify) | simulation front-end |

### Dans les 3 démos
- Signature « Website by Lucas Guidet » dans le footer (déjà en place).
- `og:url` de chaque démo.
- Les coordonnées fictives (téléphones `+33 5 00…`, `+351 21 000…`, `+33 4 00…`, emails `…-demo.com`) : à laisser tant que c'est une démo, à remplacer pour un vrai client.
- Le bandeau « Demo website » (`<div class="demo-banner">`) : à supprimer pour un vrai client.

### Où mettre de vraies photos (Unsplash / Pexels)
| Démo | Emplacement | Recherche suggérée |
|---|---|---|
| Portfolio | Aperçus des cartes « Work » (`.preview`) → capture d'écran de chaque démo | — (faites vos propres captures) |
| Portfolio | `og:image` (1200×630) | capture du hero |
| Restaurant | Fond du hero (`.hero` dans `style.css` : ajouter `background-image`) | "french bistro interior" |
| Restaurant | Illustration « Our story » (`.about-visual` → remplacer le `<svg>` par `<img>`) | "chef cooking", "bistro table wine" |
| Restaurant | Carte stylisée (`.map`) → éventuellement un `<iframe>` Google Maps | — |
| Clinique | Illustration du hero (`.hero-illu`) | "physiotherapy session" |
| Clinique | Avatars de l'équipe (`.avatar` → `<img>` rond) | "physiotherapist portrait" |
| Atelier | Fond du hero (`.hero`) | "woodworking workshop" |
| Atelier | Les 12 projets de la galerie : remplacer chaque `<svg>` dans `.work-art` par `<img src="…" alt="…">` (la lightbox clone l'élément : adapter `script.js` → `art.querySelector("svg")` en `"img"`) | "wooden dining table", "walnut sideboard", "oak kitchen" |

Pour les images : `<img src="images/photo.webp" alt="Description" width="1200" height="800" loading="lazy">`, au format WebP, moins de 200 Ko chacune.

---

## 4. Adapter une démo pour un vrai prospect (checklist 10 minutes)

1. **Dupliquer** le dossier de la démo la plus proche (ex. `demo-restaurant` → `client-la-table-de-sofia`).
2. **Nom & SEO** (2 min) : `<title>`, `meta description`, `og:*`, logo, footer. Rechercher/remplacer le nom (« Chez Marcel » → nom du client).
3. **Couleurs & polices** (2 min) : modifiez uniquement le bloc `:root` en haut de `style.css`. Pour changer de police, remplacez le lien Google Fonts dans `<head>` et les variables `--font-display` / `--font-body`. Récupérez les couleurs du logo du client (pipette : <https://imagecolorpicker.com>).
4. **Textes** (3 min) : reprenez les infos du site actuel, de la fiche Google Business et des avis Google du prospect (horaires, adresse, menu/soins/tarifs, 3 vrais avis).
5. **Photos** (2 min) : 2–3 photos de leur Instagram/Google (avec leur accord) ou des photos libres de droits (voir tableau ci-dessus).
6. **Contact** (1 min) : téléphone (`tel:`), email, adresse, lien Google Maps, réseaux sociaux. Pour le restaurant, mettez aussi à jour `OPENING_HOURS` et `CLOSED_DAYS` dans `script.js`.
7. **Bandeau démo** : remplacez le texte par « Mockup prepared for [Client] by Lucas Guidet » plutôt que de le supprimer tant que le client n'a pas signé.
8. **Publier** sur Netlify Drop → envoyez le lien au prospect par WhatsApp/email avec une capture d'écran mobile.

---

## Notes techniques
- Aucune dépendance : 2 polices Google Fonts max par site, animations en CSS + `IntersectionObserver`.
- Accessibilité : HTML sémantique, lien d'évitement, navigation clavier (onglets du menu avec flèches, sélecteur de créneaux en vrais boutons radio, lightbox `<dialog>` avec Échap), `prefers-reduced-motion` respecté.
- Les créneaux de la clinique sont **fictifs** (générés dans `demo-clinic/script.js`). Pour un vrai cabinet, branchez Calendly, Doctolib ou équivalent.
