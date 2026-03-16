# Rocade

Application Flask de gestion Rocade.

Lancer localement:

```bash
python app.py
```

Deploiement GitHub Pages (GitHub uniquement):

1. Pousser sur la branche `main`.
2. Dans GitHub: `Settings` > `Pages` > `Source`: `GitHub Actions`.
3. Le workflow `.github/workflows/pages.yml` publie automatiquement `index.html` + `static/`.
4. URL publique attendue: `https://bjacky94-alt.github.io/rocade/`.

Notes:

- En mode GitHub Pages, la persistance utilise `localStorage` (navigateur) au lieu de l'API Flask.
- Le bouton `Reinitialiser` efface les donnees locales sur Pages.

Deploiement Railway:

1. Connecter le repo GitHub sur Railway.
2. Railway detecte automatiquement Python et utilise le Procfile.
3. URL publique dans l'onglet Settings > Domains.