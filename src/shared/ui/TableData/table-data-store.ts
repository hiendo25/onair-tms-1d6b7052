import { devtools, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
export interface TableDataState<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    perPageOptions: number[];
  };
}
export interface TableDataActions<T> {
  onFilter: (data: T) => void;
  onChangePage: (newPage: number) => void;
}
export type TableDataStoreApi<T> = TableDataState<T> & TableDataActions<T>;

const createTableDataStore = <T>(initState: TableDataState<T>) => {
  return createStore<TableDataStoreApi<T>>()(
    devtools(
      persist(
        (set, get, store) => ({
          ...initState,
          onFilter: () => {},
          onChangePage: (newPage) => {
            set((state) => ({
              ...state,
              pagination: {
                ...state.pagination,
                page: newPage,
              },
            }));
          },
        }),
        { name: "tableDataStore" },
      ),
    ),
  );
};
export { createTableDataStore };
