import { PATHS } from "./path.contstants";
import { PermissionsCheck } from "./permission.constant";

// Utility type to extract all nested string values from PATHS object
type DeepPathValues<T> = T extends string
  ? T
  : T extends (...args: any[]) => infer R
  ? R
  : T extends object
  ? { [K in keyof T]: DeepPathValues<T[K]> }[keyof T]
  : never;

type AllPathValues = DeepPathValues<typeof PATHS>;

type PathWithPermissionsCheck = Partial<Record<AllPathValues, PermissionsCheck>>;
/**
 * Empty array for public access
 * Not define for public access
 */
export const PATHS_WITH_PERMISSIONS = {
  [PATHS.DASHBOARD]: [],
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
  [PATHS.COURSES.ROOT]: [
    {
      $or: "course:read",
    },
    {
      $or: "course:read",
    },
    {
      $or: "course:delete",
    },
    {
      $or: "course:update",
    },
  ],
  [PATHS.COURSES.STUDENTS()]: ["course:update"],
  [PATHS.COURSES.EDIT()]: ["course:update"],
  [PATHS.EMPLOYEES.CREATE_EMPLOYEE]: ["employee:create"],
  [PATHS.ASSIGNMENTS.ROOT]: [
    {
      $or: "assignment:create",
    },
    {
      $or: "assignment:read",
    },
    {
      $or: "assignment:delete",
    },
    {
      $or: "assignment:update",
    },
  ],
  [PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT]: ["assignment:create"],
  [PATHS.ASSIGNMENTS.EDIT_ASSIGNMENT()]: ["assignment:update"],
  [PATHS.ROLE.ROOT]: [
    {
      $or: "role:update",
    },
    {
      $or: "role:read",
    },
    {
      $or: "role:create",
    },
    {
      $or: "role:delete",
    },
  ],
  [PATHS.ROLE.ROLES_ID()]: ["role:update"],
  [PATHS.ROLE.CREATE]: ["role:create"],
} as const satisfies PathWithPermissionsCheck;
