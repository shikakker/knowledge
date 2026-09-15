import React from "react";
import type { NextPage, GetServerSideProps } from "next";
import type { ParsedUrlQuery } from "querystring";
import Head from "next/head";
import { Button, DisplayText, Flex, Paragraph } from "@contentful/f36-components";

import { getToCFromContentful } from "../utils/tableOfContents";
import { FrontMatterContextProvider } from "../utils/frontMatterContext";
import type { PageContentProps } from "../components/PageContent";
import { PageContent } from "../components/PageContent";
import {
  getAllCategories,
  getSingleArticleBySlug,
  getSiteSettings,
} from "../lib/api";
import type { SidebarProps } from "../components/Sidebar";
import { Layout } from "../components/Layout";
import type { SiteSettings } from "../types";

interface ComponentPageProps extends Partial<PageContentProps> {
  sidebarLinks: SidebarProps["links"];
  siteSettings?: SiteSettings;
  contentUnavailable: boolean;
}

const ComponentPage: NextPage<ComponentPageProps> = ({
  contentUnavailable,
  frontMatter,
  headings,
  sidebarLinks,
  source,
}: ComponentPageProps) => {
  if (contentUnavailable || !frontMatter || !headings || !source) {
    return (
      <Layout sidebarLinks={[]}>
        <Head>
          <title>Knowledge base unavailable</title>
        </Head>
        <Flex
          as="article"
          flexDirection="column"
          alignItems="flex-start"
          gap="spacingM"
          padding="spacing2Xl"
        >
          <DisplayText as="h1" size="large">
            Article unavailable
          </DisplayText>
          <Paragraph>
            The content service is temporarily unavailable. Try this page again
            in a moment.
          </Paragraph>
          <Button as="a" href="/" variant="primary">
            Return home
          </Button>
        </Flex>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{frontMatter.title}</title>
      </Head>

      <FrontMatterContextProvider value={frontMatter}>
        <Layout sidebarLinks={sidebarLinks}>
          <PageContent
            frontMatter={frontMatter}
            headings={headings}
            source={source}
          />
        </Layout>
      </FrontMatterContextProvider>
    </>
  );
};

interface Params extends ParsedUrlQuery {
  slug: string[];
}

export const getServerSideProps: GetServerSideProps<
  ComponentPageProps,
  Params
> = async ({ params, res }) => {
  const slugParts = params?.slug;
  const entrySlug = Array.isArray(slugParts)
    ? slugParts[slugParts.length - 1]
    : undefined;

  if (!entrySlug) {
    return { notFound: true };
  }

  try {
    const [sidebarLinks, siteSettings, contentfulResult] = await Promise.all([
      getAllCategories(),
      getSiteSettings(),
      getSingleArticleBySlug(entrySlug),
    ]);

    if (!contentfulResult?.body?.json) {
      return { notFound: true };
    }

    return {
      props: {
        contentUnavailable: false,
        headings: getToCFromContentful(contentfulResult.body.json.content),
        frontMatter: {
          title: contentfulResult.title,
        },
        sidebarLinks,
        siteSettings,
        source: {
          richTextBody: contentfulResult.body.json,
          richTextLinks: contentfulResult.body.links,
        },
      },
    };
  } catch {
    res.statusCode = 503;
    return {
      props: {
        sidebarLinks: [],
        contentUnavailable: true,
      },
    };
  }
};

export default ComponentPage;
