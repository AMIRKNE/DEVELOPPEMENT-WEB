/**
 * Composant réutilisable : Card(title, price, features, options)
 *
 * @param {string}   title      Nom du plan (ex. "Plan de base")
 * @param {string}   price      Prix affiché (ex. "9,99 $")
 * @param {string[]} features   Liste des avantages
 * @param {object}   [options]
 * @param {string}   [options.period="/ mois"]           Texte après le prix
 * @param {string}   [options.buttonText="Démarrer l'essai"]
 * @param {boolean}  [options.featured=false]           Met la carte en avant
 * @param {string}   [options.ribbon="Populaire"]       Texte du bandeau si featured
 * @param {function} [options.onSelect]                 Appelée au clic : onSelect(title, bouton)
 * @returns {HTMLElement} la carte, prête à être ajoutée au DOM
 */
function Card(title, price, features = [], options = {}) {
  const {
    period = "/ mois",
    buttonText = "Démarrer l'essai",
    featured = false,
    ribbon = "Populaire",
    onSelect = null,
  } = options;

  const card = document.createElement("article");
  card.className = "card" + (featured ? " card--featured" : "");

  if (featured) {
    const badge = document.createElement("span");
    badge.className = "card__ribbon";
    badge.textContent = ribbon;
    card.appendChild(badge);
  }

  const h2 = document.createElement("h2");
  h2.className = "card__title";
  h2.textContent = title;

  const p = document.createElement("p");
  p.className = "card__price";
  p.textContent = price + " ";
  const per = document.createElement("span");
  per.className = "card__period";
  per.textContent = period;
  p.appendChild(per);

  const ul = document.createElement("ul");
  ul.className = "card__features";
  features.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f; // textContent : pas d'injection HTML possible
    ul.appendChild(li);
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card__btn";
  btn.textContent = buttonText;
  btn.addEventListener("click", () => {
    if (typeof onSelect === "function") onSelect(title, btn);
  });

  card.append(h2, p, ul, btn);
  return card;
}

// Export pour Node / tests, sans casser l'usage direct dans le navigateur
if (typeof module !== "undefined" && module.exports) module.exports = { Card };
