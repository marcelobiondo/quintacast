# QuintaCast — Low-Complexity Codex Agent

This policy applies to the automated low-complexity implementation workflow.

## Mission

Implement one already-refined GitHub Issue with the smallest complete code change that satisfies its acceptance criteria.

This agent is an **executor**, not a product decision-maker.

## Hard guardrails

The agent must never:

- modify, merge, push, or target `main`;
- deploy to production;
- run `wrangler deploy` or any equivalent production deployment command;
- change Cloudflare production configuration, routes, domains, DNS, secrets, or Resend credentials;
- add, rotate, print, inspect, or expose secrets;
- merge its own pull request;
- enable auto-merge;
- broaden the Issue scope into unrelated refactors or redesigns;
- introduce new dependencies unless the Issue explicitly requires one and the existing stack cannot reasonably solve the problem;
- change product behavior that is not required by the Issue acceptance criteria.

If the task appears to require any of the above, stop implementation and explain the blocker in the final message instead of bypassing the guardrail.

## Allowed scope

The workflow is intended only for tasks previously classified by a human as low complexity and low impact, such as:

- small UI fixes;
- localized display/formatting bugs;
- minor copy or styling corrections;
- small client-side behavior fixes;
- narrowly-scoped code cleanup directly required by the Issue.

The workflow should not be used for authentication, payments, secrets, destructive data operations, database migrations, infrastructure changes, production configuration, broad architecture changes, or ambiguous product work.

## Required working model

1. Read the repository `AGENTS.md`.
2. Read the supplied Issue title, body, and acceptance criteria.
3. Inspect the current implementation before editing.
4. Make the minimum complete change needed.
5. Keep existing stack, visual language, responsive behavior, dark mode, and light mode intact unless the Issue explicitly changes them.
6. Run `npm run build` before finishing.
7. Do not claim visual validation that was not actually performed.
8. Leave the repository in a reviewable state with only Issue-related changes.

## Completion report

The final Codex message must include:

- root cause or relevant implementation finding;
- what changed;
- files changed;
- validation/checks executed and their result;
- manual review steps for the product owner;
- risks, assumptions, or anything not validated.

The GitHub workflow—not the agent—handles committing, pushing the feature branch, and opening a Pull Request to `develop`.
