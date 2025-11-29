export type User = { roles: Role[]; id: string };

const ROLES = {
  admin: ["view:comments", "create:comments", "update:comments", "delete:comments"],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments", "view:posts"],
} as const;

type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];
type PermissionCheck = Permission | Permission[];

export function hasOnePermission(user: User, permission: Permission) {
  return user.roles.some((role) => (ROLES[role] as readonly Permission[]).includes(permission));
}

export function hasPermissions(user: User, permission: Permission | Permission[]) {
  if (Array.isArray(permission)) {
    return permission.some((per) => hasOnePermission(user, per));
  }
  return hasOnePermission(user, permission);
}

// USAGE:
const user: User = { id: "1", roles: ["user"] };

// Can create a comment
hasPermissions(user, ["create:comments", "delete:comments"]);

// Can view all comments
hasPermissions(user, "view:comments");

type PerAction = "create" | "update" | "view";
type Resource = "classRoom" | "comment";

type BuildPermissions<A extends string, R extends string> = `${A}:${R}`;
type Permissions = BuildPermissions<PerAction, Resource>;
