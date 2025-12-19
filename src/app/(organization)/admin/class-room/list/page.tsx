import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import ClassRoomContainer from "./_components/ClassRoomContainer";

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
      <ClassRoomContainer />
    </PageContainer>
  );
};

export default ClassRoomList;
