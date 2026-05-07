"use client";
import { RefObject, useCallback, useEffect } from "react";

const useClickOutSide = (ref: RefObject<HTMLElement | null>, cb: () => void) => {
  const handleClickOutSide = useCallback(
    (e: MouseEvent) => {
      const element = ref.current;
      if (element && !element.contains(e.target as Node)) {
        cb();
      }
    },
    [ref, cb],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, [handleClickOutSide]);
};
export default useClickOutSide;
