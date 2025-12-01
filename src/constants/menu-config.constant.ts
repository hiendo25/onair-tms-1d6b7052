import {
  ClassIcon,
  ClipboardIcon,
  GitIcon,
  SquareFourIcon,
  UsersIcon,
  MonitorIcon,
  BookOpenIcon,
  UsersIcon2,
  BarChart10Icon,
} from "@/shared/assets/icons";
import { MenuItemType } from "@/shared/ui/layouts/MainLayout/MenuList/type";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import React from "react";
import { PATHS } from "./path.contstants";
import { PermissionsCheck } from "./permission.constant";
import { PATHS_WITH_PERMISSIONS } from "./path-with-permissions";

type PermissionValue = (typeof PATHS_WITH_PERMISSIONS)[keyof typeof PATHS_WITH_PERMISSIONS];

type AddPermissionCheck<T> = T extends { children?: infer C }
  ? Omit<T, "children"> & {
      persCheck?: PermissionValue;
      children?: C extends Array<infer Item> ? AddPermissionCheck<Item>[] : never;
    }
  : T & { persCheck?: PermissionValue };

type MenuItemTypeWithPer = AddPermissionCheck<MenuItemType>;
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
    key: "manage-organization",
    path: "/manage-organization",
    persCheck: PATHS_WITH_PERMISSIONS["/admin/employees/create"],
    children: [
      {
        title: "Quản lý Chi nhánh",
        key: "manage-branch",
        path: PATHS.BRANCHES.ROOT,
        type: "item",
      },
      {
        title: "Quản lý Phòng ban",
        key: "manage-department",
        path: PATHS.DEPARTMENTS.ROOT,
        type: "item",
      },
      {
        title: "Quản lý người dùng",
        key: "manage-employee",
        path: PATHS.EMPLOYEES.ROOT,
        type: "item",
      },
      {
        title: "Vai trò & phân quyền",
        key: "manage-employee",
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
        path: PATHS.CLASSROOMS.ROOT,
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
        key: "manage-course",
        path: PATHS.COURSES.LIST,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/online-course/create"],
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
    icon: React.createElement(StickyNote2OutlinedIcon),
    key: "plans",
    path: PATHS.PLANS.ROOT,
    children: [
      {
        title: "Danh sách kế hoạch",
        icon: React.createElement(ClipboardIcon),
        key: "plans",
        path: PATHS.PLANS.ROOT,
      },
      {
        title: "Tạo kế hoạch",
        icon: React.createElement(ClipboardIcon),
        key: "plans/create",
        path: PATHS.PLANS.CREATE,
      },
      {
        title: "Khảo sát kế hoạch",
        icon: React.createElement(ClipboardIcon),
        key: "plans/surveys",
        path: PATHS.SURVEYS.ROOT,
      },
    ],
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

const STUDENTS_MENU_LIST: MenuItemType[] = [
  {
    title: "Bài kiểm tra của tôi",
    icon: React.createElement(ClipboardIcon),
    key: "my-assignments",
    path: PATHS.MY_ASSIGNMENTS.ROOT,
    type: "item",
  },
  {
    title: "Lớp học của tôi",
    icon: React.createElement(UsersIcon2),
    key: "my-class",
    path: PATHS.STUDENTS.ROOT,
  },
];

export { ADMIN_MENU_LIST, STUDENTS_MENU_LIST };
