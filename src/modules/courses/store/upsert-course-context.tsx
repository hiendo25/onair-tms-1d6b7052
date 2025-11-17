"use client";
import { useStore } from "zustand";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { UpsertCourseStore, createUpsertCourseStore } from "./upsert-course-store";

export type UpsertCourseStoreAPI = ReturnType<typeof createUpsertCourseStore>;
export const UpsertCourseContext = createContext<UpsertCourseStoreAPI | undefined>(undefined);

export interface UpsertCourseProviderProps {
  children: ReactNode;
  selectedTeachers?: UpsertCourseStore["state"]["selectedTeachers"];
  selectedStudents?: UpsertCourseStore["state"]["selectedStudents"];
}

export const UpsertCourseProvider = ({
  children,
  selectedTeachers = [],
  selectedStudents = [],
}: UpsertCourseProviderProps) => {
  const storeRef = useRef<UpsertCourseStoreAPI | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUpsertCourseStore({ selectedTeachers, selectedStudents });
  }

  return <UpsertCourseContext.Provider value={storeRef.current}>{children}</UpsertCourseContext.Provider>;
};

export const useUpsertCourseStore = <T,>(selector: (store: UpsertCourseStore) => T): T => {
  const context = useContext(UpsertCourseContext);

  if (!context) {
    throw new Error(`useClassRoomStore must be used within UpsertCourseProvider`);
  }

  return useStore(context, selector);
};
