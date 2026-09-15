# Knowledge — Contentful Knowledge Base

A server-rendered knowledge-base frontend built with Next.js, Contentful and Contentful Forma 36. The repository began as a Contentful/Next.js example and is maintained here as a hardened CMS delivery reference rather than as an independently invented CMS product.

## What it does

- renders the knowledge-base home and article routes from Contentful;
- builds sidebar/category navigation from Contentful entries;
- renders Contentful rich text, code blocks, tables and allowlisted Contentful assets;
- provides bounded full-text article search with Lunr;
- degrades to explicit HTTP 503 recovery states when Contentful is unavailable instead of failing the application build or exposing raw provider errors.

## Runtime architecture

Content is fetched server-side from Contentful at request time. The normal `yarn build` does **not** contact Contentful and does not generate or mutate CMS data.

Search is also runtime-owned:

- `/api/search` is POST-only;
- queries are required and capped at 100 characters;
- results are capped at 20;
- searchable Contentful article data and the Lunr index are cached in process memory for five minutes;
- the runtime does not depend on a writable filesystem cache;
- provider/index failures return a controlled `503 SEARCH_UNAVAILABLE` response.

The optional historical generation scripts remain explicit commands. `yarn search:index` may contact Contentful and should only be run intentionally in a configured environment.

## Stack

- Next.js `15.5.24` — Pages Router
- React 18.2
- TypeScript
- Contentful GraphQL API
- Contentful Forma 36
- Lunr
- Yarn 1 / `yarn.lock`
- Node.js 22 in CI

The production dependency graph pins the vulnerable Next.js line to `15.5.24` and resolves Next's transitive PostCSS dependency to `8.5.23`. CI blocks high/critical production advisories. Moderate advisories remain in the historical Forma 36 / Emotion dependency tree and are tracked as modernization debt rather than hidden.

## Local setup

```bash
yarn install --frozen-lockfile
cp .env.local.example .env.local
```

Configure:

```bash
CONTENTFUL_SPACE_ID=...
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...
```

`CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` are required for normal provider-backed rendering. The preview token is only needed for preview-aware code paths.

Start development:

```bash
yarn dev
```

Then open `http://localhost:3000`.

## Verification

```bash
yarn test
yarn typecheck
yarn lint
yarn build
```

The GitHub Actions `Quality` workflow additionally performs a frozen install and blocks high/critical production dependency advisories before running tests, typecheck, lint and the production build.

Current regression coverage includes:

- Contentful configuration and timeout/error boundaries;
- GraphQL variable handling;
- non-mutating production build behavior;
- runtime CMS failure recovery for home/article routes;
- bounded, method-safe search API behavior;
- no writable filesystem dependency or per-result Contentful N+1 search calls;
- client-side search failure handling and literal-text highlighting.

## Deployment

The canonical Vercel project currently linked to this repository is `knowledge`.

A Vercel build no longer requires Contentful to be reachable because CMS reads moved out of the build phase. A fully provider-backed production smoke still requires valid Contentful environment configuration in the target deployment.

For release verification, check:

1. `/` renders content or the controlled unavailable state;
2. a real article route renders or distinguishes a missing article from provider unavailability;
3. search accepts a normal query, handles special characters as text, and recovers from provider failure;
4. runtime logs contain no unexpected 5xx/provider stack traces.

## Security and reliability notes

- Contentful credentials are server-only and are never committed.
- Contentful requests are timeout-bounded and non-success/GraphQL-error responses fail closed.
- Contentful asset rendering only accepts HTTPS URLs from known Contentful asset hosts.
- Search responses and CMS failure states are normalized; upstream exception text is not returned to clients.
- Production dependency audit is part of CI.

## Provenance / portfolio boundary

This repository is derived from a Contentful/Next.js knowledge-base example. Portfolio claims should focus on the verified hardening work in this fork: runtime CMS isolation, search redesign, failure recovery, dependency/security modernization and deterministic delivery. It should not be presented as an original Contentful or Next.js product.

See `PRODUCT_COMPLETION_STATUS.md` for current T01–T10 / I01–I10 / F01–F10 status and hosted verification evidence.
