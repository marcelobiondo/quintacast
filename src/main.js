import "./styles.css";
import { initStickyHeader } from "./header.js";

const episodesContainer = document.querySelector("#episodes");
const themeToggle = document.querySelector("#theme-toggle");
let descriptionResizeFrame;

initStickyHeader();

episodesContainer.addEventListener("click", (event) => {
  const toggle = event.target.closest(
    ".episode-description-toggle"
  );

  if (!toggle) return;

  const episode = toggle.closest(".episode");
  const shouldExpand = !episode.classList.contains(
    "is-expanded"
  );

  collapseExpandedEpisode();

  if (shouldExpand) {
    setEpisodeExpanded(episode, true);
  }
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(descriptionResizeFrame);

  descriptionResizeFrame = requestAnimationFrame(
    updateDescriptionControls
  );
});

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
        createEpisode(item, index, items.length)
      );
    });

    updateDescriptionControls();
    expandLatestEpisode();
  } catch (error) {
    console.error(error);

    episodesContainer.innerHTML = `
      <p class="loading">
        Não conseguimos carregar os episódios agora.
      </p>
    `;
  }
}

function expandLatestEpisode() {
  const latestEpisode =
    episodesContainer.querySelector(".episode");

  if (latestEpisode) {
    setEpisodeExpanded(latestEpisode, true);
  }
}

function createEpisode(item, index, episodeCount) {
  const title = getText(item, "title");

  const description =
    getText(item, "description") ||
    getText(item, "content\\:encoded");

  const pubDate = getText(item, "pubDate");

  const duration =
    getText(item, "itunes\\:duration");

const artworkUrl =
  item
    .getElementsByTagName("itunes:image")[0]
    ?.getAttribute("href") || "";

  const audioUrl =
    item.querySelector("enclosure")?.getAttribute("url") || "#";

  const episodeNumber =
    getText(item, "itunes\\:episode") ||
    String(episodeCount - index);

  const article = document.createElement("article");

  article.className = "episode";

article.innerHTML = `
  <div class="episode-side">
    <div class="episode-number">
      EP.${padNumber(episodeNumber)}
    </div>

    ${
      artworkUrl
        ? `<img
            class="episode-artwork"
            src="${escapeHTML(artworkUrl)}"
            alt="Capa do episódio ${escapeHTML(episodeNumber)}"
            loading="lazy"
          >`
        : ""
    }
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

      <button
        class="episode-description-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="episode-description-${index}"
        hidden
      >
        Ver mais
      </button>

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

  article
    .querySelector(".episode-description")
    .setAttribute("id", `episode-description-${index}`);

  return article;
}

function updateDescriptionControls() {
  const episodes = [
    ...episodesContainer.querySelectorAll(".episode")
  ];

  episodes.forEach((episode) => {
    const description = episode.querySelector(
      ".episode-description"
    );
    const toggle = episode.querySelector(
      ".episode-description-toggle"
    );

    const wasExpanded = episode.classList.contains(
      "is-expanded"
    );

    episode.classList.remove("is-expanded");

    const hasOverflow =
      description.scrollHeight > description.clientHeight + 1;

    toggle.hidden = !hasOverflow;

    if (hasOverflow && wasExpanded) {
      setEpisodeExpanded(episode, true);
    } else {
      setEpisodeExpanded(episode, false);
    }
  });
}

function collapseExpandedEpisode() {
  const expandedEpisode = episodesContainer.querySelector(
    ".episode.is-expanded"
  );

  if (expandedEpisode) {
    setEpisodeExpanded(expandedEpisode, false);
  }
}

function setEpisodeExpanded(episode, isExpanded) {
  const toggle = episode.querySelector(
    ".episode-description-toggle"
  );

  episode.classList.toggle("is-expanded", isExpanded);
  toggle.setAttribute("aria-expanded", String(isExpanded));
  toggle.textContent = isExpanded ? "Ver menos" : "Ver mais";
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
