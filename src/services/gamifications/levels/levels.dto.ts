import { Level } from "@/model/level.model";

export interface BaseLevelResult {
  id: string;
  title: string;
  createdAt: string;
  description: string | null;
  author: {
    id: string;
    fullName: string;
  };
  icon: string | null;
  organization: { id: string; name: string };
  scoreRequired: number;
  status: "inactive" | "active" | "deleted";
  updatedAt: string | null;
}
/**
 * Create Level
 */
export interface CreateLevelInput {
  title: string;
  description: string;
  icon: string;
  organizationId: string;
  authorId: string;
  scoreRequired: number;
}
export interface CreateLevelResult extends BaseLevelResult {}

/**
 * Update Level
 */
export interface UpdateLevelInput {
  id: string;
  title: string;
  description: string;
  icon: string;
  organizationId: string;
  scoreRequired: number;
}
export interface UpdateLevelResult extends BaseLevelResult {}

/**
 * Toggle Status Level
 */
export interface UpdateLevelStatusInput {
  status: Level["status"];
  id: string;
}
export interface UpdateLevelStatusResult extends BaseLevelResult {}

/**
 * Get Levels
 */

export interface GetLevelsInput {
  page?: number;
  pageSize?: number;
  organizationId: string;
  authorId?: string;
}
interface LevelItemType extends BaseLevelResult {}

export interface GetLevelsResult {
  data: LevelItemType[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeleteLevelResult extends BaseLevelResult {}
