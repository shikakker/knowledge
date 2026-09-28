# knowledge — Modernization Roadmap

The repository contains a typed Next.js application with Contentful integration, components, scripts, utilities and environment configuration. It is worth evaluating as an actual application rather than treating it as a static sample.

## 10 tasks

1. Document the verified user problem and current content model by tracing pages, components and Contentful queries.
2. Remove committed build/cache artifacts such as `.cache` from version control and confirm generated directories are ignored.
3. Validate Contentful responses and centralize content mapping instead of allowing CMS shapes to leak throughout UI components.
4. Audit `.env.local.example` and all configuration so secrets are never exposed client-side or committed.
5. Add loading, empty, 404 and Contentful/network failure states to the main knowledge flows.
6. Add unit/integration tests for content mapping, routing and the most important user-facing behavior.
7. Upgrade the historical dependency stack incrementally after establishing a reproducible baseline build.
8. Add CI for lint, type-check, tests and production build.
9. Improve information architecture, search/navigation discoverability and metadata only where supported by the actual product scope.
10. Rewrite portfolio documentation around the verified product behavior, architecture and implementation decisions, with screenshots and explicit limitations.

## Portfolio value

Potentially useful as a Product Engineer artifact because it combines typed frontend implementation, CMS integration and information architecture. Feature it only after the product purpose and original contribution are made clear.