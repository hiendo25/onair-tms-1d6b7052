"use client";
import React, { PropsWithChildren, useRef } from "react";
import { styled } from "@mui/material";
import Box from "@mui/material/Box";
import Image from "next/image";
import Link from "next/link";

import { ChevronRightDoubleIcon, LogoOnairIcon, LogoOnairShortIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

import DashboardSidebar from "./DashboardSidebar";
import { DashboardSidebarProps } from "./DashboardSidebar";
import Footer from "./Footer";
import Header from "./Header";
import OrganizationSelector, { OrganizationSelectorProps } from "./OrganizationSelector";
import useToggleSidebar from "./useToggleSidebar";
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
  background: "white",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
  scrollbarColor: "#eaeaea transparent",
  px: { xs: 4, md: 6, xl: 8 },
  ...theme.applyStyles("dark", {
    background: "#141a21",
  }),
}));

export interface MainLayoutProps extends PropsWithChildren {
  className?: string;
  menuItems: DashboardSidebarProps["menuItems"];
  organizationItems: OrganizationSelectorProps["options"];
  onChangeOrganization?: OrganizationSelectorProps["onChange"];
  currentOrganizationId?: OrganizationSelectorProps["value"];
  logoUrl?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  menuItems,
  onChangeOrganization,
  currentOrganizationId,
  organizationItems,
  logoUrl,
}) => {
  const layoutRef = useRef<HTMLDivElement>(null);

  const { isExpanded, toggle: toggleExpand } = useToggleSidebar();

  return (
    <LayoutWrapper ref={layoutRef} className="main-layout">
      <DashboardSidebar
        expanded={isExpanded}
        setExpanded={toggleExpand}
        container={layoutRef.current ?? undefined}
        className="main-layout__sidebar"
        menuItems={menuItems}
        slots={{
          top: (
            <div
              className={cn("gap-3", {
                "py-4 px-2 flex items-center justify-center": !isExpanded,
                "py-4 px-6": isExpanded,
              })}
            >
              <Link href="/dashboard">
                {logoUrl ? <Image src={logoUrl} alt="logo" width={120} height={80} /> : null}
              </Link>
            </div>
          ),
          // bottom: (
          //   <div className="px-4 py-2">
          //     <Button
          //       endIcon={<ChevronRightDoubleIcon />}
          //       color="inherit"
          //       variant="fill"
          //       fullWidth
          //       title={isExpanded ? "Thu gọn menu" : "Mở rộng menu"}
          //       className="min-w-auto"
          //       onClick={() => toggleExpand(!isExpanded)}
          //       sx={{
          //         ".MuiButton-endIcon": {
          //           marginLeft: 0,
          //           marginRight: 0,
          //         },
          //       }}
          //     />
          //   </div>
          // ),
        }}
      />
      {/* Main content */}
      <MainLayoutContent className="main-layout__content">
        <Header
          menuOpen={isExpanded}
          onToggleMenu={toggleExpand}
          actions={
            <OrganizationSelector
              value={currentOrganizationId}
              options={organizationItems}
              onChange={onChangeOrganization}
            />
          }
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
