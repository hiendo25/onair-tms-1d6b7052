import { PlanStatus } from "@/model/plan.model";

export interface PlanListItem {
  id: string;
  name: string;
  objective: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  status: PlanStatus;
  programsCount: number;
  topicsCount: number;
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
}
