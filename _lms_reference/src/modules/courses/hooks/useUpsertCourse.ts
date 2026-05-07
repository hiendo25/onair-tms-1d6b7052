"use client";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { UpsertCourseService } from "@/services/course/upsert-course.service";
import { UpsertCourseFormData } from "../components/ManageCourseForm/upsert-course.schema";

const useUpsertCourse = () => {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);

  const courseService = new UpsertCourseService(currentEmployee.id, currentEmployee.organization.id);

  const queryClient = useQueryClient();

  const { mutate: doCreateCourse, isPending } = useTMutation({
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
