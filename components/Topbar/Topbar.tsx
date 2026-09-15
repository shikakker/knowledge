import React from "react";
import { css, cx } from "emotion";
import { Grid, Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";

import {
  getGridStyles,
  SCREEN_BREAKPOINT_DESKTOP,
  SCREEN_BREAKPOINT_LARGE,
  TOPBAR_HEIGHT,
} from "../../utils/getGridStyles";
import { TopbarLogo } from "./TopbarLogo";
import { SearchBox } from "../SearchBox/SearchBox";

const styles = {
  header: css({
    display: "grid",
    minHeight: TOPBAR_HEIGHT,
    padding: `${tokens.spacingS} 0`,
    backgroundColor: tokens.colorWhite,
    color: tokens.blue700,
    borderBottom: `1px solid ${tokens.gray300}`,
    rowGap: tokens.spacingS,
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      height: TOPBAR_HEIGHT,
      minHeight: TOPBAR_HEIGHT,
      padding: 0,
      rowGap: 0,
    },
  }),
  logo: css({
    minWidth: 0,
    paddingLeft: tokens.spacingM,
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      paddingLeft: tokens.spacingXl,
    },
  }),
  searchBox: css({
    gridColumn: 1,
    minWidth: 0,
    width: "100%",
    "> div": {
      width: "100%",
    },
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
      gridColumnStart: 2,
    },
  }),
};

export function Topbar() {
  const gridStyles = getGridStyles();

  return (
    <Grid.Item
      as="header"
      area="topbar"
      className={cx(styles.header, gridStyles.wrapperColumns)}
    >
      <Flex alignItems="center" className={styles.logo}>
        <TopbarLogo />
      </Flex>

      <Flex
        justifyContent="space-between"
        alignItems="center"
        className={cx(
          gridStyles.contentColumns,
          gridStyles.contentColumnsBigScreens
        )}
      >
        <Flex className={styles.searchBox}>
          <SearchBox />
        </Flex>
      </Flex>
    </Grid.Item>
  );
}
