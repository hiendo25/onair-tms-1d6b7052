import { useTQuery } from "@/lib";
import { elearningRepository } from "@/repository";
import { ElearningAssignedCourseDto, ElearningCourseDto, ElearningCourseStudentDto } from "@/types/dto/elearning/elearning.dto";
import { PaginatedResult } from "@/types/dto/pagination.dto";

export interface GetElearningsQueryInput {
    q?: string;
    page?: number;
    limit?: number;
    orderField?: string;
    orderBy?: "asc" | "desc";
    organizationId?: string;
    employeeId?: string;
}

export interface GetElearningStudentsQueryInput {
    courseId: string;
    page?: number;
    limit?: number;
    search?: string;
    branchId?: string;
    departmentId?: string;
}

export interface GetMyElearningCoursesInput {
    studentId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export const useGetElearningQuery = (
    input: GetElearningsQueryInput = {},
    options?: { enabled?: boolean },
) => {
    return useTQuery<PaginatedResult<ElearningCourseDto>>({
        queryKey: ["elearning-courses", input],
        queryFn: () => elearningRepository.getElearnings(input),
        enabled: options?.enabled ?? true,
    });
};


export const useGetTableTest = (
) => {
    return useTQuery({
        queryKey: ["table-test"],
        queryFn: () => elearningRepository.getTableTest(),
    });
};

export const useGetElearningStudentsQuery = (
    input: GetElearningStudentsQueryInput,
) => {
    return useTQuery<PaginatedResult<ElearningCourseStudentDto>>({
        queryKey: ["elearning-course-students", input],
        queryFn: () => elearningRepository.getElearningCourseStudents(input),
        enabled: Boolean(input?.courseId),
    });
};

export const useGetMyElearningCoursesQuery = (
    input: GetMyElearningCoursesInput,
    options?: { enabled?: boolean },
) => {
    return useTQuery<PaginatedResult<ElearningAssignedCourseDto>>({
        queryKey: ["my-elearning-courses", input],
        queryFn: () => elearningRepository.getMyElearningCourses(input),
        enabled: (options?.enabled ?? true) && Boolean(input?.studentId),
    });
};
