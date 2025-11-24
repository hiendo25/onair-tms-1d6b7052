"use client";
import { Button, IconButton, Typography } from "@mui/material";
import StudentsContainer, { StudentsContainerProps } from "./StudentsContainer";
import { useClassRoomStore } from "@/modules/class-room-management/store/class-room-context";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import QrSetting from "./QrSetting";
import { useClassRoomFormContext } from "../ClassRoomFormContainer";
import { Download01Icon } from "@/shared/assets/icons";

const TabClassRoomSetting = () => {
  const { control, getValues } = useClassRoomFormContext();
  const classRoomPlatform = getValues("platform");

  const setStudents = useClassRoomStore((state) => state.actions.setSelectedStudents);
  const selectedStudents = useClassRoomStore((state) => state.state.selectedStudents);

  const handleSelect: StudentsContainerProps["onChange"] = (employees) => {
    const students = employees.map<StudentSelectedItem>((item) => ({
      id: item.id,
      avatar: item.avatar,
      email: item.email,
      empoyeeType: item.empoyeeType,
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
      {/* {!selectedStudents.length ? (
          <div className="py-2">
            <Typography sx={(theme) => ({ color: theme.palette.error["main"], fontSize: "0.75rem" })}>
              {!selectedStudents.length ? "Chưa chọn học viên" : null}
            </Typography>
          </div>
        ) : null} */}
      <StudentsContainer seletedItems={selectedStudents} onChange={handleSelect} />
    </div>
  );
};
export default TabClassRoomSetting;
