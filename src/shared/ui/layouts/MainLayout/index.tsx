"use client";
import { PropsWithChildren, useCallback, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import DashboardSidebar from "./DashboardSidebar";
import Footer from "./Footer";
import { DashboardSidebarProps } from "./DashboardSidebar";
interface MainLayoutProps extends PropsWithChildren {
  className?: string;
  menuItems: DashboardSidebarProps["menuItems"];
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className, menuItems }) => {
  const theme = useTheme();
  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] = useState(false);
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

  const layoutRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={layoutRef}
      component="div"
      className="main-layout"
      sx={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        height: "100dvh",
      }}
    >
      <DashboardSidebar
        expanded={isNavigationExpanded}
        setExpanded={setIsNavigationExpanded}
        container={layoutRef.current ?? undefined}
        className="main-layout__sider"
        menuItems={menuItems}
      />
      {/* Main content */}
      <Box
        component="div"
        className="main-layout__content"
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          background: "#F5F8FF",
          overflowY: "auto",
          ...theme.applyStyles("dark", {
            background: "rgb(5 7 10)",
          }),
        }}
      >
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            px: { xs: 4, md: 6, xl: 8 },
          }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};
export default MainLayout;
