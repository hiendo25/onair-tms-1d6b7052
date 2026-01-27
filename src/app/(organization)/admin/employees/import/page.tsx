import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";

import PageContainer from "@/shared/ui/PageContainer";

import EmployeeImport from "./_components/EmployeeImport";
// import EmployeeImport from "../_components/EmployeeImport";
interface EmployeeImportPageProps {
  searchParams: Promise<Record<string, any>>;
}

export async function generateMetadata(
  { searchParams }: EmployeeImportPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Import nhân viên",
    description: "Import nhân viên",
  };
}

const EmployeeImportPage: React.FC<EmployeeImportPageProps> = async ({ searchParams }) => {
  return (
    <PageContainer
      title="Import User"
      breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: "Import User" }]}
    >
      <EmployeeImport />
    </PageContainer>
  );
};

export default EmployeeImportPage;
