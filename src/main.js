import "./styles.css";
import { initStickyHeader } from "./header.js";
import { fetchEpisodes } from "./episodes.js";
import { getPerson } from "./data/people.js";
import { getEpisodePeople } from "./data/episode-people.js";

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
    const episodes = await fetchEpisodes();

    episodesContainer.innerHTML = "";

    episodes.forEach((episode, index) => {
      episodesContainer.appendChild(
        createEpisode(episode, index)
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

/* function createPeopleLinks(personIds) {
  return personIds
    .map((personId) => getPerson(personId))
    .filter(Boolean)
    .map(
      (person) =>
        `<a href="${person.profileUrl}">${escapeHTML(person.name)}</a>`
    )
    .join(" · ");
} */

function createPeopleLinks(personIds) {
  return personIds
    .map((personId) => getPerson(personId))
    .filter(Boolean)
    .map((person) => escapeHTML(person.name))
    .join(" · ");
}

function createEpisode(episode, index) {
const {
  number: episodeNumber,
  title,
  description,
  pubDate,
  duration,
  artworkUrl,
  audioUrl
} = episode;

const { hosts, guests } =
  getEpisodePeople(episodeNumber);

const hostLinks = createPeopleLinks(hosts);
const guestLinks = createPeopleLinks(guests);

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
  ${
    hostLinks
      ? `Apresentação: ${hostLinks}`
      : ""
  }

  ${
    guestLinks
      ? `<br>Convidados: ${guestLinks}`
      : ""
  }
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
