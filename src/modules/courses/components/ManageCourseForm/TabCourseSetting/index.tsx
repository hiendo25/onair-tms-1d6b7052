"use client";
import { Box, Typography } from "@mui/material";
import StudentsContainer, { StudentsContainerProps } from "./StudentsContainer";
import { useUpsertCourseStore } from "@/modules/courses/store/upsert-course-context";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import QrSetting from "./QrSetting";
import { useUpsertCourseFormContext } from "../UpsertCourseFormContainer";

const TabClassRoomSetting = () => {
  const setStudents = useUpsertCourseStore((state) => state.actions.setSelectedStudents);
  const selectedStudents = useUpsertCourseStore((state) => state.state.selectedStudents);

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
    <div className="flex flex-col gap-6">
      <Box component="div" className="bg-white p-6 rounded-xl hidden">
        <div className="mb-6 flex flex-col gap-2">
          <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Thiết lập thời gian hiệu lực cho môn học <span className="text-red-600">*</span>
          </Typography>
          <div>
            <Typography variant="body2">
              Môn chỉ hoạt động trong khoảng thời gian được thiết lập. Sau khi hết hạn, người học sẽ không thể truy cập.
            </Typography>
            <Typography variant="body2">Nếu không chọn hệ thống mặc định môn học được mở vĩnh viễn.</Typography>
          </div>
        </div>
        <QrSetting />
      </Box>
      <Box component="div" className="bg-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Thêm học viên <span className="text-red-600">*</span>
          </Typography>
        </div>
        <StudentsContainer seletedItems={selectedStudents} onChange={handleSelect} />
      </Box>
    </div>
  );
};
export default TabClassRoomSetting;
