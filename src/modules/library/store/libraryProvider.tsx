"use client";
import { type ReactNode, createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import { LibraryStore, createLibraryStore, libraryStateInit } from "./libraryStore";

type LibraryStoreContextApi = ReturnType<typeof createLibraryStore>;

export const LibraryStoreContext = createContext<LibraryStoreContextApi | undefined>(
  undefined,
);

export interface LibraryProviderProps {
  children: ReactNode;
}

export const LibraryProvider = ({ children }: LibraryProviderProps) => {
  const storeRef = useRef<LibraryStoreContextApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createLibraryStore(libraryStateInit);
  }

  return (
    <LibraryStoreContext.Provider value={storeRef.current}>
      {children}
    </LibraryStoreContext.Provider>
  );
};

export const useLibraryStore = <T, >(selector: (store: LibraryStore) => T): T => {
  const context = useContext(LibraryStoreContext);

  if (!context) {
    throw new Error(`useLibraryStore must be used within LibraryProvider`);
  }

  return useStore(context, selector);
};
