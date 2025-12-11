import React, { createContext, useContext } from "react";
export const TableDataContext = createContext<any>(null);

export const useTableData = () => {
  const context = useContext(TableDataContext);
  if (!context) throw new Error("useTableData must under TableDataContext");
  return context;
};

interface TableRowDataProviderProps {
  children: Readonly<React.ReactNode>;
}
const TableRowDataProvider: React.FC<TableRowDataProviderProps> = ({ children }) => {
  return <TableDataContext.Provider value={undefined}>{children}</TableDataContext.Provider>;
};
export default TableRowDataProvider;
