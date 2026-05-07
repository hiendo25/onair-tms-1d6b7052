// Mock dataset cho chuỗi F&B Highlands Coffee Vietnam (200+ cửa hàng)

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
  { id: "1", code: "HLC0001", name: "Nguyễn Văn An", email: "an.nv@highlandscoffee.vn", phone: "0901234567", role: "admin", branch: "Hà Nội", department: "Phòng Đào tạo & Phát triển", position: "Trưởng phòng Đào tạo", status: "active", joinedAt: "2022-03-12" },
  { id: "2", code: "HLC0002", name: "Trần Thị Mai", email: "mai.tt@highlandscoffee.vn", phone: "0907654321", role: "teacher", branch: "Hà Nội", department: "Phòng Đào tạo & Phát triển", position: "Chuyên viên Đào tạo", status: "active", joinedAt: "2023-01-08" },
  { id: "3", code: "HLC0003", name: "Lê Hoàng Cường", email: "cuong.lh@highlandscoffee.vn", phone: "0912345678", role: "student", branch: "TP.HCM", department: "Phòng Vận hành", position: "Nhân viên pha chế", status: "active", joinedAt: "2024-06-20" },
  { id: "4", code: "HLC0004", name: "Phạm Thuỳ Dung", email: "dung.pt@highlandscoffee.vn", phone: "0987654321", role: "student", branch: "TP.HCM", department: "Khu vực Miền Nam", position: "Nhân viên thu ngân", status: "inactive", joinedAt: "2025-02-14" },
  { id: "5", code: "HLC0005", name: "Vũ Minh Đức", email: "duc.vm@highlandscoffee.vn", phone: "0934567890", role: "teacher", branch: "Đà Nẵng", department: "Phòng Đào tạo & Phát triển", position: "Giám sát vùng", status: "active", joinedAt: "2023-08-03" },
  { id: "6", code: "HLC0006", name: "Hoàng Thị Hà", email: "ha.ht@highlandscoffee.vn", phone: "0945678901", role: "student", branch: "Hà Nội", department: "Phòng Vận hành", position: "Trưởng ca", status: "active", joinedAt: "2024-09-15" },
  { id: "7", code: "HLC0007", name: "Đỗ Quang Huy", email: "huy.dq@highlandscoffee.vn", phone: "0956789012", role: "admin", branch: "TP.HCM", department: "Khu vực Miền Nam", position: "Giám đốc Vùng", status: "active", joinedAt: "2021-11-01" },
  { id: "8", code: "HLC0008", name: "Bùi Thị Lan", email: "lan.bt@highlandscoffee.vn", phone: "0967890123", role: "student", branch: "Đà Nẵng", department: "Phòng Vận hành", position: "Quản lý cửa hàng", status: "active", joinedAt: "2024-01-12" },
  { id: "9", code: "HLC0009", name: "Ngô Văn Minh", email: "minh.nv@highlandscoffee.vn", phone: "0978901234", role: "student", branch: "Hà Nội", department: "Phòng Vận hành", position: "Nhân viên pha chế", status: "active", joinedAt: "2025-02-20" },
  { id: "10", code: "HLC0010", name: "Lý Thị Ngọc", email: "ngoc.lt@highlandscoffee.vn", phone: "0989012345", role: "teacher", branch: "TP.HCM", department: "Phòng Đào tạo & Phát triển", position: "Chuyên viên Đào tạo", status: "active", joinedAt: "2023-09-01" },
];

export const BRANCHES = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
export const DEPARTMENTS = ["Phòng Đào tạo & Phát triển", "Phòng Vận hành", "Khu vực Miền Bắc", "Khu vực Miền Trung", "Khu vực Miền Nam", "Phòng Nhân sự", "Phòng Marketing"];
export const POSITIONS = ["Giám đốc Vùng", "Quản lý cửa hàng", "Trưởng ca", "Nhân viên pha chế", "Nhân viên thu ngân", "Giám sát vùng", "Chuyên viên Đào tạo"];

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
    "Onboarding Nhân viên Pha chế Q2/2025",
    "Quy trình pha chế chuẩn Highlands - Khóa 12",
    "An toàn vệ sinh thực phẩm cửa hàng HN",
    "Kỹ năng phục vụ khách hàng VIP",
    "Đào tạo Trưởng ca - Đợt 2/2025",
    "Vận hành máy POS & thanh toán",
    "Xử lý tình huống khiếu nại khách hàng",
    "Quản lý cửa hàng cấp 1 - Khu vực HCM",
    "Upselling & combo món mới hè 2025",
  ][i],
  code: `HLC-CLS-${String(i + 101).padStart(4, "0")}`,
  type: (["offline", "hybrid", "offline", "online", "hybrid", "online", "online", "offline", "online"] as const)[i],
  status: (["active", "active", "draft", "active", "completed", "active", "draft", "active", "active"] as const)[i],
  students: [28, 32, 56, 22, 18, 64, 9, 47, 125][i],
  capacity: [30, 35, 60, 30, 25, 80, 15, 50, 150][i],
  startDate: ["2025-04-01", "2025-04-10", "2025-03-15", "2025-04-05", "2025-02-01", "2025-04-20", "2025-05-01", "2025-03-25", "2025-04-15"][i],
  endDate: ["2025-06-30", "2025-07-10", "2025-05-15", "2025-07-05", "2025-04-15", "2025-07-20", "2025-08-01", "2025-05-25", "2025-06-30"][i],
  teacher: ["Trần Thị Mai", "Vũ Minh Đức", "Lý Thị Ngọc", "Trần Thị Mai", "Vũ Minh Đức", "Lý Thị Ngọc", "Trần Thị Mai", "Vũ Minh Đức", "Lý Thị Ngọc"][i],
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
    "Quy trình pha chế chuẩn Highlands",
    "Kỹ năng phục vụ khách hàng",
    "An toàn vệ sinh thực phẩm (VSATTP)",
    "Xử lý tình huống khiếu nại",
    "Vận hành máy POS & thanh toán",
    "Văn hoá thương hiệu Highlands Coffee",
    "Upselling & gợi ý combo",
    "Quản lý ca & xếp lịch nhân sự",
  ][i],
  code: `HLC-CRS-${String(i + 1).padStart(3, "0")}`,
  category: ["Pha chế", "Dịch vụ KH", "Tuân thủ", "Dịch vụ KH", "Vận hành", "Văn hoá", "Sales", "Quản lý"][i],
  lessons: [18, 8, 12, 6, 10, 5, 9, 14][i],
  duration: ["6h 30m", "4h 00m", "5h 15m", "3h 00m", "3h 30m", "2h 00m", "4h 45m", "7h 20m"][i],
  level: (["Cơ bản", "Cơ bản", "Cơ bản", "Trung cấp", "Cơ bản", "Cơ bản", "Trung cấp", "Nâng cao"] as const)[i],
  enrolled: [842, 1124, 1240, 467, 932, 1156, 645, 256][i],
  rating: [4.8, 4.7, 4.9, 4.5, 4.6, 4.8, 4.6, 4.7][i],
  cover: COVERS[i % COVERS.length],
  description: "Khóa đào tạo nội bộ áp dụng cho nhân viên chuỗi cửa hàng Highlands Coffee toàn quốc.",
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
    title: "Onboarding nhân viên mới",
    description: "Lộ trình 4 tuần dành cho nhân viên pha chế / thu ngân mới gia nhập Highlands Coffee.",
    phases: [
      { title: "Tuần 1 - Văn hoá thương hiệu & nội quy", courses: 3, weeks: 1 },
      { title: "Tuần 2 - Quy trình pha chế chuẩn", courses: 4, weeks: 1 },
      { title: "Tuần 3 - VSATTP & vận hành cửa hàng", courses: 3, weeks: 1 },
      { title: "Tuần 4 - Thực tập & đánh giá", courses: 2, weeks: 1 },
    ],
    enrolled: 384,
    status: "published",
  },
  {
    id: "2",
    title: "Lộ trình thăng tiến Trưởng ca",
    description: "Phát triển nhân viên pha chế xuất sắc thành Trưởng ca cửa hàng.",
    phases: [
      { title: "Kỹ năng quản lý ca", courses: 4, weeks: 3 },
      { title: "Quản lý nhân sự ca làm", courses: 5, weeks: 4 },
      { title: "Báo cáo & vận hành cửa hàng", courses: 3, weeks: 3 },
    ],
    enrolled: 124,
    status: "published",
  },
  {
    id: "3",
    title: "Đào tạo Quản lý cửa hàng",
    description: "Lộ trình toàn diện cho Quản lý cửa hàng Highlands Coffee.",
    phases: [
      { title: "Quản trị vận hành cửa hàng", courses: 5, weeks: 4 },
      { title: "Quản lý doanh thu & chi phí", courses: 4, weeks: 3 },
      { title: "Lãnh đạo đội ngũ & dịch vụ KH", courses: 4, weeks: 3 },
    ],
    enrolled: 56,
    status: "published",
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
  { id: "1", title: "Kiểm tra nghiệp vụ pha chế Q1/2025", type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 2, createdAt: "2025-03-01", status: "published" },
  { id: "2", title: "Bài test VSATTP tháng 5/2025", type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 1, createdAt: "2025-05-02", status: "published" },
  { id: "3", title: "Đánh giá kỹ năng phục vụ khách hàng", type: "Hỗn hợp", questions: 25, duration: 60, attempts: 1, createdAt: "2025-04-12", status: "published" },
  { id: "4", title: "Kiểm tra vận hành máy POS", type: "Trắc nghiệm", questions: 15, duration: 20, attempts: 3, createdAt: "2025-03-20", status: "published" },
  { id: "5", title: "Tình huống xử lý khiếu nại khách hàng", type: "Tự luận", questions: 5, duration: 60, attempts: 1, createdAt: "2025-04-18", status: "draft" },
  { id: "6", title: "Bài thi cuối khoá Trưởng ca", type: "Hỗn hợp", questions: 40, duration: 75, attempts: 1, createdAt: "2025-02-28", status: "published" },
];

export type Question = {
  id: string;
  content: string;
  type: "single" | "multiple" | "essay";
  category: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
};

export const MOCK_QUESTIONS: Question[] = [
  { id: "1", content: "Tỷ lệ chuẩn cho 1 ly Phin Sữa Đá size M là bao nhiêu ml cà phê?", type: "single", category: "Pha chế", difficulty: "Dễ" },
  { id: "2", content: "Trình bày 5 bước xử lý khi khách hàng phàn nàn về chất lượng đồ uống.", type: "essay", category: "Dịch vụ KH", difficulty: "Trung bình" },
  { id: "3", content: "Nhiệt độ bảo quản sữa tươi tại quầy bar tối đa là bao nhiêu độ C?", type: "single", category: "VSATTP", difficulty: "Dễ" },
  { id: "4", content: "Các bước thao tác chuẩn khi nhận order trên máy POS Highlands?", type: "multiple", category: "Vận hành", difficulty: "Trung bình" },
  { id: "5", content: "Liệt kê các combo upsize và combo bánh ngọt hiện hành.", type: "multiple", category: "Sales", difficulty: "Dễ" },
  { id: "6", content: "Mô tả quy trình kiểm kê nguyên liệu đầu ca và cuối ca.", type: "essay", category: "Quản lý", difficulty: "Trung bình" },
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
  { id: "1", name: "Kế hoạch đào tạo nhân viên pha chế Q2/2025", year: 2025, quarter: 2, totalCourses: 18, totalLearners: 645, budget: "520,000,000đ", status: "running" },
  { id: "2", name: "Kế hoạch đào tạo VSATTP Q1/2025", year: 2025, quarter: 1, totalCourses: 6, totalLearners: 1240, budget: "310,000,000đ", status: "completed" },
  { id: "3", name: "Onboarding nhân viên mới Q3/2025", year: 2025, quarter: 3, totalCourses: 8, totalLearners: 320, budget: "240,000,000đ", status: "approved" },
  { id: "4", name: "Đào tạo Quản lý cửa hàng 2025", year: 2025, quarter: 4, totalCourses: 12, totalLearners: 56, budget: "180,000,000đ", status: "draft" },
];

export type Branch = { id: string; code: string; name: string; address: string; phone: string; manager: string; employees: number };
export const MOCK_BRANCHES: Branch[] = [
  { id: "1", code: "HN", name: "Chi nhánh Hà Nội", address: "Tầng 5, Toà nhà Capital Place, Liễu Giai, Ba Đình", phone: "024-3555-1234", manager: "Nguyễn Văn An", employees: 412 },
  { id: "2", code: "HCM", name: "Chi nhánh TP.HCM", address: "Tầng 12, Bitexco Financial Tower, Quận 1", phone: "028-3825-9999", manager: "Đỗ Quang Huy", employees: 587 },
  { id: "3", code: "DN", name: "Chi nhánh Đà Nẵng", address: "78 Bạch Đằng, Hải Châu, Đà Nẵng", phone: "0236-3777-456", manager: "Lý Thị Ngọc", employees: 156 },
  { id: "4", code: "CT", name: "Chi nhánh Cần Thơ", address: "12 Hoà Bình, Ninh Kiều, Cần Thơ", phone: "0292-3666-789", manager: "Vũ Minh Đức", employees: 64 },
  { id: "5", code: "HP", name: "Chi nhánh Hải Phòng", address: "45 Lạch Tray, Ngô Quyền, Hải Phòng", phone: "0225-3888-321", manager: "Hoàng Thị Hà", employees: 48 },
];

export type Department = { id: string; code: string; name: string; branch: string; head: string; employees: number };
export const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", code: "DT-PT", name: "Phòng Đào tạo & Phát triển", branch: "Hà Nội", head: "Nguyễn Văn An", employees: 24 },
  { id: "2", code: "VH", name: "Phòng Vận hành", branch: "TP.HCM", head: "Đỗ Quang Huy", employees: 145 },
  { id: "3", code: "MB", name: "Khu vực Miền Bắc", branch: "Hà Nội", head: "Hoàng Thị Hà", employees: 412 },
  { id: "4", code: "MT", name: "Khu vực Miền Trung", branch: "Đà Nẵng", head: "Lý Thị Ngọc", employees: 156 },
  { id: "5", code: "MN", name: "Khu vực Miền Nam", branch: "TP.HCM", head: "Đỗ Quang Huy", employees: 587 },
  { id: "6", code: "MKT", name: "Phòng Marketing", branch: "TP.HCM", head: "Lê Hoàng Cường", employees: 18 },
  { id: "7", code: "HR", name: "Phòng Nhân sự", branch: "Hà Nội", head: "Bùi Thị Lan", employees: 14 },
];

export type Role = { id: string; code: string; name: string; description: string; permissions: number; users: number };
export const MOCK_ROLES: Role[] = [
  { id: "1", code: "SUPER_ADMIN", name: "Quản trị hệ thống", description: "Toàn quyền trên toàn bộ hệ thống LMS Highlands", permissions: 64, users: 2 },
  { id: "2", code: "TRAINING_MANAGER", name: "Trưởng phòng Đào tạo", description: "Quản trị toàn bộ chương trình đào tạo nội bộ", permissions: 48, users: 4 },
  { id: "3", code: "TRAINER", name: "Chuyên viên Đào tạo", description: "Soạn bài, chấm bài, quản lý lớp được phân", permissions: 22, users: 18 },
  { id: "4", code: "AREA_SUPERVISOR", name: "Giám sát vùng", description: "Theo dõi tiến độ học tập của khu vực phụ trách", permissions: 16, users: 12 },
  { id: "5", code: "STORE_MANAGER", name: "Quản lý cửa hàng", description: "Theo dõi đào tạo nhân viên cửa hàng", permissions: 12, users: 215 },
  { id: "6", code: "EMPLOYEE", name: "Nhân viên cửa hàng", description: "Tham gia học tập và làm bài kiểm tra", permissions: 6, users: 1240 },
];

export type Certificate = { id: string; name: string; template: string; issued: number; createdAt: string };
export const MOCK_CERTIFICATES: Certificate[] = [
  { id: "1", name: "Chứng chỉ Vệ sinh An toàn Thực phẩm", template: "Mặc định", issued: 1240, createdAt: "2025-01-12" },
  { id: "2", name: "Chứng nhận Nhân viên Xuất sắc Quý 1", template: "Vàng", issued: 86, createdAt: "2025-04-02" },
  { id: "3", name: "Chứng nhận Hoàn thành Onboarding", template: "Mặc định", issued: 384, createdAt: "2025-02-20" },
  { id: "4", name: "Chứng nhận Trưởng ca Highlands", template: "Bạc", issued: 124, createdAt: "2025-03-15" },
  { id: "5", name: "Chứng nhận Pha chế chuẩn Highlands", template: "Vàng", issued: 645, createdAt: "2025-03-30" },
];

export type Survey = { id: string; title: string; questions: number; responses: number; status: "draft" | "running" | "closed"; createdAt: string };
export const MOCK_SURVEYS: Survey[] = [
  { id: "1", title: "Khảo sát hài lòng nhân viên Q1/2025", questions: 15, responses: 982, status: "closed", createdAt: "2025-01-15" },
  { id: "2", title: "Đánh giá chất lượng đào tạo pha chế", questions: 10, responses: 542, status: "running", createdAt: "2025-04-10" },
  { id: "3", title: "Khảo sát nhu cầu đào tạo 2025", questions: 20, responses: 0, status: "draft", createdAt: "2025-04-22" },
  { id: "4", title: "Phản hồi sau khoá Onboarding nhân viên mới", questions: 8, responses: 384, status: "closed", createdAt: "2025-02-01" },
];

export type Flashcard = { id: string; title: string; cards: number; category: string; createdAt: string };
export const MOCK_FLASHCARDS: Flashcard[] = [
  { id: "1", title: "Menu đồ uống Highlands - Tên & công thức", cards: 86, category: "Pha chế", createdAt: "2025-01-20" },
  { id: "2", title: "Thuật ngữ VSATTP cần nhớ", cards: 60, category: "Tuân thủ", createdAt: "2024-11-08" },
  { id: "3", title: "Phím tắt máy POS Highlands", cards: 42, category: "Vận hành", createdAt: "2025-03-04" },
  { id: "4", title: "Các combo & chương trình KM hiện hành", cards: 28, category: "Sales", createdAt: "2025-04-12" },
];
