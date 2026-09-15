import React from "react";
import Image from "next/image";
import slugger from "github-slugger";

import {
  Heading,
  Paragraph,
  Subheading,
  List,
  Table,
  TextLink,
} from "@contentful/f36-components";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import type { Block, Inline, Text } from "@contentful/rich-text-types";
import type { RenderNode } from "@contentful/rich-text-react-renderer";
import { CodeBlock } from "./CodeBlock";

const CONTENTFUL_ASSET_HOSTS = new Set([
  "images.ctfassets.net",
  "assets.ctfassets.net",
]);

const getHeadingId = (node: Block | Inline) =>
  slugger.slug((node.content[0] as Text).value, false);

function getSafeAssetUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (url.protocol !== "https:" || !CONTENTFUL_ASSET_HOSTS.has(url.hostname)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function getRenderNode(links): RenderNode {
  const entryMap = new Map();
  for (const entry of links.entries.block) {
    entryMap.set(entry.sys.id, entry);
  }

  for (const entry of links.entries.hyperlink) {
    entryMap.set(entry.sys.id, entry);
  }

  const assetMap = new Map();
  for (const asset of links.assets.block) {
    assetMap.set(asset.sys.id, asset);
  }

  return {
    [BLOCKS.PARAGRAPH]: (_node, children) => {
      return <Paragraph>{children}</Paragraph>;
    },
    [BLOCKS.HEADING_2]: (node, children) => {
      const id = getHeadingId(node);

      return (
        <Heading id={id} as="h2" marginTop="spacing2Xl">
          {children}
        </Heading>
      );
    },
    [BLOCKS.HEADING_3]: (node, children) => {
      const id = getHeadingId(node);

      return (
        <Subheading id={id} as="h3" marginTop="spacingXl">
          {children}
        </Subheading>
      );
    },
    [BLOCKS.HEADING_4]: (node, children) => {
      const id = getHeadingId(node);
      return (
        <Subheading id={id} as="h4">
          {children}
        </Subheading>
      );
    },
    [BLOCKS.HEADING_5]: (node, children) => {
      const id = getHeadingId(node);
      return (
        <Subheading id={id} as="h5">
          {children}
        </Subheading>
      );
    },
    [BLOCKS.HEADING_6]: (node, children) => {
      const id = getHeadingId(node);
      return (
        <Subheading id={id} as="h6">
          {children}
        </Subheading>
      );
    },
    [BLOCKS.UL_LIST]: (_node, children) => (
      <List as="ul">
        <List.Item>{children}</List.Item>
      </List>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = assetMap.get(node.data.target.sys.id);
      const src = getSafeAssetUrl(asset?.url);
      if (!src || !Number.isFinite(asset?.width) || !Number.isFinite(asset?.height)) {
        return null;
      }

      return (
        <Image
          alt={asset.description ?? asset.title ?? "Content image"}
          height={asset.height}
          loader={({ src: imageSrc }) => imageSrc}
          src={src}
          unoptimized
          width={asset.width}
        />
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const entry = entryMap.get(node.data.target.sys.id);
      return (
        <CodeBlock className={`language-${entry.language ?? "jsx"}`}>
          {entry.code}
        </CodeBlock>
      );
    },
    [INLINES.HYPERLINK]: (node, children) => {
      return <TextLink href={node.data.uri}>{children}</TextLink>;
    },
    [INLINES.ENTRY_HYPERLINK]: (node, children) => {
      const entry = entryMap.get(node.data.target.sys.id);
      return (
        <TextLink href={`/${entry.kbAppCategory.slug}/${entry.slug}`}>
          {children}
        </TextLink>
      );
    },
    [BLOCKS.TABLE]: (node) => {
      const [headerRow, ...bodyRows] = node.content as any[];

      return (
        <Table>
          <Table.Head>
            <Table.Row>
              {headerRow.content.map((cell, idx) => (
                <Table.Cell key={idx}>
                  {cell.content[0].content[0].value}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {bodyRows.map((row, idx) => (
              <Table.Row key={idx}>
                {row.content.map((cell, idx) => (
                  <Table.Cell key={idx}>
                    {cell.content[0].content[0].value}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      );
    },
  };
}
