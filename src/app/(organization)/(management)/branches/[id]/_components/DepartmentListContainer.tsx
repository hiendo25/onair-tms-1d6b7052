"use client";
import React from "react";

import TableData from "@/shared/ui/TableData";

interface DepartmentListContainerProps {
  branchId: string;
}
const DepartmentListContainer: React.FC<DepartmentListContainerProps> = ({ branchId }) => {
  return (
    <div>
      <TableData
        rows={[]}
        columns={[]}
        hoverRow
        pagination={{
          page: 1,
          pageSize: 20,
          total: 0,
        }}
      />
    </div>
  );
};
export default DepartmentListContainer;
