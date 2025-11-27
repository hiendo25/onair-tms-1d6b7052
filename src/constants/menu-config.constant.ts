import {
  ClassIcon,
  ClipboardIcon,
  GitIcon,
  HelpIcon,
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

const ADMIN_MENU_LIST: MenuItemType[] = [
  {
    title: "Dashboard",
    icon: React.createElement(SquareFourIcon),
    key: "dashboard",
    path: PATHS.DASHBOARD,
    type: "item",
  },
  {
    title: "Quản lý tổ chức",
    icon: React.createElement(GitIcon),
    key: "manage-organization",
    path: "/manage-organization",
    type: "item",
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
    key: "manage-class",
    path: PATHS.CLASSROOMS.ROOT,
    type: "item",
    children: [
      {
        title: "Tạo lớp học",
        icon: React.createElement(SquareFourIcon),
        key: "manage-branch",
        path: PATHS.CLASSROOMS.ROOT,
        type: "item",
      },
      {
        title: "Danh sách lớp học",
        icon: React.createElement(SquareFourIcon),
        key: "manage-department",
        path: PATHS.CLASSROOMS.LIST_CLASSROOM,
        type: "item",
      },
      {
        title: "Môn học",
        icon: React.createElement(SquareFourIcon),
        key: "manage-department",
        path: PATHS.COURSES.LIST,
        type: "item",
      },
    ],
  },
  {
    title: "Quản lý bài kiểm tra",
    icon: React.createElement(ClipboardIcon),
    key: "assignments",
    path: PATHS.ASSIGNMENTS.ROOT,
    children: [
      {
        title: "Tạo bài kiểm tra",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/create",
        path: PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT,
      },
      {
        title: "Danh sách bài kiểm tra",
        icon: React.createElement(ClipboardIcon),
        key: "assignments",
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
