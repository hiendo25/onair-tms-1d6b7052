import { createStore } from "zustand/vanilla";

import { Resource } from "../types";

import attachActions from "./libraryActions";

export type SelectionMode = "single" | "multiple";

export interface LibraryConfig {
  mode: SelectionMode;
  selectedIds: string[];
  libraryId?: string;
}

type LibraryStoreState = {
  resources: Resource[];
  open: boolean;
  config: LibraryConfig | null;
  resolve: ((resources: Resource[]) => void) | null;
  reject: ((reason?: any) => void) | null;
  employeeId: string;
};

type LibraryStoreActions = {
  openLibrary: (config?: Partial<LibraryConfig>) => Promise<Resource[]>;
  closeLibrary: (resources?: Resource[]) => void;
  cancelLibrary: () => void;
  setResources: (resources: Resource[]) => void;
};

type LibraryStore = LibraryStoreState & LibraryStoreActions;

const libraryStateInit: LibraryStoreState = {
  resources: [],
  open: false,
  config: null,
  resolve: null,
  reject: null,
  employeeId: "",
};

const createLibraryStore = (initState: LibraryStoreState) => {
  return createStore<LibraryStore>()((set, get) => ({
    ...initState,
    ...attachActions(initState)(set, get),
  }));
};

export { createLibraryStore, libraryStateInit };
export type { LibraryStore, LibraryStoreActions, LibraryStoreState };
