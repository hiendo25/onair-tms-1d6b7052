import * as React from "react";

import PageContainer from "@/shared/ui/PageContainer";
import EmployeeImport from "../_components/EmployeeImport";

const EmployeeImportPage = () => {
  return (
    <PageContainer
      title="Import User"
      breadcrumbs={[
        { title: "Nhân viên", path: "/admin/employees" },
        { title: "Import User" },
      ]}
    >
      <EmployeeImport />
    </PageContainer>
  );
};

export default EmployeeImportPage;

