"use client";
import { useMemo, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { GetCourseByIdResponse } from "@/repository/courses";
import { PATHS } from "@/constants/path.contstants";
import ManageCourseForm, {
  ManageCourseFormProps,
  ManageCourseFormRef,
} from "@/modules/courses/components/ManageCourseForm";
import { useUpsertCourse } from "@/modules/courses/hooks/useUpsertCourse";
import { getCourseMetaValue } from "@/modules/courses/utils";
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
    const { sections, courses_resources, courses_metadatas } = data;

    const categories = data.courses_categories.reduce<string[]>((acc, item) => {
      const categoryId = item.categories?.id;
      return categoryId ? [...acc, categoryId] : acc;
    }, []);

    const coursedocs = courses_resources.map<UpdateCourseFormvalue["docs"][number]>((cr) => {
      return {
        id: cr.resources.id,
        mimeType: cr.resources.mime_type || "",
        name: cr.resources.name,
        url: cr.resources.path || "",
      };
    });
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
    // const metas = [...courses_metadatas]
    // const benefits = getCourseMetaValue(metas, 'benefits')
    // const faqs = getClassRoomMetaValue(class_room_metadata, "faqs");
    // const galleries = getClassRoomMetaValue(class_room_metadata, "galleries");
    // const whies = getClassRoomMetaValue(class_room_metadata, "why");

    return {
      title: data.title || "",
      slug: data.slug || "",
      description: data.description || "",
      thumbnailUrl: data.thumbnail_url || "",
      categories: categories,
      docs: coursedocs,
      status: data.status,
      courseId: data.id,
      benefits: [],
      sections: courseSections,
    };
  }, [data]);

  const handleCancelUpdate = () => {
    startTransition(() => {
      router.push(PATHS.CLASSROOMS.ROOT);
    });
  };

  const handleUpdateCourse: ManageCourseFormProps["onSubmit"] = (formData, students, teachers) => {
    onUpdate(
      { courseId: data.id, formData, students, teachers },
      {
        onSuccess(data, variables, onMutateResult, context) {
          enqueueSnackbar("Cập nhật lớp học thành công.", { variant: "success" });
          router.refresh();
        },
      },
    );
  };

  return (
    <ManageCourseForm
      initFormValue={initFormValue}
      ref={formRef}
      onSubmit={handleUpdateCourse}
      onCancel={handleCancelUpdate}
      isLoading={isLoading || isTransition}
    />
  );
};
export default UpdateCourseForm;
