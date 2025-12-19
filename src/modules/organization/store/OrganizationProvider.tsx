"use client";
import { createContext, type ReactNode, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";

import { createOrganizationStore, OrganizationStoreApi, UserOrganizationState } from "./user-organization-store";

type UserOrganizationStoreContextApi = ReturnType<typeof createOrganizationStore>;

export const UserOrganizationContext = createContext<UserOrganizationStoreContextApi | undefined>(undefined);

export interface OrganizationProviderProps {
  children: ReactNode;
  currentOrganization: UserOrganizationState["currentOrganization"];
  organizations: UserOrganizationState["organizations"];
  employees: UserOrganizationState["employees"];
  currentEmployee: UserOrganizationState["currentEmployee"];
}

export const OrganizationProvider = ({
  children,
  organizations = [],
  currentOrganization,
  employees = [],
  currentEmployee,
}: OrganizationProviderProps) => {
  const storeRef = useRef<UserOrganizationStoreContextApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createOrganizationStore({
      currentOrganization: currentOrganization,
      organizations,
      employees,
      currentEmployee,
    });
  }

  return <UserOrganizationContext.Provider value={storeRef.current}>{children}</UserOrganizationContext.Provider>;
};

export const useUserOrganization = <T,>(selector: (store: OrganizationStoreApi) => T): T => {
  const context = useContext(UserOrganizationContext);
  if (!context) {
    throw new Error(`useUserOrganization must be used within OrganizationProvider`);
  }
  return useStore(context, selector);
};
