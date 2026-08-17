# Completion plan

1. Define `knowledge` as the implemented Next.js/Contentful knowledge-base starter with rich-text rendering, sidebar/table of contents, search and catch-all content pages. Establish template/upstream provenance before presenting it as an original product.
2. Audit Contentful credentials and API usage in `.env.local.example`/`lib/api.ts`. Delivery/preview tokens must have appropriate scope, preview credentials stay server-side and no management token belongs in browser code.
3. Treat `contentful/export.json` as a content/data artifact: inspect it for personal/private content or credentials before public use, document its provenance and do not let an old export silently override current Contentful content expectations.
4. Harden Contentful rich-text rendering: safe external URLs, controlled embedded assets/entries, syntax-highlighted code without executable HTML injection and deterministic handling for unsupported node types.
5. Make search semantics explicit in `lib/search.ts`: what content is indexed, when cache/index is rebuilt, tokenization/ranking and empty/no-result behavior. Avoid claiming semantic/AI search if it is ordinary local/text search.
6. Ensure catch-all routing handles drafts, unknown slugs, redirects and deleted content correctly. Preview/draft content must never leak into production pages or search results without explicit preview authorization.
7. Improve information architecture/accessibility: stable heading IDs, accurate table of contents, current sidebar state, keyboard navigation, mobile sidebar behavior and visible focus; code blocks need readable overflow/copy behavior.
8. Standardize cache/revalidation behavior for Contentful fetches so content freshness is predictable. Document build-time versus runtime fetching and fail gracefully during Contentful outages rather than serving misleading partial navigation.
9. Add fixtures/tests for rich-text nodes, slug/navigation construction, search ranking and draft/404 behavior; mock Contentful in CI and run lint/typecheck/tests/Next.js build without live credentials.
10. Rewrite README as verified knowledge-base starter documentation: provenance, Contentful model/API flow, search implementation, cache/freshness, setup/import/export, screenshots and explicit non-features.
