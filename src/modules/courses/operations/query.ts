import { useTQuery } from "@/lib";
import { getClassFields } from "@/repository/class-room-field";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { employeeRepository } from "@/repository";
import { EmployeeQueryParams } from "@/repository/employee";

const useGetClassFieldQuery = () => {
  return useTQuery({
    queryFn: getClassFields,
    queryKey: [QUERY_KEYS.GET_CLASS_FIELDS],
  });
};

const useGetEmployeeQuery = (options?: { enabled?: boolean; queryParams?: EmployeeQueryParams }) => {
  const { enabled, queryParams } = options || {};
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
