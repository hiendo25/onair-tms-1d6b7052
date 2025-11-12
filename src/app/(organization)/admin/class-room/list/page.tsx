import PageContainer from "@/shared/ui/PageContainer";
import ClassRoomContainer from "./_components/ClassRoomContainer";


const ClassRoomList = () => {
  return (
    <PageContainer
      title="Danh sách lớp học"
      breadcrumbs={[
        {
          title: "LMS",
          path: "/dashboard/",
        },
        {
          title: "Quản lý lớp học",
          path: "/class-room"
        },
        {
          title: "Danh sách lớp học",
          path: "/class-room/list"
        },
      ]}
    >
      <ClassRoomContainer />
    </PageContainer>
  )
};

export default ClassRoomList;
