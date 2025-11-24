import { useTQuery } from "@/lib";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { coursesRepository } from "@/repository";
import { PaginatedResult } from "@/types/dto/pagination.dto";
import { CourseDto } from "@/types/dto/courses/course.dto";
import { GetCoursesListMinimalQueryParams, GetCoursesQueryParams } from "@/repository/courses";
export interface GetCoursesQueryInput {
  q?: string;
  page?: number;
  limit?: number;
  orderField?: string;
  orderBy?: "asc" | "desc";
  organizationId?: string;
  employeeId?: string;
}

export const useGetCourseListQuery = (input: GetCoursesQueryInput = {}, options?: { enabled?: boolean }) => {
  return useTQuery<PaginatedResult<CourseDto>>({
    queryKey: [QUERY_KEYS.GET_COURSES, input],
    queryFn: () => coursesRepository.getCourses(input),
    enabled: options?.enabled ?? true,
  });
};

export const useGetCourseListQueryV2 = (options?: { enabled?: boolean; queryParams: GetCoursesQueryParams }) => {
  const { enabled = true, queryParams } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_COURSES, queryParams],
    queryFn: () => coursesRepository.getCoursesV2(queryParams),
    enabled: enabled,
  });
};

export const useGetCourseListMinimalQuery = (options?: {
  queryParams: GetCoursesListMinimalQueryParams;
  enabled?: boolean;
}) => {
  const { queryParams, enabled = true } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_COURSES_MINIMAL, queryParams],
    queryFn: () => coursesRepository.getCoursesListMinimal(queryParams),
    enabled: enabled,
  });
};
