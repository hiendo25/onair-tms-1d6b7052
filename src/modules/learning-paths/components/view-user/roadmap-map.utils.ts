export const ROAD_WIDTH = 900;

const ROAD_MARGIN = 16;
export const MAP_TOP_Y = 80;
const ROAD_CENTER_X = ROAD_WIDTH / 2;
const PERIOD_VERTICAL_GAP = 140;
const MAP_CORNER_RADIUS = 60;
const MAP_START_Y = MAP_TOP_Y + MAP_CORNER_RADIUS;
const MAP_CORNER_TANGENT_RATIO = 0.55228475;
const MAP_CORNER_TANGENT = Math.round(MAP_CORNER_RADIUS * MAP_CORNER_TANGENT_RATIO);
const MAP_CORNER_OFFSET = MAP_CORNER_RADIUS - MAP_CORNER_TANGENT;
const MAP_CORNER_INSET = MAP_CORNER_TANGENT;
const MAP_STEP_DOWN = PERIOD_VERTICAL_GAP - MAP_CORNER_RADIUS * 2;
const MAP_BOTTOM_PADDING = 32;
const MIN_MAP_HEIGHT = MAP_START_Y + MAP_CORNER_RADIUS;
const MAP_TOTAL_OFFSET = 2000;
const MAP_LEFT_START_X = ROAD_MARGIN;
const MAP_LEFT_X = MAP_LEFT_START_X + MAP_CORNER_RADIUS;
const MAP_RIGHT_X = ROAD_WIDTH - ROAD_MARGIN;
const MAP_END_X = MAP_RIGHT_X - MAP_CORNER_RADIUS;
const MAP_START_X = ROAD_CENTER_X;
const MAP_START_CTRL_Y = MAP_START_Y - MAP_CORNER_INSET;
const MAP_LEFT_CTRL_X = MAP_LEFT_START_X + MAP_CORNER_OFFSET;
const MAP_RIGHT_CTRL_X = MAP_RIGHT_X - MAP_CORNER_OFFSET;
export const NODE_CENTER_X = ROAD_CENTER_X;
export const NODE_CENTER_Y = MAP_TOP_Y;
const NODE_SIDE_GAP = 150;
const NODE_LEFT_CENTER_X = MAP_LEFT_X + NODE_SIDE_GAP;
const NODE_RIGHT_CENTER_X = MAP_END_X - NODE_SIDE_GAP;
const PERIOD_LEFT_OFFSET = NODE_LEFT_CENTER_X - ROAD_CENTER_X;
const PERIOD_RIGHT_OFFSET = NODE_RIGHT_CENTER_X - ROAD_CENTER_X;

export type PeriodLayout = {
  index: number;
  x: number;
  y: number;
  strokeDashoffset: number;
};

const shouldExtendLastRowToCenter = (lastIndex: number): boolean => lastIndex > 0 && lastIndex % 2 === 1;

export const generateZigZagPath = (loopCount: number, lastIndex: number): string => {
  // Fixed start point
  let path = `M${MAP_START_X} ${MAP_TOP_Y}H${MAP_END_X}C${MAP_RIGHT_CTRL_X} ${MAP_TOP_Y} ${MAP_RIGHT_X} ${MAP_START_CTRL_Y} ${MAP_RIGHT_X} ${MAP_START_Y}`;
  let currentY = MAP_START_Y;
  const lastRow = lastIndex > 0 ? Math.ceil(lastIndex / 2) : 0;
  const lastOnRight = lastIndex > 0 ? lastIndex % 4 <= 1 : true;
  const lastTargetX = lastOnRight ? NODE_RIGHT_CENTER_X : NODE_LEFT_CENTER_X;
  const lastRowEndX = shouldExtendLastRowToCenter(lastIndex) ? MAP_START_X : lastTargetX;

  for (let rowIndex = 0; rowIndex < loopCount; rowIndex += 1) {
    const isEven = rowIndex % 2 === 0;
    const rowNumber = rowIndex + 1;

    if (isEven) {
      // Odd row: go down and curve left.
      const vDown = currentY + MAP_STEP_DOWN;
      path += `V${vDown}C${MAP_RIGHT_X} ${vDown + MAP_CORNER_INSET} ${MAP_RIGHT_CTRL_X} ${vDown + MAP_CORNER_RADIUS} ${MAP_END_X} ${vDown + MAP_CORNER_RADIUS}`;
      if (rowNumber === lastRow) {
        path += `H${lastRowEndX}`;
        break;
      }
      path += `H${MAP_LEFT_X}`;
      currentY = vDown + MAP_CORNER_RADIUS;
    } else {
      // Even row: go down and curve right.
      const vDown = currentY + MAP_STEP_DOWN;
      path += `V${vDown}C${MAP_LEFT_START_X} ${vDown + MAP_CORNER_INSET} ${MAP_LEFT_CTRL_X} ${vDown + MAP_CORNER_RADIUS} ${MAP_LEFT_X} ${vDown + MAP_CORNER_RADIUS}`;
      if (rowNumber === lastRow) {
        path += `H${lastRowEndX}`;
        break;
      }
      path += `H${MAP_END_X}`;
      currentY = vDown + MAP_CORNER_RADIUS;
    }

    // Only add the connector curve when this is not the last row.
    if (rowIndex < loopCount - 1) {
      if (isEven) {
        // At the left side, curve down to the next row.
        path += `C${MAP_LEFT_CTRL_X} ${currentY} ${MAP_LEFT_START_X} ${currentY + MAP_CORNER_OFFSET} ${MAP_LEFT_START_X} ${currentY + MAP_CORNER_RADIUS}`;
      } else {
        // At the right side, curve down to the next row.
        path += `C${MAP_RIGHT_CTRL_X} ${currentY} ${MAP_RIGHT_X} ${currentY + MAP_CORNER_OFFSET} ${MAP_RIGHT_X} ${currentY + MAP_CORNER_RADIUS}`;
      }
      currentY += MAP_CORNER_RADIUS;
    }
  }
  return path;
};

export const calculateTotalHeight = (loopCount: number): number => {
  if (loopCount <= 0) return 100; // Minimum height when there are no loops.

  let currentY = MAP_START_Y; // Start point matches generateZigZagPath.

  for (let index = 0; index < loopCount; index += 1) {
    // 1. Downward step then curve left.
    const vDown1 = currentY + MAP_STEP_DOWN;
    currentY = vDown1 + MAP_CORNER_RADIUS; // After the left horizontal segment.

    // 2. Curve left downwards (always).
    currentY += MAP_CORNER_RADIUS;

    // 3. Downward step then curve right.
    const vDown2 = currentY + MAP_STEP_DOWN;
    currentY = vDown2 + MAP_CORNER_RADIUS; // After the right horizontal segment.

    // 4. Only curve down again if this is not the last loop.
    if (index < loopCount - 1) {
      currentY += MAP_CORNER_RADIUS;
    }
  }

  // Add padding so the bottom isn't clipped.
  return Math.max(currentY - MAP_BOTTOM_PADDING, MIN_MAP_HEIGHT);
};

export const getPeriodLayoutByIndex = (index = 0, totalItems = 9): PeriodLayout => {
  const y = index === 0 ? 0 : Math.ceil(index / 2) * PERIOD_VERTICAL_GAP;
  let x = 0;
  if (index !== 0) {
    x = index % 4 <= 1 ? PERIOD_RIGHT_OFFSET : PERIOD_LEFT_OFFSET;
  }

  // StrokeDashoffset steps down from 2000 to 0.
  // Step size = 2000 / (total items - 1).
  const totalSteps = Math.max(totalItems - 1, 1);
  const step = MAP_TOTAL_OFFSET / totalSteps;
  const strokeDashoffset = MAP_TOTAL_OFFSET - index * step;

  return { index, x, y, strokeDashoffset };
};
