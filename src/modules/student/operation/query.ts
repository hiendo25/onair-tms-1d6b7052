import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { employeeRepository } from "@/repository";
import { GetStudentsQueryParams } from "@/repository/employee";

const useGetStudentsQuery = (queryParams: GetStudentsQueryParams) => {
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_STUDENTS],
    queryFn: () => employeeRepository.getStudents(queryParams),
  });
};
export { useGetStudentsQuery };
