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
export type DBEmployee = { id: string; org_id: string; employee_code: string; name: string; email: string; phone: string; branch: string; department: string; role: string; position: string; type: string; status: string; avatar_url: string; joined_at: string | null; user_id: string | null; };
const employeesCrud = createOrgCrud<DBEmployee>("employees", "nhân viên");
export const useEmployees = employeesCrud.useList;
export const useEmployeeMutations = employeesCrud.useMutations;

// ===== Online courses =====
export type DBOnlineCourse = { id: string; org_id: string; code: string; title: string; description: string; category: string; level: string; duration_minutes: number; instructor: string; students_count: number; lessons_count: number; status: string; cover_url: string; is_required: boolean; author_id: string | null; author_name: string; created_at: string; };
const onlineCoursesCrud = createOrgCrud<DBOnlineCourse>("online_courses", "khoá học");
export const useOnlineCourses = onlineCoursesCrud.useList;
export const useOnlineCourseMutations = onlineCoursesCrud.useMutations;

export type DBCourseSection = { id: string; org_id: string; course_id: string; title: string; description: string; sort_order: number; status: string; created_at: string; };
export type DBCourseLesson = {
  id: string; org_id: string; course_id: string; section_id: string;
  title: string; description: string; content: string; lesson_type: "video" | "pdf" | "scorm" | "quiz" | "file";
  content_url: string; content_meta: Record<string, unknown>;
  quiz_assignment_id: string | null; duration_seconds: number;
  sort_order: number; status: string; created_at: string;
};
export type DBCourseEnrollment = { id: string; org_id: string; course_id: string; user_id: string; status: "not_started" | "in_progress" | "completed"; progress: number; started_at: string | null; completed_at: string | null; created_at: string; updated_at: string };
export type DBLessonProgress = { id: string; org_id: string; course_id: string; lesson_id: string; user_id: string; status: "not_started" | "in_progress" | "completed"; progress_pct: number; meta: Record<string, unknown>; started_at: string | null; completed_at: string | null; updated_at: string };

// ===== Classrooms =====
export type DBClassroom = {
  id: string; org_id: string; code: string; title: string; description: string;
  instructor: string; location: string; capacity: number; students_count: number;
  start_date: string | null; end_date: string | null; type: string; status: string;
  delivery: "live" | "online" | "offline"; mode: "single" | "series";
  cover_url: string; topics: string[]; objective: string; materials: unknown;
  meeting_provider: string; meeting_url: string; meeting_id: string; meeting_password: string;
  start_at: string | null; end_at: string | null; created_by: string | null;
  created_at: string;
};
const classroomsCrud = createOrgCrud<DBClassroom>("classrooms", "lớp học");
export const useClassrooms = classroomsCrud.useList;
export const useClassroomMutations = classroomsCrud.useMutations;

// ===== Learning paths =====
export type DBLearningPath = {
  id: string; org_id: string; code: string; title: string; description: string;
  category: string; courses_count: number; duration_hours: number; students_count: number;
  status: "inactive" | "active" | "locked";
  cover_url: string; version: number; published_at: string | null; created_by: string | null;
  created_at: string;
};
const learningPathsCrud = createOrgCrud<DBLearningPath>("learning_paths", "lộ trình");
export const useLearningPaths = learningPathsCrud.useList;
export const useLearningPathMutations = learningPathsCrud.useMutations;

export type DBLpStage = { id: string; org_id: string; learning_path_id: string; name: string; description: string; stage_order: number; start_date: string | null; end_date: string | null; created_at: string; updated_at: string };
export type DBLpStageCourse = { id: string; org_id: string; stage_id: string; course_id: string; course_order: number; created_at: string };
export type DBLpStageAssignment = { id: string; org_id: string; stage_id: string; assignment_id: string; unlock_condition: string; required: boolean; created_at: string };
export type DBLpSettings = { id: string; org_id: string; learning_path_id: string; sequential_mode: boolean; completion_threshold: number; deadline_days: number | null; allow_retake: boolean; created_at: string; updated_at: string };
export type DBLpAudience = { id: string; org_id: string; learning_path_id: string; target_type: "all" | "user" | "department" | "branch"; target_id: string | null; assigned_at: string; assigned_by: string | null };
export type DBLpEnrollment = { id: string; org_id: string; learning_path_id: string; user_id: string; enrolled_at: string; started_at: string | null; completed_at: string | null; deadline: string | null; status: "not_started" | "in_progress" | "completed" | "overdue"; progress: number; created_at: string; updated_at: string };
export type DBLpVersion = { id: string; org_id: string; learning_path_id: string; version: number; snapshot: unknown; changed_by: string | null; changed_at: string; change_note: string };
export type DBNotification = { id: string; org_id: string; user_id: string; type: string; title: string; body: string; channel: string; read: boolean; sent_at: string; ref_type: string | null; ref_id: string | null; created_at: string };

function useLpChild<T extends AnyRow>(table: string, learningPathId: string | undefined) {
  return useQuery({
    queryKey: [table, learningPathId],
    enabled: !!learningPathId,
    queryFn: async () => {
      const { data, error } = await supabase.from(table as never).select("*").eq("learning_path_id", learningPathId as string).order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}
function useStageChild<T extends AnyRow>(table: string, stageIds: string[]) {
  return useQuery({
    queryKey: [table, stageIds.join(",")],
    enabled: stageIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from(table as never).select("*").in("stage_id", stageIds);
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

export const useLpStages = (lpId: string | undefined) => {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["learning_path_stages", orgId, lpId],
    enabled: !!lpId,
    queryFn: async () => {
      const { data, error } = await supabase.from("learning_path_stages").select("*").eq("learning_path_id", lpId as string).order("stage_order");
      if (error) throw error;
      return (data ?? []) as unknown as DBLpStage[];
    },
  });
};
export const useLpStageCourses = (stageIds: string[]) => useStageChild<DBLpStageCourse>("learning_path_stage_courses", stageIds);
export const useLpStageAssignments = (stageIds: string[]) => useStageChild<DBLpStageAssignment>("learning_path_stage_assignments", stageIds);
export const useLpSettings = (lpId: string | undefined) => useLpChild<DBLpSettings>("learning_path_settings", lpId);
export const useLpAudience = (lpId: string | undefined) => useLpChild<DBLpAudience>("learning_path_audience", lpId);
export const useLpEnrollments = (lpId: string | undefined) => useLpChild<DBLpEnrollment>("learning_path_enrollments", lpId);
export const useLpVersions = (lpId: string | undefined) => useLpChild<DBLpVersion>("learning_path_versions", lpId);

export function useLpInvalidate() {
  const qc = useQueryClient();
  return (lpId?: string) => {
    qc.invalidateQueries({ queryKey: ["learning_paths"] });
    if (lpId) {
      ["learning_path_stages", "learning_path_settings", "learning_path_audience", "learning_path_enrollments", "learning_path_versions"].forEach(t =>
        qc.invalidateQueries({ queryKey: [t, undefined, lpId] }));
    }
    qc.invalidateQueries(); // simple broad invalidate
  };
}


// ===== Assignments =====
export type DBAssignment = {
  id: string; org_id: string; code: string; title: string; description: string; type: string;
  deadline: string | null; total_questions: number; assigned_count: number; completed_count: number;
  status: string; pass_score: number;
  time_limit_minutes: number | null; max_attempts: number | null;
  shuffle_questions: boolean; shuffle_answers: boolean; show_results: boolean;
  total_points: number; created_by: string | null;
  created_at: string;
};
const assignmentsCrud = createOrgCrud<DBAssignment>("assignments", "bài kiểm tra");
export const useAssignments = assignmentsCrud.useList;
export const useAssignmentMutations = assignmentsCrud.useMutations;

// ===== Question bank =====
export type DBQuestion = {
  id: string; org_id: string; folder_id: string | null;
  title: string; question: string; type: string; category: string; difficulty: string;
  options: string[]; correct_answer: string; correct_answers: string[];
  explanation: string; points: number; tags: string[]; status: string;
  created_at: string;
};
const questionsCrud = createOrgCrud<DBQuestion>("question_bank", "câu hỏi");
export const useQuestions = questionsCrud.useList;
export const useQuestionMutations = questionsCrud.useMutations;

// ===== Question folders =====
export type DBQuestionFolder = { id: string; org_id: string; parent_id: string | null; name: string; created_at: string; updated_at: string };
const qFoldersCrud = createOrgCrud<DBQuestionFolder>("question_folders", "thư mục");
export const useQuestionFolders = qFoldersCrud.useList;
export const useQuestionFolderMutations = qFoldersCrud.useMutations;

// ===== Exam questions (link) =====
export type DBExamQuestion = { id: string; org_id: string; assignment_id: string; question_id: string; sort_order: number; points: number; created_at: string };
const examQCrud = createOrgCrud<DBExamQuestion>("exam_questions", "câu hỏi bài KT");
export const useExamQuestions = examQCrud.useList;
export const useExamQuestionMutations = examQCrud.useMutations;

// ===== Exam assignments (lần gán) =====
export type DBExamAssignment = {
  id: string; org_id: string; exam_id: string;
  exam_snapshot: Record<string, unknown>;
  audience: Array<{ type: string; id: string; label?: string }>;
  student_ids: string[];
  deadline: string | null; status: string; assigned_by: string | null;
  created_at: string; updated_at: string;
};
const examACrud = createOrgCrud<DBExamAssignment>("exam_assignments", "lần gán");
export const useExamAssignments = examACrud.useList;
export const useExamAssignmentMutations = examACrud.useMutations;

// ===== Exam attempts =====
export type DBExamAttempt = {
  id: string; org_id: string; exam_assignment_id: string; user_id: string;
  attempt_number: number; status: "in_progress" | "submitted";
  started_at: string; submitted_at: string | null;
  score: number | null; passed: boolean | null;
  answers: Record<string, string | string[]>;
  created_at: string; updated_at: string;
};
const examAttCrud = createOrgCrud<DBExamAttempt>("exam_attempts", "lần làm bài");
export const useExamAttempts = examAttCrud.useList;
export const useExamAttemptMutations = examAttCrud.useMutations;

// ===== Certificates =====
export type CertificateContent = {
  heading: string;
  awarded_to_label: string;
  description: string;
  issue_date_label: string;
  expire_date_label: string;
};
export type DBCertificate = { id: string; org_id: string; code: string; title: string; description: string; template_url: string; frame_url: string; content: CertificateContent; valid_months: number; issued_count: number; status: string; };
const certificatesCrud = createOrgCrud<DBCertificate>("certificates", "chứng chỉ");
export const useCertificates = certificatesCrud.useList;
export const useCertificateMutations = certificatesCrud.useMutations;

export type DBCertificateFrame = { id: string; org_id: string; name: string; image_url: string; is_default: boolean; };
const certificateFramesCrud = createOrgCrud<DBCertificateFrame>("certificate_frames", "khung chứng nhận");
export const useCertificateFrames = certificateFramesCrud.useList;
export const useCertificateFrameMutations = certificateFramesCrud.useMutations;


// ===== Surveys =====
export type DBSurvey = { id: string; org_id: string; code: string; title: string; description: string; type: string; category: string; version: number; anonymous: boolean; start_date: string | null; end_date: string | null; responses_count: number; target_count: number; status: string; created_by: string | null; created_at: string; };
const surveysCrud = createOrgCrud<DBSurvey>("surveys", "khảo sát");
export const useSurveys = surveysCrud.useList;
export const useSurveyMutations = surveysCrud.useMutations;

// ===== Survey Questions =====
export type DBSurveyQuestion = { id: string; org_id: string; survey_id: string; type: string; content: string; options: unknown; correct_answer: unknown; order_index: number; required: boolean; };
const surveyQuestionsCrud = createOrgCrud<DBSurveyQuestion>("survey_questions", "câu hỏi khảo sát");
export const useSurveyQuestions = surveyQuestionsCrud.useList;
export const useSurveyQuestionMutations = surveyQuestionsCrud.useMutations;

// ===== Survey Assignments =====
export type DBSurveyAssignment = { id: string; org_id: string; survey_id: string; version: number; student_ids: string[]; start_date: string | null; end_date: string | null; status: string; created_at: string; };
const surveyAssignmentsCrud = createOrgCrud<DBSurveyAssignment>("survey_assignments", "lần gán khảo sát");
export const useSurveyAssignments = surveyAssignmentsCrud.useList;
export const useSurveyAssignmentMutations = surveyAssignmentsCrud.useMutations;

// ===== Survey Responses =====
export type DBSurveyResponse = { id: string; org_id: string; survey_id: string; user_id: string | null; assignment_id: string | null; version: number; submitted_at: string; };
const surveyResponsesCrud = createOrgCrud<DBSurveyResponse>("survey_responses", "phản hồi khảo sát");
export const useSurveyResponses = surveyResponsesCrud.useList;
export const useSurveyResponseMutations = surveyResponsesCrud.useMutations;

// ===== Survey Answers =====
export type DBSurveyAnswer = { id: string; org_id: string; response_id: string; question_id: string; value: unknown; };
const surveyAnswersCrud = createOrgCrud<DBSurveyAnswer>("survey_answers", "đáp án khảo sát");
export const useSurveyAnswers = surveyAnswersCrud.useList;
export const useSurveyAnswerMutations = surveyAnswersCrud.useMutations;

// ===== Flashcards =====
export type DBFlashcard = {
  id: string; org_id: string; code: string; name: string; title: string;
  content: string; image_url: string; description: string; category: string;
  cards_count: number; students_count: number; status: string; enabled: boolean;
  created_at: string;
};
const flashcardsCrud = createOrgCrud<DBFlashcard>("flashcards", "flashcard");
export const useFlashcards = flashcardsCrud.useList;
export const useFlashcardMutations = flashcardsCrud.useMutations;

export type DBClassroomFlashcard = { id: string; org_id: string; classroom_id: string; flashcard_id: string; display_order: number; created_at: string; };
export type DBUserFlashcard = {
  id: string; org_id: string; user_id: string; flashcard_id: string; classroom_id: string | null;
  content_snapshot: { name?: string; content?: string; image_url?: string };
  scheduled_at: string; delivered_at: string | null; viewed_at: string | null; created_at: string;
};

// ===== Gamifications =====
export type DBGamification = { id: string; org_id: string; code: string; title: string; description: string; type: string; points: number; badge_url: string; icon: string; condition: string; active: boolean; priority: number; xp_required: number; };
const gamificationsCrud = createOrgCrud<DBGamification>("gamifications", "huy hiệu");
export const useGamifications = gamificationsCrud.useList;
export const useGamificationMutations = gamificationsCrud.useMutations;

export type DBGamificationSettings = {
  id: string; org_id: string; enabled: boolean;
  course_enabled: boolean; course_points: number;
  class_enabled: boolean; class_points: number;
  phase_enabled: boolean; phase_points: number;
  path_enabled: boolean; path_points: number;
  assignment_enabled: boolean; assignment_points: number;
};
export type DBUserBadge = { id: string; org_id: string; user_id: string; badge_id: string; earned_at: string; };
export type DBUserTitle = { id: string; org_id: string; user_id: string; title_id: string; assigned_at: string; };
export type DBUserXp = { id: string; org_id: string; user_id: string; total_xp: number; };

export function useGamificationSettings() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["gamification_settings", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("gamification_settings").select("*").eq("org_id", orgId).maybeSingle();
      if (error) throw error;
      return (data ?? null) as DBGamificationSettings | null;
    },
  });
}

export function useGamificationSettingsMutation() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<DBGamificationSettings>) => {
      const { error } = await supabase.from("gamification_settings").upsert({ ...p, org_id: orgId } as never, { onConflict: "org_id" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gamification_settings", orgId] }); toast.success("Đã lưu cấu hình"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMyXp() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["user_xp_me", orgId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("user_xp").select("*").eq("org_id", orgId).eq("user_id", u.user.id).maybeSingle();
      return (data ?? null) as DBUserXp | null;
    },
  });
}

export function useMyBadges() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["user_badges_me", orgId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase.from("user_badges").select("*").eq("org_id", orgId).eq("user_id", u.user.id);
      return (data ?? []) as DBUserBadge[];
    },
  });
}

export function useMyTitle() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["user_title_me", orgId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("user_titles").select("*").eq("org_id", orgId).eq("user_id", u.user.id).maybeSingle();
      return (data ?? null) as DBUserTitle | null;
    },
  });
}

export function useLeaderboard() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["leaderboard", orgId],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("user_id, total_xp").eq("org_id", orgId).order("total_xp", { ascending: false }).limit(50);
      const rows = (data ?? []) as { user_id: string; total_xp: number }[];
      if (!rows.length) return [];
      const ids = rows.map(r => r.user_id);
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return rows.map((r, i) => ({ rank: i + 1, user_id: r.user_id, total_xp: r.total_xp, profile: map.get(r.user_id) as any }));
    },
  });
}

// ===== Plans =====
export type DBPlan = {
  id: string; org_id: string; code: string; title: string;
  objective: string; description: string; type: string;
  start_date: string | null; end_date: string | null;
  budget: number; target_count: number; completed_count: number;
  status: "draft" | "pending_survey" | "pending" | "approved" | "rejected";
  created_by: string | null; approved_by: string | null;
  rejection_reason: string; created_at: string;
};
const plansCrud = createOrgCrud<DBPlan>("plans", "kế hoạch");
export const usePlans = plansCrud.useList;
export const usePlanMutations = plansCrud.useMutations;
