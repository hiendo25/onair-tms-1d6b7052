"use client";
import { Button, Typography } from "@mui/material";

import { useClassRoomStore } from "@/modules/class-room-management/store/class-room-context";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import StudentDataTransfer, { StudentDataTransferProps } from "@/modules/student/container/StudentsDataTransfer";
import { Download01Icon } from "@/shared/assets/icons";

const TabClassRoomSetting = () => {
  const setStudents = useClassRoomStore((state) => state.actions.setSelectedStudents);
  const selectedStudents = useClassRoomStore((state) => state.state.selectedStudents);

  const handleSelect: StudentDataTransferProps["onChange"] = (employees) => {
    const students = employees.map<StudentSelectedItem>((item) => ({
      id: item.id,
      avatar: item.avatar,
      email: item.email,
      employeeType: item.employeeType,
      employeeCode: item.employeeCode,
      fullName: item.fullName,
    }));
    setStudents(students);
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
          Thêm học viên <span className="text-red-600">*</span>
        </Typography>
        <Button variant="outlined" startIcon={<Download01Icon />}>
          Import
        </Button>
      </div>
      <StudentDataTransfer selectedItems={selectedStudents} onChange={handleSelect} />
    </div>
  );
};
export default TabClassRoomSetting;
