"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { ADMIN_MENU_LIST, MenuItemTypeWithPer, STUDENTS_MENU_LIST } from "@/constants/menu-config.constant";
import { PermissionsCheck } from "@/constants/permission.constant";
import { useUpdateOrganizationMutation } from "@/modules/organization/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { usePermissions } from "@/modules/permission-wrapper";
import { MenuItemType } from "@/shared/ui/layouts/MainLayout/MenuList/type";
import MainLayout, { MainLayoutProps } from "../components/MainLayout";
interface LayoutWrapperProps {
  children: React.ReactNode;
}

const mappingPathWithRolePermissions = (
  items: MenuItemTypeWithPer[],
  hasPermissions: (pers: PermissionsCheck) => boolean,
): MenuItemType[] => {
  return items.reduce<MenuItemType[]>((allMenuItems, { persCheck, children, ...menuItem }) => {
    /**
     * Default no handle pers, empty pers can be bypass check.
     */
    if (!persCheck || !persCheck.length || (persCheck && hasPermissions(persCheck))) {
      const childItems = mappingPathWithRolePermissions(children || [], hasPermissions);

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

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { hasPermissions } = usePermissions();

  const {
    currentOrganization: { orgId, orgLogo },
    currentEmployee: { type: employeeType },
    organizations,
    setCurrentOrganization,
    reset,
  } = useUserOrganization((state) => state);

  const { mutate: updateOrganization } = useUpdateOrganizationMutation();

  const organizationItems = organizations.reduce<MainLayoutProps["organizationItems"]>(
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
  const menuList = employeeType === "student" ? STUDENTS_MENU_LIST : ADMIN_MENU_LIST;

  const handleChangeOrganization: MainLayoutProps["onChangeOrganization"] = (value, option) => {
    updateOrganization(value, {
      onSuccess(data, variables, onMutateResult, context) {
        router.refresh();
        setCurrentOrganization(value);
      },
    });
  };
  return (
    <MainLayout
      menuItems={mappingPathWithRolePermissions(menuList, hasPermissions)}
      currentOrganizationId={orgId}
      logoUrl={orgLogo}
      organizationItems={organizationItems}
      onChangeOrganization={handleChangeOrganization}
    >
      {children}
    </MainLayout>
  );
};
export default LayoutWrapper;
