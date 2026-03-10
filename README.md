# Obtrace Docs Service

`obtrace-docs-service` is the standalone documentation site for SDKs, concepts, security, environments, workflows, and API references. It is a Next.js application using Fumadocs as the docs runtime.

## Runtime Summary

- Framework: Next.js 15 App Router
- Rendering model: static and server-rendered docs pages
- Content model: MDX in `content/docs`
- Docs UI: Fumadocs
- Search/AI integration: Inkeep and AI SDK dependencies

## Entrypoints

Primary files:

- [app/layout.tsx](./app/layout.tsx)
- [app/page.tsx](./app/page.tsx)
- [lib/source.ts](./lib/source.ts)
- [middleware.ts](./middleware.ts)

## Architecture

### Request flow

1. Incoming request resolves through Next.js App Router.
2. `middleware.ts` can normalize locale or request handling concerns.
3. Layout composes metadata, theme, and root docs provider.
4. Fumadocs source loader resolves MDX navigation and document payload.
5. Rendered page returns static or dynamic docs content.

### Content flow

1. Content is authored under `content/docs`.
2. Locale-aware metadata trees are resolved from `meta.json` and `meta.pt-BR.json`.
3. Shared metadata helpers define canonical URLs, OG images, and layout metadata.
4. Build output compiles MDX into the docs runtime.

## Domain Model

Primary domain entities:

- `DocPage`: one MDX-backed documentation page
- `DocSection`: a navigable collection of pages such as `sdks`, `concepts`, or `security`
- `LocaleVariant`: `en` and `pt-BR` document variants
- `SiteMetadata`: canonical metadata, OG image, sitemap, robots rules
- `QA/SearchConfig`: Inkeep or AI-backed structured search metadata

## Data Model

This service does not persist application data to Postgres or ClickHouse. Its persistence model is repository-backed content:

- MDX files in `content/docs/**`
- static assets under `public/`
- generated Next.js build artifacts under `.next/`

Because the content is file-backed rather than DB-backed, the durability model is Git plus deployment artifact storage rather than runtime database state.

## Sync vs Async

- Sync:
  - request routing
  - page render
  - metadata generation
  - robots/sitemap generation
- Async:
  - build pipeline
  - deployment pipeline
  - optional external search/index synchronization outside this package

## Resilience Model

- No internal queueing or worker layer.
- Reliability comes from static content, deterministic build output, and simple runtime dependencies.
- If AI/search integrations are unavailable, docs content should remain renderable.

## Operational Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run typecheck
```

Default local URL:

- `http://127.0.0.1:3005/docs`

## Content Topology

Major docs sections already in the repo:

- `sdks`
- `concepts`
- `security`
- `projects`
- `workflows`
- `integrations`
- `api-reference`
- `environments`

## Repository Responsibility

This service is the documentation delivery runtime, not the sole documentation source of truth. Service-level and repo-level READMEs in the monorepo must remain technically accurate and should link into this docs site where public-facing explanatory content exists.

## Related Documentation

- [Monorepo README](../README.md)
- [Frontend README](../obtrace/README.md)
- [Ingest README](../ingest/README.md)
