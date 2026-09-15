import lunr from "lunr";
import type { NextApiRequest, NextApiResponse } from "next";

import { getSearchData, SearchDocument } from "../../lib/search";

const MAX_SEARCH_QUERY_LENGTH = 100;
const MAX_SEARCH_RESULTS = 20;

type SearchResponse =
  | Array<{ content: string; title: string; slug: string }>
  | { error: string };

function parseBody(body: unknown): Record<string, unknown> | null {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }

  if (typeof body !== "string") return null;

  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function createSnippet(found: lunr.Index.Result, document: SearchDocument) {
  const metadata = found.matchData?.metadata ?? {};
  let position: [number, number] | undefined;

  for (const term of Object.values(metadata)) {
    const positions = term.content?.position;
    if (positions?.length) {
      position = positions[0] as [number, number];
      break;
    }
  }

  if (!position) {
    return document.content.slice(0, 120);
  }

  const [index, length] = position;
  const startIndex = Math.max(0, index - 15);
  const endIndex = Math.min(document.content.length, startIndex + length + 80);
  let content = document.content.slice(startIndex, endIndex);

  if (startIndex > 0) content = `…${content}`;
  if (endIndex < document.content.length) content = `${content}…`;

  return content;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const body = parseBody(req.body);
  const rawQuery = body?.query;
  if (typeof rawQuery !== "string" || !rawQuery.trim()) {
    res.status(400).json({ error: "SEARCH_QUERY_REQUIRED" });
    return;
  }

  const query = rawQuery.trim();
  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    res.status(400).json({ error: "SEARCH_QUERY_TOO_LONG" });
    return;
  }

  try {
    const { index, documents } = await getSearchData();
    const escapedQuery = lunr.Query.escape(query);
    const found = index.search(`${escapedQuery}*`).slice(0, MAX_SEARCH_RESULTS);

    const matches = found.flatMap((result) => {
      const document = documents[result.ref];
      if (!document) return [];

      return [
        {
          content: createSnippet(result, document),
          title: document.title,
          slug: document.path,
        },
      ];
    });

    res.status(200).json(matches);
  } catch {
    res.status(503).json({ error: "SEARCH_UNAVAILABLE" });
  }
}
