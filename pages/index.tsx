import React from "react";
import type { GetServerSideProps } from "next";
import { css } from "emotion";
import Image from "next/image";
import tokens from "@contentful/f36-tokens";
import {
  DisplayText,
  Heading,
  Paragraph,
  Flex,
  TextLink,
  Button,
} from "@contentful/f36-components";
import { ArrowForwardTrimmedIcon } from "@contentful/f36-icons";

import formaSVG from "../public/images/forma-icon.svg";
import nextJsSVG from "../public/images/nextjs-icon.svg";
import homepageImg from "../public/images/homepage-illustration.svg";
import {
  SCREEN_BREAKPOINT_DESKTOP,
  SCREEN_BREAKPOINT_LARGE,
} from "../utils/getGridStyles";
import { getAllCategories, getSiteSettings } from "../lib/api";
import { Layout } from "../components/Layout";
import type { SidebarProps } from "../components/Sidebar";
import type { SiteSettings } from "../types";

const styles = {
  grid: css({
    flex: 1,
    minWidth: 0,
    padding: `${tokens.spacing2Xl} ${tokens.spacingM} 0`,
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      padding: `${tokens.spacing3Xl} ${tokens.spacingL} 0`,
    },
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
      display: "grid",
      gridTemplateColumns: "1fr minmax(0, 960px) 1fr",
      gridTemplateRows: "min-content",
    },
    "> *": {
      [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
        gridColumnStart: 2,
      },
    },
  }),
  hero: css({
    flexDirection: "column",
    minWidth: 0,
    width: "100%",
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      flexDirection: "row",
    },
  }),
  sections: css({
    flexWrap: "wrap",
    "> *": {
      maxWidth: "220px",
      minWidth: "180px",
    },
  }),
  imgContainer: css({
    flexGrow: 1,
    width: "100%",
    maxWidth: "680px",
    minWidth: 0,
    "> span": { flexGrow: 1, maxWidth: "100%" },
  }),
};

interface HomePageProps {
  sidebarLinks: SidebarProps["links"];
  siteSettings?: SiteSettings;
  contentUnavailable: boolean;
}

export default function Home({
  sidebarLinks,
  contentUnavailable,
}: HomePageProps) {
  if (contentUnavailable) {
    return (
      <Layout sidebarLinks={[]}>
        <article className={styles.grid}>
          <Flex flexDirection="column" alignItems="flex-start" gap="spacingM">
            <DisplayText as="h1" size="large">
              Knowledge base unavailable
            </DisplayText>
            <Paragraph>
              The content service is temporarily unavailable. Reload this page
              to try again.
            </Paragraph>
            <Button as="a" href="/" variant="primary">
              Try again
            </Button>
          </Flex>
        </article>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks}>
      <article className={styles.grid}>
        <Flex
          className={styles.hero}
          justifyContent="space-between"
          alignItems="flex-start"
          gap="spacing2Xl"
        >
          <Flex flexDirection="column">
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              marginBottom="spacing3Xl"
            >
              <DisplayText as="h1" size="large">
                Knowledge base.
                <br />
                Contentful + Next.js
              </DisplayText>

              <Button
                as="a"
                href="/getting-started/overview"
                variant="primary"
                size="large"
                endIcon={<ArrowForwardTrimmedIcon />}
              >
                Get started
              </Button>
            </Flex>

            <Flex className={styles.sections} gap="spacing2Xl">
              <Flex flexDirection="column" alignItems="flex-start">
                <Image src={formaSVG} alt="Forma36 logo" />

                <Heading marginTop="spacingM">Forma36</Heading>
                <Paragraph>A design system by Contentful</Paragraph>
                <TextLink href="https://f36.contentful.com/" target="_blank">
                  View the documentation
                </TextLink>
              </Flex>

              <Flex flexDirection="column" alignItems="flex-start">
                <Image src={nextJsSVG} alt="Next.js logo" />

                <Heading marginTop="spacingM">Next.js</Heading>
                <Paragraph>The React Framework</Paragraph>
                <TextLink href="https://nextjs.org/" target="_blank">
                  View the documentation
                </TextLink>
              </Flex>
            </Flex>
          </Flex>

          <Flex className={styles.imgContainer}>
            <Image
              src={homepageImg}
              alt="Knowledge-base interface illustration"
              layout="responsive"
            />
          </Flex>
        </Flex>
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async ({
  res,
}) => {
  try {
    const [sidebarLinks, siteSettings] = await Promise.all([
      getAllCategories(),
      getSiteSettings(),
    ]);

    return {
      props: {
        sidebarLinks,
        siteSettings,
        contentUnavailable: false,
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
