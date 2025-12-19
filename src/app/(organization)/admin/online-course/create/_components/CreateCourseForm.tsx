"use client";
import { useRef } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import ManageCourseForm, {
  ManageCourseFormProps,
  ManageCourseFormRef,
} from "@/modules/courses/components/ManageCourseForm";
import { useUpsertCourse } from "@/modules/courses/hooks/useUpsertCourse";

const CreateCourseForm = () => {
  const { onCreate, isLoading } = useUpsertCourse();

  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const courseFormRef = useRef<ManageCourseFormRef>(null);
  const handleCancel = () => {
    startTransition(() => {
      router.push(PATHS.COURSES.LIST);
    });
  };

  const handleCreateClassRoom: ManageCourseFormProps["onSubmit"] = (formData) => {
    onCreate(
      { formData },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo môn học thành công", { variant: "success" });
            router.push(PATHS.COURSES.LIST);
          });
        },
      },
    );
  };

  return (
    <ManageCourseForm
      onSubmit={handleCreateClassRoom}
      onCancel={handleCancel}
      ref={courseFormRef}
      isLoading={isLoading || isTransition}
    />
  );
};
export default CreateCourseForm;
