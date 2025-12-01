import { PATHS } from "./path.contstants";
import { PermissionsCheck } from "./permission.constant";

type PathWithPermissionsCheck = Record<string, PermissionsCheck>;
/**
 * Empty array for public access
 * Not define for public access
 */
export const PATHS_WITH_PERMISSIONS: PathWithPermissionsCheck = {
  // [PATHS.DASHBOARD]: [],
  [PATHS.CLASSROOMS.ROOT]: [
    {
      $or: "classroom:create",
    },
    {
      $or: "classroom:read",
    },
    {
      $or: "classroom:delete",
    },
    {
      $or: "classroom:update",
    },
  ],
  [PATHS.CLASSROOMS.LIST_CLASSROOM]: [
    {
      $or: "course:read",
    },
  ],
  [PATHS.CLASSROOMS.CREATE_CLASSROOM]: ["classroom:create"],
  [PATHS.COURSES.CREATE]: ["course:create"],
  [PATHS.COURSES.EDIT()]: ["course:update"],
};
