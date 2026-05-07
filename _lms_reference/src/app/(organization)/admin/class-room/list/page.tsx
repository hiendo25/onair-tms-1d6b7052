import { Suspense } from "react";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import ClassRoomTableList from "./_components/ClassRoomTableList";

const ClassRoomList = () => {
  return (
    <PageContainer
      title="Danh sách lớp học"
      breadcrumbs={[
        {
          title: "LMS",
          path: PATHS.DASHBOARD,
        },
        {
          title: "Quản lý lớp học",
          path: PATHS.CLASSROOMS.ROOT,
        },
        {
          title: "Danh sách lớp học",
          path: "",
        },
      ]}
    >
      <ClassRoomTableList />
    </PageContainer>
  );
};

export default ClassRoomList;
