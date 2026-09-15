import { css } from "emotion";
import tokens from "@contentful/f36-tokens";

export const TOPBAR_HEIGHT = "70px";
export const SCREEN_BREAKPOINT_DESKTOP = "900px";
export const SCREEN_BREAKPOINT_LARGE = "1600px";

export const getGridStyles = () => ({
  wrapper: css({
    height: "100vh",
    overflow: "hidden",
    gridTemplateAreas: `
      "topbar"
      "sidebar"
      "content"
    `,
    gridTemplateRows: "auto minmax(0, 180px) minmax(0, 1fr)",
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      gridTemplateAreas: `
        "topbar topbar"
        "sidebar content"
      `,
      gridTemplateRows: `${TOPBAR_HEIGHT} minmax(0, 1fr)`,
    },
  }),
  wrapperColumns: css({
    gridTemplateColumns: "minmax(0, 1fr)",
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      gridTemplateColumns: "280px minmax(0, 1fr)",
    },
  }),
  contentColumns: css({
    display: "grid",
    minWidth: 0,
    padding: `0 ${tokens.spacingM}`,
    gridTemplateColumns: "minmax(0, 1fr)",
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_DESKTOP})`]: {
      padding: `0 ${tokens.spacingL}`,
      gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1fr)",
    },
  }),
  contentColumnsBigScreens: css({
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
      gridTemplateColumns: "1fr 720px 240px 1fr",
    },
  }),
  columnStartTwo: css({
    [`@media screen and (min-width: ${SCREEN_BREAKPOINT_LARGE})`]: {
      gridColumnStart: 2,
    },
  }),
});
