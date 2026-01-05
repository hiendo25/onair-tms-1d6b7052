import React from "react";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

import {
  BarChart10Icon,
  BookOpenIcon,
  ClassIcon,
  ClipboardIcon,
  FileAttachmentIcon,
  FolderShieldIcon,
  GitIcon,
  MonitorIcon,
  SquareFourIcon,
  Star01Icon,
  UsersIcon,
  UsersIcon2,
} from "@/shared/assets/icons";
import { MenuItemType } from "@/shared/ui/layouts/MainLayout/MenuList/type";

import { PATHS } from "./path.constant";
import { PATHS_WITH_PERMISSIONS } from "./path-with-permissions.constant";
import { PermissionsCheck } from "./permission.constant";

type PermissionValue = (typeof PATHS_WITH_PERMISSIONS)[keyof typeof PATHS_WITH_PERMISSIONS];

type AddPermissionCheck<T> = T extends { children?: infer C }
  ? Omit<T, "children"> & {
      persCheck?: PermissionValue;
      children?: C extends Array<infer Item> ? AddPermissionCheck<Item>[] : never;
    }
  : T & { persCheck?: PermissionValue };

export type MenuItemTypeWithPer = AddPermissionCheck<MenuItemType>;

const ADMIN_MENU_LIST: MenuItemTypeWithPer[] = [
  {
    title: "Dashboard",
    icon: React.createElement(SquareFourIcon),
    key: "dashboard",
    path: PATHS.DASHBOARD,
    persCheck: PATHS_WITH_PERMISSIONS["/dashboard"],
  },
  {
    title: "Quản lý tổ chức",
    icon: React.createElement(GitIcon),
    key: "manage-org",
    path: "/manage-organization",
    persCheck: PATHS_WITH_PERMISSIONS["/admin/employees/create"],
    children: [
      {
        title: "Quản lý Chi nhánh",
        key: "manage-org/branch",
        path: PATHS.BRANCHES.ROOT,
        type: "item",
      },
      {
        title: "Quản lý Phòng ban",
        key: "manage-org/department",
        path: PATHS.DEPARTMENTS.ROOT,
        type: "item",
      },
      {
        title: "Quản lý người dùng",
        key: "manage-org/employees",
        path: PATHS.EMPLOYEES.ROOT,
        type: "item",
      },
      {
        title: "Vai trò & phân quyền",
        key: "manage-org/role",
        path: PATHS.ROLE.ROOT,
        type: "item",
      },
    ],
  },
  {
    title: "Quản lý lớp học",
    icon: React.createElement(MonitorIcon),
    key: "class-room",
    path: PATHS.CLASSROOMS.ROOT,
    persCheck: PATHS_WITH_PERMISSIONS["/admin/class-room"],
    children: [
      {
        title: "Tạo lớp học",
        key: "class-room/create",
        path: PATHS.CLASSROOMS.CREATE_CLASSROOM,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/class-room/create"],
        type: "item",
      },
      {
        title: "Danh sách lớp học",
        key: "class-room/list",
        path: PATHS.CLASSROOMS.LIST_CLASSROOM,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/class-room"],
        type: "item",
      },
      {
        title: "Môn học",
        key: "class-room/online-course",
        path: PATHS.COURSES.ROOT,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/online-course"],
        type: "item",
      },
    ],
  },
  {
    title: "Quản lý bài kiểm tra",
    icon: React.createElement(ClipboardIcon),
    key: "assignments",
    path: PATHS.ASSIGNMENTS.ROOT,
    persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments"],
    children: [
      {
        title: "Tạo bài kiểm tra",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/create",
        path: PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments/create"],
      },
      {
        title: "Danh sách bài kiểm tra",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/list",
        path: PATHS.ASSIGNMENTS.ROOT,
      },
    ],
  },
  {
    title: "Kế hoạch đào tạo",
    icon: React.createElement(FolderShieldIcon),
    key: "plans",
    path: PATHS.PLANS.ROOT,
    persCheck: PATHS_WITH_PERMISSIONS["/admin/plans"],
    children: [
      {
        title: "Danh sách kế hoạch",
        icon: React.createElement(ClipboardIcon),
        key: "plans/list",
        path: PATHS.PLANS.ROOT,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/plans"],
      },
      {
        title: "Tạo kế hoạch",
        icon: React.createElement(ClipboardIcon),
        key: "plans/create",
        path: PATHS.PLANS.CREATE,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/plans/create"],
      },
      // {
      //   title: "Khảo sát kế hoạch",
      //   icon: React.createElement(ClipboardIcon),
      //   key: "plans/surveys",
      //   path: PATHS.SURVEYS.ROOT,
      // },
    ],
  },
  {
    title: "Lộ trình học tập",
    icon: React.createElement(BookOpenIcon),
    key: "learning-paths",
    path: PATHS.LEARNING_PATHS.ROOT,
    persCheck: [],
    children: [
      {
        title: "Danh sách lộ trình",
        key: "learning-paths/list",
        path: PATHS.LEARNING_PATHS.ROOT,
        type: "item",
      },
      {
        title: "Tạo lộ trình",
        key: "learning-paths/create",
        path: PATHS.LEARNING_PATHS.CREATE,
        type: "item",
      },
    ],
  },
  {
    title: "Khảo sát",
    icon: React.createElement(FileAttachmentIcon),
    key: "surveys",
    path: PATHS.SURVEYS.ROOT,
    children: [
      {
        title: "Danh sách khảo sát",
        key: "surveys/list",
        path: PATHS.SURVEYS.LIST,
      },
      {
        title: "Tạo khảo sát",
        key: "surveys/create",
        path: PATHS.SURVEYS.CREATE,
      },
    ],
  },
  {
    title: "Gamification",
    icon: React.createElement(Star01Icon),
    key: "gamifications",
    path: PATHS.GAMIFICATIONS.ROOT,
    persCheck: [],
    type: "item",
  },
  // {
  //   title: "Báo cáo",
  //   icon: React.createElement(BarChart10Icon),
  //   key: "manage-report",
  //   path: PATHS.REPORTS.ROOT,
  //   type: "item",
  //   children: [
  //     {
  //       title: "Báo cáo tổng quan",
  //       key: "report-overview",
  //       path: PATHS.REPORTS.OVER_VIEW,
  //       type: "item",
  //     },
  //   ],
  // },
];

const STUDENTS_MENU_LIST: MenuItemTypeWithPer[] = [
  {
    title: "Bài kiểm tra của tôi",
    icon: React.createElement(ClipboardIcon),
    key: "my-assignments",
    path: PATHS.MY_ASSIGNMENTS.ROOT,
    persCheck: [],
  },
  {
    title: "Lớp học của tôi",
    icon: React.createElement(UsersIcon2),
    key: "my-class",
    path: PATHS.STUDENTS.ROOT,
    persCheck: [],
  },
];

export { ADMIN_MENU_LIST, STUDENTS_MENU_LIST };
