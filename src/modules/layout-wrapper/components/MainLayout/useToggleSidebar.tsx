import { useCallback, useState } from "react";
import { Theme, useMediaQuery, useTheme } from "@mui/material";

const useToggleSidebar = () => {
  const theme = useTheme();
  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] = useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] = useState(false);

  const isOverLGViewport = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true,
  });

  const isNavigationExpanded = isOverLGViewport ? isDesktopNavigationExpanded : isMobileNavigationExpanded;

  const setIsNavigationExpanded = useCallback(
    (newExpanded: boolean) => {
      if (isOverLGViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
      } else {
        setIsMobileNavigationExpanded(newExpanded);
      }
    },
    [isOverLGViewport, setIsDesktopNavigationExpanded, setIsMobileNavigationExpanded],
  );

  const handleToggleHeaderMenu = useCallback(
    (isExpanded: boolean) => {
      setIsNavigationExpanded(isExpanded);
    },
    [setIsNavigationExpanded],
  );

  return {
    toggle: handleToggleHeaderMenu,
    isExpanded: isNavigationExpanded,
  };
};
export default useToggleSidebar;
