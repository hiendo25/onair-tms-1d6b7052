import { Checkbox } from "@mui/material";
import React from "react";
import { EmployeeStudentWithProfileItem } from "@/model/employee.model";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
interface CheckAllStudentsProps {
  selectedStudents?: StudentSelectedItem[];
  students?: EmployeeStudentWithProfileItem[];
  onCheckAll: (checked: boolean) => void;
}
const CheckAllStudents: React.FC<CheckAllStudentsProps> = ({ students = [], selectedStudents = [], onCheckAll }) => {
  const isCheckedAllItem = React.useMemo(() => {
    if (!students.length) return false;
    return students.every((selectedItem) => selectedStudents.some((item) => item.id === selectedItem.id));
  }, [selectedStudents, students]);

  const isIndeterminate = React.useMemo(() => {
    if (!students?.length) return false;
    return students.some((item) => selectedStudents.some((it) => it.id === item.id));
  }, [students, selectedStudents]);

  return (
    <Checkbox
      indeterminate={!isCheckedAllItem && isIndeterminate}
      checked={isCheckedAllItem}
      onChange={(evt, checked) => onCheckAll(checked)}
      className="mr-4"
    />
  );
};
export default CheckAllStudents;
