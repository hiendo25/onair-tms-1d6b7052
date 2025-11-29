import { PATHS } from "./path.contstants";
import { ResourcePermission } from "./permission.constant";

type PathWithPermissions = Record<string, ResourcePermission> & {
  // Support for dynamic paths using functions
  [key: string]: ResourcePermission | ((params?: any) => ResourcePermission);
};

/**
 * Empty array for public access
 * Not define for public access
 */
export const PATHS_WITH_PERMISSIONS: PathWithPermissions = {
  [PATHS.DASHBOARD]: [],
  [PATHS.CLASSROOMS.ROOT]: [
    {
      $or: [
        { resource: "classroom", action: "read" },
        { resource: "classroom", action: "delete" },
        { resource: "classroom", action: "create" },
        { resource: "classroom", action: "update" },
      ],
    },
  ],
  [PATHS.CLASSROOMS.LIST_CLASSROOM]: [
    {
      $or: [{ resource: "classroom", action: "read" }],
    },
  ],
  [PATHS.CLASSROOMS.CREATE_CLASSROOM]: [{ resource: "classroom", action: "create" }],
  [PATHS.COURSES.CREATE]: [{ resource: "course", action: "create" }],
  // For dynamic paths, you can use a function
  "/admin/online-course/:id/edit": [{ resource: "course", action: "update" }],
  //  "/admin/online-course/:id/edit": () => [{ resource: "course", action: "update" }],
  // Or if EDIT_CLASSROOM is a function that returns a path:
  // You can define it as a pattern matcher
};
