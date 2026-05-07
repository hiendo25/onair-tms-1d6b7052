import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "./org-context";
import { toast } from "sonner";

// ===== Generic factory for org-scoped CRUD =====
type AnyRow = { id: string; org_id: string; [k: string]: unknown };

export function createOrgCrud<TRow extends AnyRow>(table: string, label: string) {
  function useList() {
    const { orgId } = useOrg();
    return useQuery({
      queryKey: [table, orgId],
      queryFn: async () => {
        const { data, error } = await supabase.from(table as never).select("*").eq("org_id", orgId).order("created_at");
        if (error) throw error;
        return (data ?? []) as unknown as TRow[];
      },
    });
  }
  function useMutations() {
    const { orgId } = useOrg();
    const qc = useQueryClient();
    const inv = () => qc.invalidateQueries({ queryKey: [table, orgId] });
    return {
      create: useMutation({
        mutationFn: async (p: Partial<TRow>) => {
          const { error } = await supabase.from(table as never).insert({ ...p, org_id: orgId } as never);
          if (error) throw error;
        },
        onSuccess: () => { inv(); toast.success(`Đã tạo ${label}`); },
        onError: (e: Error) => toast.error(e.message),
      }),
      update: useMutation({
        mutationFn: async ({ id, ...p }: Partial<TRow> & { id: string }) => {
          const { error } = await supabase.from(table as never).update(p as never).eq("id", id);
          if (error) throw error;
        },
        onSuccess: () => { inv(); toast.success("Đã cập nhật"); },
        onError: (e: Error) => toast.error(e.message),
      }),
      remove: useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase.from(table as never).delete().eq("id", id);
          if (error) throw error;
        },
        onSuccess: () => { inv(); toast.success("Đã xoá"); },
        onError: (e: Error) => toast.error(e.message),
      }),
      bulkInsert: useMutation({
        mutationFn: async (rows: Partial<TRow>[]) => {
          const { error } = await supabase.from(table as never).insert(rows.map((r) => ({ ...r, org_id: orgId })) as never);
          if (error) throw error;
        },
        onSuccess: () => inv(),
        onError: (e: Error) => toast.error(e.message),
      }),
    };
  }
  return { useList, useMutations };
}

// ===== Branches =====
export type DBBranch = { id: string; org_id: string; code: string; name: string; address: string; phone: string; manager: string; employees: number; status: string; };
const branchesCrud = createOrgCrud<DBBranch>("branches", "chi nhánh");
export const useBranches = branchesCrud.useList;
export const useBranchMutations = branchesCrud.useMutations;

// ===== Departments =====
export type DBDepartment = { id: string; org_id: string; code: string; name: string; branch: string; head: string; employees: number; status: string; };
const departmentsCrud = createOrgCrud<DBDepartment>("departments", "phòng ban");
export const useDepartments = departmentsCrud.useList;
export const useDepartmentMutations = departmentsCrud.useMutations;

// ===== Roles =====
export type DBRole = { id: string; org_id: string; code: string; name: string; description: string; permissions: number; users: number; is_admin: boolean; is_instructor: boolean; is_student: boolean; };
const rolesCrud = createOrgCrud<DBRole>("org_roles", "vai trò");
export const useRoles = rolesCrud.useList;
export const useRoleMutations = rolesCrud.useMutations;

// ===== Employees =====
export type DBEmployee = { id: string; org_id: string; employee_code: string; name: string; email: string; phone: string; branch: string; department: string; role: string; position: string; type: string; status: string; avatar_url: string; joined_at: string | null; };
const employeesCrud = createOrgCrud<DBEmployee>("employees", "nhân viên");
export const useEmployees = employeesCrud.useList;
export const useEmployeeMutations = employeesCrud.useMutations;

// ===== Online courses =====
export type DBOnlineCourse = { id: string; org_id: string; code: string; title: string; description: string; category: string; level: string; duration_minutes: number; instructor: string; students_count: number; lessons_count: number; status: string; cover_url: string; is_required: boolean; };
const onlineCoursesCrud = createOrgCrud<DBOnlineCourse>("online_courses", "khoá học");
export const useOnlineCourses = onlineCoursesCrud.useList;
export const useOnlineCourseMutations = onlineCoursesCrud.useMutations;

// ===== Classrooms =====
export type DBClassroom = { id: string; org_id: string; code: string; title: string; description: string; instructor: string; location: string; capacity: number; students_count: number; start_date: string | null; end_date: string | null; type: string; status: string; };
const classroomsCrud = createOrgCrud<DBClassroom>("classrooms", "lớp học");
export const useClassrooms = classroomsCrud.useList;
export const useClassroomMutations = classroomsCrud.useMutations;

// ===== Learning paths =====
export type DBLearningPath = { id: string; org_id: string; code: string; title: string; description: string; category: string; courses_count: number; duration_hours: number; students_count: number; status: string; };
const learningPathsCrud = createOrgCrud<DBLearningPath>("learning_paths", "lộ trình");
export const useLearningPaths = learningPathsCrud.useList;
export const useLearningPathMutations = learningPathsCrud.useMutations;

// ===== Assignments =====
export type DBAssignment = { id: string; org_id: string; code: string; title: string; description: string; type: string; deadline: string | null; total_questions: number; assigned_count: number; completed_count: number; status: string; };
const assignmentsCrud = createOrgCrud<DBAssignment>("assignments", "bài tập");
export const useAssignments = assignmentsCrud.useList;
export const useAssignmentMutations = assignmentsCrud.useMutations;

// ===== Question bank =====
export type DBQuestion = { id: string; org_id: string; question: string; type: string; category: string; difficulty: string; options: unknown; correct_answer: string; explanation: string; points: number; tags: string[]; };
const questionsCrud = createOrgCrud<DBQuestion>("question_bank", "câu hỏi");
export const useQuestions = questionsCrud.useList;
export const useQuestionMutations = questionsCrud.useMutations;

// ===== Certificates =====
export type DBCertificate = { id: string; org_id: string; code: string; title: string; description: string; template_url: string; valid_months: number; issued_count: number; status: string; };
const certificatesCrud = createOrgCrud<DBCertificate>("certificates", "chứng chỉ");
export const useCertificates = certificatesCrud.useList;
export const useCertificateMutations = certificatesCrud.useMutations;

// ===== Surveys =====
export type DBSurvey = { id: string; org_id: string; code: string; title: string; description: string; type: string; anonymous: boolean; start_date: string | null; end_date: string | null; responses_count: number; target_count: number; status: string; };
const surveysCrud = createOrgCrud<DBSurvey>("surveys", "khảo sát");
export const useSurveys = surveysCrud.useList;
export const useSurveyMutations = surveysCrud.useMutations;

// ===== Flashcards =====
export type DBFlashcard = { id: string; org_id: string; code: string; title: string; description: string; category: string; cards_count: number; students_count: number; status: string; };
const flashcardsCrud = createOrgCrud<DBFlashcard>("flashcards", "flashcard");
export const useFlashcards = flashcardsCrud.useList;
export const useFlashcardMutations = flashcardsCrud.useMutations;

// ===== Gamifications =====
export type DBGamification = { id: string; org_id: string; code: string; title: string; description: string; type: string; points: number; badge_url: string; condition: string; active: boolean; };
const gamificationsCrud = createOrgCrud<DBGamification>("gamifications", "huy hiệu");
export const useGamifications = gamificationsCrud.useList;
export const useGamificationMutations = gamificationsCrud.useMutations;

// ===== Plans =====
export type DBPlan = { id: string; org_id: string; code: string; title: string; description: string; type: string; start_date: string | null; end_date: string | null; target_count: number; completed_count: number; status: string; };
const plansCrud = createOrgCrud<DBPlan>("plans", "kế hoạch");
export const usePlans = plansCrud.useList;
export const usePlanMutations = plansCrud.useMutations;
