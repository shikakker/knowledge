import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import lunr from "lunr";

import { getAllSearchArticles } from "./api";

export interface SearchDocument {
  content: string;
  title: string;
  slug: string;
  path: string;
}

export interface SearchData {
  index: lunr.Index;
  documents: Record<string, SearchDocument>;
}

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedSearchData: { expiresAt: number; data: SearchData } | null = null;
let pendingSearchData: Promise<SearchData> | null = null;

function createIndex(documents: SearchDocument[]) {
  return lunr(function () {
    this.ref("slug");
    this.field("title");
    this.field("content");
    this.metadataWhitelist = ["position"];

    documents.forEach((document) => {
      this.add(document);
    });
  });
}

async function createSearchData(): Promise<SearchData> {
  const articles = await getAllSearchArticles();
  const documents = articles
    .filter(
      (article) =>
        article?.slug &&
        article?.title &&
        article?.body?.json &&
        article?.kbAppCategory?.slug,
    )
    .map((article): SearchDocument => ({
      content: documentToPlainTextString(article.body.json),
      title: article.title,
      slug: article.slug,
      path: `/${article.kbAppCategory.slug}/${article.slug}`,
    }));

  const documentMap = documents.reduce<Record<string, SearchDocument>>(
    (accumulator, document) => {
      accumulator[document.slug] = document;
      return accumulator;
    },
    {},
  );

  return {
    index: createIndex(documents),
    documents: documentMap,
  };
}

export async function getSearchData(): Promise<SearchData> {
  if (cachedSearchData && Date.now() < cachedSearchData.expiresAt) {
    return cachedSearchData.data;
  }

  if (!pendingSearchData) {
    pendingSearchData = createSearchData()
      .then((data) => {
        cachedSearchData = {
          data,
          expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
        };
        return data;
      })
      .finally(() => {
        pendingSearchData = null;
      });
  }

  return pendingSearchData;
}

export async function buildSearchIndex() {
  return (await createSearchData()).index;
}
