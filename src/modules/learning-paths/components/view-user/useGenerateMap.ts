import { useEffect, useMemo, useRef, useState } from "react";

export const ROAD_WIDTH = 900;

const ROAD_MARGIN = 16;
const ROAD_CENTER_X = ROAD_WIDTH / 2;
const PERIOD_VERTICAL_GAP = 140;
export const MAP_TOP_Y = 80;
const MAP_CORNER_RADIUS = 60;
const MAP_START_Y = MAP_TOP_Y + MAP_CORNER_RADIUS;
const MAP_CORNER_TANGENT_RATIO = 0.55228475;
const MAP_CORNER_TANGENT = Math.round(MAP_CORNER_RADIUS * MAP_CORNER_TANGENT_RATIO);
const MAP_CORNER_OFFSET = MAP_CORNER_RADIUS - MAP_CORNER_TANGENT;
const MAP_CORNER_INSET = MAP_CORNER_TANGENT;
const MAP_STEP_DOWN = PERIOD_VERTICAL_GAP - MAP_CORNER_RADIUS * 2;
const MAP_STEP_DOWN_FIRST = MAP_STEP_DOWN;
const MAP_BOTTOM_PADDING = 32;
const MIN_MAP_HEIGHT = MAP_START_Y + MAP_CORNER_RADIUS;
const MAP_STROKE_PADDING = 800;
const MAP_TOTAL_OFFSET = 2000;
const MAP_LEFT_START_X = ROAD_MARGIN;
const MAP_LEFT_X = MAP_LEFT_START_X + MAP_CORNER_RADIUS;
const MAP_RIGHT_X = ROAD_WIDTH - ROAD_MARGIN;
const MAP_END_X = MAP_RIGHT_X - MAP_CORNER_RADIUS;
const MAP_START_X = ROAD_CENTER_X;
const MAP_START_CTRL_Y = MAP_START_Y - MAP_CORNER_INSET;
const MAP_LEFT_CTRL_X = MAP_LEFT_START_X + MAP_CORNER_OFFSET;
const MAP_RIGHT_CTRL_X = MAP_RIGHT_X - MAP_CORNER_OFFSET;
const NODE_CENTER_X = ROAD_CENTER_X;
const NODE_CENTER_Y = MAP_TOP_Y;
const NODE_SIDE_GAP = 150;
const NODE_LEFT_CENTER_X = MAP_LEFT_X + NODE_SIDE_GAP;
const NODE_RIGHT_CENTER_X = MAP_END_X - NODE_SIDE_GAP;
const PERIOD_LEFT_OFFSET = NODE_LEFT_CENTER_X - ROAD_CENTER_X;
const PERIOD_RIGHT_OFFSET = NODE_RIGHT_CENTER_X - ROAD_CENTER_X;
const PATH_SAMPLE_STEP = 4;
const PATH_SAMPLE_REFINEMENT_STEP = 1;

type Point = { x: number; y: number };

const getSquaredDistance = (from: Point, to: Point): number => {
  const deltaX = from.x - to.x;
  const deltaY = from.y - to.y;
  return deltaX * deltaX + deltaY * deltaY;
};

const findClosestLengthForPoint = (
  path: SVGPathElement,
  target: Point,
  totalLength: number,
): number => {
  let closestLength = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  // Sample the path to approximate the closest length to a target point.
  for (let length = 0; length <= totalLength; length += PATH_SAMPLE_STEP) {
    const point = path.getPointAtLength(length);
    const distance = getSquaredDistance(point, target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestLength = length;
    }
  }

  const refineStart = Math.max(0, closestLength - PATH_SAMPLE_STEP);
  const refineEnd = Math.min(totalLength, closestLength + PATH_SAMPLE_STEP);
  for (let length = refineStart; length <= refineEnd; length += PATH_SAMPLE_REFINEMENT_STEP) {
    const point = path.getPointAtLength(length);
    const distance = getSquaredDistance(point, target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestLength = length;
    }
  }

  return closestLength;
};

const generateZigZagPath = (rows: number, lastIndex: number): string => {
  // Điểm bắt đầu cố định
  let path = `M${MAP_START_X} ${MAP_TOP_Y}H${MAP_END_X}C${MAP_RIGHT_CTRL_X} ${MAP_TOP_Y} ${MAP_RIGHT_X} ${MAP_START_CTRL_Y} ${MAP_RIGHT_X} ${MAP_START_Y}`;
  let currentY = MAP_START_Y;
  const lastRow = lastIndex > 0 ? Math.ceil(lastIndex / 2) : 0;
  const lastOnRight = lastIndex > 0 ? lastIndex % 4 <= 1 : true;
  const lastTargetX = lastOnRight ? NODE_RIGHT_CENTER_X : NODE_LEFT_CENTER_X;

  for (let i = 0; i < rows; i++) {
    const isEven = i % 2 === 0;
    const rowNumber = i + 1;

    if (isEven) {
      // TẦNG LẺ (1, 3, 5...): Chạy xuống và cua sang TRÁI
      const vDown = currentY + MAP_STEP_DOWN;
      path += `V${vDown}C${MAP_RIGHT_X} ${vDown + MAP_CORNER_INSET} ${MAP_RIGHT_CTRL_X} ${vDown + MAP_CORNER_RADIUS} ${MAP_END_X} ${vDown + MAP_CORNER_RADIUS}`;
      if (rowNumber === lastRow) {
        path += `H${lastTargetX}`;
        break;
      }
      path += `H${MAP_LEFT_X}`;
      currentY = vDown + MAP_CORNER_RADIUS;
    } else {
      // TẦNG CHẴN (2, 4, 6...): Chạy xuống và cua sang PHẢI
      const vDown = currentY + MAP_STEP_DOWN;
      path += `V${vDown}C${MAP_LEFT_START_X} ${vDown + MAP_CORNER_INSET} ${MAP_LEFT_CTRL_X} ${vDown + MAP_CORNER_RADIUS} ${MAP_LEFT_X} ${vDown + MAP_CORNER_RADIUS}`;
      if (rowNumber === lastRow) {
        path += `H${lastTargetX}`;
        break;
      }
      path += `H${MAP_END_X}`;
      currentY = vDown + MAP_CORNER_RADIUS;
    }

    // CHỈ thêm đoạn uốn nối tầng nếu CHƯA PHẢI tầng cuối cùng
    if (i < rows - 1) {
      if (isEven) {
        // Đang ở bên trái, uốn để đi xuống tiếp
        path += `C${MAP_LEFT_CTRL_X} ${currentY} ${MAP_LEFT_START_X} ${currentY + MAP_CORNER_OFFSET} ${MAP_LEFT_START_X} ${currentY + MAP_CORNER_RADIUS}`;
      } else {
        // Đang ở bên phải, uốn để đi xuống tiếp
        path += `C${MAP_RIGHT_CTRL_X} ${currentY} ${MAP_RIGHT_X} ${currentY + MAP_CORNER_OFFSET} ${MAP_RIGHT_X} ${currentY + MAP_CORNER_RADIUS}`;
      }
      currentY += MAP_CORNER_RADIUS;
    }
  }
  return path;
};

const calculateTotalHeight = (loops: number): number => {
  if (loops <= 0) return 100; // Chiều cao tối thiểu nếu không có loop

  let currentY = MAP_START_Y; // Điểm bắt đầu giống trong generateZigZagPath

  for (let i = 0; i < loops; i++) {
    // 1. Tầng xuống và cua trái
    const vDown1 = currentY + MAP_STEP_DOWN_FIRST;
    currentY = vDown1 + MAP_CORNER_RADIUS; // Vị trí sau khi vẽ đoạn ngang sang trái

    // 2. Cua trái xuống dưới (luôn có)
    currentY += MAP_CORNER_RADIUS;

    // 3. Tầng xuống và cua phải
    const vDown2 = currentY + MAP_STEP_DOWN;
    currentY = vDown2 + MAP_CORNER_RADIUS; // Vị trí sau khi vẽ đoạn ngang sang phải

    // 4. Chỉ uốn xuống tiếp nếu chưa phải vòng cuối
    if (i < loops - 1) {
      currentY += MAP_CORNER_RADIUS;
    }
  }

  // Cộng thêm padding để không bị cắt mép dưới
  return Math.max(currentY - MAP_BOTTOM_PADDING, MIN_MAP_HEIGHT);
};
const getRowPositions = (
  rows: number,
): Array<{ row: number; start: { x: number; y: number }; end: { x: number; y: number } }> => {
  const positions: Array<{ row: number; start: { x: number; y: number }; end: { x: number; y: number } }> = [];
  let currentY = MAP_START_Y;

  for (let i = 0; i < rows; i++) {
    const isEven = i % 2 === 0;
    const rowData: { row: number; start: { x: number; y: number }; end: { x: number; y: number } } = {
      row: i + 1,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    };

    if (isEven) {
      // TẦNG LẺ: Đi từ Phải sang Trái
      // Điểm bắt đầu của đoạn thẳng đứng bên phải
      rowData.start = { x: MAP_RIGHT_X, y: currentY };

      const vDown = currentY + MAP_STEP_DOWN;
      // Điểm kết thúc của đoạn nằm ngang bên trái
      rowData.end = { x: MAP_LEFT_X, y: vDown + MAP_CORNER_RADIUS };

      currentY = vDown + MAP_CORNER_RADIUS;
    } else {
      // TẦNG CHẴN: Đi từ Trái sang Phải
      // Điểm bắt đầu của đoạn thẳng đứng bên trái
      rowData.start = { x: MAP_LEFT_START_X, y: currentY };

      const vDown = currentY + MAP_STEP_DOWN;
      // Điểm kết thúc của đoạn nằm ngang bên phải
      rowData.end = { x: MAP_END_X, y: vDown + MAP_CORNER_RADIUS };

      currentY = vDown + MAP_CORNER_RADIUS;
    }

    positions.push(rowData);

    // Cộng thêm bước uốn nối tầng để currentY khớp với tầng tiếp theo
    if (i < rows - 1) {
      currentY += MAP_CORNER_RADIUS;
    }
  }
  return positions;
};

export const getPeriodLayoutByIndex = (
  index = 0,
  totalItems = 9,
): { index: number; x: number; y: number; strokeDashoffset: number } => {
  const y = index === 0 ? 0 : Math.ceil(index / 2) * PERIOD_VERTICAL_GAP;
  let x = 0;
  if (index !== 0) {
    x = index % 4 <= 1 ? PERIOD_RIGHT_OFFSET : PERIOD_LEFT_OFFSET;
  }

  // 3. Tính StrokeDashoffset: Giảm dần từ 2000 về 0
  // Khoảng cách mỗi bước = 2000 / (tổng số phần tử - 1)
  const step = MAP_TOTAL_OFFSET / (totalItems - 1);
  const strokeDashoffset = MAP_TOTAL_OFFSET - index * step;

  return { index, x, y, strokeDashoffset };
};

const buildProgressOffsets = (
  path: SVGPathElement,
  totalLength: number,
  dataLength: number,
): number[] => {
  if (dataLength <= 0) return [];

  const offsets = new Array<number>(dataLength);
  for (let index = 0; index < dataLength; index += 1) {
    const layout = getPeriodLayoutByIndex(index, dataLength);
    const targetPoint: Point = {
      x: NODE_CENTER_X + layout.x,
      y: NODE_CENTER_Y + layout.y,
    };
    const lengthAtPoint = findClosestLengthForPoint(path, targetPoint, totalLength);
    offsets[index] = totalLength - lengthAtPoint;
  }

  return offsets;
};

export const useGenerateMap = (dataLength: number, currentStepIndex: number = 0) => {
  // Luôn generate path và height dựa trên cùng một giá trị loops
  const pathRef = useRef<SVGPathElement | null>(null);
  const [realPathLength, setRealPathLength] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const [progressOffsets, setProgressOffsets] = useState<number[]>([]);
  const { svgPath, mapHeight, rowPositions } = useMemo(() => {
    const loops = Math.ceil((dataLength - 1) / 2);
    const rows = loops * 2;
    return {
      svgPath: generateZigZagPath(loops, dataLength - 1),
      mapHeight: calculateTotalHeight(loops - 1),
      rowPositions: getRowPositions(rows),
    };
  }, [dataLength]);
  useEffect(() => {
    let rafId: number;

    rafId = requestAnimationFrame(() => {
      const path = pathRef.current;

      if (path?.getTotalLength) {
        const length = path.getTotalLength();
        setRealPathLength(length);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [svgPath]);
  useEffect(() => {
    if (realPathLength <= 0) return;
    const path = pathRef.current;
    if (!path) {
      setProgressOffsets([]);
      return;
    }
    setProgressOffsets(buildProgressOffsets(path, realPathLength, dataLength));
  }, [dataLength, realPathLength]);
  useEffect(() => {
    if (realPathLength <= 0) return;
    if (currentStepIndex >= dataLength) {
      setDashOffset(0);
      return;
    }

    const safeIndex = Math.max(currentStepIndex, 0);
    const nextOffset = progressOffsets[safeIndex];
    setDashOffset(typeof nextOffset === "number" ? nextOffset : realPathLength);
  }, [currentStepIndex, dataLength, realPathLength, progressOffsets]);
  return {
    mapHeight,
    mapPath: svgPath,
    width: ROAD_WIDTH,
    rowPositions,
    pathRef,
    realPathLength,
    dashOffset,
  };
};
