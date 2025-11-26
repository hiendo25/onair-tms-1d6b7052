"use client";
import { enqueueSnackbar } from "notistack";

import { UpsertCourseFormData } from "../components/ManageCourseForm/upsert-course.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useTMutation } from "@/lib";
import { QueryClient } from "@tanstack/react-query";

import { UpsertCourseService } from "@/services/course/upsert-course.service";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useQueryClient } from "@tanstack/react-query";

const useUpsertCourse = () => {
  const userInfo = useUserOrganization((state) => state.data);
  const courseService = new UpsertCourseService(userInfo.id, userInfo.organization.id);

  const queryClient = useQueryClient();
  const { mutate: doCreateCourse, isPending } = useTMutation({
    mutationKey: ["CREATE_COURSE"],
    mutationFn: async (payload: { formData: UpsertCourseFormData }) => {
      const { formData } = payload;
      return await courseService.create({ formData });
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });

  const { mutate: doUpdate, isPending: isPendingUpdate } = useTMutation({
    mutationKey: ["UPDATE_COURSE"],
    mutationFn: async (payload: { courseId: string; formData: UpsertCourseFormData }) => {
      const { formData, courseId } = payload;

      return await courseService.update(courseId, { formData });
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });

  return {
    onCreate: doCreateCourse,
    onUpdate: doUpdate,
    isLoading: isPending || isPendingUpdate,
  };
};
export { useUpsertCourse };
