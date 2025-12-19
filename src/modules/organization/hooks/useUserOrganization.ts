import { use } from "react";
import { useStore } from "zustand";

import { UserOrganizationContext } from "../store/OrganizationProvider";
import { OrganizationStoreApi } from "../store/user-organization-store";

export const useUserOrganization = <T>(selector: (store: OrganizationStoreApi) => T): T => {
  const context = use(UserOrganizationContext);
  if (!context) {
    throw new Error(`useUserOrganization must be used within UserOrganizationProvider`);
  }
  return useStore(context, selector);
};
