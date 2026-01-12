"use client";

import { useCallback, useEffect, useState } from "react";

import { CLASSROOM_SCROLL_OFFSET_RATIO } from "../_constants";

interface UseClassRoomScrollSpyOptions {
  sectionClassName: string;
  joinZoneClassName: string;
  scrollContainerSelector: string;
  offsetRatio?: number;
  enabled?: boolean;
}

interface UseClassRoomScrollSpyResult {
  activeSectionIndex: number;
  showJoinHorizontal: boolean;
  scrollToSection: (index: number) => void;
}

export const useClassRoomScrollSpy = (
  options: UseClassRoomScrollSpyOptions,
): UseClassRoomScrollSpyResult => {
  const {
    sectionClassName,
    joinZoneClassName,
    scrollContainerSelector,
    offsetRatio = CLASSROOM_SCROLL_OFFSET_RATIO,
    enabled = true,
  } = options;

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showJoinHorizontal, setShowJoinHorizontal] = useState(false);

  const scrollToSection = useCallback(
    (index: number) => {
      const sections = document.getElementsByClassName(sectionClassName);
      const section = sections[index] as HTMLElement | undefined;

      if (!section) {
        return;
      }

      section.scrollIntoView({ behavior: "smooth" });
    },
    [sectionClassName],
  );

  const handleScroll = useCallback(() => {
    const scrollElement = document.querySelector(scrollContainerSelector);
    if (!scrollElement) {
      return;
    }

    const scrollOffset = scrollElement.clientHeight * offsetRatio;
    const scrollPosition = scrollElement.scrollTop + scrollOffset;
    const sections = document.querySelectorAll(`.${sectionClassName}`);
    const joinZone = document.querySelector(`.${joinZoneClassName}`) as HTMLElement | null;

    let newActiveSection: number | null = null;

    sections.forEach((section, index) => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionBottom = sectionTop + (section as HTMLElement).clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        newActiveSection = index;
      }
    });

    if (joinZone) {
      setShowJoinHorizontal(scrollPosition >= joinZone.offsetTop);
    } else {
      setShowJoinHorizontal(false);
    }

    if (newActiveSection !== null) {
      setActiveSectionIndex(newActiveSection);
    }
  }, [joinZoneClassName, offsetRatio, scrollContainerSelector, sectionClassName]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const scrollElement = document.querySelector(scrollContainerSelector);
    if (!scrollElement) {
      return;
    }

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, handleScroll, scrollContainerSelector]);

  return {
    activeSectionIndex,
    showJoinHorizontal,
    scrollToSection,
  };
};
