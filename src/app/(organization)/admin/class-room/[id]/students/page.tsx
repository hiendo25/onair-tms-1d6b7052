import { notFound } from "next/navigation";
import PageContainer from "@/shared/ui/PageContainer";
import StudentsSection from "./_components";
import { getClassRoomById } from "@/repository/class-room";

const StudentsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { data: classRoom, error } = await getClassRoomById(id);

    if (!classRoom || error) {
        return notFound();
    }

    const classRoomTitle = classRoom?.title || "Lớp học";
    const pageTitle = `Danh Sách học viên${classRoom?.title ? ` • ${classRoomTitle}` : ""}`;

    return (
        <PageContainer
            title={pageTitle}
            breadcrumbs={[
                {
                    title: "LMS",
                    path: "/dashboard",
                },
                {
                    title: classRoomTitle,
                },
                {
                    title: "Danh Sách học viên",
                },
            ]}
        >
            <StudentsSection classRoomId={id} />
        </PageContainer>
    );
};

export default StudentsPage;
