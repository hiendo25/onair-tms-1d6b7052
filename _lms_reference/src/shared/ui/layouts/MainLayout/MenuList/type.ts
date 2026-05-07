import React from "react";

export interface MenuContentItemType {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  path: string;
  key: string; // for handle active menu item
  children?: (MenuContentItemType | MenuGroupItemType)[];
  type?: "item";
  nonAction?: boolean;
}
export interface MenuGroupItemType {
  title: string;
  key: string; // for handle active menu item
  children: MenuContentItemType[];
  type: "group";
  nonAction?: boolean;
}

export type MenuItemType = MenuGroupItemType | MenuContentItemType;
