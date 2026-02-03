import React from "react";

import TableData from "@/shared/ui/TableData";

interface EmployeeTableDataProps {
  departmentId: string;
}
const EmployeeTableData: React.FC<EmployeeTableDataProps> = ({ departmentId }) => {
  return (
    <TableData
      rows={[]}
      columns={[]}
      hoverRow
      showRowCount
      bordered={false}
      // loading={isEmployeesLoading}
      // onRowClick={handleEmployeeClick}
      // pagination={{
      // 	page: employeesPage,
      // 	pageSize: employeesPageSize,
      // 	total: employeesTotal,
      // 	onChangePage: onEmployeesPageChange,
      // 	onChangePageSize: onEmployeesPageSizeChange,
      // }}
    />
  );
};
export default EmployeeTableData;
