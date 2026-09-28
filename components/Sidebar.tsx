import React from "react";
import { css } from "emotion";
import tokens from "@contentful/f36-tokens";
import { Grid } from "@contentful/f36-components";

import { SidebarSection } from "./SidebarSection";
import { useRouter } from "next/router";
import { SCREEN_BREAKPOINT_DESKTOP } from "../utils/getGridStyles";

const styles = {
  nav: css({
    minWidth: 0,
    padding: `${tokens.spacingS} ${tokens.spacingM}`,
    overflowY: "auto",
    color: tokens.gray700,
    backgroundColor: tokens.colorWhite,
    borderBottom: `1px solid ${tokens.gray300}`,
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      padding: `${tokens.spacingM} 0`,
      borderBottom: 0,
      borderRight: `1px solid ${tokens.gray300}`,
    },
  }),
};

export interface SidebarProps {
  links: any[];
}

export function Sidebar({ links }: SidebarProps) {
  const { asPath: currentPage } = useRouter();

  return (
    <Grid.Item
      as="nav"
      area="sidebar"
      aria-label="Main Navigation"
      className={styles.nav}
    >
      {links.map((link) => (
        <SidebarSection
          currentPage={currentPage}
          links={link.links}
          key={link.slug}
          title={link.title}
        />
      ))}
    </Grid.Item>
  );
}
