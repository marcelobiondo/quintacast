import "./styles.css";

import { getPerson } from "./data/people.js";
import { episodeHasPerson } from "./data/episode-people.js";
import { fetchEpisodes } from "./episodes.js";
import { renderSiteHeader } from "./site-header.js";
import {
  initStickyHeader,
  initThemeToggle
} from "./header.js";

const app = document.querySelector("#app");

const personId = document.body.dataset.person;
const person = getPerson(personId);

if (!person) {
  renderNotFound();
} else {
  renderPerson();
}

async function renderPerson() {
  app.innerHTML = `
    ${renderSiteHeader()}

    <main class="person-page">
      <section class="container person-hero">
        <p class="person-role">
          ${escapeHTML(person.role)}
        </p>

        <h1 class="person-name">
          ${escapeHTML(person.name)}
        </h1>

        ${
          person.bio
            ? `
              <p class="person-bio">
                ${escapeHTML(person.bio)}
              </p>
            `
            : ""
        }

        ${createPersonLinks(person.links)}
      </section>

      ${createCarSection(person.car)}

      <section class="container person-episodes">
        <header class="person-section-header">
          <p class="eyebrow">
            No QuintaCast
          </p>

          <h2>
            Episódios
          </h2>
        </header>

        <div
          id="person-episode-list"
          class="person-episode-list"
        >
          <p class="loading">
            Carregando episódios...
          </p>
        </div>
      </section>
    </main>
  `;

initStickyHeader();
initThemeToggle();

await loadPersonEpisodes();
}

async function loadPersonEpisodes() {
  const container = document.querySelector(
    "#person-episode-list"
  );

  try {
    const episodes = await fetchEpisodes();

    const personEpisodes = episodes.filter(
      (episode) =>
        episodeHasPerson(
          episode.number,
          person.id
        )
    );

    if (!personEpisodes.length) {
      container.innerHTML = `
        <p>
          Nenhum episódio encontrado.
        </p>
      `;

      return;
    }

    container.innerHTML = "";

    personEpisodes.forEach((episode) => {
      container.appendChild(
        createCompactEpisode(episode)
      );
    });
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p>
        Não conseguimos carregar os episódios agora.
      </p>
    `;
  }
}

function createCompactEpisode(episode) {
  const article = document.createElement("article");

  article.className = "person-episode";

  article.innerHTML = `
    ${
      episode.artworkUrl
        ? `
          <img
            class="person-episode-artwork"
            src="${escapeHTML(episode.artworkUrl)}"
            alt="Capa do episódio ${escapeHTML(episode.number)}"
            loading="lazy"
          >
        `
        : ""
    }

    <div class="person-episode-content">
      <div class="person-episode-number">
        EP.${padNumber(episode.number)}
      </div>

      <h3>
        ${escapeHTML(episode.title)}
      </h3>

      <div class="episode-meta">
        ${
          episode.pubDate
            ? `<span>${formatDate(episode.pubDate)}</span>`
            : ""
        }

        ${
          episode.duration
            ? `<span>${escapeHTML(episode.duration)}</span>`
            : ""
        }
      </div>

      <a
        class="listen-button"
        href="${escapeHTML(episode.audioUrl)}"
        target="_blank"
        rel="noreferrer"
      >
        ▶ Ouvir agora
      </a>
    </div>
  `;

  return article;
}

function createPersonLinks(links = []) {
  if (!links.length) {
    return "";
  }

  return `
    <div class="person-links">
      ${links
        .map(
          (link) => `
            <a
              href="${escapeHTML(link.url)}"
              ${
                link.url !== "#"
                  ? 'target="_blank" rel="noreferrer"'
                  : ""
              }
            >
              ${escapeHTML(link.label)}
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function createCarSection(car) {
  if (!car) {
    return "";
  }

  return `
    <section class="container person-project">
      <p class="eyebrow">
        Projeto
      </p>

      <h2>
        ${escapeHTML(car.name)}
      </h2>

      <p>
        ${escapeHTML(car.description)}
      </p>
    </section>
  `;
}

function renderNotFound() {
  app.innerHTML = `
    <main class="container">
      <h1>Pessoa não encontrada.</h1>

      <a href="/">
        Voltar para o QuintaCast
      </a>
    </main>
  `;
}

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(new Date(dateString));
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}