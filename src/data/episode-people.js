export const episodePeople = {
  "1": {
    hosts: ["marcelo", "guido", "edu"],
    guests: []
  },

  "2": {
    hosts: ["marcelo", "guido", "edu"],
    guests: []
  }
};

export function getEpisodePeople(episodeNumber) {
  return episodePeople[String(episodeNumber)] || {
    hosts: [],
    guests: []
  };
}

export function episodeHasPerson(episodeNumber, personId) {
  const { hosts, guests } = getEpisodePeople(episodeNumber);

  return (
    hosts.includes(personId) ||
    guests.includes(personId)
  );
}