import React from "react";
import { Button, Chip, Stack, Typography } from "@mui/material";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import dayjs from "@/lib/dayjs";
import { departmentsRepository } from "@/repository";
import { CalendarDateIcon2 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentGroupContainer from "./_components/DepartmentGroup";
import EmployeeTableData from "./_components/EmployeesTableData";
interface DepartmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, any>>;
}

export async function generateMetadata(
  { params, searchParams }: DepartmentDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý phòng ban",
    description: "Quản lý phòng ban",
  };
}

export default async function DepartmentDetailPage({ params }: DepartmentDetailPageProps) {
  const { id } = await params;

  const departmentDetail = await departmentsRepository.getDepartmentById(id);

  if (!departmentDetail) {
    notFound();
  }
  const breadcrumbs = [{ title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT }, { title: departmentDetail.name }];

  return (
    <PageContainer title={departmentDetail.name} breadcrumbs={breadcrumbs}>
      <div className="section-content flex flex-col gap-6">
        <div className="section-content__header flex justify-between mb-3">
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
            Thông tin phòng ban
          </Typography>
          <Stack direction="row" gap={2}>
            <Button size="small" color="warning">
              Kích hoạt
            </Button>
            <Button size="small">Chỉnh sửa</Button>
          </Stack>
        </div>
        <div className="section-content__body">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <BoxContentItem icon={<CalendarDateIcon2 />} title="Tên phòng ban" content={departmentDetail.name} />
            <BoxContentItem icon={<CalendarDateIcon2 />} title="Mã phòng ban" content={departmentDetail.code} />
            <BoxContentItem
              icon={<CalendarDateIcon2 />}
              title="Người quản lý"
              content={departmentDetail.managedBy?.profiles?.full_name || "-"}
            />
            <BoxContentItem icon={<CalendarDateIcon2 />} title="Chi nhánh" content={departmentDetail.branch?.name} />
            <BoxContentItem icon={<CalendarDateIcon2 />} title="Số nhóm" content={"3"} />
            <BoxContentItem icon={<CalendarDateIcon2 />} title="Số người dùng" content={"30"} />
            <BoxContentItem
              icon={<CalendarDateIcon2 />}
              title="Ngày tạo"
              content={dayjs(departmentDetail.created_at).format("DD/MM/YYYY HH:mm")}
            />
            <BoxContentItem
              icon={<CalendarDateIcon2 />}
              title="Ngày cập nhật"
              content={departmentDetail.updated_at || "-"}
            />
            <BoxContentItem
              icon={<CalendarDateIcon2 />}
              title="Trạng thái"
              content={
                departmentDetail.status === "active" ? (
                  <Chip label="Đang hoạt động" color="success" size="small" />
                ) : null
              }
            />
          </div>
        </div>
      </div>
      <div className="line my-6 bg-gray-200 h-px"></div>
      <div className="section-content flex flex-col gap-6">
        <div className="section-content__header flex justify-between mb-3">
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
            Danh sách nhóm
          </Typography>
          <Button size="small" startIcon={<PlusIcon />}>
            Tạo hóm
          </Button>
        </div>
        <div className="section-content__body">
          <DepartmentGroupContainer />
        </div>
      </div>
      <div className="line my-6 bg-gray-200 h-px"></div>
      <div className="section-content flex flex-col gap-6">
        <div className="section-content__header flex justify-between mb-3">
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
            Danh sách người dùng
          </Typography>
        </div>
        <div className="section-content__body">
          <EmployeeTableData departmentId={departmentDetail.id} />
        </div>
      </div>
    </PageContainer>
  );
}

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
