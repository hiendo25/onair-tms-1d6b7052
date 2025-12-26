import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import Link from "next/link";

import type { LearningPathWithDetails } from "@/repository/learning-paths";
import PageContainer from "@/shared/ui/PageContainer";

import LearningScreenSection from "./LearningScreenSection";

interface LearningScreenPageShellProps {
  courseId: string;
  courseTitle: string | null;
  backHref: string;
  breadcrumbs: {
    title: string;
    path?: string;
  }[];
  learningPathData?: LearningPathWithDetails | null;
  learningPathId?: string | null;
}

const LearningScreenPageShell = ({
  courseId,
  courseTitle,
  backHref,
  breadcrumbs,
  learningPathData,
  learningPathId,
}: LearningScreenPageShellProps) => {
  return (
    <PageContainer
      actions={
        <div className="flex items-center gap-2 w-full">
          <Link href={backHref}>
            <IconButton>
              <ArrowBackIcon className="h-6 w-6" />
            </IconButton>
          </Link>
          <p className="text-2xl font-semibold">{courseTitle ?? "--"}</p>
        </div>
      }
      breadcrumbs={breadcrumbs}
    >
      <LearningScreenSection
        courseId={courseId}
        learningPathData={learningPathData}
        learningPathId={learningPathId}
      />
    </PageContainer>
  );
};

export default LearningScreenPageShell;
