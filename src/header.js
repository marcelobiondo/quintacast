export function initStickyHeader() {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const updateHeader = () => {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 24
    );
  };

  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );
}

export function initThemeToggle() {
  const themeToggle =
    document.querySelector("#theme-toggle");

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const current =
      document.documentElement.dataset.theme;

    const next =
      current === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme = next;

    localStorage.setItem("theme", next);
  });
}