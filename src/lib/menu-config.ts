import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  BookOpen,
  Monitor,
  ClipboardList,
  Award,
  FileText,
  GraduationCap,
  Users,
  Trophy,
  BarChart3,
  Library,
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
  { title: "Dashboard", key: "dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
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
  { title: "Kế hoạch đào tạo", key: "plans", path: "/admin/plans", icon: FolderKanban },
  { title: "Lộ trình học tập", key: "learning-paths", path: "/admin/learning-paths", icon: BookOpen },
  {
    title: "Nội dung học tập",
    key: "class-room",
    icon: Monitor,
    children: [
      { title: "Lớp học", key: "cr-list", path: "/admin/class-room" },
      { title: "Khóa học", key: "courses", path: "/admin/online-course" },
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
  { title: "Quản lý chứng nhận", key: "certificates", path: "/admin/certificates", icon: Award },
  {
    title: "Khảo sát",
    key: "surveys",
    icon: FileText,
    children: [
      { title: "Danh sách khảo sát", key: "surveys-list", path: "/admin/surveys" },
      { title: "Kết quả khảo sát", key: "surveys-results", path: "/admin/surveys-results" },
    ],
  },
  {
    title: "Thi đua & xếp hạng",
    key: "compete",
    icon: Trophy,
    children: [
      { title: "Flashcard", key: "flashcards", path: "/admin/flashcards" },
      { title: "Gamification", key: "gamifications", path: "/admin/gamifications" },
    ],
  },
  { title: "Báo cáo tổ chức", key: "analytic", path: "/analytic", icon: BarChart3 },
];

export const STUDENT_MENU: MenuItem[] = [
  { title: "Tổng quan", key: "s-dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { title: "Lộ trình", key: "my-lp", path: "/my-learning-paths", icon: GraduationCap },
  { title: "Lớp học", key: "my-class", path: "/my-class", icon: Users },
  { title: "Bài kiểm tra", key: "my-as", path: "/my-assignments", icon: ClipboardList },
  { title: "Thưởng học tập", key: "my-gam", path: "/my-gamification", icon: Trophy },
  {
    title: "Thư viện",
    key: "my-library",
    icon: Library,
    children: [
      { title: "Chứng nhận", key: "my-certs", path: "/my-certificates" },
      { title: "Flashcard", key: "my-fc", path: "/my-flashcards" },
      { title: "Mục yêu thích", key: "my-fav", path: "/my-favorites" },
    ],
  },
];
