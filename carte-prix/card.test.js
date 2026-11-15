// Tests du composant Card — lancer avec : node card.test.js
// (utilise jsdom : npm install jsdom)
const { JSDOM } = require("jsdom");
const assert = require("assert");

const dom = new JSDOM("<!DOCTYPE html><body></body>");
global.document = dom.window.document;
const { Card } = require("./card.js");

let passed = 0;
function test(name, fn) { fn(); passed++; console.log("✓ " + name); }

test("affiche le titre, le prix et la période", () => {
  const c = Card("Plan de base", "9,99 $", ["A"]);
  assert.strictEqual(c.querySelector(".card__title").textContent, "Plan de base");
  assert.ok(c.querySelector(".card__price").textContent.includes("9,99 $"));
  assert.strictEqual(c.querySelector(".card__period").textContent, "/ mois");
});

test("affiche une ligne par avantage", () => {
  const c = Card("X", "1 $", ["un", "deux", "trois"]);
  assert.strictEqual(c.querySelectorAll(".card__features li").length, 3);
});

test("le bouton appelle onSelect avec le titre", () => {
  let recu = null;
  const c = Card("Plan Pro", "19 $", [], { onSelect: (t) => (recu = t) });
  c.querySelector(".card__btn").click();
  assert.strictEqual(recu, "Plan Pro");
});

test("option featured ajoute la classe et le bandeau", () => {
  const c = Card("X", "1 $", [], { featured: true });
  assert.ok(c.classList.contains("card--featured"));
  assert.ok(c.querySelector(".card__ribbon"));
});

test("le texte n'est pas interprété comme du HTML", () => {
  const c = Card("<b>x</b>", "1 $", ["<img src=x onerror=alert(1)>"]);
  assert.strictEqual(c.querySelector("img"), null);
  assert.strictEqual(c.querySelector("b"), null);
});

console.log(`\n${passed} tests réussis`);
