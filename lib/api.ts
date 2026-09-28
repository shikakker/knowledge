import fetch from "isomorphic-unfetch";
import dotenv from "dotenv-flow";
import { SiteSettings } from "../types";

dotenv.config();

const CONTENTFUL_TIMEOUT_MS = 10_000;
const CONTENT_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedSidebarLinks: any[] | undefined;
let cachedSidebarLinksExpiresAt = 0;

const ARTICLE_GRAPHQL_FIELDS = `
sys {
  id
}
title
slug
metaDescription
body {
  json
  links {
    entries {
      block {
        sys {
          id
        }
        __typename
        ... on CodeBlock {
          name
          language
          code
        }
      }
      hyperlink {
        sys {
          id
        }
        __typename
        ... on KbAppArticle {
          title
          slug
          kbAppCategory {
            sys {
              id
            }
            slug
          }
        }
      }
    }
    assets {
      block {
        sys {
          id
        }
        url
        title
        width
        height
        description
      }
    }
  }
}
kbAppCategory {
  sys {
    id
  }
  name
  slug
  previewDescription
}
`;

type GraphQLVariables = Record<string, string | number | boolean | null>;

function getContentfulConfig(preview: boolean) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID?.trim();
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN?.trim();
  const previewAccessToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN?.trim();
  const token = preview ? previewAccessToken : accessToken;

  if (!spaceId || !token) {
    throw new Error("CONTENTFUL_NOT_CONFIGURED");
  }

  return { spaceId, token };
}

async function fetchGraphQL(
  query: string,
  preview = false,
  variables: GraphQLVariables = {},
) {
  const { spaceId, token } = getContentfulConfig(preview);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTENTFUL_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error("CONTENTFUL_REQUEST_FAILED");
    }

    let payload: any;
    try {
      payload = await response.json();
    } catch {
      throw new Error("CONTENTFUL_REQUEST_FAILED");
    }

    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new Error("CONTENTFUL_GRAPHQL_ERROR");
    }

    return payload;
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "CONTENTFUL_NOT_CONFIGURED",
        "CONTENTFUL_REQUEST_FAILED",
        "CONTENTFUL_GRAPHQL_ERROR",
      ].includes(error.message)
    ) {
      throw error;
    }
    throw new Error("CONTENTFUL_REQUEST_FAILED");
  } finally {
    clearTimeout(timeout);
  }
}

function extractArticle(fetchResponse: any) {
  return fetchResponse?.data?.kbAppArticleCollection?.items?.[0];
}

function extractArticleEntries(fetchResponse: any) {
  return fetchResponse?.data?.kbAppArticleCollection?.items;
}

export async function getSingleArticleBySlug(slug: string, preview = false) {
  const entry = await fetchGraphQL(
    `query ArticleBySlug($slug: String!) {
      kbAppArticleCollection(where: { slug: $slug }, preview: ${preview}, limit: 1) {
        items {
          ${ARTICLE_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
    { slug },
  );

  return extractArticle(entry);
}

export async function getSiteSettings(preview = false): Promise<SiteSettings> {
  const response = await fetchGraphQL(
    `query {
      kbAppSiteSettingsCollection(preview: ${preview}, limit: 1) {
        items {
          siteName
          siteDescription
          siteKeywords
        }
      }
    }`,
    preview,
  );

  const settings = response?.data?.kbAppSiteSettingsCollection?.items?.[0];
  if (!settings) {
    throw new Error("CONTENTFUL_EMPTY_RESPONSE");
  }
  return settings;
}

export async function getAllCategories(preview = false) {
  if (
    !preview &&
    cachedSidebarLinks &&
    Date.now() < cachedSidebarLinksExpiresAt
  ) {
    return cachedSidebarLinks;
  }

  const entries = await fetchGraphQL(
    `query {
      kbAppCategoryCollection(where: { slug_exists: true }) {
        items {
          slug
          name
          previewDescription
          sys {
            id
          }
          linkedFrom {
            kbAppArticleCollection {
              items {
                title
                slug
                sys {
                  id
                }
              }
            }
          }
        }
      }
    }`,
    preview,
  );

  const data = entries?.data?.kbAppCategoryCollection?.items;
  if (!Array.isArray(data)) {
    throw new Error("CONTENTFUL_EMPTY_RESPONSE");
  }

  const sidebarLinks = data
    .filter((entry) => entry?.slug && entry?.name)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map((categoryEntry) => ({
      description: categoryEntry.previewDescription,
      links: (categoryEntry.linkedFrom?.kbAppArticleCollection?.items ?? [])
        .filter((article) => article?.slug && article?.title)
        .map((article) => ({
          slug: `/${categoryEntry.slug}/${article.slug}`,
          title: article.title,
        })),
      slug: `/${categoryEntry.slug}`,
      title: categoryEntry.name,
    }));

  if (!preview) {
    cachedSidebarLinks = sidebarLinks;
    cachedSidebarLinksExpiresAt = Date.now() + CONTENT_CACHE_TTL_MS;
  }

  return sidebarLinks;
}

export async function getAllArticles(preview = false) {
  const entries = await fetchGraphQL(
    `query {
      kbAppArticleCollection(where: { slug_exists: true }, preview: ${preview}) {
        items {
          slug
          sys {
            id
          }
          title
          kbAppCategory {
            sys {
              id
            }
            name
            slug
            previewDescription
          }
        }
      }
    }`,
    preview,
  );

  const articleEntries = extractArticleEntries(entries);
  if (!Array.isArray(articleEntries)) {
    throw new Error("CONTENTFUL_EMPTY_RESPONSE");
  }
  return articleEntries;
}

export async function getAllSearchArticles(preview = false) {
  const entries = await fetchGraphQL(
    `query {
      kbAppArticleCollection(where: { slug_exists: true }, preview: ${preview}) {
        items {
          slug
          title
          body {
            json
          }
          kbAppCategory {
            slug
          }
        }
      }
    }`,
    preview,
  );

  const articleEntries = extractArticleEntries(entries);
  if (!Array.isArray(articleEntries)) {
    throw new Error("CONTENTFUL_EMPTY_RESPONSE");
  }
  return articleEntries;
}
