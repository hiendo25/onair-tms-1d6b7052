import { useTMutation } from "@/lib";
import { classRoomRepository } from "@/repository";
import chunk from "lodash/chunk";

const DELETE_BATCH_SIZE = 500;
const DELETE_BATCH_CONCURRENCY = 3;

export const useDeleteClassRoomMutation = () => {
    return useTMutation({
        mutationFn: (classRoomId: string) => classRoomRepository.deleteClassRoomById(classRoomId),
    });
};

export const useDeleteUserInClassRoomMutation = () => {
    return useTMutation({
        mutationFn: async (payload: { class_room_id: string, employeeIds: string[] }) => {
            const { class_room_id, employeeIds } = payload;
            const validIds = (employeeIds ?? []).filter(Boolean);

            if (validIds.length === 0) {
                return;
            }

            const uniqueIds = Array.from(new Set(validIds));

            const batches = chunk(uniqueIds, DELETE_BATCH_SIZE);

            for (let i = 0; i < batches.length; i += DELETE_BATCH_CONCURRENCY) {
                const parallelBatches = batches.slice(i, i + DELETE_BATCH_CONCURRENCY);
                await Promise.all(
                    parallelBatches.map((batch) =>
                        classRoomRepository.deletePivotClassRoomAndEmployeeByEmployeeId({
                            class_room_id,
                            employeeIds: batch,
                        }),
                    ),
                );
            }
        },
    });
};

export type MarkAttendancePayload = {
    classSessionId: string;
    classRoomId: string;
    employeeId: string,
    attendance_method: "qr" | "manual" | "online_auto"
    attendance_mode: "offline" | "online"
};

export const useMarkAttendanceMutation = () => {
    return useTMutation({
        mutationFn: (payload: MarkAttendancePayload) => classRoomRepository.markAttendance(payload),
    });
};


type ExportStudentsAttendance = "attended" | "absent" | "pending";

export interface ExportStudentsMutationInput {
    classRoomId: string;
    search?: string;
    branchId?: string;
    departmentId?: string;
    attendanceStatus?: ExportStudentsAttendance;
}

const buildExportParams = (input: ExportStudentsMutationInput) => {
    const params = new URLSearchParams();
    params.set("classRoomId", input.classRoomId);

    if (input.search) {
        params.set("search", input.search);
    }

    if (input.branchId) {
        params.set("branchId", input.branchId);
    }

    if (input.departmentId) {
        params.set("departmentId", input.departmentId);
    }

    if (input.attendanceStatus) {
        params.set("attendanceStatus", input.attendanceStatus);
    }

    return params.toString();
};

export const useExportStudentsMutation = () => {
    return useTMutation({
        mutationFn: async (input: ExportStudentsMutationInput) => {
            const params = buildExportParams(input);
            const response = await fetch(`/api/class-room/students/export?${params}`);

            if (!response.ok) {
                let message = "Xuất danh sách học viên thất bại. Vui lòng thử lại.";

                try {
                    const errorPayload = await response.json();
                    if (errorPayload?.error) {
                        message = errorPayload.error;
                    }
                } catch {
                    // Keep default message when response body is not JSON.
                }

                const error = new Error(message);
                (error as Error & { severity?: "info" | "error" }).severity =
                    response.status === 404 ? "info" : "error";
                throw error;
            }

            const disposition = response.headers.get("Content-Disposition") ?? "";
            const matchedFileName = disposition.match(/filename="(.+)"/);
            const fileName = matchedFileName?.[1] ?? "danh_sach_hoc_vien.xlsx";

            const blob = await response.blob();

            return {
                blob,
                fileName,
            };
        },
    });
};
