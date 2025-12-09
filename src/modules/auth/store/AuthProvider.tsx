"use client";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import { AuthStore, AuthStoreState, createAuthStore } from "./authStore";

type AuthStoreContextApi = ReturnType<typeof createAuthStore>;

export const AuthStoreContext = createContext<AuthStoreContextApi | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  data: AuthStoreState["data"];
}

export const AuthProvider = ({ children, data }: AuthProviderProps) => {
  const storeRef = useRef<AuthStoreContextApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createAuthStore({
      data: data,
    });
  }
  return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const context = useContext(AuthStoreContext);

  if (!context) {
    throw new Error(`useAuthStore must be used within AuthProvider`);
  }

  return useStore(context, selector);
};
