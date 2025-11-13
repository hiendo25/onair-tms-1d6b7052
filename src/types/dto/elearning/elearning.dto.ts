import { Tables } from "@/types/supabase.types";

type ElearningCourseTeacherAssignmentDto = Tables<"courses_teachers"> & {
  teacher?: (Tables<"employees"> & {
    profile?: Pick<
      Tables<"profiles">,
      "id" | "full_name" | "avatar" | "email" | "phone_number"
    > | null;
  }) | null;
};

type ElearningCourseCategoryDto = Tables<"courses_categories"> & {
  category?: Pick<Tables<"categories">, "id" | "name" | "slug"> | null;
};

export type ElearningCourseDto = Tables<"courses"> & {
  teacherAssignments?: ElearningCourseTeacherAssignmentDto[] | null;
  categories?: ElearningCourseCategoryDto[] | null;
  studentCount?: { count: number }[] | null;
};

type ElearningStudentProfileDto = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "email" | "phone_number" | "avatar"
>;

type ElearningStudentEmploymentDto = Tables<"employments"> & {
  organizationUnit?: Pick<
    Tables<"organization_units">,
    "id" | "name" | "type"
  > | null;
};

type ElearningStudentEmployeeDto = Pick<
  Tables<"employees">,
  "id" | "employee_code" | "employee_type" | "status"
> & {
  profile?: ElearningStudentProfileDto | null;
  employments?: ElearningStudentEmploymentDto[];
};

export type ElearningCourseStudentDto = Tables<"courses_students"> & {
  student?: ElearningStudentEmployeeDto | null;
};

export type ElearningAssignedCourseDto = {
  assignmentId: number;
  assignedAt: string;
  courseId: string;
  course?: ElearningCourseDto | null;
};
