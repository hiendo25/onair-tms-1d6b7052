"use client";
import React, { PropsWithChildren, useCallback, useRef, useState } from "react";
import { Button, styled, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";

import { ChevronRightDoubleIcon, LogoOnairIcon, LogoOnairShortIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";
import SelectContent from "../../SelectContent";

import DashboardSidebar from "./DashboardSidebar";
import { DashboardSidebarProps } from "./DashboardSidebar";
import Footer from "./Footer";
import Header from "./Header";

interface MainLayoutProps extends PropsWithChildren {
  className?: string;
  menuItems: DashboardSidebarProps["menuItems"];
  organizationContent?: React.ReactNode;
}

const LayoutWrapper = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  overflow: "hidden",
  height: "100dvh",
}));

const MainLayoutContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  background: "#F5F8FF",
  overflowY: "auto",
  px: { xs: 4, md: 6, xl: 8 },
  ...theme.applyStyles("dark", {
    background: "rgb(5 7 10)",
  }),
}));

const MainLayout: React.FC<MainLayoutProps> = ({ children, className, menuItems }) => {
  const theme = useTheme();
  const layoutRef = useRef<HTMLDivElement>(null);

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

  return (
    <LayoutWrapper ref={layoutRef} className="main-layout">
      <DashboardSidebar
        expanded={isNavigationExpanded}
        setExpanded={setIsNavigationExpanded}
        container={layoutRef.current ?? undefined}
        className="main-layout__sider"
        menuItems={menuItems}
        slots={{
          top: (
            <>
              <div
                className={cn("gap-3", {
                  "pt-6 pb-2 px-6 flex items-center justify-center": !isNavigationExpanded,
                  "pt-6 pb-2 px-3 text-center": isNavigationExpanded,
                })}
              >
                <Link href="/dashboard">
                  {!isNavigationExpanded ? (
                    <LogoOnairShortIcon className="mx-auto block w-8 h-8" />
                  ) : (
                    <LogoOnairIcon className="h-10 w-auto" />
                  )}
                </Link>
              </div>
              <div className="line bg-gray-200 w-full h-px my-4"></div>
              <div className="px-4 mb-6">
                <SelectContent />
              </div>
            </>
          ),
          bottom: (
            <div className="px-4 py-2">
              <Button
                endIcon={<ChevronRightDoubleIcon />}
                color="inherit"
                variant="fill"
                fullWidth
                title={isNavigationExpanded ? "Mở rộng menu" : "Thu gọn menu"}
                onClick={() => handleToggleHeaderMenu(!isNavigationExpanded)}
                sx={{
                  ".MuiButton-endIcon": {
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
                className="min-w-auto"
              ></Button>
            </div>
          ),
        }}
      />
      {/* Main content */}
      <MainLayoutContent className="main-layout__content">
        <Header
          menuOpen={isNavigationExpanded}
          onToggleMenu={handleToggleHeaderMenu}
          logo={<LogoOnairIcon className="w-fit h-[36px]" />}
        />
        <Box component="main" sx={{ display: "flex", flexDirection: "column", flex: 1, px: { xs: 4, md: 6, xl: 8 } }}>
          {children}
        </Box>
        <Footer />
      </MainLayoutContent>
    </LayoutWrapper>
  );
};
export default MainLayout;
