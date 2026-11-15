# Prompts IA utilisées

## Prompt 1 : identifier et corriger les bogues
```
Voici un composant HTML/CSS de carte de prix qui est cassé : la mise en page ne
s'applique pas et le bouton ne répond pas. Analyse le code ligne par ligne, liste
chaque bogue (HTML et CSS) avec sa cause, puis donne une version corrigée qui
garde le même design de départ : carte de 300px centrée, fond blanc, ombre, titre
en gras, prix en vert, liste sans puces avec séparateurs, bouton bleu qui devient
bleu foncé au survol. Le bouton doit réagir au clic. Mets aussi les textes en français.

[code de avant.html collé ici]
```

## Prompt 2 : transformer en composant réutilisable
```
Transforme cette carte de prix corrigée en un composant JavaScript réutilisable,
sans framework : une fonction Card(title, price, features, options) qui renvoie
un élément DOM. Options : period, buttonText, featured (bandeau « Populaire »),
onSelect (callback au clic). Sépare le CSS dans card.css avec des variables CSS et
des classes BEM (card__title, card__price…). Utilise textContent (pas innerHTML)
pour éviter les injections. Donne une page index.html qui affiche 3 plans (Base,
Pro, Entreprise) avec ce composant, et quelques tests du composant avec jsdom.
```

## Prompt 3 : correction après le test visuel
```
Les cartes se chevauchent dans la grille : elles dépassent 300px. Pourquoi, et
comment corriger ?
```
→ Réponse : `padding` et `border` s'ajoutaient à la largeur (`box-sizing: content-box`
par défaut). Correction : `box-sizing: border-box` sur `.card` et ses enfants.
