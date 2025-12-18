"use client";
import { createContext, type ReactNode, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";

import { LOCAL_STORAGE_KEYS } from "@/constants/localStorage.constant";

import { createOrganizationStore, OrganizationStoreApi, UserOrganizationState } from "./user-organization-store";

type UserOrganizationStoreContextApi = ReturnType<typeof createOrganizationStore>;

export const UserOrganizationContext = createContext<UserOrganizationStoreContextApi | undefined>(undefined);

export interface UserOrganizationProviderProps {
  children: ReactNode;
  data: UserOrganizationState["data"];
  currentOrganization: UserOrganizationState["currentOrganization"];
  organizations: UserOrganizationState["organizations"];
  employees: UserOrganizationState["employees"];
  currentEmployee: UserOrganizationState["currentEmployee"];
}

export const UserOrganizationProvider = ({
  children,
  data,
  organizations = [],
  currentOrganization,
  employees = [],
  currentEmployee,
}: UserOrganizationProviderProps) => {
  const storeRef = useRef<UserOrganizationStoreContextApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createOrganizationStore({
      data,
      currentOrganization: currentOrganization,
      organizations,
      employees,
      currentEmployee,
    });
  }
  useEffect(() => {
    const organizationId = localStorage.getItem(LOCAL_STORAGE_KEYS.ORGANIZATION_ID);
    const orgItem = organizations.find((org) => org.orgId === organizationId);
    const employeeItem = employees.find((employee) => employee.organization.id === organizationId);
    if (!orgItem || !employeeItem) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORGANIZATION_ID, currentOrganization.orgId);
      return;
    }

    storeRef.current?.setState({ currentOrganization: orgItem, currentEmployee: employeeItem });
  }, []);

  return <UserOrganizationContext.Provider value={storeRef.current}>{children}</UserOrganizationContext.Provider>;
};

export const useUserOrganization = <T,>(selector: (store: OrganizationStoreApi) => T): T => {
  const context = useContext(UserOrganizationContext);
  if (!context) {
    throw new Error(`useUserOrganization must be used within UserOrganizationProvider`);
  }
  return useStore(context, selector);
};
