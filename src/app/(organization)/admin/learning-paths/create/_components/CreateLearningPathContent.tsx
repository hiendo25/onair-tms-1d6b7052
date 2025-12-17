"use client";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import LearningPathForm from "./LearningPathForm";

export default function CreateLearningPathContent() {
  return (
    <PageContainer
      title="Tạo lộ trình học tập"
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
        { title: "Tạo lộ trình học tập" },
      ]}
    >
      <LearningPathForm mode="create" />
    </PageContainer>
  );
}

