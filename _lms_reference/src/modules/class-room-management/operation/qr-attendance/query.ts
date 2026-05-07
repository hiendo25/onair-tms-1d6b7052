import { useTQuery } from "@/lib/queryClient";
import {
  getAttendancesByClassRoom,
  getAttendancesByEmployee,
  getAttendancesBySession,
  getAttendanceStatsByQRCode,
  getQRCodeById,
  getQRCodesByClassRoom,
  getQRCodesBySession,
} from "@/repository/qr-attendance";

import { QR_ATTENDANCE_KEYS } from "./key";

export const useGetQRCodeQuery = (qrCodeId: string | undefined) => {
  return useTQuery({
    queryKey: qrCodeId ? QR_ATTENDANCE_KEYS.qrCodes.byId(qrCodeId) : [],
    queryFn: () => (qrCodeId ? getQRCodeById(qrCodeId) : Promise.resolve({ data: null, error: null })),
    enabled: !!qrCodeId,
  });
};

export const useGetQRCodesByClassRoomQuery = (classRoomId: string | undefined) => {
  return useTQuery({
    queryKey: classRoomId ? QR_ATTENDANCE_KEYS.qrCodes.byClassRoom(classRoomId) : [],
    queryFn: () =>
      classRoomId ? getQRCodesByClassRoom(classRoomId) : Promise.resolve({ data: [], error: null }),
    enabled: !!classRoomId,
  });
};

export const useGetQRCodesBySessionQuery = (sessionId: string | undefined) => {
  return useTQuery({
    queryKey: sessionId ? QR_ATTENDANCE_KEYS.qrCodes.bySession(sessionId) : [],
    queryFn: () =>
      sessionId ? getQRCodesBySession(sessionId) : Promise.resolve({ data: [], error: null }),
    enabled: !!sessionId,
  });
};


export const useGetAttendancesByClassRoomQuery = (classRoomId: string | undefined) => {
  return useTQuery({
    queryKey: classRoomId ? QR_ATTENDANCE_KEYS.attendances.byClassRoom(classRoomId) : [],
    queryFn: () =>
      classRoomId ? getAttendancesByClassRoom(classRoomId) : Promise.resolve({ data: [], error: null }),
    enabled: !!classRoomId,
  });
};

export const useGetAttendancesBySessionQuery = (sessionId: string | undefined) => {
  return useTQuery({
    queryKey: sessionId ? QR_ATTENDANCE_KEYS.attendances.bySession(sessionId) : [],
    queryFn: () =>
      sessionId ? getAttendancesBySession(sessionId) : Promise.resolve({ data: [], error: null }),
    enabled: !!sessionId,
  });
};

export const useGetAttendancesByEmployeeQuery = (employeeId: string | undefined) => {
  return useTQuery({
    queryKey: employeeId ? QR_ATTENDANCE_KEYS.attendances.byEmployee(employeeId) : [],
    queryFn: () =>
      employeeId ? getAttendancesByEmployee(employeeId) : Promise.resolve({ data: [], error: null }),
    enabled: !!employeeId,
  });
};

export const useGetAttendanceStatsQuery = (qrCodeId: string | undefined) => {
  return useTQuery({
    queryKey: qrCodeId ? QR_ATTENDANCE_KEYS.attendances.statsByQRCode(qrCodeId) : [],
    queryFn: () =>
      qrCodeId
        ? getAttendanceStatsByQRCode(qrCodeId)
        : Promise.resolve({
            data: { total: 0, present: 0, late: 0, absent: 0, rejected: 0 },
            error: null,
          }),
    enabled: !!qrCodeId,
  });
};
