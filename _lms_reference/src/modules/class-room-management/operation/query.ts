import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { employeeRepository } from "@/repository";
import { getClassFields } from "@/repository/class-room-field";
import { GetStudentsQueryParams } from "@/repository/employee";

const useGetClassFieldQuery = () => {
  return useTQuery({
    queryFn: getClassFields,
    queryKey: [QUERY_KEYS.GET_CLASS_FIELDS],
  });
};

const useGetEmployeeQuery = (options: { enabled?: boolean; queryParams: GetStudentsQueryParams }) => {
  const { enabled, queryParams } = options;
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_STUDENTS, queryParams],
    queryFn: () => employeeRepository.getStudents(queryParams),
    enabled,
  });
};
export default useGetEmployeeQuery;

export { useGetClassFieldQuery };

export {
  useGetQRCodeQuery,
  useGetQRCodesByClassRoomQuery,
  useGetQRCodesBySessionQuery,
  useGetAttendancesByClassRoomQuery,
  useGetAttendancesBySessionQuery,
  useGetAttendancesByEmployeeQuery,
  useGetAttendanceStatsQuery,
} from "./qr-attendance/query";
