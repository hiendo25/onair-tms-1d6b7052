"use client";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useTransition } from "react";
import ManageCourseForm, {
  ManageCourseFormProps,
  ManageCourseFormRef,
} from "@/modules/courses/components/ManageCourseForm";
import { useUpsertCourse } from "@/modules/courses/hooks/useUpsertCourse";
import { PATHS } from "@/constants/path.contstants";

const CreateCourseForm = () => {
  const { onCreate, isLoading } = useUpsertCourse();

  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const courseFormRef = useRef<ManageCourseFormRef>(null);
  const handleCancel = () => {
    router.push("/admin/class-room");
  };

  const handleCreateClassRoom: ManageCourseFormProps["onSubmit"] = (formData, students, teachers) => {
    onCreate(
      { formData, students, teachers },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo môn học thành công", { variant: "success" });
            router.push(PATHS.CLASSROOMS.ROOT);
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
