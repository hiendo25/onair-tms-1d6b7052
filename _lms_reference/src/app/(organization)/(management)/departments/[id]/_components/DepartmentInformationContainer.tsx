"use client";
import React, { useRef } from "react";
import { Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import UpdateRootDepartmentDrawer, {
  UpdateRootDepartmentDrawerRef,
} from "@/modules/department/container/UpdateRootDepartmentDrawer";
import { GetDepartmentById } from "@/repository/departments";
import {
  ArchiveIcon,
  CalendarDateIcon,
  CalendarDateIcon2,
  Edit02Icon,
  GitIcon,
  Hash01Icon,
  UserIcon,
} from "@/shared/assets/icons";
interface DepartmentInformationContainerProps {
  name?: string;
  code?: string;
  managedName?: string;
  createdAt?: string;
  updatedAt?: string;
  branchName?: string;
  branchCode?: string;
  status?: "active" | "inactive" | "deleted";
  data: NonNullable<GetDepartmentById>;
}
const DepartmentInformationContainer: React.FC<DepartmentInformationContainerProps> = ({
  name,
  code,
  createdAt,
  managedName,
  branchName,
  updatedAt,
  status,
  data,
}) => {
  const router = useRouter();
  const updateDepartmentRef = useRef<UpdateRootDepartmentDrawerRef>(null);

  const handleUpdateDepartment = () => {
    updateDepartmentRef.current?.open(
      {
        branchId: data.branch_id ?? undefined,
        code: data.code || "",
        id: data.id,
        managedById: data.managed_by ?? undefined,
        name: data.name,
        status: data.status,
      },
      {
        onSuccess(data) {
          router.refresh();
        },
      },
    );
  };
  return (
    <>
      <div className="section-content flex flex-col gap-6">
        <div className="section-content__header flex justify-between mb-3">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
              Thông tin phòng ban
            </Typography>
            <Button
              color="primary"
              variant="text"
              startIcon={<Edit02Icon className="w-4 h-4" />}
              onClick={handleUpdateDepartment}
              size="small"
              disableRipple
              className="hover:bg-transparent"
            >
              Sửa
            </Button>
          </Stack>
        </div>
        <div className="section-content__body">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            <BoxContentItem icon={<ArchiveIcon />} title="Tên phòng ban" content={name} />
            <BoxContentItem icon={<Hash01Icon />} title="Mã phòng ban" content={code} />
            <BoxContentItem icon={<UserIcon />} title="Người quản lý" content={managedName || "-"} />
            <BoxContentItem icon={<GitIcon />} title="Chi nhánh" content={branchName} />
            {/* <BoxContentItem icon={<Users02Icon />} title="Số nhóm" content={"3"} />
            <BoxContentItem icon={<Users02Icon />} title="Số người dùng" content={"30"} /> */}
            <BoxContentItem
              icon={<CalendarDateIcon />}
              title="Ngày tạo"
              content={createdAt ? dayjs(createdAt).format("DD/MM/YYYY HH:mm") : "-"}
            />
            <BoxContentItem
              icon={<CalendarDateIcon2 />}
              title="Ngày cập nhật"
              content={updatedAt ? dayjs(updatedAt).format("DD/MM/YYYY HH:mm") : "-"}
            />
          </div>
          <>
            {status === "active" ? (
              <Chip label="Đang hoạt động" color="success" size="small" />
            ) : status === "inactive" ? (
              <Chip label="Ngừng hoạt động" color="error" size="small" />
            ) : status === "deleted" ? (
              <Chip label="đã xóa" color="error" size="small" />
            ) : null}
          </>
        </div>
      </div>
      <UpdateRootDepartmentDrawer ref={updateDepartmentRef} />
    </>
  );
};
export default DepartmentInformationContainer;

const BoxContentItem = ({
  title,
  content,
  icon,
}: {
  title: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const renderContent = () => {
    if (typeof content === "string") {
      return <Typography sx={{ fontSize: 14 }}>{content}</Typography>;
    }
    return <div>{content}</div>;
  };
  return (
    <Stack direction="row" spacing={2}>
      <div className="icon">{icon}</div>
      <div>
        <Typography sx={{ fontSize: 12 }} color="text.secondary">
          {title}
        </Typography>
        {renderContent()}
      </div>
    </Stack>
  );
};
