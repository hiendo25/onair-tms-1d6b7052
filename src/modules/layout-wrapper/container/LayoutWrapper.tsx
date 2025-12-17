"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { ADMIN_MENU_LIST, MenuItemTypeWithPer, STUDENTS_MENU_LIST } from "@/constants/menu-config.constant";
import { useUpdateMainEmployeeOrganization } from "@/modules/organization/hooks/useUpdateMainEmployeeOrganization";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { usePermissions } from "@/modules/permission-wrapper";
import { MenuItemType } from "@/shared/ui/layouts/MainLayout/MenuList/type";
import MainLayout, { MainLayoutProps } from "../components/MainLayout";
interface LayoutWrapperProps {
  children: React.ReactNode;
}
const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const router = useRouter();

  const {
    data: userOrganization,
    employeesOrganizations,
    mainOrganization,
    setMainOrganization,
  } = useUserOrganization((state) => state);
  const { mutate: updateMainEmployee, isPending } = useUpdateMainEmployeeOrganization();
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

  console.log({ mainOrganization });
  const organizationItems = employeesOrganizations.reduce<MainLayoutProps["organizationItems"]>(
    (acc, org): MainLayoutProps["organizationItems"] => {
      return [
        ...acc,
        {
          name: org.orgName,
          logo: org.orgLogo,
          domain: org.orgDomain,
          favicon: org.orgFavicon,
          id: org.orgId,
          shortName: org.orgShortName,
        },
      ];
    },
    [],
  );
  const menuList = userOrganization.employeeType === "student" ? STUDENTS_MENU_LIST : ADMIN_MENU_LIST;

  const handleChangeOrganization: MainLayoutProps["onChangeOrganization"] = (value, option) => {
    updateMainEmployee(
      { employeeId: userOrganization.id, nextOrganizationId: value },
      {
        onSuccess(data, variables, onMutateResult, context) {
          router.refresh();
          window.location.reload();
          // setMainOrganization({
          // 	""
          // })
        },
      },
    );
  };
  return (
    <MainLayout
      menuItems={mappingPathWithRolePermissions(menuList)}
      currentOrganization={mainOrganization.orgId}
      organizationItems={organizationItems}
      onChangeOrganization={handleChangeOrganization}
      logoUrl={mainOrganization.orgLogo}
    >
      {children}
    </MainLayout>
  );
};
export default LayoutWrapper;
