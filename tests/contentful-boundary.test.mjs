import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const api = await readFile(new URL('../lib/api.ts', import.meta.url), 'utf8')

test('article slug is passed as a GraphQL variable instead of query interpolation', () => {
  assert.match(api, /\$slug:\s*String!/)
  assert.match(api, /slug:\s*\$slug/)
  assert.match(api, /variables:\s*\{\s*slug/)
  assert.doesNotMatch(api, /slug:\s*"\$\{slug\}"/)
})

test('Contentful configuration fails closed before provider requests', () => {
  assert.match(api, /CONTENTFUL_SPACE_ID/)
  assert.match(api, /CONTENTFUL_ACCESS_TOKEN/)
  assert.match(api, /CONTENTFUL_PREVIEW_ACCESS_TOKEN/)
  assert.match(api, /CONTENTFUL_NOT_CONFIGURED/)
})

test('Contentful requests are timeout bounded and reject non-success responses', () => {
  assert.match(api, /AbortController/)
  assert.match(api, /CONTENTFUL_TIMEOUT_MS/)
  assert.match(api, /if\s*\(!response\.ok\)/)
  assert.match(api, /CONTENTFUL_REQUEST_FAILED/)
})

test('Contentful GraphQL errors do not pass through as successful data', () => {
  assert.match(api, /payload\.errors/)
  assert.match(api, /CONTENTFUL_GRAPHQL_ERROR/)
})
