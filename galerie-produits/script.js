// ===== Bascule de thème clair / foncé =====
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(dark));
  toggle.setAttribute("aria-label", dark ? "Activer le mode clair" : "Activer le mode sombre");
}

applyTheme(root.getAttribute("data-theme") || "light");

toggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) { /* stockage indisponible */ }
});

// ===== Animations en fondu à l'apparition (une carte après l'autre) =====
const fadeEls = document.querySelectorAll(".fade-in");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = [...fadeEls].indexOf(el);
        el.style.transitionDelay = `${index * 150}ms`;
        el.classList.add("visible");
        // retire le délai ensuite pour que le survol réagisse immédiatement
        setTimeout(() => (el.style.transitionDelay = "0ms"), 900 + index * 150);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach((el) => observer.observe(el));
} else {
  fadeEls.forEach((el) => el.classList.add("visible"));
}

// ===== Bouton « Ajouter » : petite notification =====
const toast = document.getElementById("toast");
let toastTimer;

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.closest(".card").querySelector("h2").textContent;
    toast.textContent = `« ${name} » ajouté au panier`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});
