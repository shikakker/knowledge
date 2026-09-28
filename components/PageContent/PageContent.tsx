import React from "react";
import { css, cx } from "emotion";
import { Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";

import type { FrontMatter } from "../../types";
import {
  getGridStyles,
  SCREEN_BREAKPOINT_DESKTOP,
  SCREEN_BREAKPOINT_LARGE,
} from "../../utils/getGridStyles";
import { TableOfContent, TableOfContentProps } from "./TableOfContent";
import { PageContentHeader } from "./PageContentHeader";
import type { RichTextProps } from "../ContentfulRichText";
import { RichText } from "../ContentfulRichText";

const styles = {
  grid: css({
    flex: 1,
    minWidth: 0,
    gridAutoRows: "min-content",
    gridTemplateAreas: `
      "header"
      "content"
      "toc"
    `,
    rowGap: tokens.spacingL,
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      gridTemplateAreas: `
        "header header"
        "content toc"
      `,
      rowGap: 0,
    },
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
      gridTemplateAreas: `
        ". header header ."
        ". content toc ."
      `,
    },
  }),
  content: css({
    gridArea: "content",
    minWidth: 0,
  }),
  article: css({
    minWidth: 0,
    overflowWrap: "anywhere",
    "> *:first-child": { marginTop: 0 },
  }),
  tableOfContent: css({
    gridArea: "toc",
    display: "flex",
    flexDirection: "column",
    position: "static",
    paddingTop: tokens.spacingM,
    alignSelf: "start",
    overflowY: "auto",
    overscrollBehavior: "contain",
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      position: "sticky",
      top: tokens.spacing2Xl,
      paddingTop: 0,
      paddingLeft: tokens.spacing2Xl,
    },
  }),
};

export interface PageContentProps {
  headings: TableOfContentProps["headings"];
  frontMatter: FrontMatter;
  source: {
    richTextBody?: RichTextProps["document"];
    richTextLinks?: RichTextProps["links"];
  };
}

export function PageContent({
  headings,
  frontMatter,
  source,
}: PageContentProps) {
  const gridStyles = getGridStyles();
  const { title } = frontMatter;

  return (
    <div
      className={cx(
        styles.grid,
        gridStyles.contentColumns,
        gridStyles.contentColumnsBigScreens
      )}
    >
      <PageContentHeader title={title} />

      <Flex flexDirection="column" className={styles.content}>
        <article className={styles.article}>
          {source.richTextBody && (
            <RichText
              document={source.richTextBody}
              links={source.richTextLinks}
            />
          )}
        </article>
      </Flex>

      {headings.length > 1 && (
        <nav className={styles.tableOfContent} aria-label="On this page">
          <TableOfContent headings={headings} />
        </nav>
      )}
    </div>
  );
}
