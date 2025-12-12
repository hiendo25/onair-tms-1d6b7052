import { use } from "react";
import { useStore } from "zustand";

import { AuthStoreContext } from "../store/AuthProvider";
import { AuthStore } from "../store/authStore";
export const useAuthStore = <T>(selector: (store: AuthStore) => T): T => {
  const context = use(AuthStoreContext);

  if (!context) {
    throw new Error(`useAuthStore must be used within AuthProvider`);
  }

  return useStore(context, selector);
};
