"use client";
import { redirect } from "next/navigation";

import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";

import CourseTableList from "./CourseTableList";

export default function CourseListContainer() {
  const { ...rest } = useUserOrganization((state) => state.data);
  const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher";

  if (!isHasAccess) {
    redirect("/403");
  }

  return <CourseTableList />;
}
