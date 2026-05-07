"use client";

import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import type { LearningPathFormSchema } from "@/modules/learning-paths/learning-path-form.schema";
import { useCreateLearningPathMutation } from "@/modules/learning-paths/operations/mutation";
import PageContainer from "@/shared/ui/PageContainer";

import LearningPathForm from "./LearningPathForm";

export default function CreateLearningPathContent() {
  const router = useRouter();
  const notifications = useNotifications();
  const { mutateAsync: createLearningPath, isPending } = useCreateLearningPathMutation();

  const handleSubmit = async (data: LearningPathFormSchema) => {
    try {
      const result = await createLearningPath(data);
      notifications.show(result.message || "Tạo lộ trình học tập thành công!", {
        severity: "success",
      });
      router.push(PATHS.LEARNING_PATHS.ROOT);
    } catch (error) {
      // Error is already thrown by mutation, just rethrow it
      throw error;
    }
  };

  return (
    <PageContainer
      title="Tạo lộ trình học tập"
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
        { title: "Tạo lộ trình học tập" },
      ]}
    >
      <LearningPathForm mode="create" onSubmit={handleSubmit} isLoading={isPending} />
    </PageContainer>
  );
}

