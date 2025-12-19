import React, { createContext, useContext, useEffect, useRef } from "react";
import { StoreApi, useStore } from "zustand";

import { createTableDataStore, TableDataState, TableDataStoreApi } from "./table-data-store";

export const TableDataContext = createContext<StoreApi<TableDataStoreApi<any>> | null>(null);

interface TableDataProviderProps<T> {
  children: Readonly<React.ReactNode>;
  initState: TableDataState<T>;
}
const TableDataProvider = <T,>({ children, initState }: TableDataProviderProps<T>) => {
  const tableDataRef = useRef<StoreApi<TableDataStoreApi<T>> | null>(null);
  if (!tableDataRef.current) {
    tableDataRef.current = createTableDataStore<T>(initState);
  }
  // useEffect(() => {
  //   tableDataRef.current?.setState(initState);
  // }, [initState]);
  return <TableDataContext.Provider value={tableDataRef.current}>{children}</TableDataContext.Provider>;
};
export default TableDataProvider;

export const useTableData = <TRow, TResult>(selector: (state: TableDataStoreApi<TRow>) => TResult): TResult => {
  const context = useContext(TableDataContext);

  if (!context) {
    throw new Error(`useTableData must be used within TableDataProvider`);
  }

  return useStore(context, selector);
};
