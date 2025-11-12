import PageContainer from "@/shared/ui/PageContainer";
import { Box } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LearningScreenSection from "./_components";

const LearningScreenPage = () => {
    return (
        <PageContainer
            actions={
                <Box>
                    <div className="flex items-center gap-2">
                        <div className="cursor-pointer">
                            <ArrowBackIcon className="w-6 h-6 text-[#636365]" />
                        </div>
                        <p className="font-semibold text-2xl">Khoá học hướng dẫn và chuyển đổi số cùng Ai...</p>
                    </div>
                </Box>
            }
            breadcrumbs={[
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
        </PageContainer>
    );
}

export default LearningScreenPage;