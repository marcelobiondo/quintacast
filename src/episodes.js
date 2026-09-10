export async function fetchEpisodes() {
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

  return items.map((item, index) =>
    parseEpisode(item, index, items.length)
  );
}

function parseEpisode(item, index, episodeCount) {
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
    item
      .querySelector("enclosure")
      ?.getAttribute("url") || "#";

  const episodeNumber =
    getText(item, "itunes\\:episode") ||
    String(episodeCount - index);

  const guid = getText(item, "guid");

  return {
    number: episodeNumber,
    title,
    description,
    pubDate,
    duration,
    artworkUrl,
    audioUrl,
    guid
  };
}

function getText(parent, selector) {
  return (
    parent.querySelector(selector)?.textContent?.trim() || ""
  );
}