"use client";

import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { redirect } from "next/navigation";
import ClassRoomTableList from "./ClassRoomTableList";

export default function ClassRoomContainer() {
  const { ...rest } = useUserOrganization((state) => state.data);
  const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher"

  if (!isHasAccess) {
    redirect('/403');
  }

  return (
    <ClassRoomTableList />
  );
}
