import fs from "node:fs/promises";
import path from "node:path";
import fetch from "isomorphic-unfetch";
import dotenv from "dotenv-flow";
import { SiteSettings } from "../types";

dotenv.config();

const CACHE_FILE = path.resolve(".cache/sidebarLinks.json");
const CONTENTFUL_TIMEOUT_MS = 10_000;

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

function extractArticle(fetchResponse) {
  return fetchResponse?.data?.kbAppArticleCollection?.items?.[0];
}

function extractArticleEntries(fetchResponse) {
  return fetchResponse?.data?.kbAppArticleCollection?.items;
}

export async function getSingleArticleBySlug(slug, preview = false) {
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

  return response?.data?.kbAppSiteSettingsCollection?.items?.[0];
}

export async function getAllCategories(preview = false) {
  let sidebarLinks;

  if (!preview) {
    try {
      sidebarLinks = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    } catch (_) {
      console.log("Cache not initialized");
    }
  }

  if (!sidebarLinks) {
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

    if (data) {
      sidebarLinks = data
        .sort((a, b) => b.name < a.name)
        .reduce((categories, categoryEntry) => {
          const category = {
            description: categoryEntry.previewDescription,
            links: [],
            slug: `/${categoryEntry.slug}`,
            title: categoryEntry.name,
          };

          category.links = categoryEntry.linkedFrom?.kbAppArticleCollection?.items.map(
            (article) => ({
              slug: `/${categoryEntry.slug}/${article.slug}`,
              title: article.title,
            }),
          );

          categories.push(category);
          return categories;
        }, []);

      if (!preview) {
        await fs
          .writeFile(CACHE_FILE, JSON.stringify(sidebarLinks), "utf8")
          .catch(() => {});
      }
    }
  }

  return sidebarLinks;
}

export async function getAllArticles(preview = false) {
  const entries = await fetchGraphQL(
    `query {
      kbAppArticleCollection(where: { slug_exists: true }) {
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

  if (!articleEntries) {
    throw new Error("Could not fetch any entries from Contentful");
  }

  return articleEntries;
}
