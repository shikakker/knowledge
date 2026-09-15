import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const home = await readFile(new URL('../pages/index.tsx', import.meta.url), 'utf8')
const articlePage = await readFile(new URL('../pages/[...slug].tsx', import.meta.url), 'utf8')

test('production build does not execute Contentful indexing as a package lifecycle side effect', () => {
  assert.equal(packageJson.scripts.build, 'next build')
  assert.equal(packageJson.scripts.prebuild, undefined)
  assert.equal(packageJson.scripts['search:index'], 'ts-node scripts/generate-search-index.ts')
})

test('home content is resolved at request time with a recoverable provider-unavailable state', () => {
  assert.match(home, /GetServerSideProps/)
  assert.match(home, /contentUnavailable/)
  assert.match(home, /statusCode\s*=\s*503/)
  assert.doesNotMatch(home, /GetStaticProps/)
})

test('article routes do not require Contentful during build and distinguish unavailable from not found', () => {
  assert.match(articlePage, /GetServerSideProps/)
  assert.match(articlePage, /contentUnavailable/)
  assert.match(articlePage, /statusCode\s*=\s*503/)
  assert.match(articlePage, /notFound:\s*true/)
  assert.doesNotMatch(articlePage, /getStaticPaths/)
})
