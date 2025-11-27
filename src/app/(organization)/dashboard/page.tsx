"use client";

import PageContainer from "@/shared/ui/PageContainer";
import DashboardSection from "./_components";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { redirect } from "next/navigation";

const DashboardPage = () => {
  const { ...rest } = useUserOrganization((state) => state.data);
  const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher";

  if (!isHasAccess) {
    redirect("/my-class");
  }

  return (
    <PageContainer title="Dashboard" breadcrumbs={[{ title: "Dashboard", path: "/dashboard" }]}>
      <DashboardSection />
    </PageContainer>
  );
};

export default DashboardPage;
