"use client";
import React from "react";
import { useRef } from "react";
import { Button, Typography } from "@mui/material";

import CreateChildDepartmentDrawer, {
  CreateChildDepartmentDrawerRef,
} from "@/modules/department/container/CreateChildDepartmentDrawer";
import UpdateChildDepartmentDrawer, {
  UpdateChildDepartmentDrawerProps,
  UpdateChildDepartmentDrawerRef,
} from "@/modules/department/container/UpdateChildDepartmentDrawer";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import TableData from "@/shared/ui/TableData";
interface DepartmentGroupContainerProps {
  departmentId: string;
}
const DepartmentGroupContainer: React.FC<DepartmentGroupContainerProps> = ({ departmentId }) => {
  const createChildDepartmentRef = useRef<CreateChildDepartmentDrawerRef>(null);
  const updateChildDepartmentRef = useRef<UpdateChildDepartmentDrawerRef>(null);

  const handleCreateGroup = () => createChildDepartmentRef.current?.open(departmentId);

  return (
    <div className="section-content flex flex-col gap-6">
      <div className="section-content__header flex justify-between mb-3">
        <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
          Danh sách nhóm
        </Typography>
        <Button size="small" startIcon={<PlusIcon />} onClick={handleCreateGroup}>
          Tạo nhóm
        </Button>
      </div>
      <div className="section-content__body">
        <TableData columns={[]} showRowCount rows={[]} bordered={false} />;
      </div>
      <CreateChildDepartmentDrawer ref={createChildDepartmentRef} />
      <UpdateChildDepartmentDrawer ref={updateChildDepartmentRef} />
    </div>
  );
};
export default DepartmentGroupContainer;
