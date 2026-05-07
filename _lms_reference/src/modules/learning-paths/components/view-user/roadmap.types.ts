import type { CSSProperties, ReactNode } from "react";

import type { PhaseStatus } from "../../learning-path-user.constants";

export type RoadMapItemStatus = PhaseStatus;

export interface RoadMapItem {
  title: string;
  content: string;
  isFinished?: boolean;
  orderIndex?: number;
  status?: RoadMapItemStatus;
  progressPercentage?: number;
}

export interface RoadMapProps {
  data: RoadMapItem[];
  currentStepIndex: number;
  onPressPeriod: (index: number) => void;
  onPressPeriodLocked: (index: number) => void;
  hideFinished?: boolean;
  renderItem?: (index: number) => ReactNode;
  renderFinished?: (index: number) => ReactNode;
  titleStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  titleActiveColor?: string;
  titleDisableColor?: string;
  titleActiveWeight?: CSSProperties["fontWeight"];
  titleDisableWeight?: CSSProperties["fontWeight"];
  titlePosition?: {
    x: number;
    y: number;
  };
  titleTextFontSize?: number;
  contentActiveColor?: string;
  contentDisableColor?: string;
  contentActiveWeight?: CSSProperties["fontWeight"];
  contentDisableWeight?: CSSProperties["fontWeight"];
  contentPosition?: {
    x: number;
    y: number;
  };
  contentTextFontSize?: number;
  finishTextActiveColor?: string;
  finishTextDisableColor?: string;
  finishTextActiveWeight?: CSSProperties["fontWeight"];
  finishTextDisableWeight?: CSSProperties["fontWeight"];
  finishTextPosition?: {
    x: number;
    y: number;
  };
  finishTextFontSize?: number;
  width?: number;
}

export interface TextStyleConfig {
  position?: {
    x: number;
    y: number;
  };
  fontSize: number;
  activeColor: string;
  inactiveColor: string;
  activeWeight: CSSProperties["fontWeight"];
  inactiveWeight: CSSProperties["fontWeight"];
  style?: CSSProperties;
  maxCharsPerLine?: number;
  maxLines?: number;
}

export interface FinishTextConfig {
  position?: {
    x: number;
    y: number;
  };
  fontSize: number;
  activeColor: string;
  inactiveColor: string;
  activeWeight: CSSProperties["fontWeight"];
  inactiveWeight: CSSProperties["fontWeight"];
}
