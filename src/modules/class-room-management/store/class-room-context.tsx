"use client";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { StoreApi, useStore } from "zustand";

import { ClassRoomStore, createClassRoomStore } from "./class-room-store";

export const ClassRoomStoreContext = createContext<StoreApi<ClassRoomStore> | undefined>(undefined);

export interface ClassRoomProviderProps {
  children: ReactNode;
  selectedTeachers?: ClassRoomStore["state"]["selectedTeachers"];
  selectedStudents?: ClassRoomStore["state"]["selectedStudents"];
  selectedCertificate?: ClassRoomStore["state"]["selectedCertificate"];
}

export const ClassRoomProvider = ({
  children,
  selectedTeachers = {},
  selectedStudents = [],
  selectedCertificate = null,
}: ClassRoomProviderProps) => {
  const storeRef = useRef<StoreApi<ClassRoomStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createClassRoomStore({ selectedTeachers, selectedStudents, selectedCertificate });
  }

  return <ClassRoomStoreContext.Provider value={storeRef.current}>{children}</ClassRoomStoreContext.Provider>;
};

export const useClassRoomStore = <T,>(selector?: (store: ClassRoomStore) => T) => {
  const context = useContext(ClassRoomStoreContext);

  if (!context) {
    throw new Error(`useClassRoomStore must be used within ClassRoomProvider`);
  }

  return useStore(context, selector!);
};
