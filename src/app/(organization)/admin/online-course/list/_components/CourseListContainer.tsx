"use client";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import ELearningTab from "./CourseTableList";
import CourseTableList from "./CourseTableList";

type TabValue = "ClassRoomTab" | "ElearningTab";

export default function CourseListContainer() {
  const { ...rest } = useUserOrganization((state) => state.data);
  const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher";

  if (!isHasAccess) {
    redirect("/403");
  }

  return <CourseTableList />;
}
