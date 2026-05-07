"use client";
import React from "react";
import { useRef } from "react";
import { Button, Typography } from "@mui/material";

import CreateDepartmentGroupDrawer, {
  CreateDepartmentGroupDrawerRef,
} from "@/modules/department/container/CreateDepartmentGroupDrawer";
import UpdateDepartmentGroupDrawer, {
  UpdateDepartmentGroupDrawerRef,
} from "@/modules/department/container/UpdateDepartmentGroupDrawer";
import { useGetDepartmentGroupsQuery } from "@/modules/department/operations/query";
import { Edit02Icon, EyeIcon } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import TableData from "@/shared/ui/TableData";

import { DepartmentGroupRecord, groupColumns } from "./groupColumns";
interface DepartmentGroupContainerProps {
  departmentId: string;
}
const DepartmentGroupContainer: React.FC<DepartmentGroupContainerProps> = ({ departmentId }) => {
  const createDepartmentGroupRef = useRef<CreateDepartmentGroupDrawerRef>(null);
  const updateDepartmentGroupRef = useRef<UpdateDepartmentGroupDrawerRef>(null);

  const { data, isPending } = useGetDepartmentGroupsQuery({
    queryParams: {
      departmentId,
    },
  });

  const handleCreateGroup = () => createDepartmentGroupRef.current?.open(departmentId);

  const handleEditGroup = (record: DepartmentGroupRecord) => () => {
    updateDepartmentGroupRef.current?.open({
      id: record.id,
      code: record.code || "",
      managedById: record.managedBy?.id,
      name: record.name,
      status: record.status,
    });
  };
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
        <TableData
          loading={isPending}
          columns={groupColumns}
          showRowCount
          rows={data?.items || []}
          bordered={false}
          slots={{
            menuActions(row, index) {
              return [
                {
                  action: handleEditGroup(row),
                  iconButton: <Edit02Icon className="w-4 h-4" />,
                  altText: "Chỉnh sửa",
                },
              ];
            },
          }}
          pagination={{
            total: data?.count || 0,
          }}
        />
      </div>
      <CreateDepartmentGroupDrawer ref={createDepartmentGroupRef} />
      <UpdateDepartmentGroupDrawer ref={updateDepartmentGroupRef} />
    </div>
  );
};
export default DepartmentGroupContainer;
