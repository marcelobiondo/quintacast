# QuintaCast

Site oficial do **QuintaCast** — um podcast automotivo sobre DIY, manutenção, modificações, retrofits, projetos, eventos, acertos e cagadas.

> Quinta-feira é dia de postinho.

Este repositório contém o site público, a integração com o feed RSS do podcast, páginas de participantes, página de contato e o Cloudflare Worker que serve o frontend e executa as integrações de backend.

---

## Visão geral

O projeto foi pensado para ser simples de manter, barato de operar e fácil de evoluir.

```text
Visitante
   │
   ▼
quintacast.com.br
   │
   ├── frontend estático (Vite)
   ├── páginas de episódios e participantes
   ├── /api/feed ───────────────► RSS do podcast
   └── /api/contact
            │
            ▼
     Cloudflare Worker
            │
            ▼
          Resend
            │
            ▼
       caixa de e-mail
```

O mesmo repositório atende dois ambientes:

```text
develop ──► DEV
main    ──► PROD
```

---

# Stack

## Frontend

O site usa HTML, CSS e JavaScript sem framework de UI.

Principais páginas:

```text
/
└── Home + episódios

/contato/
└── Fale com a gente

/pessoas/marcelo/
/pessoas/guido/
/pessoas/edu/
└── Perfis reutilizáveis de participantes
```

Também existem aliases de contato:

```text
/feedback
/mensagem
```

Esses caminhos são redirecionados pelo Worker para `/contato/`.

### CSS

O CSS é responsável por layout, responsividade, light/dark mode, hero, cards de episódio, perfis, formulário, navegação e estados visuais. Não há framework CSS.

### JavaScript

O JavaScript do frontend é usado principalmente para:

- buscar e normalizar episódios do RSS;
- renderizar cards da Home;
- renderizar perfis e episódios relacionados;
- relacionar episódios e participantes;
- reutilizar navbar interna e comportamento sticky;
- alternar e persistir tema;
- enviar o formulário de contato;
- consumir os endpoints do Worker.

### Vite

O [Vite](https://vite.dev/) fornece servidor local, hot reload, build e geração de `dist/`.

```bash
npm run dev
npm run build
npm run preview
```

---

# Episódios e participantes

O RSS continua sendo a fonte principal dos episódios. O frontend usa uma camada compartilhada para parsing e normalização em `src/episodes.js`.

A relação entre episódio e participantes é enriquecida localmente no repositório, sem CMS, através de dados versionados em `src/data/`.

Essa abordagem mantém o fluxo editorial simples e evita duplicar o cadastro de episódios, enquanto permite criar perfis e relacionamentos que o RSS atual não entrega de forma suficiente para o site.

As páginas de participantes usam uma estrutura reutilizável em vez de páginas independentes com markup duplicado.

---

# Iconografia

A interface usa **Lucide** como biblioteca padrão de ícones funcionais.

A dependência é instalada via npm, sem CDN em runtime. Os ícones ficam centralizados em:

```text
src/icons.js
```

Stack inicial:

- `Calendar` — data de publicação;
- `Clock` — duração do episódio;
- `Mic` — apresentação/participantes;
- `Play` — ação “Ouvir agora”.

A documentação completa de uso, expansão, acessibilidade e ajustes ópticos está em:

```text
docs/ICONS.md
```

Antes de adicionar SVG avulso, emoji funcional ou outra biblioteca de ícones, consulte essa documentação e reutilize a stack existente sempre que possível.

Os ícones dos agregadores continuam como assets próprios em:

```text
public/platforms/
```

---

# Cloudflare

O projeto usa Cloudflare para DNS, SSL, domínio, Workers, assets estáticos, ambientes DEV/PROD, secrets e deploy integrado ao GitHub.

Configuração principal:

```text
wrangler.jsonc
```

## Cloudflare Worker

Arquivo:

```text
worker/index.js
```

Responsabilidades atuais:

```text
/api/feed
/api/contact
/feedback
/mensagem
assets estáticos
```

### `/api/feed`

Busca o feed RSS original:

```text
https://anchor.fm/s/11621a644/podcast/rss
```

e o entrega ao frontend.

### `/api/contact`

Recebe os dados do formulário, valida campos, verifica honeypot, aplica limites, chama o Resend e devolve o status ao frontend.

A API key do Resend é um secret e **nunca deve ser versionada**.

---

# Tema claro e escuro

O site suporta `dark` e `light`.

Na primeira visita, segue `prefers-color-scheme`. Quando o usuário altera manualmente, a preferência é persistida em `localStorage`.

---

# Estrutura do projeto

Estrutura resumida:

```text
quintacast/
├── contato/
│   └── index.html
├── pessoas/
│   ├── marcelo/
│   ├── guido/
│   └── edu/
├── docs/
│   └── ICONS.md
├── public/
│   ├── brand/
│   └── platforms/
├── src/
│   ├── data/
│   │   ├── episode-people.js
│   │   └── people.js
│   ├── contact.js
│   ├── episodes.js
│   ├── header.js
│   ├── icons.js
│   ├── main.js
│   ├── person.js
│   ├── site-header.js
│   └── styles.css
├── worker/
│   └── index.js
├── index.html
├── install.sh
├── package.json
├── package-lock.json
├── vite.config.js
├── wrangler.jsonc
└── README.md
```

A pasta `dist/` é gerada pelo Vite e não deve ser editada manualmente.

---

# Ambientes

## DEV

```text
branch: develop
worker: quintacast-dev
https://dev.quintacast.com.br
```

É o ambiente de integração e validação antes de produção.

## PROD

```text
branch: main
worker: quintacast
https://quintacast.com.br
```

A `main` recebe apenas mudanças já validadas.

---

# Fluxo de desenvolvimento

Evite trabalhar diretamente em `develop` ou `main`.

Nova feature:

```bash
git switch develop
git pull origin develop
git switch -c feat/minha-feature
```

Depois das alterações:

```bash
git add .
git commit -m "feat: descrição da alteração"
git push -u origin feat/minha-feature
```

Fluxo esperado:

```text
feature branch
     ↓
PR para develop
     ↓
DEV
     ↓
validação
     ↓
PR develop → main
     ↓
PROD
```

Mudanças de produto/UX devem ser validadas em DEV antes da promoção. Correções exclusivamente documentais podem ser integradas sem nova rodada visual quando não alterarem o produto publicado.

---

# Preparando uma nova máquina

O projeto inclui `install.sh`, que prepara automaticamente o ambiente de desenvolvimento.

Suporte pensado para:

- macOS;
- Linux / Ubuntu;
- WSL2;
- Windows com Git Bash.

## Instalação rápida

```bash
git clone https://github.com/marcelobiondo/quintacast.git
cd quintacast
chmod +x install.sh
./install.sh
```

No Windows, execute pelo Git Bash ou WSL2.

## O que o `install.sh` faz

O script:

1. detecta o sistema operacional;
2. verifica Git, Curl, Node e npm;
3. instala Node.js quando necessário;
4. instala todas as dependências declaradas no projeto com `npm ci`;
5. valida Vite;
6. valida Wrangler;
7. executa `npm run build`;
8. informa os próximos passos.

Isso significa que novas dependências npm, como Lucide, são automaticamente instaladas em uma máquina nova sem exigir lógica específica no bootstrap.

O script **não cria nem grava secrets automaticamente**.

---

# Requisitos

```text
Node.js 24+
npm 10+
Git
```

Confira:

```bash
node --version
npm --version
git --version
```

---

# Desenvolvimento local

## Frontend isolado

```bash
npm run dev
```

Normalmente em:

```text
http://localhost:5173
```

Esse modo sobe apenas o Vite. Endpoints do Worker, como `/api/feed`, não ficam disponíveis localmente nesse fluxo.

## Aplicação completa com Worker

```bash
npm run build
npx wrangler dev
```

ou:

```bash
npm run build && npx wrangler dev
```

Abra a URL informada pelo Wrangler, normalmente:

```text
http://localhost:8787
```

Esse é o fluxo recomendado para validar episódios reais vindos do RSS.

## Worker DEV

```bash
npm run build
npx wrangler dev --env dev
```

---

# Secrets

Secrets nunca devem ir para o GitHub.

## Resend

DEV:

```bash
npx wrangler secret put RESEND_API_KEY --env dev
```

PROD:

```bash
npx wrangler secret put RESEND_API_KEY
```

## Secrets locais

Para testar integrações localmente, crie `.dev.vars` na raiz:

```text
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
```

Garanta que `.dev.vars` esteja no `.gitignore` e nunca faça commit desse arquivo.

Configurações não sensíveis, como `CONTACT_FROM_EMAIL` e `CONTACT_TO_EMAIL`, podem ficar no `wrangler.jsonc`.

---

# Login e deploy manual

Autenticação:

```bash
npx wrangler login
```

DEV:

```bash
npm run build
npx wrangler deploy --env dev
```

PROD:

```bash
npm run build
npx wrangler deploy
```

O fluxo principal de deploy continua conectado ao GitHub; deploy manual é exceção.

---

# Build

Antes de um push relevante:

```bash
npm run build
```

O resultado deve ser gerado em `dist/`.

---

# Segurança

O projeto atualmente inclui:

- secrets fora do Git;
- validação server-side do formulário;
- honeypot anti-spam;
- limites de tamanho;
- sanitização do HTML do e-mail;
- endpoint de contato aceitando apenas `POST`;
- API key armazenada no Cloudflare;
- separação DEV/PROD.

---

# Documentação técnica

Documentos especializados devem complementar o README sem duplicá-lo.

- [`docs/ICONS.md`](docs/ICONS.md) — iconografia, arquitetura, acessibilidade e expansão da biblioteca de ícones.
- [`AGENTS.md`](AGENTS.md) — regras e contexto para agentes que colaboram no repositório, quando aplicável.

O README funciona como mapa geral do produto e da operação; detalhes específicos devem ficar em documentos próprios.

---

# Princípios do projeto

A infraestrutura é mantida intencionalmente proporcional ao problema.

```text
entregar
   ↓
validar
   ↓
aprender
   ↓
evoluir
```

O objetivo é evitar complexidade antes dela ser necessária, sem tornar o próximo passo caro.

---

# QuintaCast

**Marcelo · Guido · Edu**

Quinta-feira é dia de postinho.
