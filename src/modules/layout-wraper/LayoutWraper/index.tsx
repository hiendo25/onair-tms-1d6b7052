"use client";
import MainLayout from "@/shared/ui/layouts/MainLayout";
import { ADMIN_MENU_LIST, STUDENTS_MENU_LIST } from "@/constants/menu-config.constant";
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

  const menuList = data.employeeType === "student" ? STUDENTS_MENU_LIST : ADMIN_MENU_LIST;

  const getChilds = (item: (typeof ADMIN_MENU_LIST)[number]): MenuItemType[] => {
    const { persCheck, children, ...restItem } = item;

    if (!item.children) return [];

    return item.children.reduce<MenuItemType[]>((allChildItems, childItem) => {
      const { persCheck, children, ...restChild } = childItem;

      const childrentItems = getChilds(childItem);

      if (!childItem.persCheck || (childItem.persCheck && hasPermissions(childItem.persCheck))) {
        allChildItems = [
          ...allChildItems,
          {
            ...restChild,
            children: childrentItems || [],
          } as MenuItemType,
        ];
      }
      return allChildItems;
    }, []);
  };
  const mappingPathWithRolePers = (items: typeof ADMIN_MENU_LIST) => {
    return items.reduce<MenuItemType[]>((allMenuItems, item) => {
      const { persCheck, children, ...restItem } = item;

      const childItems = getChilds(item);
      // const childItems = item.children?.reduce<MenuItemType[]>((accChilItems, childItem) => {
      //   const { persCheck, children, ...restChild } = childItem;

      //   if (!childItem.persCheck || (childItem.persCheck && hasPermissions(childItem.persCheck))) {
      //     accChilItems = [...accChilItems, restChild];
      //   }
      //   return accChilItems;
      // }, []);

      if (!item.persCheck || !item.persCheck.length || (item.persCheck && hasPermissions(item.persCheck))) {
        const menuItem =
          restItem.type === "group"
            ? {
                // icon: restItem.icon,
                key: restItem.key,
                // subTitle: restItem.subTitle,
                title: restItem.title,
                type: restItem.type,
                // path: "",
                children: [],
              }
            : {
                icon: restItem.icon,
                key: restItem.key,
                subTitle: restItem.subTitle,
                title: restItem.title,
                path: restItem.path,
                type: "item",
                children: [],
              };

        allMenuItems = [...allMenuItems, { ...menuItem, children: [] }];
      }

      return allMenuItems;
    }, []);
  };

  return <MainLayout menuItems={menuList}>{children}</MainLayout>;
};
export default LayoutWraper;
