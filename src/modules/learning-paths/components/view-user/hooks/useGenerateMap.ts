import { useEffect, useMemo, useRef, useState } from "react";

import {
  calculateTotalHeight,
  generateZigZagPath,
  getPeriodLayoutByIndex,
  NODE_CENTER_X,
  NODE_CENTER_Y,
} from "../roadmap-map.utils";
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

export const useGenerateMap = (dataLength: number, currentStepIndex = 0) => {
  // Always generate path and height from the same loop count.
  const pathRef = useRef<SVGPathElement | null>(null);
  const [realPathLength, setRealPathLength] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const [progressOffsets, setProgressOffsets] = useState<number[]>([]);
  const { svgPath, mapHeight } = useMemo(() => {
    const lastIndex = dataLength - 1;
    const loopCount = Math.ceil(Math.max(lastIndex, 0) / 2);
    return {
      svgPath: generateZigZagPath(loopCount, lastIndex),
      mapHeight: calculateTotalHeight(loopCount),
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
    pathRef,
    realPathLength,
    dashOffset,
  };
};
