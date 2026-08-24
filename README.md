# QuintaCast

Site oficial do **QuintaCast** — um podcast automotivo sobre DIY, manutenção, modificações, retrofits, projetos, eventos, acertos e cagadas.

> Quinta-feira é dia de postinho.

Este repositório contém o site público, a integração com o feed RSS do podcast, a página de contato e o Worker que serve o frontend e executa as integrações de backend.

---

## Visão geral

O projeto foi pensado para ser simples de manter, barato de operar e fácil de evoluir.

A arquitetura atual é:

```text
Visitante
   │
   ▼
quintacast.com.br
   │
   ├── frontend estático (Vite)
   │
   ├── /api/feed ───────────────► RSS do podcast
   │
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

### HTML

O site usa HTML simples, sem framework de UI.

Principais páginas:

```text
/
└── Home + episódios

/contato/
└── Fale com a gente
```

Também existem aliases de contato:

```text
/feedback
/mensagem
```

Esses caminhos são redirecionados pelo Worker para:

```text
/contato/
```

---

## CSS

O CSS do projeto é responsável por:

- layout;
- responsividade;
- dark mode / light mode;
- hero;
- cards dos episódios;
- formulário;
- navegação;
- ícones dos agregadores.

Não há framework CSS.

---

## JavaScript

O JavaScript do frontend é usado principalmente para:

- buscar e renderizar episódios;
- alternar tema claro/escuro;
- persistir a preferência de tema;
- enviar o formulário de contato;
- consumir os endpoints do Worker.

---

## Vite

O [Vite](https://vite.dev/) é usado para desenvolvimento e build.

Ele fornece:

- servidor local;
- hot reload;
- build otimizado;
- processamento dos assets;
- geração da pasta `dist/`.

Comandos principais:

```bash
npm run dev
npm run build
npm run preview
```

---

# Cloudflare

O projeto usa Cloudflare para:

- DNS;
- SSL;
- domínio;
- Cloudflare Workers;
- assets estáticos;
- ambientes DEV e PROD;
- secrets;
- deploy integrado ao GitHub.

A configuração principal fica em:

```text
wrangler.jsonc
```

---

## Cloudflare Worker

O Worker funciona como backend e também serve o build do frontend.

Arquivo:

```text
worker/index.js
```

Principais responsabilidades:

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

Recebe os dados do formulário:

```json
{
  "name": "Nome",
  "email": "email@exemplo.com",
  "message": "Mensagem",
  "website": ""
}
```

O campo `website` é um honeypot anti-spam.

O Worker:

1. valida os dados;
2. verifica o honeypot;
3. limita o tamanho dos campos;
4. chama a API do Resend;
5. devolve o status para o frontend.

---

# Resend

O [Resend](https://resend.com/) é responsável pela entrega dos e-mails enviados pelo formulário.

Fluxo:

```text
Formulário
   │
   ▼
POST /api/contact
   │
   ▼
Cloudflare Worker
   │
   ▼
Resend
   │
   ▼
E-mail do QuintaCast
```

O endereço informado pelo visitante é usado como `reply_to`.

Assim, quando a mensagem chega e alguém clica em **Responder**, a resposta vai diretamente para quem enviou o formulário.

A API key do Resend é um secret e **nunca deve ser versionada**.

---

# RSS

O podcast é distribuído via RSS.

Feed original:

```text
https://anchor.fm/s/11621a644/podcast/rss
```

O site consome:

```text
/api/feed
```

Isso mantém a integração centralizada no Worker.

---

# Agregadores

Atualmente o QuintaCast está disponível em:

- Spotify;
- Apple Podcasts;
- Overcast;
- YouTube Music;
- Amazon Music;
- Castbox;
- RSS.

Os ícones utilizados no site ficam em:

```text
public/platforms/
```

---

# Tema claro e escuro

O site suporta:

```text
dark
light
```

Na primeira visita, o tema segue:

```text
prefers-color-scheme
```

Quando o usuário altera o tema manualmente, a escolha é persistida usando:

```text
localStorage
```

---

# Estrutura do projeto

Estrutura resumida:

```text
quintacast/
├── contato/
│   └── index.html
│
├── public/
│   ├── brand/
│   └── platforms/
│
├── src/
│   ├── contact.js
│   ├── main.js
│   └── styles.css
│
├── worker/
│   └── index.js
│
├── index.html
├── install.sh
├── package.json
├── package-lock.json
├── vite.config.js
├── wrangler.jsonc
└── README.md
```

A pasta:

```text
dist/
```

é gerada pelo Vite e não deve ser editada manualmente.

---

# Ambientes

## DEV

Branch:

```text
develop
```

Worker:

```text
quintacast-dev
```

Domínio:

```text
https://dev.quintacast.com.br
```

O ambiente DEV é usado para testar alterações antes da produção.

---

## PROD

Branch:

```text
main
```

Worker:

```text
quintacast
```

Domínio:

```text
https://quintacast.com.br
```

A branch `main` deve receber apenas versões já validadas.

---

# Fluxo de desenvolvimento

Evite trabalhar diretamente em `main`.

Exemplo de nova feature:

```bash
git checkout develop
git pull origin develop

git checkout -b feat/minha-feature
```

Depois das alterações:

```bash
git add .
git commit -m "feat: descrição da alteração"
```

Para integrar em DEV:

```bash
git checkout develop
git merge feat/minha-feature
git push origin develop
```

Valide em:

```text
https://dev.quintacast.com.br
```

Depois de aprovado:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Isso publica a versão em produção.

---

# Preparando uma nova máquina

O projeto inclui:

```text
install.sh
```

Ele prepara automaticamente o ambiente de desenvolvimento.

É útil ao configurar:

- outro Mac;
- Linux;
- Ubuntu;
- WSL2;
- Windows com Git Bash.

---

## Instalação rápida

Clone o repositório:

```bash
git clone https://github.com/marcelobiondo/quintacast.git
cd quintacast
```

Dê permissão ao instalador:

```bash
chmod +x install.sh
```

Execute:

```bash
./install.sh
```

No Windows, execute pelo **Git Bash** ou **WSL2**.

---

# O que o `install.sh` faz

O script:

1. detecta o sistema operacional;
2. verifica Git, Curl, Node e npm;
3. instala Node.js quando necessário;
4. instala as dependências com `npm ci`;
5. valida Vite;
6. valida Wrangler;
7. executa `npm run build`;
8. informa os próximos passos.

O script **não cria nem grava secrets automaticamente**.

---

# Requisitos

Recomendado:

```text
Node.js 24+
npm 10+
Git
```

As dependências de Vite e Wrangler são instaladas pelo próprio projeto.

Confira:

```bash
node --version
npm --version
git --version
```

---

# Desenvolvimento local

## Frontend

```bash
npm run dev
```

Normalmente disponível em:

```text
http://localhost:5173
```

Esse modo é ideal para trabalhar apenas no frontend.

---

## Worker completo

Para testar frontend + Worker:

```bash
npm run build
npx wrangler dev
```

Normalmente disponível em:

```text
http://localhost:8787
```

---

## Worker DEV

```bash
npm run build
npx wrangler dev --env dev
```

---

# Secrets

Secrets nunca devem ir para o GitHub.

## Resend

### DEV

```bash
npx wrangler secret put RESEND_API_KEY --env dev
```

### PROD

```bash
npx wrangler secret put RESEND_API_KEY
```

---

# Secrets locais

Para testar integrações localmente, crie na raiz:

```text
.dev.vars
```

Exemplo:

```text
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
```

Garanta que `.dev.vars` esteja no `.gitignore`.

Nunca faça commit desse arquivo.

---

# Variáveis não sensíveis

Configurações como:

```text
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

podem ficar no `wrangler.jsonc`.

Credenciais como:

```text
RESEND_API_KEY
```

não podem.

---

# Login no Cloudflare

Em uma máquina nova, para deploy manual ou administração de secrets:

```bash
npx wrangler login
```

Isso abrirá o navegador para autenticação.

---

# Deploy manual

O fluxo principal de deploy está conectado ao GitHub, mas também é possível publicar manualmente.

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

Use deploy manual apenas quando necessário.

---

# Build

Para validar o projeto antes de um push:

```bash
npm run build
```

O resultado deve ser gerado em:

```text
dist/
```

---

# Segurança

O projeto atualmente inclui:

- secrets fora do Git;
- validação server-side do formulário;
- honeypot anti-spam;
- limites de tamanho;
- sanitização do HTML do e-mail;
- endpoint de contato aceitando apenas `POST`;
- API key armazenada no Cloudflare.

---

# Princípios do projeto

A infraestrutura foi mantida intencionalmente enxuta.

A lógica é:

```text
entregar
   ↓
validar
   ↓
aprender
   ↓
evoluir
```

O objetivo é evitar complexidade antes dela ser necessária.

---

# QuintaCast

**Marcelo · Guido · Edu**

Quinta-feira é dia de postinho.
