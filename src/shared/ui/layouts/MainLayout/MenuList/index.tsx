"use client";
import React, { memo, useCallback, useState } from "react";
import { Box, List, SxProps, Theme } from "@mui/material";
import MenuContextProvider, { MenuContextApi } from "./MenuContext";
import { usePathname } from "next/navigation";
import MenuContentItem from "./MenuContentItem";
import { useMenuContext } from "./MenuContext";
import MenuHeaderItem from "./MenuHeaderItem";
import { getDrawerSxTransitionMixin } from "../DashboardSidebar/mixins";
import { MINI_DRAWER_WIDTH } from "../DashboardSidebar/constants";
import MenuContentSubItem from "./MenuContentSubItem";
import { MenuItemType } from "./type";

export interface MenuListProps {
  className?: string;
  items: MenuContentListProps["items"];
  mini?: boolean;
  isFullyExpanded?: boolean;
  viewport?: "mobile" | "desktop";
  hasDrawerTransitions?: boolean;
  expandedItems?: string[];
}

const MenuList: React.FC<MenuListProps> = ({
  mini = false,
  isFullyExpanded = false,
  items,
  viewport = "desktop",
  hasDrawerTransitions,
  expandedItems = [],
}) => {
  const pathname = usePathname();
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>(expandedItems);

  const handleMenuItemClick = useCallback(
    (itemId: string, hasNestedNavigation: boolean) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter((previousValueItemId) => previousValueItemId !== itemId)
            : [...previousValue, itemId],
        );
      }
    },
    [mini],
  );

  const matchPath = useCallback(
    (pathname: string) => (pathCheck: string) => {
      // console.log({ pathname, pathCheck });

      return pathname.includes(pathCheck);
    },
    [pathname],
  );

  if (!items.length) return null;

  return (
    <Box
      component="nav"
      aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "auto",
        scrollbarGutter: mini ? "stable" : "auto",
        scrollbarWidth: "none",
        overflowX: "hidden",
        ...(hasDrawerTransitions ? getDrawerSxTransitionMixin(isFullyExpanded, "padding") : {}),
        "& ul": {
          padding: 0,
        },
      }}
    >
      <MenuContextProvider
        value={{
          mini,
          onMenuItemClick: handleMenuItemClick,
          expandedItemIds: expandedItemIds,
          matchPath: matchPath(pathname),
        }}
      >
        <MenuContentList items={items} depth={0} />
      </MenuContextProvider>
    </Box>
  );
};
export default MenuList;

interface MenuContentListProps {
  items: MenuItemType[];
  isNested?: boolean;
  depth?: number;
}
const MenuContentList: React.FC<MenuContentListProps> = memo(({ items: menuItems, depth = 0 }) => {
  const { expandedItemIds, matchPath, mini } = useMenuContext();

  const hasExpanded = useCallback((key: string) => expandedItemIds.includes(key), [expandedItemIds]);

  const getMenuListSx = useCallback(
    (isSubNavigation: boolean): SxProps<Theme> => {
      return {
        display: "flex",
        flexDirection: "column",
        ...(isSubNavigation
          ? {
            gap: 0,
            marginLeft: mini ? undefined : `${depth === 1 ? 38 : depth * 8}px !important`,
            // borderLeft: mini ? undefined : "2px solid #cdcdcd",
            padding: mini ? 1 : 0.5,
            width: mini ? 220 : "auto",
          }
          : { gap: 0.5, padding: mini ? 1 : 0.5, width: mini ? MINI_DRAWER_WIDTH : "auto" }),
      };
    },
    [mini],
  );

  //render UI for nested Menu Item
  if (depth > 0) {
    return (
      <List dense sx={getMenuListSx(true)}>
        {menuItems.map((item, _index) => (
          <React.Fragment key={_index}>
            {!item.type || item.type === "item" ? (
              <MenuContentSubItem
                id={item.key}
                title={item.title}
                href={item.path}
                selected={matchPath(item.path)}
                defaultExpanded={matchPath(item.path)}
                expanded={hasExpanded(item.key)}
                nestedNavigation={
                  item.children?.length ? <MenuContentList items={item.children} depth={depth + 1} /> : undefined
                }
              />
            ) : null}
            {item.type === "group" ? (
              <React.Fragment key={item.key}>
                <MenuHeaderItem>{item.title}</MenuHeaderItem>
                {item.children.length ? (
                  <React.Fragment>
                    {item.children.map((groupItem, _index) => (
                      <MenuContentSubItem
                        key={_index}
                        id={groupItem.key}
                        title={groupItem.title}
                        href={groupItem.path}
                        selected={matchPath(groupItem.path)}
                        defaultExpanded={matchPath(groupItem.path)}
                        expanded={hasExpanded(groupItem.key)}
                        nestedNavigation={
                          groupItem.children?.length ? (
                            <MenuContentList items={groupItem.children} depth={depth + 1} />
                          ) : undefined
                        }
                      />
                    ))}
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ))}
      </List>
    );
  }

  // Render UI for Parent Menu Item
  return (
    <List dense sx={getMenuListSx(false)}>
      {menuItems.map((item, _index) => (
        <React.Fragment key={_index}>
          {!item.type || item.type === "item" ? (
            <MenuContentItem
              id={item.key} // for handle active menu
              title={item.title}
              subTitle={item.subTitle}
              icon={depth === 0 ? item.icon : undefined} // only show icon at first
              href={item.path}
              selected={matchPath(item.path)}
              defaultExpanded={matchPath(item.path)}
              expanded={hasExpanded(item.key)}
              nestedNavigation={
                item.children?.length ? <MenuContentList items={item.children} depth={depth + 1} /> : undefined
              }
            />
          ) : null}
          {item.type === "group" ? (
            <React.Fragment key={item.key}>
              <MenuHeaderItem>{item.title}</MenuHeaderItem>
              {item.children?.length ? (
                <React.Fragment>
                  {item.children.map((groupItem, _index) => (
                    <MenuContentItem
                      key={_index}
                      id={groupItem.key}
                      title={groupItem.title}
                      subTitle={groupItem.subTitle}
                      icon={depth === 0 ? groupItem.icon : undefined} // only show icon at first
                      href={groupItem.path}
                      selected={matchPath(groupItem.path)}
                      defaultExpanded={matchPath(groupItem.path)}
                      expanded={hasExpanded(groupItem.key)}
                      nestedNavigation={
                        groupItem.children?.length ? (
                          <MenuContentList items={groupItem.children} depth={depth + 1} />
                        ) : undefined
                      }
                    />
                  ))}
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}
        </React.Fragment>
      ))}
    </List>
  );
});
