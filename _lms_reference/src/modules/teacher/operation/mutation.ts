import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { teacherRepository } from "@/repository";
import { GetTeacherQueryParams } from "@/repository/teacher";

const useGetTeachersQuery = (options?: { enabled?: boolean; queryParams?: GetTeacherQueryParams }) => {
  const { enabled, queryParams } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_TEACHERS, queryParams],
    queryFn: () => teacherRepository.getTeacherList(queryParams),
    enabled,
  });
};
export { useGetTeachersQuery };
