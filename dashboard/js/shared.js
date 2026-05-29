(function () {
  const THEME_KEY = "web_demos_theme";

  function applySavedTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", saved);
    return saved;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    return next;
  }

  function currencyBRL(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(value);
  }

  function showState(stateId, allStateIds) {
    for (const id of allStateIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle("active", id === stateId);
    }
  }

  window.DemoShared = { applySavedTheme, toggleTheme, currencyBRL, showState };
})();
