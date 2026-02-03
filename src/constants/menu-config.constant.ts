import React from "react";
import RouteIcon from "@mui/icons-material/Route";

import {
  BookOpenIcon,
  CertificateIcon,
  ClipboardIcon,
  FileAttachmentIcon,
  FlashcardIcon,
  FolderShieldIcon,
  GitIcon,
  LearningPathIcon,
  MonitorIcon,
  PieChart2Icon,
  Star01Icon,
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
    icon: React.createElement(PieChart2Icon),
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
      // {
      //   title: "Tạo bài kiểm tra",
      //   icon: React.createElement(ClipboardIcon),
      //   key: "assignments/create",
      //   path: PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT,
      //   persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments/create"],
      // },
      {
        title: "Ngân hàng câu hỏi",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/question-bank",
        path: PATHS.ASSIGNMENTS.QUESTION_BANK,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments/question-bank"],
      },
      {
        title: "Ngân hàng bài kiểm tra",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/list",
        path: PATHS.ASSIGNMENTS.ROOT,
      },
      {
        title: "Bài kiểm tra đã gán",
        icon: React.createElement(ClipboardIcon),
        key: "assignments/assigned",
        path: PATHS.ASSIGNMENTS.ASSIGNED_LIST,
        persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments/assigned"],
      },

      // {
      //   title: "Tạo câu hỏi",
      //   icon: React.createElement(ClipboardIcon),
      //   key: "assignments/question-bank/create",
      //   path: PATHS.ASSIGNMENTS.CREATE_QUESTION_BANK,
      //   persCheck: PATHS_WITH_PERMISSIONS["/admin/assignments/question-bank/create"],
      // },
    ],
  },

  {
    title: "Quản lý chứng nhận",
    icon: React.createElement(CertificateIcon),
    key: "certificates",
    path: PATHS.CERTIFICATES.ROOT,
    persCheck: [],
    children: [
      {
        title: "Danh sách chứng nhận",
        key: "certificates/list",
        path: PATHS.CERTIFICATES.ROOT,
        type: "item",
      },
      {
        title: "Tạo chứng nhận",
        key: "certificates/create",
        path: PATHS.CERTIFICATES.CREATE,
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
    title: "Flashcard",
    icon: React.createElement(FlashcardIcon),
    key: "flashcards",
    path: PATHS.FLASHCARDS.ROOT,
    persCheck: [],
    children: [
      {
        title: "Danh sách Flashcard",
        key: "flashcards/list",
        path: PATHS.FLASHCARDS.ROOT,
        type: "item",
      },
      {
        title: "Tạo Flashcard",
        key: "flashcards/create",
        path: PATHS.FLASHCARDS.CREATE,
        type: "item",
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
    title: "Tổng quan",
    icon: React.createElement(ClipboardIcon),
    key: "",
    path: "gg",
    persCheck: [],
    nonAction: true,
  },
  {
    title: "Lộ trình",
    icon: React.createElement(BookOpenIcon),
    key: "my-learning-paths",
    path: PATHS.MY_LEARNING_PATHS.ROOT,
    persCheck: [],
  },
  {
    title: "Lớp học",
    icon: React.createElement(UsersIcon2),
    key: "my-class",
    path: PATHS.STUDENTS.ROOT,
    persCheck: [],
  },
  {
    title: "Bài kiểm tra",
    icon: React.createElement(ClipboardIcon),
    key: "my-assignments",
    path: PATHS.MY_ASSIGNMENTS.ROOT,
    persCheck: [],
  },
  {
    title: "Thử viện",
    icon: React.createElement(Star01Icon),
    key: "my-gamification",
    path: PATHS.MY_GAMIFICATION.ROOT,
    persCheck: [],
    children: [
      {
        title: "Chứng nhận",
        key: "my-gamification",
        path: PATHS.MY_GAMIFICATION.ROOT,
        type: "item",
      },
      {
        title: "FlashCard",
        key: "",
        path: "gg",
        type: "item",
        nonAction: true,
      },
      {
        title: "Mục yêu thich",
        key: "",
        path: "gg",
        type: "item",
        nonAction: true,
      },

    ],
  },
];

export { ADMIN_MENU_LIST, STUDENTS_MENU_LIST };
