import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  BookOpen,
  Monitor,
  ClipboardList,
  Award,
  FileText,
  Layers,
  Star,
  GraduationCap,
  Users,
  Trophy,
  Library,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  title: string;
  key: string;
  path?: string;
  icon?: LucideIcon;
  children?: MenuItem[];
};

export const ADMIN_MENU: MenuItem[] = [
  { title: "Dashboard", key: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    title: "Quản lý tổ chức",
    key: "manage-org",
    icon: Building2,
    children: [
      { title: "Chi nhánh", key: "branches", path: "/branches" },
      { title: "Phòng ban", key: "departments", path: "/departments" },
      { title: "Người dùng", key: "employees", path: "/admin/employees" },
      { title: "Vai trò & phân quyền", key: "roles", path: "/admin/roles" },
    ],
  },
  {
    title: "Kế hoạch đào tạo",
    key: "plans",
    icon: FolderKanban,
    children: [
      { title: "Danh sách kế hoạch", key: "plans-list", path: "/admin/plans" },
      { title: "Tạo kế hoạch", key: "plans-create", path: "/admin/plans/create" },
    ],
  },
  {
    title: "Lộ trình học tập",
    key: "learning-paths",
    icon: BookOpen,
    children: [
      { title: "Danh sách lộ trình", key: "lp-list", path: "/admin/learning-paths" },
      { title: "Tạo lộ trình", key: "lp-create", path: "/admin/learning-paths/create" },
    ],
  },
  {
    title: "Quản lý lớp học",
    key: "class-room",
    icon: Monitor,
    children: [
      { title: "Danh sách lớp học", key: "cr-list", path: "/admin/class-room" },
      { title: "Tạo lớp học", key: "cr-create", path: "/admin/class-room/create" },
      { title: "Môn học", key: "courses", path: "/admin/online-course" },
    ],
  },
  {
    title: "Quản lý bài kiểm tra",
    key: "assignments",
    icon: ClipboardList,
    children: [
      { title: "Ngân hàng câu hỏi", key: "qb", path: "/admin/assignments/question-bank" },
      { title: "Ngân hàng bài KT", key: "as-list", path: "/admin/assignments" },
      { title: "Bài KT đã gán", key: "as-assigned", path: "/admin/assignments/assigned" },
    ],
  },
  {
    title: "Quản lý chứng nhận",
    key: "certificates",
    icon: Award,
    children: [
      { title: "Danh sách", key: "cert-list", path: "/admin/certificates" },
      { title: "Tạo chứng nhận", key: "cert-create", path: "/admin/certificates/create" },
    ],
  },
  {
    title: "Khảo sát",
    key: "surveys",
    icon: FileText,
    children: [
      { title: "Danh sách", key: "sv-list", path: "/admin/surveys" },
      { title: "Tạo khảo sát", key: "sv-create", path: "/admin/surveys/create" },
    ],
  },
  {
    title: "Flashcard",
    key: "flashcards",
    icon: Layers,
    children: [
      { title: "Danh sách", key: "fc-list", path: "/admin/flashcards" },
      { title: "Tạo Flashcard", key: "fc-create", path: "/admin/flashcards/create" },
    ],
  },
  { title: "Gamification", key: "gamifications", path: "/admin/gamifications", icon: Star },
  { title: "Báo cáo", key: "analytic", path: "/analytic", icon: BarChart3 },
];

export const STUDENT_MENU: MenuItem[] = [
  { title: "Tổng quan", key: "s-dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Lộ trình", key: "my-lp", path: "/my-learning-paths", icon: GraduationCap },
  { title: "Lớp học", key: "my-class", path: "/my-class", icon: Users },
  { title: "Bài kiểm tra", key: "my-as", path: "/my-assignments", icon: ClipboardList },
  { title: "Thưởng học tập", key: "my-gam", path: "/my-gamification", icon: Trophy },
  { title: "Thư viện", key: "library", path: "/library", icon: Library },
];
