import { useTQuery } from "@/lib";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { coursesRepository } from "@/repository";
import { GetCoursesQueryParams } from "@/repository/courses";

export const useGetCourseListQuery = (options?: { queryParams: GetCoursesQueryParams; enabled?: boolean }) => {
  const { queryParams, enabled = true } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_COURSES, queryParams],
    queryFn: () => coursesRepository.getCourses(queryParams),
    enabled: enabled,
  });
};
