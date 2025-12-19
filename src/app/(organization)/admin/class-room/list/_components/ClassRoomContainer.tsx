"use client";

import { redirect } from "next/navigation";

import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";

import ClassRoomTableList from "./ClassRoomTableList";

export default function ClassRoomContainer() {
  return <ClassRoomTableList />;
}
