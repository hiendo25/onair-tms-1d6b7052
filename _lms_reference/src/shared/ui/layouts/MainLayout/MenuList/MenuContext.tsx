import * as React from "react";

export interface MenuContextApi {
  onMenuItemClick: (id: string, hasNestedNavigation: boolean) => void;
  mini: boolean;
  expandedItemIds: string[];
  matchPath: (path: string) => boolean;
}
const MenuContext = React.createContext<MenuContextApi | null>(null);

export { MenuContext };

interface MenuContextProviderProps {
  children?: React.ReactNode;
  value: MenuContextApi | null;
}
const MenuContextProvider: React.FC<MenuContextProviderProps> = ({ children, value }) => {
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
export default MenuContextProvider;

export const useMenuContext = () => {
  const menuContext = React.useContext(MenuContext);
  if (!menuContext) {
    throw new Error("useMenuContext context was used without a MenuContextProvider.");
  }
  return menuContext;
};
