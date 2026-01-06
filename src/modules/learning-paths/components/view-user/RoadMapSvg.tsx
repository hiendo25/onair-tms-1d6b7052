"use client";

import * as React from "react";

import { useGenerateMap } from "./hooks/useGenerateMap";
import { MultilineSvgText } from "./MultilineSvgText";
import { getPeriodLayoutByIndex, NODE_CENTER_X, NODE_CENTER_Y, ROAD_WIDTH } from "./roadmap-map.utils";

const ROAD_STROKE_WIDTH = 26;
const ROAD_DASH_SEGMENT = ROAD_STROKE_WIDTH / 2;
const ROAD_DASH_PATTERN = `${ROAD_DASH_SEGMENT} ${ROAD_DASH_SEGMENT}`;
const ROAD_BASE_COLOR = "#E2E2E2";
const ROAD_PROGRESS_COLOR = "#B8CBFF";
const ROAD_DASH_COLOR = "#FFFFFF";
const ROAD_PROGRESS_TRANSITION = "stroke-dashoffset 2s ease";

const PERIOD_ACTIVE_OUTER = "#CCDCFF";
const PERIOD_INACTIVE_OUTER = "#E5E5E5";
const PERIOD_ACTIVE_STROKE = "#1D4ED8";
const PERIOD_ACTIVE_ICON = "#007AFF";
const PERIOD_INACTIVE_ICON = "#C4CDD5";
const PERIOD_INNER_BG = "#FFFFFF";
const PERIOD_INACTIVE_STROKE = "#C7CDD6";
const PERIOD_ACTIVE_LABEL_BG = "#DCE6FF";
const PERIOD_ACTIVE_LABEL_COLOR = "#1D4ED8";
const PERIOD_INACTIVE_LABEL_BG = "#EEF0F3";
const PERIOD_INACTIVE_LABEL_COLOR = "#8A94A6";
const PERIOD_PROGRESS_TRACK_COLOR = "#90C5FF";
const PERIOD_PROGRESS_INACTIVE_TRACK_COLOR = "#C4CDD5"
const PERIOD_NUMBER_ACTIVE = "#1D4ED8";
const PERIOD_NUMBER_INACTIVE = "#8A94A6";
const PERIOD_NUMBER_FONT_SIZE = 20;
const PERIOD_TITLE_FONT_SIZE = 12;
const PERIOD_CONTENT_FONT_SIZE = 11;
const PERIOD_TITLE_MAX_CHARS = 16;
const PERIOD_CONTENT_MAX_CHARS = 18;
const PERIOD_CONTENT_MAX_LINES = 2;
const PERIOD_TITLE_PILL_HEIGHT = 18;
const PERIOD_TITLE_PILL_PADDING = 16;
const PERIOD_TITLE_PILL_RADIUS = 9;
const NODE_TITLE_OFFSET_Y = 49;
const NODE_CONTENT_OFFSET_Y = 75;
const NODE_OUTER_RADIUS = 36;
const NODE_RING_RADIUS = 26;
const NODE_INNER_RADIUS = 20;
const NODE_RING_WIDTH = 1;
const NODE_PROGRESS_RING_RADIUS = 30;
const NODE_PROGRESS_RING_WIDTH = 4;
const NODE_ICON_CENTER_X = 155;
const NODE_ICON_CENTER_Y = 27;
const NODE_ICON_OFFSET_X = NODE_CENTER_X - NODE_ICON_CENTER_X;
const NODE_ICON_OFFSET_Y = NODE_CENTER_Y - NODE_ICON_CENTER_Y;
const SHOW_COMPLETED_NUMBER = false;
const DEFAULT_TITLE_Y = NODE_CENTER_Y + NODE_TITLE_OFFSET_Y;
const DEFAULT_CONTENT_Y = NODE_CENTER_Y + NODE_CONTENT_OFFSET_Y;
const TOOLTIP_WIDTH = 52;
const TOOLTIP_HEIGHT = 26;
const TOOLTIP_RADIUS = 8;
const TOOLTIP_OFFSET_Y = 20;
const TOOLTIP_POINTER_WIDTH = 10;
const TOOLTIP_POINTER_HEIGHT = 6;
const TOOLTIP_BG = "#E0EAFF";
const TOOLTIP_TEXT_COLOR = "#2563EB";
const TOOLTIP_SHADOW = "0 6px 12px rgba(37, 99, 235, 0.18)";
const TOOLTIP_FONT_SIZE = 11;
const TOOLTIP_FONT_WEIGHT = 600;
const TOOLTIP_TRANSITION = "opacity 0.2s ease, transform 0.2s ease";
const TOOLTIP_Z_INDEX = 9999;
const TOOLTIP_HOVER_TRANSLATE = -4;

const FINISH_ACTIVE = "#FFAB00";
const FINISH_ACTIVE_ICON = "#FFC107";
const FINISH_INACTIVE = "#D9D9D9";
const FINISH_SHAPE_CENTER_X = 260;
const FINISH_SHAPE_CENTER_Y = 689;
const STAR_PATH =
  "M0 -10L2.9 -3.1L9.5 -3.1L4.2 1.2L6.5 8L0 4.2L-6.5 8L-4.2 1.2L-9.5 -3.1L-2.9 -3.1Z";
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * NODE_PROGRESS_RING_RADIUS;

type RoadMapItemStatus = "completed" | "active" | "locked";

interface RoadMapItemProps {
  title: string;
  content: string;
  isFinished?: boolean;
  orderIndex?: number;
  status?: RoadMapItemStatus;
  progressPercentage?: number;
}

interface RoadMapProps {
  data: RoadMapItemProps[];
  currentStepIndex: number;
  onPressPeriod: (index: number) => void;
  onPressPeriodLocked: (index: number) => void;
  hideFinished?: boolean;
  renderItem?: (index: number) => React.ReactNode;
  renderFinished?: (index: number) => React.ReactNode;
  titleStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  titleActiveColor?: string;
  titleDisableColor?: string;
  titleActiveWeight?: React.CSSProperties["fontWeight"];
  titleDisableWeight?: React.CSSProperties["fontWeight"];
  titlePosition?: {
    x: number;
    y: number;
  };
  titleTextFontSize?: number;
  contentActiveColor?: string;
  contentDisableColor?: string;
  contentActiveWeight?: React.CSSProperties["fontWeight"];
  contentDisableWeight?: React.CSSProperties["fontWeight"];
  contentPosition?: {
    x: number;
    y: number;
  };
  contentTextFontSize?: number;
  finishTextActiveColor?: string;
  finishTextDisableColor?: string;
  finishTextActiveWeight?: React.CSSProperties["fontWeight"];
  finishTextDisableWeight?: React.CSSProperties["fontWeight"];
  finishTextPosition?: {
    x: number;
    y: number;
  };
  finishTextFontSize?: number;
  width?: number;
}

interface TextStyleConfig {
  position?: {
    x: number;
    y: number;
  };
  fontSize: number;
  activeColor: string;
  inactiveColor: string;
  activeWeight: React.CSSProperties["fontWeight"];
  inactiveWeight: React.CSSProperties["fontWeight"];
  style?: React.CSSProperties;
  maxCharsPerLine?: number;
  maxLines?: number;
}

interface FinishTextConfig {
  position?: {
    x: number;
    y: number;
  };
  fontSize: number;
  activeColor: string;
  inactiveColor: string;
  activeWeight: React.CSSProperties["fontWeight"];
  inactiveWeight: React.CSSProperties["fontWeight"];
}

interface PeriodShapeProps {
  status: RoadMapItemStatus;
  orderIndex: number;
  progressPercentage: number;
  isLast: boolean;
}

interface FinishedProps {
  title: string;
  hasFinished: boolean;
  textConfig: FinishTextConfig;
}

interface PeriodItemProps {
  index: number;
  x: number;
  y: number;
  onClick: () => void;
  title: string;
  content: string;
  isFinished?: boolean;
  itemOrderIndex?: number;
  itemStatus?: RoadMapItemStatus;
  itemProgress?: number;
  currentStepIndex: number;
  dataLength: number;
  renderItem?: (index: number) => React.ReactNode;
  renderFinished?: (index: number) => React.ReactNode;
  titleConfig: TextStyleConfig;
  contentConfig: TextStyleConfig;
  finishTextConfig: FinishTextConfig;
}

const getPillWidth = (label: string, fontSize: number, padding: number) => {
  if (!label) return padding * 2;
  const estimatedWidth = label.length * (fontSize * 0.55);
  return Math.max(padding * 2, Math.min(160, estimatedWidth + padding * 2));
};

const getProgressRingOffset = (percentage: number, circumference: number): number => {
  const clamped = Math.max(0, Math.min(100, percentage));
  return circumference - (circumference * clamped) / 100;
};

const getCursorStyle = (isEnabled: boolean): React.CSSProperties => ({
  cursor: isEnabled ? "pointer" : "not-allowed",
});

const PeriodShape = ({ status, orderIndex, progressPercentage, isLast }: PeriodShapeProps) => {
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const showNumber = !isLast && (status !== "active" || (isCompleted && SHOW_COMPLETED_NUMBER));
  const ringColor = status === "locked" ? PERIOD_INACTIVE_STROKE : PERIOD_ACTIVE_STROKE;
  const outerColor = status === "locked" ? PERIOD_INACTIVE_OUTER : PERIOD_ACTIVE_OUTER;
  const numberColor = status === "locked" ? PERIOD_NUMBER_INACTIVE : PERIOD_NUMBER_ACTIVE;
  const ringProgressColor = status === "locked" ? PERIOD_INACTIVE_ICON : PERIOD_ACTIVE_ICON;
  const progressColor = status === "locked" ? PERIOD_PROGRESS_INACTIVE_TRACK_COLOR : PERIOD_PROGRESS_TRACK_COLOR;
  const progressOffset = getProgressRingOffset(progressPercentage, PROGRESS_RING_CIRCUMFERENCE);
  const displayOrder = String(orderIndex).padStart(2, "0");
  const iconColor = isActive || isCompleted ? PERIOD_ACTIVE_ICON : PERIOD_INACTIVE_ICON;

  return (
    <g>
      <circle cx={NODE_CENTER_X} cy={NODE_CENTER_Y} r={NODE_OUTER_RADIUS} fill={outerColor} />
      <circle
        cx={NODE_CENTER_X}
        cy={NODE_CENTER_Y}
        r={NODE_PROGRESS_RING_RADIUS}
        fill="none"
        stroke={progressColor}
        strokeWidth={NODE_PROGRESS_RING_WIDTH}
      />
      <circle
        cx={NODE_CENTER_X}
        cy={NODE_CENTER_Y}
        r={NODE_PROGRESS_RING_RADIUS}
        fill="none"
        stroke={ringProgressColor}
        strokeWidth={NODE_PROGRESS_RING_WIDTH}
        strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${NODE_CENTER_X} ${NODE_CENTER_Y})`}
      />
      <circle
        cx={NODE_CENTER_X}
        cy={NODE_CENTER_Y}
        r={NODE_RING_RADIUS}
        fill={PERIOD_INNER_BG}
      />
      <circle cx={NODE_CENTER_X} cy={NODE_CENTER_Y} r={NODE_INNER_RADIUS} fill={PERIOD_INNER_BG} />
      {showNumber ? (
        <text
          x={NODE_CENTER_X}
          y={NODE_CENTER_Y + 7}
          textAnchor="middle"
          fontSize={PERIOD_NUMBER_FONT_SIZE}
          fontWeight={700}
          fill={numberColor}
        >
          {displayOrder}
        </text>
      ) : (
        <>
          {isLast ? (
            <path
              d={STAR_PATH}
              fill={iconColor}
              transform={`translate(${NODE_CENTER_X} ${NODE_CENTER_Y})`}
            />
          ) : (
            <g transform={`translate(${NODE_ICON_OFFSET_X}, ${NODE_ICON_OFFSET_Y})`}>
              <path
                d="M149.021 19.5918C148.817 19.5918 148.627 19.6705 148.484 19.8135C148.339 19.9581 148.259 20.1506 148.259 20.3555V31.807C148.259 32.2269 148.602 32.5694 149.024 32.5705C150.801 32.5747 153.78 32.9452 155.834 35.0952V23.1109C155.834 22.9686 155.798 22.8348 155.729 22.7242C154.043 20.0086 150.802 19.596 149.021 19.5918Z"
                fill={iconColor}
              />
              <path
                d="M164.595 31.8071V20.3555C164.595 20.1506 164.515 19.9581 164.37 19.8135C164.227 19.6705 164.037 19.5918 163.835 19.5918C162.051 19.596 158.811 20.0086 157.125 22.7243C157.056 22.8349 157.02 22.9686 157.02 23.111V35.0952C159.074 32.9452 162.052 32.5747 163.83 32.5705C164.252 32.5694 164.595 32.2269 164.595 31.8071Z"
                fill={iconColor}
              />
            </g>
          )}
        </>
      )}
    </g>
  );
};

const Finished = ({ title, hasFinished, textConfig }: FinishedProps) => (
  <g>
    <path
      d="M305.804 685.086C307.168 687.517 307.168 690.483 305.804 692.914L287.292 725.914C285.876 728.438 283.208 730 280.315 730L243.685 730C240.791 730 238.124 728.438 236.708 725.914L218.196 692.914C216.832 690.483 216.832 687.517 218.196 685.086L236.708 652.086C238.124 649.562 240.792 648 243.685 648L280.315 648C283.209 648 285.876 649.562 287.292 652.086L305.804 685.086Z"
      fill={hasFinished ? FINISH_ACTIVE : FINISH_INACTIVE}
    />
    <path
      d="M296.589 687.755C297.384 689.234 297.384 691.013 296.589 692.491L281.257 720.998C280.385 722.619 278.694 723.63 276.853 723.63L247.147 723.63C245.307 723.63 243.615 722.619 242.743 720.998L227.412 692.491C226.617 691.013 226.617 689.234 227.412 687.755L242.743 659.248C243.615 657.628 245.307 656.616 247.147 656.616L276.853 656.616C278.694 656.617 280.385 657.628 281.257 659.248L296.589 687.755Z"
      fill={FINISH_INACTIVE}
      stroke={hasFinished ? FINISH_ACTIVE : FINISH_INACTIVE}
      strokeWidth={6}
    />
    <path
      d="M297.687 683.521C298.835 685.523 298.835 687.983 297.687 689.985L282.637 716.246C281.479 718.267 279.327 719.514 276.998 719.514L247.002 719.514C244.672 719.514 242.52 718.267 241.362 716.246L226.313 689.985C225.166 687.983 225.166 685.523 226.313 683.521L241.362 657.261C242.52 655.24 244.672 653.993 247.002 653.993L276.998 653.993C279.327 653.993 281.479 655.24 282.637 657.261L297.687 683.521Z"
      fill={PERIOD_INNER_BG}
      stroke={hasFinished ? FINISH_ACTIVE : FINISH_INACTIVE}
      strokeWidth={3}
    />
    <path
      d="M281.615 681.06C281.365 680.287 280.681 679.738 279.871 679.665L268.87 678.665L264.52 668.471C264.199 667.724 263.469 667.241 262.657 667.241C261.846 667.241 261.115 667.724 260.794 668.473L256.444 678.665L245.442 679.665C244.633 679.74 243.951 680.287 243.7 681.06C243.449 681.833 243.681 682.68 244.292 683.214L252.607 690.516L250.155 701.329C249.976 702.125 250.284 702.946 250.943 703.423C251.297 703.68 251.712 703.81 252.13 703.81C252.49 703.81 252.847 703.713 253.168 703.521L262.657 697.842L272.143 703.521C272.837 703.939 273.712 703.901 274.37 703.423C275.029 702.945 275.337 702.123 275.157 701.329L272.705 690.516L281.021 683.216C281.632 682.68 281.866 681.834 281.615 681.06Z"
      fill={hasFinished ? FINISH_ACTIVE_ICON : FINISH_INACTIVE}
    />
    <MultilineSvgText
      x={textConfig.position?.x ?? 260}
      y={textConfig.position?.y ?? 742}
      fill={hasFinished ? textConfig.activeColor : textConfig.inactiveColor}
      fontSize={textConfig.fontSize}
      fontWeight={hasFinished ? textConfig.activeWeight : textConfig.inactiveWeight}
      textAnchor="middle"
      alignmentBaseline="middle"
    >
      {title}
    </MultilineSvgText>
  </g>
);

const PeriodItem = ({
  index,
  x,
  y,
  onClick,
  title,
  content,
  isFinished,
  itemOrderIndex,
  itemStatus,
  itemProgress,
  currentStepIndex,
  dataLength,
  renderItem,
  renderFinished,
  titleConfig,
  contentConfig,
  finishTextConfig,
}: PeriodItemProps) => {
  const isEnabled = itemStatus ? itemStatus !== "locked" : currentStepIndex >= index;
  const isFinishedEnabled = currentStepIndex >= dataLength - 1;
  const finishTranslateX = NODE_CENTER_X + x - FINISH_SHAPE_CENTER_X;
  const finishTranslateY = NODE_CENTER_Y + y - FINISH_SHAPE_CENTER_Y;
  const isClickable = isFinished ? isFinishedEnabled : isEnabled;
  const cursorStyle = getCursorStyle(isClickable);

  if (isFinished) {
    if (renderFinished) {
      return (
        <g transform={`translate(${finishTranslateX}, ${finishTranslateY})`} onClick={onClick} style={cursorStyle}>
          {renderFinished(index)}
        </g>
      );
    }
    return (
      <g transform={`translate(${finishTranslateX}, ${finishTranslateY})`} onClick={onClick} style={cursorStyle}>
        <Finished title={title} hasFinished={isFinishedEnabled} textConfig={finishTextConfig} />
      </g>
    );
  }

  if (renderItem) {
    return (
      <g transform={`translate(${x}, ${y})`} onClick={onClick} style={cursorStyle}>
        {renderItem(index)}
      </g>
    );
  }

  const orderIndex = itemOrderIndex ?? index + 1;
  const status = itemStatus ?? (isEnabled ? "active" : "locked");
  const isLocked = status === "locked";
  const titleX = titleConfig.position?.x ?? NODE_CENTER_X;
  const titleY = titleConfig.position?.y ?? DEFAULT_TITLE_Y;
  const contentX = contentConfig.position?.x ?? NODE_CENTER_X;
  const contentY = contentConfig.position?.y ?? DEFAULT_CONTENT_Y;
  const progressValue = itemProgress ?? 0;
  const progressText = `${progressValue}%`;
  const titlePillWidth = getPillWidth(title, titleConfig.fontSize, PERIOD_TITLE_PILL_PADDING);
  const tooltipX = NODE_CENTER_X - TOOLTIP_WIDTH / 2;
  const tooltipY = TOOLTIP_OFFSET_Y;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={cursorStyle}
      className="lp-roadmap-node"
    >
      <PeriodShape
        status={status}
        orderIndex={orderIndex}
        progressPercentage={progressValue}
        isLast={index === dataLength - 1}
      />
      <g className="lp-roadmap-tooltip" style={{ pointerEvents: "none", zIndex: TOOLTIP_Z_INDEX }}>
        <rect
          x={tooltipX}
          y={tooltipY}
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={TOOLTIP_RADIUS}
          fill={TOOLTIP_BG}
        />
        <polygon
          points={`${NODE_CENTER_X - TOOLTIP_POINTER_WIDTH / 2},${tooltipY + TOOLTIP_HEIGHT} ${NODE_CENTER_X + TOOLTIP_POINTER_WIDTH / 2},${tooltipY + TOOLTIP_HEIGHT} ${NODE_CENTER_X},${tooltipY + TOOLTIP_HEIGHT + TOOLTIP_POINTER_HEIGHT}`}
          fill={TOOLTIP_BG}
        />
        <text
          x={NODE_CENTER_X}
          y={tooltipY + TOOLTIP_HEIGHT / 2 + 4}
          textAnchor="middle"
          fontSize={TOOLTIP_FONT_SIZE}
          fontWeight={TOOLTIP_FONT_WEIGHT}
          fill={TOOLTIP_TEXT_COLOR}
        >
          {progressText}
        </text>
      </g>
      <rect
        x={titleX - titlePillWidth / 2}
        y={titleY - PERIOD_TITLE_PILL_HEIGHT / 2}
        width={titlePillWidth}
        height={PERIOD_TITLE_PILL_HEIGHT}
        rx={PERIOD_TITLE_PILL_RADIUS}
        fill={isLocked ? PERIOD_INACTIVE_LABEL_BG : PERIOD_ACTIVE_LABEL_BG}
      />
      <MultilineSvgText
        x={titleX}
        y={titleY}
        fill={isLocked ? titleConfig.inactiveColor : titleConfig.activeColor}
        fontSize={titleConfig.fontSize}
        fontWeight={isLocked ? titleConfig.inactiveWeight : titleConfig.activeWeight}
        textAnchor="middle"
        alignmentBaseline="middle"
        style={titleConfig.style}
        maxCharsPerLine={titleConfig.maxCharsPerLine}
      >
        {title}
      </MultilineSvgText>
      <MultilineSvgText
        x={contentX}
        y={contentY}
        fill={isLocked ? contentConfig.inactiveColor : contentConfig.activeColor}
        fontSize={contentConfig.fontSize}
        fontWeight={isLocked ? contentConfig.inactiveWeight : contentConfig.activeWeight}
        textAnchor="middle"
        alignmentBaseline="middle"
        style={contentConfig.style}
        maxCharsPerLine={contentConfig.maxCharsPerLine}
        maxLines={contentConfig.maxLines}
      >
        {content}
      </MultilineSvgText>
    </g>
  );
};

const RoadMapSVG = (props: RoadMapProps) => {
  const {
    data: rawData,
    currentStepIndex,
    onPressPeriod,
    onPressPeriodLocked,
    hideFinished = false,
    renderItem,
    renderFinished,
    titleStyle,
    contentStyle,
    titleTextFontSize = PERIOD_TITLE_FONT_SIZE,
    titleActiveColor = PERIOD_ACTIVE_LABEL_COLOR,
    titleDisableColor = PERIOD_INACTIVE_LABEL_COLOR,
    titlePosition,
    titleActiveWeight = 600,
    titleDisableWeight = 500,
    contentTextFontSize = PERIOD_CONTENT_FONT_SIZE,
    contentActiveColor = "#111827",
    contentDisableColor = "#94A3B8",
    contentPosition,
    contentActiveWeight = 500,
    contentDisableWeight = 400,
    finishTextActiveColor = "#FFAB00",
    finishTextDisableColor = "#111827",
    finishTextPosition,
    finishTextActiveWeight = 600,
    finishTextDisableWeight = 500,
    finishTextFontSize = 12,
    width = ROAD_WIDTH,
  } = props;

  const data = React.useMemo<RoadMapItemProps[]>(() => {
    if (hideFinished) return rawData.filter((item) => !item.isFinished);
    return rawData;
  }, [rawData, hideFinished]);

  const { pathRef, mapHeight, mapPath, realPathLength, dashOffset } = useGenerateMap(
    data.length,
    currentStepIndex,
  );

  const titleConfig: TextStyleConfig = {
    position: titlePosition,
    fontSize: titleTextFontSize,
    activeColor: titleActiveColor,
    inactiveColor: titleDisableColor,
    activeWeight: titleActiveWeight,
    inactiveWeight: titleDisableWeight,
    style: titleStyle,
    maxCharsPerLine: PERIOD_TITLE_MAX_CHARS,
  };

  const contentConfig: TextStyleConfig = {
    position: contentPosition,
    fontSize: contentTextFontSize,
    activeColor: contentActiveColor,
    inactiveColor: contentDisableColor,
    activeWeight: contentActiveWeight,
    inactiveWeight: contentDisableWeight,
    style: contentStyle,
    maxCharsPerLine: PERIOD_CONTENT_MAX_CHARS,
    maxLines: PERIOD_CONTENT_MAX_LINES,
  };

  const finishTextConfig: FinishTextConfig = {
    position: finishTextPosition,
    fontSize: finishTextFontSize,
    activeColor: finishTextActiveColor,
    inactiveColor: finishTextDisableColor,
    activeWeight: finishTextActiveWeight,
    inactiveWeight: finishTextDisableWeight,
  };

  const renderMap = () => {
    const dashArray = realPathLength > 0 ? realPathLength : 1;

    return (
      <g>
        <path d={mapPath} stroke={ROAD_BASE_COLOR} strokeWidth={ROAD_STROKE_WIDTH} strokeLinecap="round" ref={pathRef} />
        <path
          d={mapPath}
          stroke={ROAD_PROGRESS_COLOR}
          strokeWidth={ROAD_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{ transition: ROAD_PROGRESS_TRANSITION }}
        />
        <path
          d={mapPath}
          stroke={ROAD_DASH_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={ROAD_DASH_PATTERN}
        />
      </g>
    );
  };

  const handlePeriodClick = (
    index: number,
    itemStatus?: RoadMapItemStatus,
    isFinished?: boolean,
  ) => {
    const isLocked = isFinished
      ? currentStepIndex < data.length - 1
      : itemStatus
        ? itemStatus === "locked"
        : currentStepIndex < index;

    if (isLocked) {
      onPressPeriodLocked(index);
      return;
    }
    onPressPeriod(index);
  };

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${mapHeight}`}
      fill="none"
      preserveAspectRatio="xMidYMin meet"
      style={{ display: "block", height: "auto", overflow: "visible" }}
      overflow="visible"
    >
      <style>
        {`
          .lp-roadmap-node .lp-roadmap-tooltip {
            opacity: 0;
            transform: translateY(0);
            transition: ${TOOLTIP_TRANSITION};
            filter: drop-shadow(${TOOLTIP_SHADOW});
          }
          .lp-roadmap-node:hover .lp-roadmap-tooltip {
            opacity: 1;
            transform: translateY(${TOOLTIP_HOVER_TRANSLATE}px);
          }
        `}
      </style>
      {renderMap()}

      {data.map((item, index) => {
        const layout = getPeriodLayoutByIndex(index, data.length);

        return (
          <PeriodItem
            key={`${item.title}-${index}`}
            title={item.title}
            content={item.content}
            isFinished={item.isFinished}
            itemOrderIndex={item.orderIndex}
            itemStatus={item.status}
            itemProgress={item.progressPercentage}
            onClick={() => handlePeriodClick(index, item.status, item.isFinished)}
            x={layout.x}
            y={layout.y}
            index={index}
            currentStepIndex={currentStepIndex}
            dataLength={data.length}
            renderItem={renderItem}
            renderFinished={renderFinished}
            titleConfig={titleConfig}
            contentConfig={contentConfig}
            finishTextConfig={finishTextConfig}
          />
        );
      })}
    </svg>
  );
};

export default RoadMapSVG;
