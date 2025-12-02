interface MenuContentItemType {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  path: string;
  key: string; // for handle active menu item
  children?: MenuContentItemType[];
  type?: "item";
}
interface MenuGroupItemType {
  title: string;
  key: string; // for handle active menu item
  children: MenuContentItemType[];
  type: "group";
}

export type MenuItemType = MenuGroupItemType | MenuContentItemType;
