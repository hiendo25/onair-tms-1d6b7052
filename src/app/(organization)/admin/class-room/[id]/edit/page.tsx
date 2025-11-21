import PageContainer from "@/shared/ui/PageContainer";
import UpdateClassRoomForm from "./_components/UpdateClassRoomForm";
import { getClassRoomById } from "@/repository/class-room";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import dayjs, { Dayjs } from "dayjs";
import { PATHS } from "@/constants/path.contstants";
interface EditClassRoomPageProps {
  params: Promise<{
    id: string;
  }>;
}
export async function generateMetadata(
  { params }: EditClassRoomPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id: classRoomId } = await params;
  const { data } = await getClassRoomById(classRoomId);

  return {
    title: data?.title || "Sửa lớp học",
    description: "Sửa lớp học",
  };
}

export type GetClassRoomByIdData = Awaited<ReturnType<typeof getClassRoomById>>["data"];
const EditClassRoomPage = async ({ params }: EditClassRoomPageProps) => {
  const { id: classRoomId } = await params;
  const { data, error } = await getClassRoomById(classRoomId);

  console.log(data, error);

  if (!data || error) {
    return notFound();
  }

  /**
   * Only allow edit when:
   * 1. if class room has assigned students
   * - edit when class room  upcoming and today
   * 2. if not assigned students
   * - edit when class room  upcoming and on-going, today.
   */
  const { start_at: startDate, end_at: endDate, sessions } = data;
  const isAssignedStudents = Boolean(data.employees.length);
  const isClassRoomEnded = sessions.every(
    (session) => getSessionStatus(dayjs(session.start_at), dayjs(session.end_at)) === "ended",
  );
  const isClassRoomTodayGoing = sessions.some(
    (session) => getSessionStatus(dayjs(session.start_at), dayjs(session.end_at)) === "today",
  );

  const isClassRoomOngoing = sessions.some(
    (session) => getSessionStatus(dayjs(session.start_at), dayjs(session.end_at)) === "ongoing",
  );

  if (isClassRoomEnded) {
    redirect("/admin/class-room");
  }

  return (
    <PageContainer
      title={data.title || "Cập nhật lớp học"}
      breadcrumbs={[
        {
          title: "Quản lý lớp học",
          path: PATHS.CLASSROOMS.ROOT,
        },
        {
          title: "Chỉnh sửa",
          path: "/",
        },
        {
          title: data?.title || "Cập nhật lớp học",
        },
      ]}
    >
      <div className="max-w-[1200px]">
        <UpdateClassRoomForm data={data} />
      </div>
    </PageContainer>
  );
};
export default EditClassRoomPage;

const getSessionStatus = (startDate: Dayjs, endDate: Dayjs) => {
  const now = dayjs();

  const isToday =
    now.isSame(startDate, "day") || // starts today
    (now.isAfter(startDate) && now.isBefore(endDate) && now.isSame(endDate, "day"));

  if (now.isBefore(startDate)) {
    return isToday ? "today" : "upcoming";
  }

  if (now.isAfter(endDate)) {
    return "ended";
  }

  return "ongoing";
};
