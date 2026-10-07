# BEETS AI — beets-ai.com

Free, educator-reviewed **Hong Kong AI teaching resources** — by subject, learning
stage and specific classroom task. Each resource answers one recognisable teacher
need ("P4 population line graph: check an AI-generated explanation") rather than
being a generic toolkit.

- **Live:** https://beets-ai.com (GitHub Pages)
- **Stack:** Astro + Markdown, static output
- **Content plan:** Jira **EXCO-714** (five themes, 14-idea launch inventory)

## Commands

```bash
npm ci              # install exactly what CI installs
npm run dev         # local preview server
npm run test        # Vitest unit tests
npm run check       # astro check — types + content-collection schema
npm run build       # production build into dist/
```

## Development standard

**TDD is mandatory.** Every change follows RED → GREEN → REFACTOR:

1. Write a failing test that expresses the requirement (or reproduces the bug).
2. Run it — confirm it fails for the right reason.
3. Write the minimum code to make it pass.
4. Refactor with the tests still green.

No implementation lands without a test that covers it. Never weaken, skip or delete a
test to make CI pass — fix the code. Tests live in `tests/`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat(scope): …` · `fix(scope): …` · `test(scope): …` · `docs: …` · `chore: …`.
Work on a branch and open a pull request; do not commit directly to `main`.

## Content model

Every page shares one frontmatter contract, defined in `src/lib/schema.ts` and
wired to the collection in `src/content.config.ts`. Two publishing units:

| `type` | Purpose |
|---|---|
| `resource` | The primary unit — one specific classroom task, with a downloadable file |
| `post` | Short editorial/SEO prose that links to resources |

**The educator review gate is enforced by the schema:** a published `resource` must
name its `reviewer`. Set `draft: true` while authoring; drop it and add
`reviewer: "<name>"` to publish. Drafts are excluded from every build route.

Resource URLs are stable: `/resources/<stage>-<subject>-<task>/` (see
`src/lib/slug.ts`). Keep the page when a file is revised — version it instead.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: type-check → unit tests →
build → deploy to GitHub Pages. The workflow uses the built-in `GITHUB_TOKEN`
(`pages: write`, `id-token: write`) — **no personal access token is used at runtime**.

`public/CNAME` pins the custom domain (`beets-ai.com`). DNS lives at NameCheap:
apex `A` → 185.199.108–111.153, `www` `CNAME` → `beetslimited.github.io`.

## Secrets policy

**Never commit secrets.** `.env` is git-ignored; only `.env.example` is committed.
CI credentials come from GitHub Actions secrets.

This repository is **public** — assume everything in it is world-readable. Do not add
internal pricing, customer or student data, personal contact details, or the internal
strategy documents behind the content plan.
