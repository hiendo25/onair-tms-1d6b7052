"use client";
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import type {} from "@mui/material/themeCssVarsAugmentation";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "./constants";
import { getDrawerWidthTransitionMixin } from "./mixins";
import MenuList, { MenuListProps } from "../MenuList";
import { LogoOnairIcon, LogoOnairShortIcon } from "@/shared/assets/icons";
import Link from "next/link";
import SignOutButton from "@/modules/auth/components/SignOutButton";
import CardAlert from "@/shared/ui/CardAlert";
import { cn } from "@/utils";
export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
  className?: string;
  menuItems: MenuListProps["items"];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
  className,
  menuItems,
}) => {
  // console.log(menuItems);
  const theme = useTheme();

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

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyCollapsed(false);

    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded?.(newExpanded);
    },
    [setExpanded],
  );

  const hasDrawerTransitions = isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
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
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const renderMenuContent = React.useCallback(
    (type: "mobile" | "desktop") => {
      return (
        <>
          <div
            className={cn({
              "py-6 px-6": !mini,
              "py-4 px-3": mini,
            })}
          >
            <Link href="/">
              {mini ? (
                <LogoOnairShortIcon className="mx-auto block w-8 h-8" />
              ) : (
                <LogoOnairIcon className="h-10 w-auto" />
              )}
            </Link>
          </div>
          <MenuList items={menuItems} mini={mini} isFullyExpanded={isFullyExpanded} />
          {/* {!mini ? <CardAlert /> : null} */}
          <div className="p-3">
            <SignOutButton className="w-full" type={mini ? "icon" : undefined} />
          </div>
        </>
      );
    },
    [mini, isFullyExpanded, menuItems],
  );
  return (
    <React.Fragment>
      <Drawer
        container={container}
        variant="temporary"
        open={false}
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
        sx={{
          display: { xs: "none", sm: "block" },
          ...getDrawerSharedSx(false),
        }}
        slotProps={{
          paper: {
            sx: {
              border: "none",
            },
          },
        }}
        className={className}
      >
        {renderMenuContent("desktop")}
      </Drawer>
    </React.Fragment>
  );
};
export default React.memo(DashboardSidebar);
