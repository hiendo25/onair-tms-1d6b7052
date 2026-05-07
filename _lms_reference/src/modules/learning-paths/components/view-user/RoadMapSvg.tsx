"use client";

import * as React from "react";

import { PHASE_STATUS } from "../../learning-path-user.constants";

import { useGenerateMap } from "./hooks/useGenerateMap";
import { MultilineSvgText } from "./MultilineSvgText";
import type {
  FinishTextConfig,
  RoadMapItemStatus,
  RoadMapProps,
  TextStyleConfig,
} from "./roadmap.types";
import { getPeriodLayoutByIndex, NODE_CENTER_X, NODE_CENTER_Y, ROAD_WIDTH } from "./roadmap-map.utils";
import {
  ROADMAP_DASH_PATTERN,
  ROADMAP_DEFAULTS,
  ROADMAP_FINISH,
  ROADMAP_NODE,
  ROADMAP_NODE_POSITION,
  ROADMAP_PERIOD,
  ROADMAP_PROGRESS_RING_CIRCUMFERENCE,
  ROADMAP_ROAD,
  ROADMAP_TEXT,
  ROADMAP_TEXT_DEFAULTS,
  ROADMAP_TEXT_WEIGHT,
  ROADMAP_TOOLTIP,
  ROADMAP_TOOLTIP_CSS,
} from "./roadmap-svg.constants";
import {
  getCursorStyle,
  getPillWidth,
  getProgressRingOffset,
  isFinishEnabled,
  isItemEnabled,
  isItemLocked,
  resolveItemStatus,
} from "./roadmap-svg.utils";

const DEFAULT_TITLE_Y = ROADMAP_NODE_POSITION.titleY;
const DEFAULT_CONTENT_Y = ROADMAP_NODE_POSITION.contentY;
const NODE_ICON_OFFSET_X = ROADMAP_NODE_POSITION.iconOffsetX;
const NODE_ICON_OFFSET_Y = ROADMAP_NODE_POSITION.iconOffsetY;
const TOOLTIP_X = NODE_CENTER_X - ROADMAP_TOOLTIP.width / 2;
const TOOLTIP_Y = ROADMAP_TOOLTIP.offsetY;

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

const PeriodShape = ({ status, orderIndex, progressPercentage, isLast }: PeriodShapeProps) => {
  const isActive = status === PHASE_STATUS.ACTIVE;
  const isCompleted = status === PHASE_STATUS.COMPLETED;
  const showNumber =
    !isLast &&
    (status !== PHASE_STATUS.ACTIVE || (isCompleted && ROADMAP_DEFAULTS.showCompletedNumber));
  const outerColor =
    status === PHASE_STATUS.LOCKED ? ROADMAP_PERIOD.inactiveOuter : ROADMAP_PERIOD.activeOuter;
  const numberColor =
    status === PHASE_STATUS.LOCKED ? ROADMAP_PERIOD.numberInactive : ROADMAP_PERIOD.numberActive;
  const ringProgressColor =
    status === PHASE_STATUS.LOCKED ? ROADMAP_PERIOD.inactiveIcon : ROADMAP_PERIOD.activeIcon;
  const progressColor =
    status === PHASE_STATUS.LOCKED
      ? ROADMAP_PERIOD.progressTrackInactive
      : ROADMAP_PERIOD.progressTrackActive;
  const progressOffset = getProgressRingOffset(progressPercentage);
  const displayOrder = String(orderIndex).padStart(2, "0");
  const iconColor = isActive || isCompleted ? ROADMAP_PERIOD.activeIcon : ROADMAP_PERIOD.inactiveIcon;

  return (
    <g>
      <circle cx={NODE_CENTER_X} cy={NODE_CENTER_Y} r={ROADMAP_NODE.outerRadius} fill={outerColor} />
      <circle
        cx={NODE_CENTER_X}
        cy={NODE_CENTER_Y}
        r={ROADMAP_NODE.progressRingRadius}
        fill="none"
        stroke={progressColor}
        strokeWidth={ROADMAP_NODE.progressRingWidth}
      />
      <circle
        cx={NODE_CENTER_X}
        cy={NODE_CENTER_Y}
        r={ROADMAP_NODE.progressRingRadius}
        fill="none"
        stroke={ringProgressColor}
        strokeWidth={ROADMAP_NODE.progressRingWidth}
        strokeDasharray={ROADMAP_PROGRESS_RING_CIRCUMFERENCE}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${NODE_CENTER_X} ${NODE_CENTER_Y})`}
      />
      <circle cx={NODE_CENTER_X} cy={NODE_CENTER_Y} r={ROADMAP_NODE.ringRadius} fill={ROADMAP_PERIOD.innerBg} />
      <circle cx={NODE_CENTER_X} cy={NODE_CENTER_Y} r={ROADMAP_NODE.innerRadius} fill={ROADMAP_PERIOD.innerBg} />
      {showNumber ? (
        <text
          x={NODE_CENTER_X}
          y={NODE_CENTER_Y + ROADMAP_TEXT.numberOffsetY}
          textAnchor="middle"
          fontSize={ROADMAP_TEXT.numberFontSize}
          fontWeight={700}
          fill={numberColor}
        >
          {displayOrder}
        </text>
      ) : (
        <>
          {isLast ? (
            <path
              d={ROADMAP_FINISH.starPath}
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
      fill={hasFinished ? ROADMAP_FINISH.active : ROADMAP_FINISH.inactive}
    />
    <path
      d="M296.589 687.755C297.384 689.234 297.384 691.013 296.589 692.491L281.257 720.998C280.385 722.619 278.694 723.63 276.853 723.63L247.147 723.63C245.307 723.63 243.615 722.619 242.743 720.998L227.412 692.491C226.617 691.013 226.617 689.234 227.412 687.755L242.743 659.248C243.615 657.628 245.307 656.616 247.147 656.616L276.853 656.616C278.694 656.617 280.385 657.628 281.257 659.248L296.589 687.755Z"
      fill={ROADMAP_FINISH.inactive}
      stroke={hasFinished ? ROADMAP_FINISH.active : ROADMAP_FINISH.inactive}
      strokeWidth={6}
    />
    <path
      d="M297.687 683.521C298.835 685.523 298.835 687.983 297.687 689.985L282.637 716.246C281.479 718.267 279.327 719.514 276.998 719.514L247.002 719.514C244.672 719.514 242.52 718.267 241.362 716.246L226.313 689.985C225.166 687.983 225.166 685.523 226.313 683.521L241.362 657.261C242.52 655.24 244.672 653.993 247.002 653.993L276.998 653.993C279.327 653.993 281.479 655.24 282.637 657.261L297.687 683.521Z"
      fill={ROADMAP_PERIOD.innerBg}
      stroke={hasFinished ? ROADMAP_FINISH.active : ROADMAP_FINISH.inactive}
      strokeWidth={3}
    />
    <path
      d="M281.615 681.06C281.365 680.287 280.681 679.738 279.871 679.665L268.87 678.665L264.52 668.471C264.199 667.724 263.469 667.241 262.657 667.241C261.846 667.241 261.115 667.724 260.794 668.473L256.444 678.665L245.442 679.665C244.633 679.74 243.951 680.287 243.7 681.06C243.449 681.833 243.681 682.68 244.292 683.214L252.607 690.516L250.155 701.329C249.976 702.125 250.284 702.946 250.943 703.423C251.297 703.68 251.712 703.81 252.13 703.81C252.49 703.81 252.847 703.713 253.168 703.521L262.657 697.842L272.143 703.521C272.837 703.939 273.712 703.901 274.37 703.423C275.029 702.945 275.337 702.123 275.157 701.329L272.705 690.516L281.021 683.216C281.632 682.68 281.866 681.834 281.615 681.06Z"
      fill={hasFinished ? ROADMAP_FINISH.activeIcon : ROADMAP_FINISH.inactive}
    />
    <MultilineSvgText
      x={textConfig.position?.x ?? ROADMAP_FINISH.textCenterX}
      y={textConfig.position?.y ?? ROADMAP_FINISH.textCenterY}
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
  const isEnabled = isItemEnabled(itemStatus, currentStepIndex, index);
  const isFinishedEnabled = isFinishEnabled(currentStepIndex, dataLength);
  const finishTranslateX = NODE_CENTER_X + x - ROADMAP_FINISH.shapeCenterX;
  const finishTranslateY = NODE_CENTER_Y + y - ROADMAP_FINISH.shapeCenterY;
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
  const status = resolveItemStatus(itemStatus, isEnabled);
  const isLocked = status === PHASE_STATUS.LOCKED;
  const titleX = titleConfig.position?.x ?? NODE_CENTER_X;
  const titleY = titleConfig.position?.y ?? DEFAULT_TITLE_Y;
  const contentX = contentConfig.position?.x ?? NODE_CENTER_X;
  const contentY = contentConfig.position?.y ?? DEFAULT_CONTENT_Y;
  const progressValue = itemProgress ?? 0;
  const progressText = `${progressValue}%`;
  const titlePillWidth = getPillWidth(title, titleConfig.fontSize, ROADMAP_TEXT.titlePillPadding);

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
      <g className="lp-roadmap-tooltip" style={{ pointerEvents: "none", zIndex: ROADMAP_TOOLTIP.zIndex }}>
        <rect
          x={TOOLTIP_X}
          y={TOOLTIP_Y}
          width={ROADMAP_TOOLTIP.width}
          height={ROADMAP_TOOLTIP.height}
          rx={ROADMAP_TOOLTIP.radius}
          fill={ROADMAP_TOOLTIP.background}
        />
        <polygon
          points={`${NODE_CENTER_X - ROADMAP_TOOLTIP.pointerWidth / 2},${TOOLTIP_Y + ROADMAP_TOOLTIP.height} ${NODE_CENTER_X + ROADMAP_TOOLTIP.pointerWidth / 2},${TOOLTIP_Y + ROADMAP_TOOLTIP.height} ${NODE_CENTER_X},${TOOLTIP_Y + ROADMAP_TOOLTIP.height + ROADMAP_TOOLTIP.pointerHeight}`}
          fill={ROADMAP_TOOLTIP.background}
        />
        <text
          x={NODE_CENTER_X}
          y={TOOLTIP_Y + ROADMAP_TOOLTIP.height / 2 + ROADMAP_TOOLTIP.textOffsetY}
          textAnchor="middle"
          fontSize={ROADMAP_TOOLTIP.fontSize}
          fontWeight={ROADMAP_TOOLTIP.fontWeight}
          fill={ROADMAP_TOOLTIP.textColor}
        >
          {progressText}
        </text>
      </g>
      <rect
        x={titleX - titlePillWidth / 2}
        y={titleY - ROADMAP_TEXT.titlePillHeight / 2}
        width={titlePillWidth}
        height={ROADMAP_TEXT.titlePillHeight}
        rx={ROADMAP_TEXT.titlePillRadius}
        fill={isLocked ? ROADMAP_PERIOD.inactiveLabelBg : ROADMAP_PERIOD.activeLabelBg}
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
    titleTextFontSize = ROADMAP_TEXT.titleFontSize,
    titleActiveColor = ROADMAP_PERIOD.activeLabelColor,
    titleDisableColor = ROADMAP_PERIOD.inactiveLabelColor,
    titlePosition,
    titleActiveWeight = ROADMAP_TEXT_WEIGHT.titleActive,
    titleDisableWeight = ROADMAP_TEXT_WEIGHT.titleInactive,
    contentTextFontSize = ROADMAP_TEXT.contentFontSize,
    contentActiveColor = ROADMAP_TEXT_DEFAULTS.contentActiveColor,
    contentDisableColor = ROADMAP_TEXT_DEFAULTS.contentDisableColor,
    contentPosition,
    contentActiveWeight = ROADMAP_TEXT_WEIGHT.contentActive,
    contentDisableWeight = ROADMAP_TEXT_WEIGHT.contentInactive,
    finishTextActiveColor = ROADMAP_TEXT_DEFAULTS.finishTextActiveColor,
    finishTextDisableColor = ROADMAP_TEXT_DEFAULTS.finishTextDisableColor,
    finishTextPosition,
    finishTextActiveWeight = ROADMAP_TEXT_WEIGHT.finishActive,
    finishTextDisableWeight = ROADMAP_TEXT_WEIGHT.finishInactive,
    finishTextFontSize = ROADMAP_TEXT.finishFontSize,
    width = ROAD_WIDTH,
  } = props;

  const data = React.useMemo(() => {
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
    maxCharsPerLine: ROADMAP_TEXT.titleMaxChars,
  };

  const contentConfig: TextStyleConfig = {
    position: contentPosition,
    fontSize: contentTextFontSize,
    activeColor: contentActiveColor,
    inactiveColor: contentDisableColor,
    activeWeight: contentActiveWeight,
    inactiveWeight: contentDisableWeight,
    style: contentStyle,
    maxCharsPerLine: ROADMAP_TEXT.contentMaxChars,
    maxLines: ROADMAP_TEXT.contentMaxLines,
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
    const dashArray = Math.max(realPathLength, ROADMAP_ROAD.minDashArray);

    return (
      <g>
        <path
          d={mapPath}
          stroke={ROADMAP_ROAD.baseColor}
          strokeWidth={ROADMAP_ROAD.strokeWidth}
          strokeLinecap="round"
          ref={pathRef}
        />
        <path
          d={mapPath}
          stroke={ROADMAP_ROAD.progressColor}
          strokeWidth={ROADMAP_ROAD.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{ transition: ROADMAP_ROAD.progressTransition }}
        />
        <path
          d={mapPath}
          stroke={ROADMAP_ROAD.dashColor}
          strokeWidth={ROADMAP_ROAD.dashStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={ROADMAP_DASH_PATTERN}
        />
      </g>
    );
  };

  const handlePeriodClick = (
    index: number,
    itemStatus?: RoadMapItemStatus,
    isFinished?: boolean,
  ) => {
    const isLocked = isItemLocked({
      status: itemStatus,
      currentStepIndex,
      index,
      dataLength: data.length,
      isFinished,
    });

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
      <style>{ROADMAP_TOOLTIP_CSS}</style>
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
