"use client";
import { enqueueSnackbar } from "notistack";
import { UpsertCourseFormData } from "../components/ManageCourseForm/upsert-course.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useTMutation } from "@/lib";
import { UpsertCourseService } from "@/services/course/upsert-course.service";

const useUpsertCourse = () => {
  const { organization, id: userId } = useUserOrganization((state) => state.data);

  const upsertCourseService = new UpsertCourseService(userId, organization.id);
  const { mutate: doCreateCourse, isPending } = useTMutation({
    mutationKey: ["CREATE_COURSE"],
    mutationFn: async (payload: { formData: UpsertCourseFormData }) => {
      const { formData } = payload;
      const courseData = await upsertCourseService.create({ formData });
      return courseData;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  const { mutate: doUpdate, isPending: isPendingUpdate } = useTMutation({
    mutationKey: ["UPDATE_COURSE"],
    mutationFn: async (payload: { courseId: string; formData: UpsertCourseFormData }) => {
      const { courseId, formData } = payload;
      const courseData = await upsertCourseService.update(courseId, {
        formData,
      });
      return courseData;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  return {
    onCreate: doCreateCourse,
    onUpdate: doUpdate,
    isLoading: isPending || isPendingUpdate,
  };
};
export { useUpsertCourse };
