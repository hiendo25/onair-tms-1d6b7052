import PageContainer from "@/shared/ui/PageContainer";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearningScreenSection from "./_components";
import { createSVClient } from "@/services";

interface ILearningScreenPage {
    params: Promise<{
        courseId: string;
    }>;
}

const LearningScreenPage = async ({ params }: ILearningScreenPage) => {
    const { courseId } = await params;

    const supabase = await createSVClient();
    const { data: courseDetail, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .single();

    if (error || !courseDetail) {
        notFound();
    }

    return (
        <PageContainer
            actions={
                <div className="flex items-center gap-2 w-full">
                    <Link href="/">
                        <IconButton>
                            <ArrowBackIcon className="h-6 w-6" />
                        </IconButton>
                    </Link>
                    <p className="text-2xl font-semibold">{courseDetail.title ?? "--"}</p>
                </div>
            }
            breadcrumbs={
                [
                    {
                        title: "LMS",
                        path: "/dashboard",
                    },
                    {
                        title: "Lớp học của tôi",
                    },
                ]}
        >
            <LearningScreenSection />
        </PageContainer >
    );
};

export default LearningScreenPage;
