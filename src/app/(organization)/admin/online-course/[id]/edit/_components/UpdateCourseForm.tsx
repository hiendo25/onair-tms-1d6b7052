"use client";
import React, { useMemo, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import ManageCourseForm, {
  ManageCourseFormProps,
  ManageCourseFormRef,
} from "@/modules/courses/components/ManageCourseForm";
import { useUpsertCourse } from "@/modules/courses/hooks/useUpsertCourse";
import { getCourseMetaValue } from "@/modules/courses/utils";
import { GetCourseByIdResponse } from "@/repository/courses";
interface UpdateCourseFormProps {
  data: Exclude<GetCourseByIdResponse["data"], null>;
}
type UpdateCourseFormvalue = Exclude<ManageCourseFormProps["initFormValue"], undefined>;
type LessonFormValue = UpdateCourseFormvalue["sections"][number]["lessons"][number];
const UpdateCourseForm: React.FC<UpdateCourseFormProps> = ({ data }) => {
  const router = useRouter();
  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const formRef = useRef<ManageCourseFormRef>(null);
  const { isLoading, onUpdate } = useUpsertCourse();

  const initFormValue = useMemo((): UpdateCourseFormvalue => {
    const { sections, courses_metadatas } = data;

    const categories = data.courses_categories.reduce<string[]>((acc, item) => {
      const categoryId = item.categories?.id;
      return categoryId ? [...acc, categoryId] : acc;
    }, []);

    const courseSections = sections.reduce<UpdateCourseFormvalue["sections"]>((acc, session) => {
      const lessons = session.lessons.map<LessonFormValue>(
        ({ id, title, content, assignment_id, main_resource, lesson_type, status, lessons_resources }) => {
          return {
            id: id,
            title: title || "",
            content: content || "",
            assignmentId: assignment_id ?? undefined,
            lessonType: lesson_type,
            mainResource: main_resource
              ? {
                id: main_resource?.id,
                mimeType: main_resource?.mime_type || "",
                name: main_resource?.name || "",
                url: main_resource?.path || "",
              }
              : undefined,
            resources: lessons_resources.map((lr) => ({
              id: lr.resource.id,
              mimeType: lr.resource.mime_type || "",
              name: lr.resource.name,
              url: lr.resource.path || "",
            })),
            status: status,
          };
        },
      );
      return [
        ...acc,
        {
          id: session.id,
          title: session.title || "",
          description: session.description || "",
          thumbnailUrl: "",
          lessons: lessons,
          status: session.status,
        } as UpdateCourseFormvalue["sections"][number],
      ];
    }, []);

    return {
      title: data.title || "",
      slug: data.slug || "",
      description: data.description || "",
      categories: categories,
      // sau này sẽ phải có tính năng lưu nháp riêng
      status: "published",
      id: data.id,
      sections: courseSections,
    };
  }, [data]);

  const handleCancelUpdate = () => {
    startTransition(() => {
      router.push(PATHS.COURSES.LIST);
    });
  };

  const handleUpdateCourse: ManageCourseFormProps["onSubmit"] = (formData) => {
    onUpdate(
      { courseId: data.id, formData },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Cập nhật môn học thành công.", { variant: "success" });
            router.push(PATHS.COURSES.LIST);
          });
        },
      },
    );
  };

  return (
    <ManageCourseForm
      ref={formRef}
      action="edit"
      initFormValue={initFormValue}
      onSubmit={handleUpdateCourse}
      onCancel={handleCancelUpdate}
      isLoading={isLoading || isTransition}
    />
  );
};
export default UpdateCourseForm;
