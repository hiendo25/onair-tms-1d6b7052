"use client";
import * as React from "react";
import Drawer from "@mui/material/Drawer";
import { SxProps, Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MenuList, { MenuListProps } from "@/shared/ui/layouts/MainLayout/MenuList";

import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "./constants";
import { getDrawerWidthTransitionMixin } from "./mixins";
export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
  className?: string;
  menuItems: MenuListProps["items"];
  slots?: { top?: React.ReactNode; bottom?: React.ReactNode };
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  expanded = false,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
  className,
  menuItems,
  slots = {},
}) => {
  // console.log(menuItems);
  const theme = useTheme();
  const { top: topSlot, bottom: bottomSlot } = slots;

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up("sm"));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up("md"));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyExpanded(false);

    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  // React.useEffect(() => {
  //   if (!expanded) {
  //     const drawerWidthTransitionTimeout = setTimeout(() => {
  //       setIsFullyCollapsed(true);
  //     }, theme.transitions.duration.leavingScreen);

  //     return () => clearTimeout(drawerWidthTransitionTimeout);
  //   }

  //   setIsFullyCollapsed(false);

  //   return () => {};
  // }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  // const canToggleSidebar = !!setExpanded && !disableCollapsibleSidebar;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded?.(newExpanded);
    },
    [setExpanded],
  );

  const handleToggleSidebarExpanded = React.useCallback(() => {
    if (!setExpanded) return;
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const hasDrawerTransitions = isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean): SxProps<Theme> => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;
      return {
        displayPrint: "none",
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: "absolute" } : {}),
        [`& .MuiDrawer-paper`]: {
          position: "absolute",
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundImage: "none",
          backgroundColor: "#ffffff",
          ...theme.applyStyles("dark", {
            background: "#141a21",
          }),
          ...getDrawerWidthTransitionMixin(expanded),
        },
        ...theme.applyStyles("dark", {
          background: "#141a21",
        }),
      } as SxProps<Theme>;
    },
    [expanded, mini, theme],
  );

  const renderMenuContent = React.useCallback(
    (type: "mobile" | "desktop") => {
      return (
        <>
          {topSlot && <div className="top-menu">{topSlot}</div>}
          <MenuList
            items={menuItems}
            mini={mini}
            isFullyExpanded={isFullyExpanded}
            hasDrawerTransitions={hasDrawerTransitions}
          />

          {bottomSlot}
        </>
      );
    },
    [mini, isFullyExpanded, menuItems, handleToggleSidebarExpanded, hasDrawerTransitions, topSlot],
  );
  return (
    <React.Fragment>
      <Drawer
        container={container}
        variant="temporary"
        open={!isOverMdViewport && expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          ...getDrawerSharedSx(false),
        }}
        className={className}
      >
        {renderMenuContent("mobile")}
      </Drawer>
      <Drawer
        variant="permanent"
        container={container}
        sx={{
          display: { xs: "none", sm: "block" },
          ...getDrawerSharedSx(false),
        }}
        className={className}
      >
        {renderMenuContent("desktop")}
      </Drawer>
    </React.Fragment>
  );
};
export default React.memo(DashboardSidebar);
