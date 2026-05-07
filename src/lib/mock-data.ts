export type Employee = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "teacher" | "student";
  branch: string;
  department: string;
  position: string;
  status: "active" | "inactive";
  joinedAt: string;
};

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", code: "NV001", name: "Nguyễn Văn An", email: "an.nv@onair.com", phone: "0901234567", role: "admin", branch: "Hà Nội", department: "Đào tạo", position: "Trưởng phòng", status: "active", joinedAt: "2023-04-12" },
  { id: "2", code: "NV002", name: "Trần Thị Bích", email: "bich.tt@onair.com", phone: "0907654321", role: "teacher", branch: "Hà Nội", department: "Sales", position: "Giảng viên", status: "active", joinedAt: "2024-01-08" },
  { id: "3", code: "NV003", name: "Lê Hoàng Cường", email: "cuong.lh@onair.com", phone: "0912345678", role: "student", branch: "TP.HCM", department: "Marketing", position: "Nhân viên", status: "active", joinedAt: "2024-06-20" },
  { id: "4", code: "NV004", name: "Phạm Thuỳ Dung", email: "dung.pt@onair.com", phone: "0987654321", role: "student", branch: "TP.HCM", department: "Vận hành", position: "Nhân viên", status: "inactive", joinedAt: "2025-02-14" },
  { id: "5", code: "NV005", name: "Vũ Minh Đức", email: "duc.vm@onair.com", phone: "0934567890", role: "teacher", branch: "Đà Nẵng", department: "Đào tạo", position: "Giảng viên", status: "active", joinedAt: "2025-08-03" },
  { id: "6", code: "NV006", name: "Hoàng Thị Hà", email: "ha.ht@onair.com", phone: "0945678901", role: "student", branch: "Hà Nội", department: "Sales", position: "Nhân viên", status: "active", joinedAt: "2025-09-15" },
  { id: "7", code: "NV007", name: "Đỗ Quang Huy", email: "huy.dq@onair.com", phone: "0956789012", role: "admin", branch: "TP.HCM", department: "Nhân sự", position: "Phó giám đốc", status: "active", joinedAt: "2022-11-01" },
  { id: "8", code: "NV008", name: "Bùi Thị Lan", email: "lan.bt@onair.com", phone: "0967890123", role: "student", branch: "Đà Nẵng", department: "Kế toán", position: "Nhân viên", status: "active", joinedAt: "2026-01-12" },
  { id: "9", code: "NV009", name: "Ngô Văn Minh", email: "minh.nv@onair.com", phone: "0978901234", role: "student", branch: "Hà Nội", department: "IT", position: "Lập trình viên", status: "active", joinedAt: "2026-02-20" },
  { id: "10", code: "NV010", name: "Lý Thị Ngọc", email: "ngoc.lt@onair.com", phone: "0989012345", role: "teacher", branch: "TP.HCM", department: "Đào tạo", position: "Giảng viên", status: "active", joinedAt: "2024-09-01" },
];

export const BRANCHES = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
export const DEPARTMENTS = ["Đào tạo", "Sales", "Marketing", "Nhân sự", "Vận hành", "Kế toán", "IT"];
export const POSITIONS = ["Giám đốc", "Phó giám đốc", "Trưởng phòng", "Giảng viên", "Nhân viên", "Lập trình viên"];

export type Classroom = {
  id: string;
  name: string;
  code: string;
  type: "online" | "offline" | "hybrid";
  status: "draft" | "active" | "completed";
  students: number;
  capacity: number;
  startDate: string;
  endDate: string;
  teacher: string;
  cover: string;
  progress: number;
};

const COVERS = [
  "linear-gradient(135deg,oklch(0.7 0.18 250),oklch(0.6 0.2 280))",
  "linear-gradient(135deg,oklch(0.75 0.18 150),oklch(0.65 0.2 180))",
  "linear-gradient(135deg,oklch(0.78 0.16 60),oklch(0.7 0.18 30))",
  "linear-gradient(135deg,oklch(0.7 0.2 0),oklch(0.6 0.22 340))",
  "linear-gradient(135deg,oklch(0.72 0.14 200),oklch(0.6 0.16 230))",
  "linear-gradient(135deg,oklch(0.78 0.15 90),oklch(0.68 0.18 120))",
];

export const MOCK_CLASSROOMS: Classroom[] = Array.from({ length: 9 }).map((_, i) => ({
  id: String(i + 1),
  name: [
    "Onboarding nhân viên Q4/2026",
    "Kỹ năng mềm cấp quản lý",
    "An toàn lao động cơ bản",
    "Sales Excellence 2026",
    "Tiếng Anh giao tiếp B1",
    "Marketing Digital nâng cao",
    "Lãnh đạo & Quản trị nhân sự",
    "Excel cho nhân viên văn phòng",
    "Kỹ năng chăm sóc khách hàng",
  ][i],
  code: `CLS-${String(i + 101).padStart(4, "0")}`,
  type: (["online", "offline", "hybrid"] as const)[i % 3],
  status: (["active", "active", "draft", "active", "completed", "active", "draft", "active", "active"] as const)[i],
  students: [28, 14, 56, 22, 18, 32, 9, 47, 25][i],
  capacity: [30, 20, 60, 30, 25, 40, 15, 50, 30][i],
  startDate: ["2026-04-01", "2026-04-10", "2026-03-15", "2026-04-05", "2026-02-01", "2026-04-20", "2026-05-01", "2026-03-25", "2026-04-15"][i],
  endDate: ["2026-06-30", "2026-07-10", "2026-05-15", "2026-07-05", "2026-04-15", "2026-07-20", "2026-08-01", "2026-05-25", "2026-06-30"][i],
  teacher: ["Trần Thị Bích", "Vũ Minh Đức", "Lý Thị Ngọc", "Trần Thị Bích", "Vũ Minh Đức", "Lý Thị Ngọc", "Trần Thị Bích", "Vũ Minh Đức", "Lý Thị Ngọc"][i],
  cover: COVERS[i % COVERS.length],
  progress: [72, 45, 91, 38, 100, 22, 5, 64, 50][i],
}));

export type Course = {
  id: string;
  title: string;
  code: string;
  category: string;
  lessons: number;
  duration: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  enrolled: number;
  rating: number;
  cover: string;
  description: string;
};

export const MOCK_COURSES: Course[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  title: [
    "Nhập môn Marketing số",
    "Kỹ năng giao tiếp chuyên nghiệp",
    "Excel nâng cao",
    "Quản trị thời gian",
    "Tiếng Anh thương mại",
    "An toàn lao động",
    "Bán hàng thực chiến",
    "Phân tích dữ liệu cơ bản",
  ][i],
  code: `COURSE-${String(i + 1).padStart(3, "0")}`,
  category: ["Marketing", "Kỹ năng mềm", "Tin học", "Kỹ năng mềm", "Ngoại ngữ", "Tuân thủ", "Sales", "Dữ liệu"][i],
  lessons: [12, 8, 18, 6, 24, 10, 14, 16][i],
  duration: ["6h 30m", "4h 00m", "9h 15m", "3h 00m", "12h 00m", "5h 30m", "7h 45m", "8h 20m"][i],
  level: (["Cơ bản", "Cơ bản", "Nâng cao", "Cơ bản", "Trung cấp", "Cơ bản", "Trung cấp", "Trung cấp"] as const)[i],
  enrolled: [342, 521, 189, 267, 432, 612, 245, 156][i],
  rating: [4.6, 4.8, 4.5, 4.7, 4.9, 4.4, 4.7, 4.6][i],
  cover: COVERS[i % COVERS.length],
  description: "Khóa học cung cấp kiến thức nền tảng và bài tập thực hành dành cho nhân viên doanh nghiệp.",
}));

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  phases: { title: string; courses: number; weeks: number }[];
  enrolled: number;
  status: "draft" | "published";
};

export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: "1",
    title: "Lộ trình Onboarding nhân viên mới",
    description: "Lộ trình 4 giai đoạn dành cho nhân viên gia nhập công ty.",
    phases: [
      { title: "Tuần đầu - Văn hoá & quy định", courses: 3, weeks: 1 },
      { title: "Tháng 1 - Kỹ năng cốt lõi", courses: 5, weeks: 4 },
      { title: "Tháng 2 - Nghiệp vụ chuyên sâu", courses: 4, weeks: 4 },
      { title: "Tháng 3 - Đánh giá & chứng nhận", courses: 2, weeks: 2 },
    ],
    enrolled: 128,
    status: "published",
  },
  {
    id: "2",
    title: "Lộ trình quản lý cấp trung",
    description: "Phát triển năng lực lãnh đạo cho cấp quản lý phòng / nhóm.",
    phases: [
      { title: "Tự nhận thức lãnh đạo", courses: 4, weeks: 3 },
      { title: "Quản lý đội nhóm", courses: 6, weeks: 6 },
      { title: "Hoạch định chiến lược", courses: 3, weeks: 4 },
    ],
    enrolled: 42,
    status: "published",
  },
  {
    id: "3",
    title: "Lộ trình Sales chuyên nghiệp",
    description: "Đào tạo bán hàng từ cơ bản đến nâng cao.",
    phases: [
      { title: "Hiểu khách hàng", courses: 3, weeks: 2 },
      { title: "Kỹ thuật bán hàng", courses: 5, weeks: 5 },
      { title: "Đàm phán & chốt sale", courses: 4, weeks: 3 },
    ],
    enrolled: 0,
    status: "draft",
  },
];

export type Assignment = {
  id: string;
  title: string;
  type: "Trắc nghiệm" | "Tự luận" | "Hỗn hợp";
  questions: number;
  duration: number;
  attempts: number;
  createdAt: string;
  status: "draft" | "published";
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: "1", title: "Kiểm tra cuối khóa Onboarding", type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 2, createdAt: "2026-04-01", status: "published" },
  { id: "2", title: "Quiz tuần 3 - Sales Excellence", type: "Trắc nghiệm", questions: 15, duration: 20, attempts: 1, createdAt: "2026-04-10", status: "published" },
  { id: "3", title: "Bài tự luận - Lãnh đạo", type: "Tự luận", questions: 5, duration: 90, attempts: 1, createdAt: "2026-03-22", status: "published" },
  { id: "4", title: "ATLĐ - Kiểm tra giữa kỳ", type: "Hỗn hợp", questions: 25, duration: 60, attempts: 3, createdAt: "2026-03-15", status: "published" },
  { id: "5", title: "Excel - bài tập tổng hợp", type: "Hỗn hợp", questions: 20, duration: 60, attempts: 2, createdAt: "2026-04-18", status: "draft" },
  { id: "6", title: "Tiếng Anh - Mid-term", type: "Trắc nghiệm", questions: 50, duration: 75, attempts: 1, createdAt: "2026-02-28", status: "published" },
];

export type Question = {
  id: string;
  content: string;
  type: "single" | "multiple" | "essay";
  category: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
};

export const MOCK_QUESTIONS: Question[] = [
  { id: "1", content: "Đâu là nguyên tắc 5S trong quản lý nơi làm việc?", type: "multiple", category: "ATLĐ", difficulty: "Dễ" },
  { id: "2", content: "Trình bày quy trình bán hàng B2B 7 bước.", type: "essay", category: "Sales", difficulty: "Khó" },
  { id: "3", content: "Hàm VLOOKUP trong Excel dùng để làm gì?", type: "single", category: "Excel", difficulty: "Trung bình" },
  { id: "4", content: "Choose the correct tense: 'I ___ to school every day.'", type: "single", category: "Tiếng Anh", difficulty: "Dễ" },
  { id: "5", content: "Liệt kê 4 chữ P trong Marketing Mix.", type: "multiple", category: "Marketing", difficulty: "Dễ" },
  { id: "6", content: "Mô tả kỹ thuật phản hồi SBI khi đánh giá nhân viên.", type: "essay", category: "Quản lý", difficulty: "Trung bình" },
];

export type Plan = {
  id: string;
  name: string;
  year: number;
  quarter: number;
  totalCourses: number;
  totalLearners: number;
  budget: string;
  status: "draft" | "approved" | "running" | "completed";
};

export const MOCK_PLANS: Plan[] = [
  { id: "1", name: "Kế hoạch đào tạo Q2/2026", year: 2026, quarter: 2, totalCourses: 18, totalLearners: 245, budget: "320,000,000đ", status: "running" },
  { id: "2", name: "Kế hoạch đào tạo Q1/2026", year: 2026, quarter: 1, totalCourses: 12, totalLearners: 187, budget: "210,000,000đ", status: "completed" },
  { id: "3", name: "Kế hoạch đào tạo nhân sự mới Q3/2026", year: 2026, quarter: 3, totalCourses: 8, totalLearners: 80, budget: "150,000,000đ", status: "approved" },
  { id: "4", name: "Kế hoạch nâng cao kỹ năng quản lý", year: 2026, quarter: 4, totalCourses: 6, totalLearners: 45, budget: "95,000,000đ", status: "draft" },
];

export type Branch = { id: string; code: string; name: string; address: string; phone: string; manager: string; employees: number };
export const MOCK_BRANCHES: Branch[] = [
  { id: "1", code: "HN", name: "Chi nhánh Hà Nội", address: "Tầng 5, Toà Capital, Trần Duy Hưng", phone: "024-3555-1234", manager: "Nguyễn Văn An", employees: 124 },
  { id: "2", code: "HCM", name: "Chi nhánh TP.HCM", address: "Lầu 12, Bitexco, Quận 1", phone: "028-3825-9999", manager: "Đỗ Quang Huy", employees: 187 },
  { id: "3", code: "DN", name: "Chi nhánh Đà Nẵng", address: "78 Bạch Đằng, Hải Châu", phone: "0236-3777-456", manager: "Lý Thị Ngọc", employees: 56 },
  { id: "4", code: "CT", name: "Chi nhánh Cần Thơ", address: "12 Hoà Bình, Ninh Kiều", phone: "0292-3666-789", manager: "Vũ Minh Đức", employees: 32 },
];

export type Department = { id: string; code: string; name: string; branch: string; head: string; employees: number };
export const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", code: "DT", name: "Phòng Đào tạo", branch: "Hà Nội", head: "Nguyễn Văn An", employees: 12 },
  { id: "2", code: "SALES", name: "Phòng Sales", branch: "TP.HCM", head: "Trần Thị Bích", employees: 38 },
  { id: "3", code: "MKT", name: "Phòng Marketing", branch: "TP.HCM", head: "Lê Hoàng Cường", employees: 18 },
  { id: "4", code: "HR", name: "Phòng Nhân sự", branch: "Hà Nội", head: "Đỗ Quang Huy", employees: 9 },
  { id: "5", code: "IT", name: "Phòng IT", branch: "Hà Nội", head: "Ngô Văn Minh", employees: 21 },
  { id: "6", code: "FIN", name: "Phòng Kế toán", branch: "Đà Nẵng", head: "Bùi Thị Lan", employees: 7 },
];

export type Role = { id: string; code: string; name: string; description: string; permissions: number; users: number };
export const MOCK_ROLES: Role[] = [
  { id: "1", code: "SUPER_ADMIN", name: "Quản trị hệ thống", description: "Toàn quyền trên toàn bộ hệ thống", permissions: 64, users: 2 },
  { id: "2", code: "ORG_ADMIN", name: "Quản trị tổ chức", description: "Quản trị trong phạm vi tổ chức", permissions: 48, users: 5 },
  { id: "3", code: "TEACHER", name: "Giảng viên", description: "Soạn bài, chấm bài, quản lý lớp được phân", permissions: 18, users: 14 },
  { id: "4", code: "MANAGER", name: "Quản lý phòng ban", description: "Theo dõi học viên trong phòng ban", permissions: 12, users: 22 },
  { id: "5", code: "STUDENT", name: "Học viên", description: "Tham gia học tập và làm bài kiểm tra", permissions: 6, users: 1241 },
];

export type Certificate = { id: string; name: string; template: string; issued: number; createdAt: string };
export const MOCK_CERTIFICATES: Certificate[] = [
  { id: "1", name: "Chứng nhận hoàn thành Onboarding", template: "Mặc định", issued: 128, createdAt: "2026-01-12" },
  { id: "2", name: "Chứng nhận Sales Excellence", template: "Vàng", issued: 22, createdAt: "2026-02-20" },
  { id: "3", name: "Chứng nhận An toàn lao động", template: "Mặc định", issued: 56, createdAt: "2025-12-05" },
  { id: "4", name: "Chứng nhận Excel nâng cao", template: "Bạc", issued: 47, createdAt: "2026-03-15" },
];

export type Survey = { id: string; title: string; questions: number; responses: number; status: "draft" | "running" | "closed"; createdAt: string };
export const MOCK_SURVEYS: Survey[] = [
  { id: "1", title: "Khảo sát chất lượng đào tạo Q1/2026", questions: 12, responses: 187, status: "closed", createdAt: "2026-01-15" },
  { id: "2", title: "Đánh giá giảng viên Sales Excellence", questions: 8, responses: 22, status: "running", createdAt: "2026-04-10" },
  { id: "3", title: "Khảo sát nhu cầu đào tạo 2026", questions: 20, responses: 0, status: "draft", createdAt: "2026-04-22" },
  { id: "4", title: "Phản hồi sau khóa Onboarding", questions: 10, responses: 128, status: "closed", createdAt: "2026-02-01" },
];

export type Flashcard = { id: string; title: string; cards: number; category: string; createdAt: string };
export const MOCK_FLASHCARDS: Flashcard[] = [
  { id: "1", title: "1000 từ vựng tiếng Anh thương mại", cards: 1000, category: "Ngoại ngữ", createdAt: "2026-01-20" },
  { id: "2", title: "Thuật ngữ ATLĐ", cards: 60, category: "Tuân thủ", createdAt: "2025-11-08" },
  { id: "3", title: "Excel - Hàm thường dùng", cards: 45, category: "Tin học", createdAt: "2026-03-04" },
  { id: "4", title: "Quy tắc bán hàng B2B", cards: 28, category: "Sales", createdAt: "2026-02-12" },
];
