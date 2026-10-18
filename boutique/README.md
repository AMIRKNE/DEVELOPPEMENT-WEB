# UrbanStyle – Page d'atterrissage responsive d'une boutique en ligne

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` + `style.css` | Version principale en **HTML/CSS pur** (media queries faites à la main) |
| `bootstrap/index.html` + `bootstrap/style.css` | Version **bonus avec Bootstrap 5** |
| `captures/` | Captures d'écran sur ordinateur (1440 px) et sur mobile (390 px) |

## Structure de la page

1. **En-tête** fixe avec le logo et un menu de navigation (Accueil, Produits, Avantages, Contact) qui renvoie vers chaque section.
2. **Bannière (héros)** : une image de boutique, un titre, un court texte et un bouton d'appel à l'action.
3. **Section produits** : 4 fiches produits, chacune avec une image, un nom, une description, un prix et un bouton « Acheter maintenant ».
4. **Section avantages** : livraison, paiement sécurisé, retour gratuit.
5. **Pied de page** : logo, liens, coordonnées et copyright.

## Choix de conception

- **Couleurs** : un orange vif (`#ff6b35`) pour tout ce qui est cliquable (boutons, prix, liens au survol) et un bleu nuit presque noir (`#1d1d2c`) pour le texte et le pied de page. Avec une seule couleur d'accent, l'œil va directement vers les actions importantes.
- **Variables CSS** (`:root`) : les couleurs, les arrondis et les ombres sont définis une seule fois. On peut donc changer tout le thème en modifiant une ligne.
- **Police Poppins** : moderne, arrondie et très lisible, elle correspond bien à une boutique de mode.
- **Bannière lisible** : un dégradé sombre est posé par-dessus la photo pour que le texte blanc reste lisible quelle que soit l'image.
- **Fiches produits** :
  - Les images sont recadrées à la même hauteur (`object-fit: cover`).
  - Le prix et le bouton sont toujours alignés en bas de la carte (flexbox et `margin-top: auto`), même quand les descriptions n'ont pas la même longueur.
  - Au survol, la carte se soulève légèrement pour montrer qu'elle est interactive.
  - Des badges (« Nouveau », « -15% ») attirent l'attention sur certains produits.
- **Navigation** : l'en-tête reste visible pendant le défilement. Le défilement vers les sections est fluide (`scroll-behavior: smooth`), et `scroll-padding-top` empêche l'en-tête de cacher les titres.

## Responsive (media queries)

| Largeur d'écran | Produits par ligne | Autres changements |
|---|---|---|
| plus de 992 px (ordinateur) | 4 | menu horizontal |
| 992 px et moins (tablette) | 2 | titre de la bannière réduit |
| 768 px et moins (mobile) | 2 | **menu burger**, bannière centrée, avantages et pied de page sur une colonne |
| 576 px et moins (petit mobile) | 1 | titres réduits |

Les grilles utilisent **CSS Grid** (`grid-template-columns`), ce qui permet de changer le nombre de colonnes avec une seule ligne dans chaque media query.

Le menu burger fonctionne **sans JavaScript**. Une case à cocher cachée (`#menu-toggle`) est reliée à l'icône. Quand elle est cochée, le sélecteur `.menu-toggle:checked ~ .nav` ouvre le menu.

## Bonus : version Bootstrap

La version Bootstrap reprend la même charte graphique et ajoute plusieurs composants de la bibliothèque :

- **Navbar** qui se replie automatiquement en menu burger, avec une icône de panier et un compteur (badge).
- **Carrousel** à 2 diapositives dans la bannière (nouvelle collection et soldes).
- **Grille** `row-cols-1 row-cols-sm-2 row-cols-lg-4` et **cartes** pour les produits.
- **Fenêtre modale** : le bouton « Acheter maintenant » ouvre une fenêtre où l'on choisit la quantité.
- **Toast** : une notification « Produit ajouté au panier » s'affiche et le compteur du panier augmente.
- **Bootstrap Icons** pour les avantages et les réseaux sociaux.

Le fichier `bootstrap/style.css` personnalise Bootstrap avec les couleurs de la boutique (classes `btn-orange`, `text-orange`, `bg-orange`).

## Tests

La page a été vérifiée à 1440 px (ordinateur) et à 390 px (téléphone), voir le dossier `captures/`.

Pour tester d'autres tailles : ouvrir `index.html` dans le navigateur, appuyer sur **F12**, puis sur **Ctrl + Shift + M** (mode appareil), et choisir un appareil ou une largeur.

> Les images (Unsplash), la police et Bootstrap sont chargés en ligne : une connexion internet est nécessaire.
