// Shared zod schemas for admin entity forms.
// Validation rules mirror _lms_reference where applicable.
import { z } from "zod";

export const codeSchema = (label: string) =>
  z.string()
    .min(1, `Mã ${label} không bỏ trống.`)
    .min(2, `Mã ${label} từ 2 - 8 ký tự.`)
    .max(8, `Mã ${label} từ 2 - 8 ký tự.`)
    .regex(/^[A-Za-z0-9-]+$/, "Chỉ cho phép chữ không dấu, số và dấu gạch ngang (-), không có khoảng trắng.")
    .transform((v) => v.toUpperCase());

const optStr = z.string().optional().or(z.literal("")).transform((v) => v ?? "");

export const branchSchema = z.object({
  code: codeSchema("chi nhánh"),
  name: z.string().min(1, "Tên chi nhánh không bỏ trống").max(100, "Tên chi nhánh tối đa 100 ký tự"),
  address: optStr,
  phone: optStr,
  manager: optStr,
  status: z.enum(["active", "inactive"]),
});
export type BranchForm = z.infer<typeof branchSchema>;

export const departmentSchema = z.object({
  code: codeSchema("phòng ban"),
  name: z.string().min(1, "Tên phòng ban không bỏ trống").max(100, "Tên phòng ban tối đa 100 ký tự"),
  branch: z.string().min(1, "Không bỏ trống chi nhánh."),
  head: optStr,
  status: z.enum(["active", "inactive"]),
});
export type DepartmentForm = z.infer<typeof departmentSchema>;

export const roleSchema = z.object({
  code: z.string()
    .min(2, "Mã vai trò từ 2 - 32 ký tự.")
    .max(32, "Mã vai trò từ 2 - 32 ký tự.")
    .regex(/^[A-Za-z0-9_-]+$/, "Chỉ cho phép chữ không dấu, số, dấu gạch dưới (_) và gạch ngang (-).")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "Tên vai trò không bỏ trống").max(100, "Tên vai trò tối đa 100 ký tự"),
  description: optStr,
  is_admin: z.boolean(),
  is_instructor: z.boolean(),
  is_student: z.boolean(),
});
export type RoleForm = z.infer<typeof roleSchema>;

const phoneOpt = z.string().optional().refine(
  (v) => !v || /^[0-9]{10,11}$/.test(v),
  { message: "Số điện thoại phải có 10-11 chữ số" },
);

export const employeeSchema = z.object({
  employee_code: optStr,
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên").min(3, "Họ và tên phải có ít nhất 3 ký tự"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  phone: phoneOpt,
  branch: optStr,
  department: z.string().min(1, "Vui lòng chọn phòng ban"),
  role: optStr,
  position: optStr,
  type: z.enum(["fulltime", "parttime", "intern", "contract"]),
  status: z.enum(["active", "inactive"]),
  joined_at: z.string().optional().or(z.literal("")),
});
export type EmployeeForm = z.infer<typeof employeeSchema>;

export const classroomSchema = z.object({
  code: codeSchema("lớp học"),
  title: z.string().min(1, "Tên lớp học không bỏ trống").max(100, "Tên lớp học tối đa 100 ký tự"),
  description: optStr,
  instructor: optStr,
  location: optStr,
  capacity: z.coerce.number().int().min(0, "Phải là số dương"),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  type: z.enum(["offline", "online", "live"]),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
}).refine((d) => !d.start_date || !d.end_date || d.start_date <= d.end_date, {
  message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.", path: ["end_date"],
});
export type ClassroomForm = z.infer<typeof classroomSchema>;

export const courseSchema = z.object({
  code: codeSchema("khoá học"),
  title: z.string().min(1, "Tên môn học không bỏ trống").max(200, "Vui lòng nhập tối đa 200 ký tự"),
  description: z.string().min(1, "Không bỏ trống nội dung."),
  category: z.string().min(1, "Chọn lĩnh vực."),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration_minutes: z.coerce.number().int().min(0, "Phải là số dương"),
  instructor: optStr,
  cover_url: optStr,
  is_required: z.boolean(),
  status: z.enum(["draft", "published", "unpublished"]),
});
export type CourseForm = z.infer<typeof courseSchema>;

export const learningPathSchema = z.object({
  code: codeSchema("lộ trình"),
  title: z.string().min(1, "Tên lộ trình học tập không được bỏ trống.").max(200, "Tên lộ trình học tập tối đa 200 ký tự."),
  description: optStr,
  category: optStr,
  duration_hours: z.coerce.number().int().min(0, "Phải là số dương"),
  cover_url: optStr,
  status: z.enum(["inactive", "active", "locked"]),
});
export type LearningPathForm = z.infer<typeof learningPathSchema>;

export const lpStageSchema = z.object({
  name: z.string().min(1, "Tên giai đoạn không bỏ trống").max(200),
  description: optStr,
  stage_order: z.coerce.number().int().min(0),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
});
export type LpStageForm = z.infer<typeof lpStageSchema>;

export const lpSettingsSchema = z.object({
  sequential_mode: z.boolean(),
  completion_threshold: z.coerce.number().int().min(80).max(100),
  deadline_days: z.coerce.number().int().min(0).optional().nullable(),
  allow_retake: z.boolean(),
});
export type LpSettingsForm = z.infer<typeof lpSettingsSchema>;

export const assignmentSchema = z.object({
  code: codeSchema("bài kiểm tra"),
  title: z.string().min(1, "Tên bài kiểm tra không bỏ trống").max(200),
  description: optStr,
  type: z.enum(["quiz", "exam", "homework", "survey"]),
  total_questions: z.coerce.number().int().min(0),
  deadline: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "closed"]),
});
export type AssignmentForm = z.infer<typeof assignmentSchema>;

export const questionSchema = z.object({
  question: z.string().min(1, "Câu hỏi không được bỏ trống."),
  type: z.enum(["single", "multiple", "true_false", "essay"]),
  category: optStr,
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.coerce.number().min(0.1, "Điểm phải lớn hơn 0."),
  correct_answer: optStr,
  explanation: optStr,
  options: z.array(z.string()).optional(),
});
export type QuestionForm = z.infer<typeof questionSchema>;

export const certificateSchema = z.object({
  code: codeSchema("chứng nhận"),
  title: z.string().min(1, "Tên chứng nhận không bỏ trống").max(200),
  description: optStr,
  valid_months: z.coerce.number().int().min(1, "Tối thiểu 1 tháng"),
  status: z.enum(["active", "inactive"]),
});
export type CertificateForm = z.infer<typeof certificateSchema>;

export const surveySchema = z.object({
  code: codeSchema("khảo sát"),
  title: z.string().min(1, "Tên khảo sát không bỏ trống").max(200),
  description: optStr,
  type: z.enum(["general", "course", "instructor", "satisfaction"]),
  anonymous: z.boolean(),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  target_count: z.coerce.number().int().min(0),
  status: z.enum(["draft", "active", "closed"]),
}).refine((d) => !d.start_date || !d.end_date || d.start_date <= d.end_date, {
  message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.", path: ["end_date"],
});
export type SurveyForm = z.infer<typeof surveySchema>;

export const planSchema = z.object({
  code: codeSchema("kế hoạch"),
  title: z.string().min(1, "Tên kế hoạch không bỏ trống").max(200),
  objective: optStr,
  description: optStr,
  type: z.enum(["training", "onboarding", "compliance", "development"]),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().min(0).default(0),
  target_count: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "pending_survey", "pending", "approved", "rejected"]).default("draft"),
}).refine((d) => !d.start_date || !d.end_date || d.start_date <= d.end_date, {
  message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.", path: ["end_date"],
});
export type PlanForm = z.infer<typeof planSchema>;

export const programSchema = z.object({
  name: z.string().min(1, "Tên chương trình không bỏ trống").max(200),
  description: optStr,
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
}).refine((d) => !d.start_date || !d.end_date || d.start_date <= d.end_date, {
  message: "Ngày kết thúc phải sau ngày bắt đầu.", path: ["end_date"],
});
export type ProgramForm = z.infer<typeof programSchema>;

export const topicSchema = z.object({
  name: z.string().min(1, "Tên chủ đề không bỏ trống").max(200),
  description: optStr,
  program_id: z.string().optional(),
});
export type TopicForm = z.infer<typeof topicSchema>;
