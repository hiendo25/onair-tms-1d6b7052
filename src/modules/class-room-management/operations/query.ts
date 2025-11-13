import {
  ClassRoomRuntimeStatusFilter,
  ClassRoomStatusFilter,
  ClassRoomTypeFilter,
  ClassSessionModeFilter,
} from "@/app/(organization)/admin/class-room/list/types/types";
import { useTQuery } from "@/lib/queryClient";
import { classRoomRepository } from "@/repository";
import {
  ClassRoomPriorityDto,
  ClassRoomSessionDetailDto,
  ClassRoomStatusCountDto,
  ClassRoomStudentDto,
} from "@/types/dto/classRooms/classRoom.dto";
import { PaginatedResult } from "@/types/dto/pagination.dto";

export interface GetClassRoomsQueryInput {
  q?: string;
  from?: string | null;
  to?: string | null;
  type?: ClassRoomTypeFilter;
  sessionMode?: ClassSessionModeFilter;
  runtimeStatus?: ClassRoomRuntimeStatusFilter;
  status?: ClassRoomStatusFilter;
  page?: number;
  limit?: number;
  organizationId?: string;
  employeeId?: string;
  orderField?: string;
  orderBy?: "asc" | "desc";
}

export interface GetAssignedClassRoomsQueryInput extends GetClassRoomsQueryInput {
  userId: string;
}

export interface GetClassRoomStatusCountsInput {
  employeeId?: string;
  q?: string;
  from?: string | null;
  to?: string | null;
  status?: ClassRoomStatusFilter;
  type?: ClassRoomTypeFilter;
  sessionMode?: ClassSessionModeFilter;
}

export interface GetClassRoomStudentsQueryInput {
  classRoomId: string;
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  departmentId?: string;
  attendanceStatus?: "attended" | "absent" | "pending";
}

export const useGetClassRoomQuery = (slug: string) => {
  return useTQuery({
    queryKey: ["class-room-detail", slug],
    queryFn: () => classRoomRepository.getClassRoomBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useGetClassRoomsPriorityQuery = (input: GetClassRoomsQueryInput = {}) => {
  return useTQuery<PaginatedResult<ClassRoomPriorityDto>>({
    queryKey: ["class-rooms-priority", input],
    queryFn: () => classRoomRepository.getClassRooms(input),
    enabled: Boolean(input.organizationId ?? input.employeeId),
  });
};

export const useCountStatusClassRoomsQuery = (input: GetClassRoomStatusCountsInput) => {
  return useTQuery<ClassRoomStatusCountDto[]>({
    queryKey: ["class_room_status_counts", input],
    queryFn: () => classRoomRepository.getClassRoomStatusCounts(input),
    enabled: Boolean(input.employeeId),
  });
};

export const useGetClassRoomStudentsQuery = (input: GetClassRoomStudentsQueryInput) => {
  return useTQuery<PaginatedResult<ClassRoomStudentDto>>({
    queryKey: ["class-room-students", input],
    queryFn: () => classRoomRepository.getClassRoomStudents(input),
    enabled: Boolean(input?.classRoomId),
  });
};

type GetClassRoomsByEmployeeIdQueryInput = Omit<GetClassRoomsQueryInput, "organizationId"> & {
  employeeId?: string;
};

export const useGetClassRoomsByEmployeeId = (input: GetClassRoomsByEmployeeIdQueryInput) => {
  return useTQuery<PaginatedResult<ClassRoomPriorityDto>>({
    queryKey: ["class-room-assign", input],
    queryFn: () =>
      classRoomRepository.getClassRoomsByEmployeeId({
        ...input,
        employeeId: input.employeeId!,
      }),
    enabled: Boolean(input.employeeId),
  });
};

export const useGetClassRoomSessionDetailQuery = (input: { sessionId?: string }) => {
  const { sessionId } = input;

  return useTQuery<ClassRoomSessionDetailDto | null>({
    queryKey: ["class-room-session", sessionId],
    queryFn: () =>
      classRoomRepository.getClassRoomSessionDetail({
        sessionId: sessionId!,
      }),
    enabled: Boolean(sessionId),
  });
};
