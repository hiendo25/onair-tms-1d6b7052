"use client";
import React, { useRef } from "react";
import { Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import UpdateBranchDrawer, { UpdateBranchDrawerRef } from "@/modules/branch/container/UpdateBranchDrawer";
import { GetBranchById } from "@/repository/branch";
import {
  ArchiveIcon,
  CalendarDateIcon,
  CalendarDateIcon2,
  Edit02Icon,
  Hash01Icon,
  UserIcon,
} from "@/shared/assets/icons";
interface BranchInformationContainerProps {
  name?: string;
  code?: string;
  address?: string;
  managedName?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "inactive" | "deleted";
  data: NonNullable<GetBranchById>;
}
const BranchInformationContainer: React.FC<BranchInformationContainerProps> = ({
  name,
  code,
  createdAt,
  managedName,
  updatedAt,
  status,
  data,
}) => {
  const router = useRouter();
  const updateBranchDrawerRef = useRef<UpdateBranchDrawerRef>(null);

  const handleUpdateDepartment = () => {
    updateBranchDrawerRef.current?.open(
      {
        id: data.id,
        code: data.code || "",
        managedById: data.managed_by ?? undefined,
        name: data.name,
        status: data.status,
        address: data.address,
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
              Thông tin chi nhánh
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
            <BoxContentItem icon={<ArchiveIcon />} title="Tên chi nhánh" content={name} />
            <BoxContentItem icon={<Hash01Icon />} title="Mã chi nhánh" content={code} />
            <BoxContentItem icon={<UserIcon />} title="Người quản lý" content={managedName || "-"} />

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
      <UpdateBranchDrawer ref={updateBranchDrawerRef} />
    </>
  );
};
export default BranchInformationContainer;

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
