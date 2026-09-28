import React from "react";
import { css, cx } from "emotion";
import { Grid } from "@contentful/f36-components";

import { getGridStyles } from "../utils/getGridStyles";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import type { SidebarProps } from "./Sidebar";

const styles = {
  mainItem: css({
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    minWidth: 0,
    height: "100%",
    overflow: "auto",
  }),
};

interface Props {
  children: React.ReactNode;
  sidebarLinks: SidebarProps["links"];
}

export function Layout({ children, sidebarLinks }: Props) {
  const gridStyles = getGridStyles();

  return (
    <Grid
      className={cx(gridStyles.wrapper, gridStyles.wrapperColumns)}
      columnGap="none"
    >
      <Topbar />
      <Sidebar links={sidebarLinks} />

      <Grid.Item
        key="/"
        area="content"
        as="main"
        className={styles.mainItem}
      >
        {children}
        <Footer />
      </Grid.Item>
    </Grid>
  );
}
