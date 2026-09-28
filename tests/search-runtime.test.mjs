import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const route = await readFile(new URL('../pages/api/search.ts', import.meta.url), 'utf8')
const search = await readFile(new URL('../lib/search.ts', import.meta.url), 'utf8')
const searchBox = await readFile(new URL('../components/SearchBox/SearchBox.tsx', import.meta.url), 'utf8')

test('search API is POST-only, validates a bounded query, and maps provider/index failures', () => {
  assert.match(route, /req\.method !== ["']POST["']/)
  assert.match(route, /MAX_SEARCH_QUERY_LENGTH/)
  assert.match(route, /SEARCH_QUERY_REQUIRED/)
  assert.match(route, /SEARCH_QUERY_TOO_LONG/)
  assert.match(route, /SEARCH_UNAVAILABLE/)
  assert.doesNotMatch(route, /JSON\.parse\(req\.body\)/)
  assert.doesNotMatch(route, /throw new Error\(["']Failed to load search index file["']\)/)
})

test('runtime search does not depend on writable filesystem or per-result Contentful requests', () => {
  assert.doesNotMatch(route, /readFile|writeFile|\.cache\/searchIndex/)
  assert.doesNotMatch(route, /getSingleArticleBySlug/)
  assert.match(search, /getAllSearchArticles/)
  assert.match(search, /cachedSearchData/)
  assert.doesNotMatch(search, /getSingleArticleBySlug/)
})

test('search input treats user text as plain text and handles failed HTTP responses', () => {
  assert.doesNotMatch(searchBox, /new RegExp\(query/)
  assert.match(searchBox, /if\s*\(!response\.ok\)/)
  assert.match(searchBox, /Content-Type["']?:\s*["']application\/json/)
  assert.match(searchBox, /role=["']alert["']/)
})
