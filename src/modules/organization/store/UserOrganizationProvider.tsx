"use client";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import { createOrganizationStore, OrganizationStoreApi, UserOrganizationState } from "./user-organization-store";

type UserOrganizationStoreContextApi = ReturnType<typeof createOrganizationStore>;

export const UserOrganizationContext = createContext<UserOrganizationStoreContextApi | undefined>(undefined);

export interface UserOrganizationProviderProps {
  children: ReactNode;
  data: UserOrganizationState["data"];
}

export const UserOrganizationProvider = ({ children, data }: UserOrganizationProviderProps) => {
  const storeRef = useRef<UserOrganizationStoreContextApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createOrganizationStore({
      data: data,
    });
  }

  return <UserOrganizationContext.Provider value={storeRef.current}>{children}</UserOrganizationContext.Provider>;
};

export const useUserOrganization = <T,>(selector: (store: OrganizationStoreApi) => T): T => {
  const context = useContext(UserOrganizationContext);
  if (!context) {
    throw new Error(`useUserOrganization must be used within UserOrganizationProvider`);
  }
  return useStore(context, selector);
};
