import * as React from "react";
import Link from "next/link";
import { Typography, Paper, ListItemText, ListItemButton, Collapse, Grow, Box, ListItem } from "@mui/material";
import { type Theme, alpha, SxProps } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import MenuContextProvider, { MenuContextApi, useMenuContext } from "./MenuContext";

export interface MenuContentSubItemProps {
  id: string;
  title: string;
  href: string;
  action?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  nestedNavigation?: React.ReactNode;
  type?: "item" | "group";
}
export default function MenuContentSubItem({
  id,
  title,
  href,
  action,
  defaultExpanded = false,
  expanded = defaultExpanded,
  selected = false,
  disabled = false,
  nestedNavigation,
}: MenuContentSubItemProps) {
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
      top: "50%",
      right: "6px",
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
      onMenuItemClick: onMenuItemClick,
      matchPath: matchPath,
      expandedItemIds: [],
      mini: mini,
    };
  }, [onMenuItemClick]);

  const getListItemSx = React.useCallback(
    (mini: boolean, selected: boolean): SxProps<Theme> => {
      let listItemSx: SxProps<Theme> = { display: "block", py: 0, pl: 0, pr: 2 };

      return (theme) => ({
        ...(mini
          ? {
              ...listItemSx,
              width: "auto",
              padding: "4px 8px",
              "& .MuiButtonBase-root": {
                minHeight: "auto",
                padding: "6px 20px 6px 12px",
                textAlign: "left",
                borderRadius: 1,
                opacity: 0.6,
              },
            }
          : {
              ...listItemSx,
              overflowX: "hidden",
              // marginLeft: "-2px",
              "& .MuiButtonBase-root": {
                minHeight: 42,
                padding: "6px 6px 6px 18px",
                borderRadius: 1,
                opacity: 0.7,
                // borderLeft: "2px solid transparent",
                ["&:hover"]: {
                  backgroundColor: "transparent",
                  opacity: 1,
                },
                // "&.Mui-selected": {
                //   backgroundColor: alpha(theme.palette.primary.main, 0.08),
                //   opacity: 1,
                //   ".MuiTypography-root": {
                //     color: theme.palette.primary.main,
                //     fontWeight: 500,
                //   },
                //   svg: {
                //     color: theme.palette.primary.main,
                //   },
                // },
                [`&.Mui-selected`]: {
                  backgroundColor: "transparent",
                  borderLeftColor: "black",
                  opacity: 1,
                  ["&:hover"]: {
                    backgroundColor: "transparent",
                  },
                },
              },
              position: "relative",
              [":after"]: {
                content: '" "',
                width: selected ? "8px" : "4px",
                height: selected ? "8px" : "4px",
                background: selected ? theme.palette.primary["main"] : theme.palette.grey[600],
                borderRadius: "50%",
                display: "table",
                top: "calc(50% - 2px)",
                left: 0,
                position: "absolute",
              },
            }),
      });
    },
    [mini],
  );
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
        sx={getListItemSx(mini, selected)}
      >
        <ListItemButton
          selected={selected}
          disabled={disabled}
          sx={{
            // height: mini ? 150 : "auto",
            width: "100%",
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
          {mini ? (
            <Box>
              {mini ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    textAlign: "left",
                    overflow: "hidden",
                  }}
                >
                  {title}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          {!mini ? (
            <ListItemText
              primary={title}
              sx={(theme) => ({
                WebkitLineClamp: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                textAlign: "left",
                zIndex: 1,
                margin: 0,
              })}
            />
          ) : null}
          {nestedNavigation ? <ExpandMoreIcon sx={nestedNavigationCollapseSx} /> : null}
        </ListItemButton>
        {nestedNavigation && mini ? (
          <Grow in={isHovered}>
            <Box
              sx={{
                position: "fixed",
                left: "220px",
                pl: "12px",
                mt: "6px",
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
