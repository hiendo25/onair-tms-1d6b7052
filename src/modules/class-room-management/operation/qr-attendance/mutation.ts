import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/api";
import { HttpError } from "@/lib/errors/HttpError";
import { useTMutation } from "@/lib/queryClient";
import { CreateEmployeeAttendanceResponse } from "@/repository/class-room";
import {
  activateQRCode,
  type AttendanceCheckInPayload,
  checkInWithQR,
  createClassQRCode,
  type CreateQRCodePayload,
  deactivateQRCode,
  deleteQRCode,
  updateQRCode,
  type UpdateQRCodePayload,
} from "@/repository/qr-attendance";
import {
  StudentClassRoomCheckedInResponse,
  StudentClassRoomCheckInDto,
} from "@/types/dto/classRooms/student-check-in-classroom.dto";

import { QR_ATTENDANCE_KEYS } from "./key";

export const useCreateQRCodeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: (payload: CreateQRCodePayload) => createClassQRCode(payload),
    onSuccess: (result, variables) => {
      if (result.data) {
        // Invalidate queries liên quan
        if (variables.class_room_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.byClassRoom(variables.class_room_id),
          });
        }
        if (variables.class_session_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.bySession(variables.class_session_id),
          });
        }
      }
    },
  });
};

export const useActivateQRCodeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: (qrCodeId: string) => activateQRCode(qrCodeId),
    onSuccess: (result) => {
      if (result.data) {
        // Invalidate detail query
        queryClient.invalidateQueries({
          queryKey: QR_ATTENDANCE_KEYS.qrCodes.byId(result.data.id),
        });

        // Invalidate list queries
        if (result.data.class_room_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.byClassRoom(result.data.class_room_id),
          });
        }
        if (result.data.class_session_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.bySession(result.data.class_session_id),
          });
        }
      }
    },
  });
};

export const useDeactivateQRCodeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: (qrCodeId: string) => deactivateQRCode(qrCodeId),
    onSuccess: (result) => {
      if (result.data) {
        // Invalidate detail query
        queryClient.invalidateQueries({
          queryKey: QR_ATTENDANCE_KEYS.qrCodes.byId(result.data.id),
        });

        // Invalidate list queries
        if (result.data.class_room_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.byClassRoom(result.data.class_room_id),
          });
        }
        if (result.data.class_session_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.bySession(result.data.class_session_id),
          });
        }
      }
    },
  });
};

export const useUpdateQRCodeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: ({ qrCodeId, updates }: { qrCodeId: string; updates: UpdateQRCodePayload }) =>
      updateQRCode(qrCodeId, updates),
    onSuccess: (result) => {
      if (result.data) {
        // Invalidate detail query
        queryClient.invalidateQueries({
          queryKey: QR_ATTENDANCE_KEYS.qrCodes.byId(result.data.id),
        });

        // Invalidate list queries
        if (result.data.class_room_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.byClassRoom(result.data.class_room_id),
          });
        }
        if (result.data.class_session_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.qrCodes.bySession(result.data.class_session_id),
          });
        }
      }
    },
  });
};

export const useDeleteQRCodeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: (qrCodeId: string) => deleteQRCode(qrCodeId),
    onSuccess: () => {
      // Invalidate all QR code queries
      queryClient.invalidateQueries({
        queryKey: QR_ATTENDANCE_KEYS.qrCodes.all,
      });
    },
  });
};

export const useCheckInWithQRMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: (payload: AttendanceCheckInPayload) => checkInWithQR(payload),
    onSuccess: (result) => {
      if (result.success && result.attendance) {
        // Invalidate attendance queries
        if (result.attendance.class_room_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.attendances.byClassRoom(result.attendance.class_room_id),
          });
        }
        if (result.attendance.class_session_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.attendances.bySession(result.attendance.class_session_id),
          });
        }
        if (result.attendance.employee_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.attendances.byEmployee(result.attendance.employee_id),
          });
        }
        if (result.attendance.qr_code_id) {
          queryClient.invalidateQueries({
            queryKey: QR_ATTENDANCE_KEYS.attendances.statsByQRCode(result.attendance.qr_code_id),
          });
        }
      }
    },
  });
};

export const useStudentClassRoomCheckInWithQRMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation<StudentClassRoomCheckedInResponse, HttpError, StudentClassRoomCheckInDto>({
    mutationFn: (input) => client.post("/check-in", input),
    onSuccess: (result) => {
      //  queryClient.invalidateQueries({
      //       queryKey: QR_ATTENDANCE_KEYS.attendances.statsByQRCode(result?.attendance.qr_code_id),
      //     });
      // if (result.success && result.attendance) {
      //   // Invalidate attendance queries
      //   if (result.attendance.class_room_id) {
      //     queryClient.invalidateQueries({
      //       queryKey: QR_ATTENDANCE_KEYS.attendances.byClassRoom(result.attendance.class_room_id),
      //     });
      //   }
      //   if (result.attendance.class_session_id) {
      //     queryClient.invalidateQueries({
      //       queryKey: QR_ATTENDANCE_KEYS.attendances.bySession(result.attendance.class_session_id),
      //     });
      //   }
      //   if (result.attendance.employee_id) {
      //     queryClient.invalidateQueries({
      //       queryKey: QR_ATTENDANCE_KEYS.attendances.byEmployee(result.attendance.employee_id),
      //     });
      //   }
      //   if (result.attendance.qr_code_id) {
      //   }
      // }
    },
  });
};
