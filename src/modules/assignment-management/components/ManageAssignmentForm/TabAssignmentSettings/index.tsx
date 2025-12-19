"use client";
import React, { memo } from "react";
import { Typography } from "@mui/material";
import { useController, useFormContext } from "react-hook-form";

import StudentsContainer, {
  StudentsContainerProps,
} from "@/modules/class-room-management/components/ManageClassRoomForm/TabClassRoomSetting/StudentsContainer";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import { type Assignment, type EmployeeItem } from "../../assignment-form.schema";

interface TabAssignmentSettingsProps {}

const TabAssignmentSettings: React.FC<TabAssignmentSettingsProps> = () => {
  const { control } = useFormContext<Assignment>();

  const {
    field: { value: assignedEmployees, onChange },
  } = useController({ control, name: "assignedEmployees" });

  // Convert EmployeeItem[] to StudentSelectedItem[] for StudentsContainer
  const selectedStudents: StudentSelectedItem[] = assignedEmployees.map((emp) => ({
    id: emp.id,
    fullName: emp.fullName,
    email: emp.email,
    employeeCode: emp.employeeCode,
    avatar: emp.avatar,
    empoyeeType: emp.empoyeeType as "student", // Cast to student type for compatibility
  }));

  // Adapter function to convert StudentsContainer onChange to form onChange
  const handleStudentsChange: StudentsContainerProps["onChange"] = (students) => {
    const employees: EmployeeItem[] = students.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      employeeCode: student.employeeCode,
      avatar: student.avatar,
      empoyeeType: student.empoyeeType,
    }));
    onChange(employees);
  };

  return (
    <div className="px-3 md:p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
          Thêm học viên <span className="text-red-600">*</span>
        </Typography>
      </div>
      <StudentsContainer seletedItems={selectedStudents} onChange={handleStudentsChange} />
    </div>
  );
};

export default memo(TabAssignmentSettings);
