"use client";
import React, { PropsWithChildren, useRef } from "react";
import { Stack, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/utils";

import AccountSetting from "./AccountSetting";
import DashboardSidebar from "./DashboardSidebar";
import { DashboardSidebarProps } from "./DashboardSidebar";
import Footer from "./Footer";
import Header from "./Header";
import NotificationButton from "./NotificationButton";
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
  faviconUrl?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  menuItems,
  onChangeOrganization,
  currentOrganizationId,
  organizationItems,
  logoUrl,
  faviconUrl,
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
              className={cn("gap-3 h-16 md:h-20", {
                "py-4 px-2 flex items-center justify-center": !isExpanded,
                "py-4 px-6": isExpanded,
              })}
            >
              <Link href="/dashboard">
                {logoUrl && isExpanded ? (
                  <Image src={logoUrl} alt="logo" width={120} height={80} className="h-full w-auto" />
                ) : null}
                {faviconUrl && !isExpanded ? <Image src={faviconUrl} alt="logo" width={36} height={36} /> : null}
              </Link>
            </div>
          ),
        }}
      />
      <MainLayoutContent className="main-layout__content">
        <Header
          menuOpen={isExpanded}
          onToggleMenu={toggleExpand}
          slots={{
            left: (
              <OrganizationSelector
                value={currentOrganizationId}
                options={organizationItems}
                onChange={onChangeOrganization}
              />
            ),
            right: (
              <Stack direction="row" alignItems="center" gap={{ xs: 1, md: 2 }}>
                <NotificationButton />
                <AccountSetting />
              </Stack>
            ),
          }}
        />
        <Box component="main" sx={{ display: "flex", flexDirection: "column", flex: 1, px: { xs: 2, md: 4, xl: 8 } }}>
          {children}
        </Box>
        <Footer />
      </MainLayoutContent>
    </LayoutWrapper>
  );
};
export default MainLayout;
