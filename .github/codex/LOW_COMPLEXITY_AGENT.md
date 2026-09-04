# QuintaCast — Manual Low-Complexity Codex Flow

This policy applies when a person explicitly asks Codex, authenticated with their ChatGPT account, to implement one low-complexity GitHub Issue. It does not depend on GitHub Actions or `OPENAI_API_KEY`.

## Mission

Implement one already-refined GitHub Issue with the smallest complete code change that satisfies its acceptance criteria.

Codex is an **executor**, not a product decision-maker. The human remains responsible for classifying the Issue, starting the task, reviewing the draft Pull Request, and deciding whether to merge it.

## Eligibility gate

Start only when a human has confirmed that the Issue:

- is open and already refined;
- has clear acceptance criteria;
- is low complexity and low impact;
- does not involve authentication, payments, secrets, destructive data operations, database migrations, infrastructure, production configuration, broad architecture changes, or ambiguous product decisions.

If any condition is missing, stop and report what must be clarified. Do not infer approval from a label alone.

## Hard guardrails

Codex must never:

- modify, merge, push, or target `main`;
- deploy to production or run `wrangler deploy` (or an equivalent deployment command);
- change Cloudflare production configuration, routes, domains, DNS, secrets, or Resend credentials;
- add, rotate, print, inspect, or expose secrets;
- merge its own Pull Request or enable auto-merge;
- broaden the Issue scope into unrelated refactors or redesigns;
- introduce new dependencies unless the Issue explicitly requires one and the existing stack cannot reasonably solve the problem;
- change product behavior outside the Issue acceptance criteria.

If the task appears to require any prohibited action, stop and explain the blocker instead of bypassing the guardrail.

## Required operating flow

1. Read `AGENTS.md`, this policy, and the complete Issue.
2. Confirm the Issue passes the eligibility gate. Do not begin otherwise.
3. Fetch the current repository state and start from `develop`.
4. Create a short-lived branch named `agent/issue-N`. An equivalent `fix/`, `feat/`, or `chore/` branch is acceptable when it describes the scoped change better.
5. Inspect the current implementation before editing.
6. Make only the minimum complete change required by the Issue.
7. Preserve the existing stack, visual language, responsive behavior, dark mode, and light mode unless the Issue explicitly changes them.
8. Run `npm run build` and fix any error introduced by the change.
9. Commit and push only Issue-related changes to the feature branch.
10. Open a **draft** Pull Request targeting `develop` and request human review.
11. Stop. Do not merge, deploy, promote to `main`, or enable automation that does so.

Suggested manual prompt:

```text
Implement Issue #N in marcelobiondo/quintacast. Follow AGENTS.md and .github/codex/LOW_COMPLEXITY_AGENT.md. Confirm it is refined and low complexity, start from develop, create agent/issue-N (or an equivalent scoped feature branch), run npm run build, and open a draft PR to develop. Never touch main, deploy, auto-merge, or merge. Stop if the Issue does not pass the eligibility gate.
```

## Completion report

The final Codex message must include:

- root cause or relevant implementation finding;
- what changed and which files changed;
- validation/checks executed and their result;
- the draft Pull Request link and confirmation that its base is `develop`;
- manual review steps for the product owner;
- risks, assumptions, or anything not validated.

The person starting the task is responsible for ensuring Codex is signed in with the intended ChatGPT account and has access to the repository. No repository `OPENAI_API_KEY` or GitHub Actions secret is required for this manual flow.
