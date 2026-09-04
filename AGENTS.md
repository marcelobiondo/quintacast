# AGENTS.md — QuintaCast

## Purpose

This file defines how coding agents should work in the QuintaCast repository.

QuintaCast is the official website for an automotive podcast about DIY, maintenance, modifications, retrofits, projects, events, successes and mistakes. The product should remain intentionally simple, fast, inexpensive to operate and easy to maintain.

## Product principles

- Ship useful value before adding architectural complexity.
- Prefer simple, understandable solutions over clever abstractions.
- Preserve the current visual identity unless a task explicitly requests a redesign.
- Treat responsive behavior, dark mode and light mode as part of every UI change.
- Avoid unnecessary dependencies and frameworks.
- Do not redesign unrelated areas while implementing a scoped task.
- Keep accessibility and semantic HTML in mind.

## Current stack

Frontend:
- HTML
- CSS
- Vanilla JavaScript
- Vite 8

Backend / edge:
- Cloudflare Workers
- Wrangler 4
- Static assets served from `dist/`

Integrations:
- Podcast RSS feed proxied through `/api/feed`
- Resend for contact-form email delivery

## Important paths

- `index.html` — homepage
- `contato/index.html` — contact page
- `src/main.js` — homepage/client behavior
- `src/contact.js` — contact form behavior
- `src/styles.css` — shared styling
- `worker/index.js` — Worker routes and backend logic
- `public/platforms/` — podcast platform icons
- `public/brand/` — brand assets
- `wrangler.jsonc` — Worker/assets/environment configuration
- `dist/` — generated build output; never edit manually

## Branch and environment strategy

Never implement product work directly on `main`.

- `develop` = integration / DEV
- `main` = production
- feature work = create a short-lived branch from `develop`, preferably `feat/<short-name>`, `fix/<short-name>`, or `chore/<short-name>`

Expected flow:

`feature branch -> develop -> DEV validation -> main -> PROD`

DEV:
- Worker: `quintacast-dev`
- URL: `https://dev.quintacast.com.br`

PROD:
- Worker: `quintacast`
- URL: `https://quintacast.com.br`

Do not deploy to production or merge into `main` unless explicitly requested.

## Development commands

Install dependencies:

```bash
npm ci
```

Frontend development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Full Worker locally after building:

```bash
npm run build
npx wrangler dev
```

DEV Worker locally:

```bash
npm run build
npx wrangler dev --env dev
```

## Validation before completing a task

At minimum:

1. Run `npm run build`.
2. Fix build errors introduced by the change.
3. Check that changed UI works at desktop and mobile widths.
4. Check both light and dark themes for visual changes.
5. If contact/backend behavior changed, validate the relevant Worker route without exposing secrets.
6. Summarize what changed and any manual validation still required.

Do not claim that a production deployment, external email delivery or live-domain behavior was validated unless it actually was.

## Cloudflare and secrets

Never commit credentials, API keys or `.dev.vars`.

Sensitive value:
- `RESEND_API_KEY`

Non-sensitive environment configuration may live in `wrangler.jsonc` when appropriate.

Do not print secret values in logs, PR descriptions or generated documentation.

## Worker behavior to preserve

The Worker currently handles:
- `/api/feed`
- `/api/contact`
- `/feedback` and `/feedback/` aliases
- `/mensagem` and `/mensagem/` aliases
- static assets

Contact protections such as server-side validation, field limits, honeypot handling and safe email rendering must not be weakened without an explicit product/security decision.

## UI conventions

- Reuse the global `.container` as the source of truth for site width.
- Avoid page-specific width rules that accidentally override the shared container.
- Keep layouts responsive.
- Preserve system-theme detection and persisted user theme preference.
- Podcast platform assets belong in `public/platforms/`.

## Scope discipline

When working from a GitHub Issue:

- Treat the Issue and its acceptance criteria as the requested scope.
- Inspect existing implementation before changing architecture.
- If the Issue is still an unrefined idea, do not invent major product decisions. Surface assumptions instead.
- Prefer a small complete change over a broad partial rewrite.

## Manual low-complexity Codex flow

Use `.github/codex/LOW_COMPLEXITY_AGENT.md` when a person explicitly asks Codex, authenticated with their ChatGPT account, to implement a refined low-complexity Issue. This is a manual operating procedure, not a GitHub Actions workflow, and it does not require a repository `OPENAI_API_KEY`.

Required flow:

- a human confirms that the Issue is refined, has clear acceptance criteria, and is low complexity / low impact;
- Codex reads `AGENTS.md`, the agent policy, and the complete Issue before changing code;
- work starts from the current `develop` branch;
- implementation happens on `agent/issue-<number>` or an equivalent scoped `fix/`, `feat/`, or `chore/` branch;
- only the approved Issue scope is implemented;
- `npm run build` must pass before completion;
- the result is a draft Pull Request targeting `develop`;
- human review is mandatory before merge or any later production promotion.

Codex is an executor only. It must never target or modify `main`, deploy, merge its own PR, enable auto-merge, access production secrets/configuration, or broaden the Issue beyond its approved scope. If the Issue is ambiguous, high impact, or outside the eligibility rules in the agent policy, stop and report the blocker instead of implementing it.

## Commits and PRs

Use Conventional Commit-style messages when practical:
- `feat:`
- `fix:`
- `style:`
- `refactor:`
- `docs:`
- `chore:`

PR descriptions should explain:
- what changed;
- why;
- how it was validated;
- any remaining product/design decision.

## Product-owner review

For visual or UX changes, implementation completion does not equal product approval. Prepare the change for DEV review and leave final visual/product approval to the product owner before promotion to production.
