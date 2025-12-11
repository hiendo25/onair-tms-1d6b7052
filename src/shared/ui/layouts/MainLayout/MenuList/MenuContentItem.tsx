import * as React from "react";
import { SxProps, type Theme, alpha, styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Grow from "@mui/material/Grow";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type {} from "@mui/material/themeCssVarsAugmentation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { MINI_DRAWER_WIDTH } from "../DashboardSidebar/constants";
import MenuContextProvider, { MenuContextApi, useMenuContext } from "./MenuContext";
import { svgIconClasses } from "@mui/material";

export interface MenuContentItemProps {
  id: string;
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  href: string;
  action?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  nestedNavigation?: React.ReactNode;
  type?: "item" | "group";
}

export default function MenuContentItem({
  id,
  title,
  subTitle,
  icon,
  href,
  action,
  defaultExpanded = false,
  expanded = defaultExpanded,
  selected = false,
  disabled = false,
  nestedNavigation,
}: MenuContentItemProps) {
  const { onMenuItemClick, mini = false, matchPath } = useMenuContext();

  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = React.useCallback(() => {
    if (onMenuItemClick) {
      onMenuItemClick(id, !!nestedNavigation);
    }
  }, [onMenuItemClick, id, nestedNavigation]);

  let nestedNavigationCollapseSx: SxProps<Theme> = { display: "none" };
  if (mini) {
    nestedNavigationCollapseSx = {
      fontSize: 18,
      position: "absolute",
      top: "41.5%",
      right: "2px",
      transform: "translateY(-50%) rotate(-90deg)",
    };
  } else if (!mini) {
    nestedNavigationCollapseSx = {
      ml: 0.5,
      fontSize: 20,
      transform: `rotate(${expanded ? 0 : -90}deg)`,
      transition: (theme: Theme) =>
        theme.transitions.create("transform", {
          easing: theme.transitions.easing.sharp,
          duration: 100,
        }),
    };
  }

  const hasExternalHref = href ? href.startsWith("http://") || href.startsWith("https://") : false;

  const correctPath = React.useCallback((path: string) => (path.startsWith("/") ? path : ["/", path].join("")), []);

  const LinkComponent = hasExternalHref ? "a" : Link;

  const nestedMenuItemContext: MenuContextApi = React.useMemo(() => {
    return {
      onMenuItemClick: onMenuItemClick ?? (() => {}),
      matchPath: matchPath,
      expandedItemIds: [],
      mini: mini,
    };
  }, [onMenuItemClick]);

  return (
    <React.Fragment>
      <ListItem
        disablePadding
        {...(nestedNavigation && mini
          ? {
              onMouseEnter: () => {
                setIsHovered(true);
              },
              onMouseLeave: () => {
                setIsHovered(false);
              },
            }
          : {})}
        sx={(theme) => ({
          display: "block",
          py: 0,
          px: mini ? 1 : 2,
          overflowX: "hidden",

          "& .MuiButtonBase-root": {
            minHeight: mini ? 58 : 42,
            padding: mini ? 0 : "6px 6px 6px 12px",
            ["&.Mui-selected, &:hover"]: {
              backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
              ".menu-title .MuiTypography-root": {
                color: theme.palette.primary.main,
              },
              svg: {
                color: theme.palette.primary.main,
              },
            },
          },
          ["& .MuiListItemIcon-root"]: {
            [`& svg`]: {
              width: mini ? 24 : 22,
              height: mini ? 24 : 22,
            },
          },
        })}
      >
        <ListItemButton
          selected={selected}
          disabled={disabled}
          sx={{
            height: mini ? 50 : "auto",
          }}
          {...(nestedNavigation && !mini
            ? {
                onClick: handleClick,
              }
            : {})}
          {...(!nestedNavigation
            ? {
                LinkComponent,
                ...(hasExternalHref
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {}),
                to: correctPath(href),
                onClick: handleClick,
              }
            : {})}
        >
          {icon || mini ? (
            <Box
              sx={
                mini
                  ? {
                      position: "absolute",
                      left: "50%",
                      top: "calc(50% - 6px)",
                      transform: "translate(-50%, -50%)",
                    }
                  : {}
              }
            >
              <ListItemIcon
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: mini ? "center" : "auto",
                }}
              >
                {icon ?? null}
                {!icon && mini ? (
                  <Avatar
                    sx={{
                      fontSize: 10,
                      height: 22,
                      width: 22,
                    }}
                  >
                    {title
                      .split(" ")
                      .slice(0, 2)
                      .map((titleWord) => titleWord.charAt(0).toUpperCase())}
                  </Avatar>
                ) : null}
              </ListItemIcon>
              {mini ? (
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    bottom: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    fontWeight: 500,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: MINI_DRAWER_WIDTH - 28,
                  }}
                >
                  {title}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          {!mini ? (
            <div className="flex-1">
              <ListItemText
                className="menu-title"
                primary={title}
                sx={{
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  zIndex: 1,
                  margin: 0,
                }}
              />
              <ListItemText
                className="menu-sub-title"
                secondary={subTitle}
                sx={(theme) => ({
                  WebkitLineClamp: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  zIndex: 1,
                  margin: 0,
                  ".MuiTypography-root": {
                    color: theme.palette.grey[800],
                    fontWeight: 400,
                  },
                })}
              />
            </div>
          ) : null}
          {action && !mini ? action : null}
          {nestedNavigation && !mini ? <ExpandMoreIcon sx={nestedNavigationCollapseSx} /> : null}
        </ListItemButton>
        {nestedNavigation && mini ? (
          <Grow in={isHovered}>
            <Box
              sx={{
                position: "fixed",
                left: MINI_DRAWER_WIDTH - 2,
                pl: "6px",
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 0.5,
                  transform: "translateY(-50px)",
                  boxShadow: "0px 6px 16px -4px hsla(0 0 0 / 0.3)",
                  background: "white",
                }}
              >
                <MenuContextProvider value={nestedMenuItemContext}>{nestedNavigation}</MenuContextProvider>
              </Paper>
            </Box>
          </Grow>
        ) : null}
      </ListItem>
      {nestedNavigation && !mini ? (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {nestedNavigation}
        </Collapse>
      ) : null}
    </React.Fragment>
  );
}
