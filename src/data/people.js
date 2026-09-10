export const people = {
  marcelo: {
    id: "marcelo",
    name: "Marcelo",
    role: "Apresentador",
    profileUrl: "/pessoas/marcelo/",

    bio: "TEXTO DA BIO",

    car: {
      name: "Volkswagen Polo Highline 200 TSI",
      description:
        "Um projeto OEM+ construído aos poucos, com retrofits, modificações e melhorias que tentam manter a essência original do carro — mesmo quando isso significa desmontar metade dele para instalar alguma coisa que ninguém precisava."
    },

    links: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/marceloppps"
      },
      {
        label: "Polo OEM+",
        url: "https://www.instagram.com/polo_oemplus"
      }
    ]
  },

  guido: {
    id: "guido",
    name: "Guido",
    role: "Apresentador",
    profileUrl: "/pessoas/guido/",

    bio: "Entusiasta de carros, projetos e boas ideias que às vezes dão certo. No QuintaCast, participa das conversas sobre modificações, experiências, decisões duvidosas e tudo aquilo que rende história depois.",

    car: {
      name: "Projeto do Guido",
      description:
        "Espaço reservado para o projeto automotivo do Guido, com contexto, modificações, histórias e tudo aquilo que ajuda a contar um pouco mais sobre a relação dele com o carro."
    },

    links: [
      {
        label: "Instagram",
        url: "#"
      },
      {
        label: "Projeto",
        url: "#"
      }
    ]
  },

  edu: {
    id: "edu",
    name: "Edu",
    role: "Apresentador",
    profileUrl: "/pessoas/edu/",

    bio: "Entusiasta de carros, projetos e histórias que normalmente começam com uma ideia simples e terminam em alguma improvisação. No QuintaCast, participa das conversas sobre manutenção, modificações, experiências e decisões questionáveis.",

    car: {
      name: "Projeto do Edu",
      description:
        "Espaço reservado para o projeto automotivo do Edu, com contexto, modificações, histórias e tudo aquilo que ajuda a contar um pouco mais sobre a relação dele com o carro."
    },

    links: [
      {
        label: "Instagram",
        url: "#"
      },
      {
        label: "Projeto",
        url: "#"
      }
    ]
  }
};

export function getPerson(personId) {
  return people[personId] || null;
}