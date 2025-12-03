"use client";
import MainLayout from "@/shared/ui/layouts/MainLayout";
import { ADMIN_MENU_LIST, MenuItemTypeWithPer, STUDENTS_MENU_LIST } from "@/constants/menu-config.constant";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { usePermissions } from "@/modules/permission-wraper";
import { MenuItemType } from "@/shared/ui/layouts/MainLayout/MenuList/type";
interface LayoutWraperProps {
  children: React.ReactNode;
}
const LayoutWraper: React.FC<LayoutWraperProps> = ({ children }) => {
  //   const user = useAuthStore((state) => state);
  const { data } = useUserOrganization((state) => state);

  const { hasPermissions } = usePermissions();

  const mappingPathWithRolePermissions = (items: MenuItemTypeWithPer[]): MenuItemType[] => {
    return items.reduce<MenuItemType[]>((allMenuItems, { persCheck, children, ...menuItem }) => {
      /**
       * Default no handle pers, empty pers can be bypass check.
       */
      if (!persCheck || !persCheck.length || (persCheck && hasPermissions(persCheck))) {
        const childItems = mappingPathWithRolePermissions(children || []);

        const correctMenuItem: MenuItemType =
          menuItem.type === "group"
            ? {
                key: menuItem.key,
                title: menuItem.title,
                type: "group",
                children: childItems.filter((item) => item.type !== "group"),
              }
            : {
                icon: menuItem.icon,
                key: menuItem.key,
                subTitle: menuItem.subTitle,
                title: menuItem.title,
                path: menuItem.path,
                type: "item",
                children: childItems || [],
              };

        allMenuItems = [...allMenuItems, correctMenuItem];
      }
      return allMenuItems;
    }, []);
  };

  const menuList = data.employeeType === "student" ? STUDENTS_MENU_LIST : ADMIN_MENU_LIST;

  return <MainLayout menuItems={mappingPathWithRolePermissions(menuList)}>{children}</MainLayout>;
};
export default LayoutWraper;
