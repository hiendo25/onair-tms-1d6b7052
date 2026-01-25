"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

import DashboardSection from "./_components";
const DashboardPage = () => {
  const { type: employeeType } = useUserOrganization((state) => state.currentEmployee);

  if (employeeType === "student") {
    redirect("/my-class");
  }
  return (
    <PageContainer title="Dashboard" breadcrumbs={[{ title: "Dashboard", path: "/dashboard" }]}>
      <DashboardSection />
    </PageContainer>
  );
};

export default DashboardPage;
