/**
 * Centralized Gamification Types
 * All gamification-related interfaces and types should be defined here
 *
 * Convention:
 * - Repository layer (DB): snake_case - matches database schema
 * - Service/API layer: camelCase - transformed for frontend use
 * - Component layer: uses service layer types (camelCase)
 */

// ============================================
// Level Types (Service/API Layer - camelCase)
// ============================================

export interface LevelInfo {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  scoreRequired: number;
}

export interface NextLevelInfo extends LevelInfo {
  xpNeeded: number;
}

// ============================================
// XP & Employee Gamification Types (Service/API Layer - camelCase)
// ============================================

export interface EmployeeGamificationXpResult {
  currentXp: number;
  currentLevelId: string | null;
  currentLevel: LevelInfo | null;
  nextLevel: NextLevelInfo | null;
}

// ============================================
// Ranking Types (Service/API Layer - camelCase)
// ============================================

export interface DepartmentRankingEmployee {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  avatar: string | null;
  departmentId: string;
  departmentName: string;
  currentXp: number;
  maxPossibleXp: number;
  completionPercentage: number;
  level: {
    id: string | null;
    title: string | null;
    icon: string | null;
    scoreRequired: number | null;
  };
  rank: number;
}

export interface DepartmentRankingResult {
  employees: DepartmentRankingEmployee[];
  total: number;
  page: number;
  limit: number;
  departmentId: string;
}

export interface GetDepartmentRankingParams {
  departmentId: string;
  page?: number;
  limit?: number;
}

// ============================================
// Repository Layer Types (DB Layer - snake_case)
// ============================================

export interface DepartmentRankingEmployeeDb {
  employee_id: string;
  organization_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  avatar: string | null;
  department_id: string;
  department_name: string;
  current_xp: number;
  max_possible_xp: number;
  completion_percentage: number;
  level_id: string | null;
  level_title: string | null;
  level_icon: string | null;
  level_score_required: number | null;
  department_rank: number;
}

export interface GetDepartmentRankingParamsDb {
  departmentId: string;
  organizationId: string;
  page?: number;
  limit?: number;
}

export interface GetDepartmentRankingResultDb {
  data: DepartmentRankingEmployeeDb[];
  total: number;
  page: number;
  limit: number;
}
