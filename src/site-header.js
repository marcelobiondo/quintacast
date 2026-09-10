export function renderSiteHeader({
  active = "",
  homeLabel = "Episódios"
} = {}) {
  return `
    <header class="site-header">
      <div class="container header-content">
        <a href="/" class="brand">
          QuintaCast
        </a>

        <nav class="nav">
          <a
            href="/"
            ${active === "episodes" ? 'class="active"' : ""}
          >
            ${homeLabel}
          </a>

          <a
            href="/contato/"
            ${active === "contact" ? 'class="active"' : ""}
          >
            Fale com a gente
          </a>

          <button
            class="theme-toggle"
            id="theme-toggle"
            aria-label="Alternar tema"
          >
            ◐
          </button>
        </nav>
      </div>
    </header>
  `;
}