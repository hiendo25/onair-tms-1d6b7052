import { PlanStatus } from "@/model/plan.model";
import { PlanSurveyStatus, PlanSurveyTarget } from "./plan-form.schema";
import { PaginatedResult } from "@/types/dto/pagination.dto";

export interface PlanListItem {
  id: string;
  name: string;
  objective: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  status: PlanStatus;
}

export interface PlanTopicCourse {
  id: string;
  title: string;
}

export interface PlanTopicDetail {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number | null;
  courses: PlanTopicCourse[];
}

export interface PlanProgramDetail {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  orderIndex: number | null;
  courses?: PlanTopicCourse[]; // courses directly under program when no topics
  topics: PlanTopicDetail[];
}

export interface PlanSurveyDetail {
  id: string;
  surveyId: string;
  surveyTitle: string;
  surveyCreatedAt?: string | null;
  startDate: string | null;
  endDate: string | null;
  status: PlanSurveyStatus;
  targetType: PlanSurveyTarget;
  targetUnitIds: string[] | null;
}

export interface PlanDetailDto {
  id: string;
  name: string;
  objective: string | null;
  startDate: string | null;
  createdAt:string | null;
  endDate: string | null;
  budget: number | null;
  status: PlanStatus;
  approver: string | null;
  programsCount: number;
  topicsCount: number;
  coursesCount: number;
  instructorsCount: number;
  programs: PlanProgramDetail[];
  survey?: PlanSurveyDetail | null;
}

export interface PlanListStats {
  total: number;
  approved: number;
  pending: number;
  pending_survey: number;
  rejected: number;
}

export type PlanListResponse = PaginatedResult<PlanListItem> & {
  stats: PlanListStats;
};

export interface PlanDetailCounts {
  programsCount: number;
  topicsCount: number;
  coursesCount: number;
  instructorsCount: number;
}
