import { NODE_CENTER_X, NODE_CENTER_Y } from "./roadmap-map.utils";

export const ROADMAP_ROAD = {
  strokeWidth: 26,
  baseColor: "#E2E2E2",
  progressColor: "#B8CBFF",
  dashColor: "#FFFFFF",
  dashStrokeWidth: 2,
  progressTransition: "stroke-dashoffset 2s ease",
  minDashArray: 1,
} as const;

const ROAD_DASH_SEGMENT = ROADMAP_ROAD.strokeWidth / 2;
export const ROADMAP_DASH_PATTERN = `${ROAD_DASH_SEGMENT} ${ROAD_DASH_SEGMENT}`;

export const ROADMAP_PERIOD = {
  activeOuter: "#CCDCFF",
  inactiveOuter: "#E5E5E5",
  activeStroke: "#1D4ED8",
  inactiveStroke: "#C7CDD6",
  activeIcon: "#007AFF",
  inactiveIcon: "#C4CDD5",
  innerBg: "#FFFFFF",
  activeLabelBg: "#DCE6FF",
  inactiveLabelBg: "#EEF0F3",
  activeLabelColor: "#1D4ED8",
  inactiveLabelColor: "#8A94A6",
  progressTrackActive: "#90C5FF",
  progressTrackInactive: "#C4CDD5",
  numberActive: "#1D4ED8",
  numberInactive: "#8A94A6",
} as const;

export const ROADMAP_TEXT = {
  numberFontSize: 20,
  numberOffsetY: 7,
  titleFontSize: 12,
  contentFontSize: 11,
  titleMaxChars: 16,
  contentMaxChars: 18,
  contentMaxLines: 2,
  titlePillHeight: 18,
  titlePillPadding: 16,
  titlePillRadius: 9,
  titlePillMaxWidth: 160,
  finishFontSize: 12,
} as const;

export const ROADMAP_NODE = {
  titleOffsetY: 49,
  contentOffsetY: 75,
  outerRadius: 36,
  ringRadius: 26,
  innerRadius: 20,
  ringWidth: 1,
  progressRingRadius: 30,
  progressRingWidth: 4,
  iconCenterX: 155,
  iconCenterY: 27,
} as const;

export const ROADMAP_NODE_POSITION = {
  titleY: NODE_CENTER_Y + ROADMAP_NODE.titleOffsetY,
  contentY: NODE_CENTER_Y + ROADMAP_NODE.contentOffsetY,
  iconOffsetX: NODE_CENTER_X - ROADMAP_NODE.iconCenterX,
  iconOffsetY: NODE_CENTER_Y - ROADMAP_NODE.iconCenterY,
} as const;

export const ROADMAP_PROGRESS_RING_CIRCUMFERENCE =
  2 * Math.PI * ROADMAP_NODE.progressRingRadius;

export const ROADMAP_TOOLTIP = {
  width: 52,
  height: 26,
  radius: 8,
  offsetY: 20,
  pointerWidth: 10,
  pointerHeight: 6,
  background: "#E0EAFF",
  textColor: "#2563EB",
  shadow: "0 6px 12px rgba(37, 99, 235, 0.18)",
  fontSize: 11,
  fontWeight: 600,
  textOffsetY: 4,
  transition: "opacity 0.2s ease, transform 0.2s ease",
  zIndex: 9999,
  hoverTranslate: -4,
} as const;

export const ROADMAP_TOOLTIP_CSS = `
  .lp-roadmap-node .lp-roadmap-tooltip {
    opacity: 0;
    transform: translateY(0);
    transition: ${ROADMAP_TOOLTIP.transition};
    filter: drop-shadow(${ROADMAP_TOOLTIP.shadow});
  }
  .lp-roadmap-node:hover .lp-roadmap-tooltip {
    opacity: 1;
    transform: translateY(${ROADMAP_TOOLTIP.hoverTranslate}px);
  }
`;

export const ROADMAP_FINISH = {
  active: "#FFAB00",
  activeIcon: "#FFC107",
  inactive: "#D9D9D9",
  shapeCenterX: 260,
  shapeCenterY: 689,
  textCenterX: 260,
  textCenterY: 742,
  starPath:
    "M0 -10L2.9 -3.1L9.5 -3.1L4.2 1.2L6.5 8L0 4.2L-6.5 8L-4.2 1.2L-9.5 -3.1L-2.9 -3.1Z",
} as const;

export const ROADMAP_DEFAULTS = {
  showCompletedNumber: false,
} as const;

export const ROADMAP_TEXT_DEFAULTS = {
  contentActiveColor: "#111827",
  contentDisableColor: "#94A3B8",
  finishTextActiveColor: "#FFAB00",
  finishTextDisableColor: "#111827",
} as const;

export const ROADMAP_TEXT_WEIGHT = {
  titleActive: 600,
  titleInactive: 500,
  contentActive: 500,
  contentInactive: 400,
  finishActive: 600,
  finishInactive: 500,
} as const;
