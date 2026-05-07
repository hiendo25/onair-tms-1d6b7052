import { useEffect, useRef } from "react";

import { getClientInfo } from "./utils";

const useStickyCell = (deps?: any[]) => {
  const getNodeIndex = (fixed: "left" | "right" | undefined, index: number) => (el: HTMLTableCellElement) => {
    nodeListMap.current.set(index.toString(), { index: index, node: el, fixed });
  };

  const nodeListMap = useRef<
    Map<string, { index: number; node: HTMLTableCellElement; fixed: "left" | "right" | undefined }>
  >(new Map());

  useEffect(() => {
    const nodeListArr = [...nodeListMap.current];
    let leftPosition = 0;
    nodeListArr.forEach(([nodeIndex, nodeItem], _index) => {
      if (nodeItem.fixed === "left") {
        nodeItem.node.style.left = leftPosition + "px";
        nodeItem.node.style.right = "auto";
        nodeItem.node.classList.add("fixed-left");
        nodeItem.node.style.background = "rgb(255 255 255)";
        nodeItem.node.style.zIndex = `${(_index + 1) * 10}`;
        const { width } = getClientInfo(nodeItem.node);
        leftPosition += width;
      }
    });

    let rightPosition = 0;

    const nodeListRevert = [...nodeListArr].reverse();

    nodeListRevert.forEach(([nodeIndex, nodeItem], _index) => {
      if (nodeItem.fixed === "right") {
        nodeItem.node.style.right = rightPosition + "px";
        nodeItem.node.style.left = "auto";
        nodeItem.node.classList.add("fixed-right");
        nodeItem.node.style.background = "rgb(255 255 255)";
        nodeItem.node.style.zIndex = `${_index}`;

        const { width } = getClientInfo(nodeItem.node);
        rightPosition += width;
      }
    });
  }, [nodeListMap, ...(deps || [])]);

  return getNodeIndex;
};
export { useStickyCell };
