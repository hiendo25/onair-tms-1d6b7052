"use client";
import { useStore } from "zustand";

import { type ReactNode, createContext, useContext, useRef } from "react";
import { ClassRoomStore, createClassRoomStore } from "./class-room-store";

export type ClassRoomStoreContextAPI = ReturnType<typeof createClassRoomStore>;
export const ClassRoomStoreContext = createContext<ClassRoomStoreContextAPI | undefined>(undefined);

export interface ClassRoomProviderProps {
  children: ReactNode;
  selectedTeachers?: ClassRoomStore["state"]["selectedTeachers"];
  selectedStudents?: ClassRoomStore["state"]["selectedStudents"];
}

export const ClassRoomProvider = ({
  children,
  selectedTeachers = {},
  selectedStudents = [],
}: ClassRoomProviderProps) => {
  const storeRef = useRef<ClassRoomStoreContextAPI | null>(null);

  if (!storeRef.current) {
    storeRef.current = createClassRoomStore({ selectedTeachers, selectedStudents });
  }

  return <ClassRoomStoreContext.Provider value={storeRef.current}>{children}</ClassRoomStoreContext.Provider>;
};

export const useClassRoomStore = <T,>(selector: (store: ClassRoomStore) => T): T => {
  const context = useContext(ClassRoomStoreContext);

  if (!context) {
    throw new Error(`useClassRoomStore must be used within ClassRoomProvider`);
  }

  return useStore(context, selector);
};
