export interface MenuContentItemType {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  path: string;
  key: string; // for handle active menu item
  children?: (MenuContentItemType | MenuGroupItemType)[];
  type?: "item";
}
export interface MenuGroupItemType {
  title: string;
  key: string; // for handle active menu item
  children: MenuContentItemType[];
  type: "group";
}

export type MenuItemType = MenuGroupItemType | MenuContentItemType;
