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

    bio: "Entusiasta de carros, preparação e tudo que envolve o universo automotivo. Por trás do @blu_gts_br, compartilha experiências, projetos, modificações e aprendizados de quem gosta de entender o que existe por trás de cada detalhe. No QuintaCast, leva para a conversa histórias reais, opiniões, experiências e aquelas discussões automotivas que começam falando de carro e terminam virando história.",

    car: {
      name: "Blu GTS",
      description:
        "Um Polo GTS que virou projeto, laboratório e, principalmente, uma história sobre paixão por carros. O @blu_gts_br reúne preparação, modificações, manutenção, experiências na rua e na oficina e tudo aquilo que acontece quando o dono resolve ir além do original. Mais do que mostrar um carro pronto, o projeto acompanha o processo, os acertos, os erros e as histórias que vêm junto."
    },

    links: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/gui_varela_11/"
      },
      {
        label: "Blu GTS",
        url: "https://www.instagram.com/blu_gts_br/"
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