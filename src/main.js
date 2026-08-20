import "./styles.css";

const episodesContainer = document.querySelector("#episodes");
const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = next;

  localStorage.setItem("theme", next);
});

loadEpisodes();

async function loadEpisodes() {
  try {
    const response = await fetch("/api/feed");

    if (!response.ok) {
      throw new Error("Erro ao carregar feed.");
    }

    const xmlText = await response.text();

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      xmlText,
      "application/xml"
    );

    const items = [...xml.querySelectorAll("item")];

    if (!items.length) {
      throw new Error("Nenhum episódio encontrado.");
    }

    episodesContainer.innerHTML = "";

    items.forEach((item, index) => {
      episodesContainer.appendChild(
        createEpisode(item, index)
      );
    });
  } catch (error) {
    console.error(error);

    episodesContainer.innerHTML = `
      <p class="loading">
        Não conseguimos carregar os episódios agora.
      </p>
    `;
  }
}

function createEpisode(item, index) {
  const title = getText(item, "title");

  const description =
    getText(item, "description") ||
    getText(item, "content\\:encoded");

  const pubDate = getText(item, "pubDate");

  const duration =
    getText(item, "itunes\\:duration");

  const audioUrl =
    item.querySelector("enclosure")?.getAttribute("url") || "#";

  const episodeNumber =
    getText(item, "itunes\\:episode") ||
    String(index + 1);

  const article = document.createElement("article");

  article.className = "episode";

  article.innerHTML = `
    <div class="episode-number">
      EP.${padNumber(episodeNumber)}
    </div>

    <div>
      <div class="episode-header">
        <h3>${escapeHTML(title)}</h3>
      </div>

      <div class="episode-meta">
        ${
          pubDate
            ? `<span>${formatDate(pubDate)}</span>`
            : ""
        }

        ${
          duration
            ? `<span>${escapeHTML(duration)}</span>`
            : ""
        }
      </div>

      <div class="episode-description">
        ${sanitizeDescription(description)}
      </div>

      <div class="episode-hosts">
        Apresentação: Marcelo · Guido · Edu
      </div>

      <a
        class="listen-button"
        href="${audioUrl}"
        target="_blank"
        rel="noreferrer"
      >
        ▶ Ouvir agora
      </a>
    </div>
  `;

  return article;
}

function getText(parent, selector) {
  return (
    parent.querySelector(selector)?.textContent?.trim() || ""
  );
}

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function sanitizeDescription(html) {
  if (!html) return "";

  const temp = document.createElement("div");

  temp.innerHTML = html;

  temp
    .querySelectorAll(
      "script, iframe, style, form, button"
    )
    .forEach((element) => element.remove());

  return temp.innerHTML;
}

function escapeHTML(text) {
  const element = document.createElement("div");

  element.textContent = text;

  return element.innerHTML;
}