// Multi-tenant mock data: each organization owns a fully separate dataset.
// All screens read via useOrgData() from src/lib/org-context.tsx.

import type {
  Employee,
  Classroom,
  Course,
  LearningPath,
  Assignment,
  Question,
  Plan,
  Branch,
  Department,
  Role,
  Certificate,
  Survey,
  Flashcard,
} from "./mock-data";

export type OrgId = "highlands" | "pharmacity" | "didongviet" | "circlek";

export type OrgMeta = {
  id: OrgId;
  name: string;
  short: string; // 2-letter avatar
  domain: string; // email domain
  industry: string;
  brandColor: string; // tailwind/oklch hex
};

export const ORGS: OrgMeta[] = [
  { id: "highlands",  name: "Highlands Coffee Vietnam", short: "HC", domain: "highlandscoffee.vn", industry: "Chuỗi F&B - 200+ cửa hàng",      brandColor: "#9F1B1B" },
  { id: "pharmacity", name: "Pharmacity",               short: "PM", domain: "pharmacity.vn",       industry: "Chuỗi nhà thuốc - 1.100+ điểm", brandColor: "#0066B3" },
  { id: "didongviet", name: "Di Động Việt",             short: "DV", domain: "didongviet.vn",       industry: "Bán lẻ điện thoại - 80+ cửa hàng", brandColor: "#E30613" },
  { id: "circlek",    name: "Circle K Vietnam",         short: "CK", domain: "circlek.vn",          industry: "Cửa hàng tiện lợi - 450+ điểm", brandColor: "#D7282F" },
];

const COVERS = [
  "linear-gradient(135deg,oklch(0.7 0.18 250),oklch(0.6 0.2 280))",
  "linear-gradient(135deg,oklch(0.75 0.18 150),oklch(0.65 0.2 180))",
  "linear-gradient(135deg,oklch(0.78 0.16 60),oklch(0.7 0.18 30))",
  "linear-gradient(135deg,oklch(0.7 0.2 0),oklch(0.6 0.22 340))",
  "linear-gradient(135deg,oklch(0.72 0.14 200),oklch(0.6 0.16 230))",
  "linear-gradient(135deg,oklch(0.78 0.15 90),oklch(0.68 0.18 120))",
];

export type OrgDataset = {
  meta: OrgMeta;
  employees: Employee[];
  branches: Branch[];
  departments: Department[];
  positions: string[];
  branchNames: string[];
  departmentNames: string[];
  classrooms: Classroom[];
  courses: Course[];
  learningPaths: LearningPath[];
  assignments: Assignment[];
  questions: Question[];
  plans: Plan[];
  roles: Role[];
  certificates: Certificate[];
  surveys: Survey[];
  flashcards: Flashcard[];
  // Dashboard / analytic numbers
  stats: {
    totalEmployees: number;
    completionRate: number;       // %
    activeClasses: number;
    upcomingClasses: number;
    expiringClasses: number;
    completedClasses: number;
    certsThisMonth: number;
    totalHours: string;
  };
};

// ---------- Per-org config ----------
type OrgConfig = {
  meta: OrgMeta;
  empPrefix: string;
  positions: string[];
  branches: Array<{ code: string; name: string; address: string; phone: string; mgr: string; emp: number }>;
  departments: Array<{ code: string; name: string; branch: string; head: string; emp: number }>;
  classrooms: Array<{ name: string; type: Classroom["type"]; status: Classroom["status"]; students: number; capacity: number; teacher: string }>;
  courses: Array<{ title: string; category: string; lessons: number; duration: string; level: Course["level"]; enrolled: number; rating: number }>;
  paths: LearningPath[];
  assignments: Assignment[];
  questions: Question[];
  certs: Certificate[];
  surveys: Survey[];
  flashcards: Flashcard[];
  roleNames: Record<string, string>; // override role display names
  stats: OrgDataset["stats"];
  classCodePrefix: string;
  courseCodePrefix: string;
  // Employees seed (10 NV)
  employees: Array<{ name: string; localpart: string; phone: string; role: Employee["role"]; branch: string; department: string; position: string; status: Employee["status"]; joinedAt: string }>;
};

const CONFIGS: Record<OrgId, OrgConfig> = {
  // ============================ HIGHLANDS ============================
  highlands: {
    meta: ORGS[0],
    empPrefix: "HLC",
    classCodePrefix: "HLC-CLS",
    courseCodePrefix: "HLC-CRS",
    positions: ["Giám đốc Vùng", "Quản lý cửa hàng", "Trưởng ca", "Nhân viên pha chế", "Nhân viên thu ngân", "Giám sát vùng", "Chuyên viên Đào tạo"],
    branches: [
      { code: "HN",  name: "Chi nhánh Hà Nội",       address: "Tầng 5, Capital Place, Liễu Giai, Ba Đình", phone: "024-3555-1234", mgr: "Nguyễn Văn An", emp: 412 },
      { code: "HCM", name: "Chi nhánh TP.HCM",       address: "Tầng 12, Bitexco, Quận 1",                  phone: "028-3825-9999", mgr: "Đỗ Quang Huy",  emp: 587 },
      { code: "DN",  name: "Chi nhánh Đà Nẵng",      address: "78 Bạch Đằng, Hải Châu",                    phone: "0236-3777-456", mgr: "Lý Thị Ngọc",   emp: 156 },
      { code: "CT",  name: "Chi nhánh Cần Thơ",      address: "12 Hoà Bình, Ninh Kiều",                    phone: "0292-3666-789", mgr: "Vũ Minh Đức",   emp: 64  },
      { code: "HP",  name: "Chi nhánh Hải Phòng",    address: "45 Lạch Tray, Ngô Quyền",                   phone: "0225-3888-321", mgr: "Hoàng Thị Hà",  emp: 48  },
    ],
    departments: [
      { code: "DT-PT", name: "Phòng Đào tạo & Phát triển", branch: "Hà Nội", head: "Nguyễn Văn An", emp: 24 },
      { code: "VH",    name: "Phòng Vận hành",             branch: "TP.HCM", head: "Đỗ Quang Huy",  emp: 145 },
      { code: "MB",    name: "Khu vực Miền Bắc",           branch: "Hà Nội", head: "Hoàng Thị Hà",  emp: 412 },
      { code: "MT",    name: "Khu vực Miền Trung",         branch: "Đà Nẵng",head: "Lý Thị Ngọc",   emp: 156 },
      { code: "MN",    name: "Khu vực Miền Nam",           branch: "TP.HCM", head: "Đỗ Quang Huy",  emp: 587 },
      { code: "MKT",   name: "Phòng Marketing",            branch: "TP.HCM", head: "Lê Hoàng Cường",emp: 18  },
      { code: "HR",    name: "Phòng Nhân sự",              branch: "Hà Nội", head: "Bùi Thị Lan",   emp: 14  },
    ],
    classrooms: [
      { name: "Onboarding Nhân viên Pha chế Q2/2025",        type: "offline", status: "active",    students: 28,  capacity: 30,  teacher: "Trần Thị Mai" },
      { name: "Quy trình pha chế chuẩn Highlands - Khóa 12", type: "hybrid",  status: "active",    students: 32,  capacity: 35,  teacher: "Vũ Minh Đức" },
      { name: "An toàn vệ sinh thực phẩm - HN",              type: "offline", status: "draft",     students: 56,  capacity: 60,  teacher: "Lý Thị Ngọc" },
      { name: "Kỹ năng phục vụ khách hàng VIP",              type: "online",  status: "active",    students: 22,  capacity: 30,  teacher: "Trần Thị Mai" },
      { name: "Đào tạo Trưởng ca - Đợt 2/2025",              type: "hybrid",  status: "completed", students: 18,  capacity: 25,  teacher: "Vũ Minh Đức" },
      { name: "Vận hành máy POS & thanh toán",               type: "online",  status: "active",    students: 64,  capacity: 80,  teacher: "Lý Thị Ngọc" },
      { name: "Xử lý tình huống khiếu nại khách hàng",       type: "online",  status: "draft",     students: 9,   capacity: 15,  teacher: "Trần Thị Mai" },
      { name: "Quản lý cửa hàng cấp 1 - HCM",                type: "offline", status: "active",    students: 47,  capacity: 50,  teacher: "Vũ Minh Đức" },
      { name: "Upselling & combo món mới hè 2025",           type: "online",  status: "active",    students: 125, capacity: 150, teacher: "Lý Thị Ngọc" },
    ],
    courses: [
      { title: "Quy trình pha chế chuẩn Highlands",    category: "Pha chế",    lessons: 18, duration: "6h 30m", level: "Cơ bản",   enrolled: 842,  rating: 4.8 },
      { title: "Kỹ năng phục vụ khách hàng",           category: "Dịch vụ KH", lessons: 8,  duration: "4h 00m", level: "Cơ bản",   enrolled: 1124, rating: 4.7 },
      { title: "An toàn vệ sinh thực phẩm (VSATTP)",   category: "Tuân thủ",   lessons: 12, duration: "5h 15m", level: "Cơ bản",   enrolled: 1240, rating: 4.9 },
      { title: "Xử lý tình huống khiếu nại",           category: "Dịch vụ KH", lessons: 6,  duration: "3h 00m", level: "Trung cấp",enrolled: 467,  rating: 4.5 },
      { title: "Vận hành máy POS & thanh toán",        category: "Vận hành",   lessons: 10, duration: "3h 30m", level: "Cơ bản",   enrolled: 932,  rating: 4.6 },
      { title: "Văn hoá thương hiệu Highlands Coffee", category: "Văn hoá",    lessons: 5,  duration: "2h 00m", level: "Cơ bản",   enrolled: 1156, rating: 4.8 },
      { title: "Upselling & gợi ý combo",              category: "Sales",      lessons: 9,  duration: "4h 45m", level: "Trung cấp",enrolled: 645,  rating: 4.6 },
      { title: "Quản lý ca & xếp lịch nhân sự",        category: "Quản lý",    lessons: 14, duration: "7h 20m", level: "Nâng cao", enrolled: 256,  rating: 4.7 },
    ],
    paths: [
      { id: "1", title: "Onboarding nhân viên mới", description: "Lộ trình 4 tuần cho NV pha chế / thu ngân mới gia nhập Highlands.", phases: [
        { title: "Tuần 1 - Văn hoá & nội quy", courses: 3, weeks: 1 },
        { title: "Tuần 2 - Pha chế chuẩn", courses: 4, weeks: 1 },
        { title: "Tuần 3 - VSATTP & vận hành", courses: 3, weeks: 1 },
        { title: "Tuần 4 - Thực tập & đánh giá", courses: 2, weeks: 1 },
      ], enrolled: 384, status: "published" },
      { id: "2", title: "Lộ trình thăng tiến Trưởng ca", description: "Phát triển NV pha chế thành Trưởng ca cửa hàng.", phases: [
        { title: "Kỹ năng quản lý ca", courses: 4, weeks: 3 },
        { title: "Quản lý nhân sự ca làm", courses: 5, weeks: 4 },
        { title: "Báo cáo & vận hành cửa hàng", courses: 3, weeks: 3 },
      ], enrolled: 124, status: "published" },
      { id: "3", title: "Đào tạo Quản lý cửa hàng", description: "Lộ trình toàn diện cho Quản lý cửa hàng Highlands.", phases: [
        { title: "Quản trị vận hành", courses: 5, weeks: 4 },
        { title: "Doanh thu & chi phí", courses: 4, weeks: 3 },
        { title: "Lãnh đạo đội ngũ", courses: 4, weeks: 3 },
      ], enrolled: 56, status: "published" },
    ],
    assignments: [
      { id: "1", title: "Kiểm tra nghiệp vụ pha chế Q1/2025", type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 2, createdAt: "2025-03-01", status: "published" },
      { id: "2", title: "Bài test VSATTP tháng 5/2025",        type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 1, createdAt: "2025-05-02", status: "published" },
      { id: "3", title: "Đánh giá kỹ năng phục vụ KH",         type: "Hỗn hợp",     questions: 25, duration: 60, attempts: 1, createdAt: "2025-04-12", status: "published" },
      { id: "4", title: "Kiểm tra vận hành máy POS",           type: "Trắc nghiệm", questions: 15, duration: 20, attempts: 3, createdAt: "2025-03-20", status: "published" },
      { id: "5", title: "Tình huống xử lý khiếu nại KH",       type: "Tự luận",     questions: 5,  duration: 60, attempts: 1, createdAt: "2025-04-18", status: "draft" },
      { id: "6", title: "Bài thi cuối khoá Trưởng ca",         type: "Hỗn hợp",     questions: 40, duration: 75, attempts: 1, createdAt: "2025-02-28", status: "published" },
    ],
    questions: [
      { id: "1", content: "Tỷ lệ chuẩn cho 1 ly Phin Sữa Đá size M là bao nhiêu ml cà phê?", type: "single",   category: "Pha chế",    difficulty: "Dễ" },
      { id: "2", content: "Trình bày 5 bước xử lý khi khách phàn nàn về chất lượng đồ uống.", type: "essay",   category: "Dịch vụ KH", difficulty: "Trung bình" },
      { id: "3", content: "Nhiệt độ bảo quản sữa tươi tại quầy bar tối đa là bao nhiêu °C?",  type: "single",   category: "VSATTP",     difficulty: "Dễ" },
      { id: "4", content: "Các bước thao tác chuẩn khi nhận order trên máy POS Highlands?",   type: "multiple", category: "Vận hành",   difficulty: "Trung bình" },
      { id: "5", content: "Liệt kê các combo upsize và combo bánh ngọt hiện hành.",           type: "multiple", category: "Sales",      difficulty: "Dễ" },
      { id: "6", content: "Mô tả quy trình kiểm kê nguyên liệu đầu ca và cuối ca.",           type: "essay",    category: "Quản lý",    difficulty: "Trung bình" },
    ],
    certs: [
      { id: "1", name: "Chứng chỉ Vệ sinh An toàn Thực phẩm",         template: "Mặc định", issued: 1240, createdAt: "2025-01-12" },
      { id: "2", name: "Chứng nhận Nhân viên Xuất sắc Quý 1",         template: "Vàng",     issued: 86,   createdAt: "2025-04-02" },
      { id: "3", name: "Chứng nhận Hoàn thành Onboarding",            template: "Mặc định", issued: 384,  createdAt: "2025-02-20" },
      { id: "4", name: "Chứng nhận Trưởng ca Highlands",              template: "Bạc",      issued: 124,  createdAt: "2025-03-15" },
      { id: "5", name: "Chứng nhận Pha chế chuẩn Highlands",          template: "Vàng",     issued: 645,  createdAt: "2025-03-30" },
    ],
    surveys: [
      { id: "1", title: "Khảo sát hài lòng nhân viên Q1/2025",       questions: 15, responses: 982, status: "closed",  createdAt: "2025-01-15" },
      { id: "2", title: "Đánh giá chất lượng đào tạo pha chế",       questions: 10, responses: 542, status: "running", createdAt: "2025-04-10" },
      { id: "3", title: "Khảo sát nhu cầu đào tạo 2025",             questions: 20, responses: 0,   status: "draft",   createdAt: "2025-04-22" },
      { id: "4", title: "Phản hồi sau khoá Onboarding NV mới",       questions: 8,  responses: 384, status: "closed",  createdAt: "2025-02-01" },
    ],
    flashcards: [
      { id: "1", title: "Menu đồ uống Highlands - Tên & công thức", cards: 86, category: "Pha chế",  createdAt: "2025-01-20" },
      { id: "2", title: "Thuật ngữ VSATTP cần nhớ",                 cards: 60, category: "Tuân thủ", createdAt: "2024-11-08" },
      { id: "3", title: "Phím tắt máy POS Highlands",               cards: 42, category: "Vận hành", createdAt: "2025-03-04" },
      { id: "4", title: "Combo & chương trình KM hiện hành",        cards: 28, category: "Sales",    createdAt: "2025-04-12" },
    ],
    roleNames: { STORE_MANAGER: "Quản lý cửa hàng", EMPLOYEE: "Nhân viên cửa hàng" },
    stats: { totalEmployees: 1240, completionRate: 87, activeClasses: 23, upcomingClasses: 14, expiringClasses: 7, completedClasses: 128, certsThisMonth: 156, totalHours: "18,420h" },
    employees: [
      { name: "Nguyễn Văn An",   localpart: "an.nv",    phone: "0901234567", role: "admin",   branch: "Hà Nội", department: "Phòng Đào tạo & Phát triển", position: "Trưởng phòng Đào tạo", status: "active",   joinedAt: "2022-03-12" },
      { name: "Trần Thị Mai",    localpart: "mai.tt",   phone: "0907654321", role: "teacher", branch: "Hà Nội", department: "Phòng Đào tạo & Phát triển", position: "Chuyên viên Đào tạo", status: "active",   joinedAt: "2023-01-08" },
      { name: "Lê Hoàng Cường",  localpart: "cuong.lh", phone: "0912345678", role: "student", branch: "TP.HCM", department: "Phòng Vận hành",             position: "Nhân viên pha chế",   status: "active",   joinedAt: "2024-06-20" },
      { name: "Phạm Thuỳ Dung",  localpart: "dung.pt",  phone: "0987654321", role: "student", branch: "TP.HCM", department: "Khu vực Miền Nam",           position: "Nhân viên thu ngân",  status: "inactive", joinedAt: "2025-02-14" },
      { name: "Vũ Minh Đức",     localpart: "duc.vm",   phone: "0934567890", role: "teacher", branch: "Đà Nẵng",department: "Phòng Đào tạo & Phát triển", position: "Giám sát vùng",       status: "active",   joinedAt: "2023-08-03" },
      { name: "Hoàng Thị Hà",    localpart: "ha.ht",    phone: "0945678901", role: "student", branch: "Hà Nội", department: "Phòng Vận hành",             position: "Trưởng ca",            status: "active",   joinedAt: "2024-09-15" },
      { name: "Đỗ Quang Huy",    localpart: "huy.dq",   phone: "0956789012", role: "admin",   branch: "TP.HCM", department: "Khu vực Miền Nam",           position: "Giám đốc Vùng",        status: "active",   joinedAt: "2021-11-01" },
      { name: "Bùi Thị Lan",     localpart: "lan.bt",   phone: "0967890123", role: "student", branch: "Đà Nẵng",department: "Phòng Vận hành",             position: "Quản lý cửa hàng",     status: "active",   joinedAt: "2024-01-12" },
      { name: "Ngô Văn Minh",    localpart: "minh.nv",  phone: "0978901234", role: "student", branch: "Hà Nội", department: "Phòng Vận hành",             position: "Nhân viên pha chế",    status: "active",   joinedAt: "2025-02-20" },
      { name: "Lý Thị Ngọc",     localpart: "ngoc.lt",  phone: "0989012345", role: "teacher", branch: "TP.HCM", department: "Phòng Đào tạo & Phát triển", position: "Chuyên viên Đào tạo",  status: "active",   joinedAt: "2023-09-01" },
    ],
  },

  // ============================ PHARMACITY ============================
  pharmacity: {
    meta: ORGS[1],
    empPrefix: "PMC",
    classCodePrefix: "PMC-CLS",
    courseCodePrefix: "PMC-CRS",
    positions: ["Giám đốc Vùng", "Quản lý nhà thuốc", "Dược sĩ trưởng", "Dược sĩ", "Nhân viên bán thuốc", "Giám sát vùng", "Trưởng phòng Đào tạo Y khoa"],
    branches: [
      { code: "HN",  name: "Khu vực Hà Nội",        address: "Tầng 8, Toà Discovery Complex, Cầu Giấy", phone: "024-7300-1414", mgr: "Phạm Quang Huy", emp: 1245 },
      { code: "HCM", name: "Khu vực TP.HCM",        address: "Lầu 6, Pearl Plaza, Bình Thạnh",          phone: "028-7300-1414", mgr: "Trần Thị Hương", emp: 2180 },
      { code: "DN",  name: "Khu vực Đà Nẵng",       address: "234 Nguyễn Văn Linh, Hải Châu",           phone: "0236-7300-141", mgr: "Lê Quốc Bảo",    emp: 348 },
      { code: "BD",  name: "Khu vực Bình Dương",    address: "456 Đại lộ Bình Dương, Thủ Dầu Một",      phone: "0274-7300-14",  mgr: "Nguyễn Hồng Vân",emp: 412 },
    ],
    departments: [
      { code: "DT-YK", name: "Phòng Đào tạo Y khoa",        branch: "Hà Nội", head: "Phạm Quang Huy", emp: 32  },
      { code: "VH",    name: "Phòng Vận hành Nhà thuốc",    branch: "TP.HCM", head: "Trần Thị Hương", emp: 215 },
      { code: "QL-CL", name: "Phòng Quản lý Chất lượng",    branch: "TP.HCM", head: "Lê Quốc Bảo",    emp: 28  },
      { code: "MB",    name: "Khu vực Miền Bắc",            branch: "Hà Nội", head: "Phạm Quang Huy", emp: 1245 },
      { code: "MN",    name: "Khu vực Miền Nam",            branch: "TP.HCM", head: "Trần Thị Hương", emp: 2180 },
      { code: "MKT",   name: "Phòng Marketing & CSKH",      branch: "TP.HCM", head: "Đặng Thu Trang", emp: 24  },
    ],
    classrooms: [
      { name: "Onboarding Dược sĩ mới Q2/2025",                type: "offline", status: "active",    students: 45, capacity: 50, teacher: "DS. Phạm Quang Huy" },
      { name: "Tư vấn sử dụng thuốc OTC chuẩn Pharmacity",     type: "hybrid",  status: "active",    students: 124,capacity: 150,teacher: "DS. Trần Thị Hương" },
      { name: "Cập nhật quy chế dược 2025 - Bộ Y tế",          type: "online",  status: "active",    students: 386,capacity: 400,teacher: "DS. Lê Quốc Bảo" },
      { name: "Kỹ năng tư vấn sản phẩm chăm sóc da",           type: "offline", status: "draft",     students: 32, capacity: 40, teacher: "DS. Đặng Thu Trang" },
      { name: "Đào tạo Quản lý nhà thuốc - Đợt 1/2025",        type: "hybrid",  status: "completed", students: 28, capacity: 30, teacher: "DS. Phạm Quang Huy" },
      { name: "Vận hành phần mềm POS & quản lý tồn kho",       type: "online",  status: "active",    students: 215,capacity: 250,teacher: "Trần Văn Long" },
      { name: "Xử lý tình huống khách hàng khó",               type: "online",  status: "active",    students: 96, capacity: 120,teacher: "DS. Đặng Thu Trang" },
      { name: "Tương tác thuốc & cảnh báo dùng thuốc",         type: "online",  status: "active",    students: 432,capacity: 500,teacher: "DS. Lê Quốc Bảo" },
      { name: "Bán hàng chéo (cross-sell) trong nhà thuốc",    type: "offline", status: "draft",     students: 18, capacity: 30, teacher: "DS. Trần Thị Hương" },
    ],
    courses: [
      { title: "Nghiệp vụ dược cơ bản cho dược sĩ mới",        category: "Nghiệp vụ", lessons: 24, duration: "12h 00m", level: "Cơ bản",   enrolled: 1245, rating: 4.8 },
      { title: "Tư vấn sử dụng thuốc OTC an toàn",             category: "Tư vấn",   lessons: 18, duration: "8h 30m",  level: "Trung cấp",enrolled: 2180, rating: 4.9 },
      { title: "Quy chế dược & văn bản pháp luật 2025",        category: "Tuân thủ", lessons: 12, duration: "6h 00m",  level: "Cơ bản",   enrolled: 3245, rating: 4.7 },
      { title: "Tư vấn sản phẩm chăm sóc sức khoẻ & sắc đẹp",  category: "Tư vấn",   lessons: 14, duration: "7h 00m",  level: "Trung cấp",enrolled: 1648, rating: 4.6 },
      { title: "Tương tác thuốc & cảnh báo lâm sàng",          category: "Lâm sàng", lessons: 20, duration: "10h 00m", level: "Nâng cao", enrolled: 942,  rating: 4.8 },
      { title: "Vận hành POS & quản lý tồn kho nhà thuốc",     category: "Vận hành", lessons: 10, duration: "4h 30m",  level: "Cơ bản",   enrolled: 2786, rating: 4.5 },
      { title: "Kỹ năng giao tiếp & xử lý khiếu nại KH",       category: "Dịch vụ KH",lessons: 8, duration: "3h 30m",  level: "Cơ bản",   enrolled: 2540, rating: 4.6 },
      { title: "Quản lý nhà thuốc Pharmacity",                 category: "Quản lý",  lessons: 16, duration: "9h 00m",  level: "Nâng cao", enrolled: 412,  rating: 4.7 },
    ],
    paths: [
      { id: "1", title: "Onboarding Dược sĩ mới", description: "Lộ trình 6 tuần cho dược sĩ mới gia nhập Pharmacity.", phases: [
        { title: "Tuần 1-2 - Văn hoá & quy chế dược", courses: 4, weeks: 2 },
        { title: "Tuần 3-4 - Tư vấn OTC & lâm sàng", courses: 5, weeks: 2 },
        { title: "Tuần 5 - Vận hành nhà thuốc & POS", courses: 3, weeks: 1 },
        { title: "Tuần 6 - Thực tập & sát hạch", courses: 2, weeks: 1 },
      ], enrolled: 624, status: "published" },
      { id: "2", title: "Lộ trình thăng tiến Dược sĩ trưởng", description: "Phát triển dược sĩ thành dược sĩ trưởng nhà thuốc.", phases: [
        { title: "Lâm sàng nâng cao", courses: 5, weeks: 4 },
        { title: "Quản lý ca & nhân sự", courses: 4, weeks: 3 },
        { title: "Báo cáo & vận hành nhà thuốc", courses: 4, weeks: 3 },
      ], enrolled: 245, status: "published" },
      { id: "3", title: "Đào tạo Quản lý nhà thuốc", description: "Lộ trình toàn diện cho QL nhà thuốc Pharmacity.", phases: [
        { title: "Quản trị vận hành nhà thuốc", courses: 5, weeks: 4 },
        { title: "Doanh thu, chi phí, tồn kho", courses: 4, weeks: 3 },
        { title: "Lãnh đạo & phát triển đội ngũ", courses: 4, weeks: 3 },
      ], enrolled: 84, status: "published" },
    ],
    assignments: [
      { id: "1", title: "Sát hạch nghiệp vụ dược Q1/2025",      type: "Trắc nghiệm", questions: 50, duration: 60, attempts: 2, createdAt: "2025-03-10", status: "published" },
      { id: "2", title: "Bài kiểm tra Quy chế dược 2025",        type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 1, createdAt: "2025-04-05", status: "published" },
      { id: "3", title: "Tình huống tư vấn OTC",                 type: "Tự luận",     questions: 8,  duration: 60, attempts: 1, createdAt: "2025-04-15", status: "published" },
      { id: "4", title: "Kiểm tra tương tác thuốc",              type: "Hỗn hợp",     questions: 25, duration: 50, attempts: 2, createdAt: "2025-03-22", status: "published" },
      { id: "5", title: "Sát hạch QL nhà thuốc cuối khoá",       type: "Hỗn hợp",     questions: 60, duration: 90, attempts: 1, createdAt: "2025-02-28", status: "published" },
      { id: "6", title: "Bài kiểm tra POS & tồn kho",            type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 3, createdAt: "2025-04-20", status: "draft" },
    ],
    questions: [
      { id: "1", content: "Khoảng cách dùng tối thiểu giữa Paracetamol 500mg cho người lớn?",       type: "single",   category: "Lâm sàng", difficulty: "Dễ" },
      { id: "2", content: "Trình bày tư vấn an toàn khi khách mua kháng sinh không có đơn.",        type: "essay",    category: "Tư vấn",   difficulty: "Khó" },
      { id: "3", content: "Thuốc nào sau đây tương tác nguy hiểm với Warfarin?",                    type: "multiple", category: "Lâm sàng", difficulty: "Trung bình" },
      { id: "4", content: "Quy trình bảo quản thuốc cần lạnh tại nhà thuốc Pharmacity?",            type: "essay",    category: "Vận hành", difficulty: "Trung bình" },
      { id: "5", content: "Liệt kê nhóm thuốc kê đơn theo Thông tư 20/2017/TT-BYT.",                type: "multiple", category: "Tuân thủ", difficulty: "Trung bình" },
      { id: "6", content: "Bước nào KHÔNG có trong quy trình tư vấn 5 bước Pharmacity?",            type: "single",   category: "Tư vấn",   difficulty: "Dễ" },
    ],
    certs: [
      { id: "1", name: "Chứng chỉ Hành nghề Dược nội bộ Pharmacity", template: "Vàng",     issued: 1245, createdAt: "2025-01-12" },
      { id: "2", name: "Chứng nhận Tư vấn OTC chuẩn Pharmacity",      template: "Bạc",      issued: 2180, createdAt: "2025-02-20" },
      { id: "3", name: "Chứng nhận Hoàn thành Onboarding Dược sĩ",    template: "Mặc định", issued: 624,  createdAt: "2025-03-15" },
      { id: "4", name: "Chứng nhận Quản lý Nhà thuốc",                template: "Vàng",     issued: 84,   createdAt: "2025-03-30" },
    ],
    surveys: [
      { id: "1", title: "Khảo sát hài lòng dược sĩ Q1/2025",     questions: 18, responses: 1842, status: "closed",  createdAt: "2025-01-15" },
      { id: "2", title: "Đánh giá chương trình đào tạo OTC",     questions: 12, responses: 982,  status: "running", createdAt: "2025-04-10" },
      { id: "3", title: "Khảo sát nhu cầu đào tạo 2025",         questions: 22, responses: 0,    status: "draft",   createdAt: "2025-04-22" },
    ],
    flashcards: [
      { id: "1", title: "100 hoạt chất thường gặp & biệt dược", cards: 100, category: "Lâm sàng", createdAt: "2025-01-20" },
      { id: "2", title: "Quy chế dược cần nhớ",                 cards: 65,  category: "Tuân thủ", createdAt: "2024-11-08" },
      { id: "3", title: "Phím tắt POS Pharmacity",              cards: 38,  category: "Vận hành", createdAt: "2025-03-04" },
      { id: "4", title: "Tương tác thuốc nguy hiểm",            cards: 80,  category: "Lâm sàng", createdAt: "2025-04-12" },
    ],
    roleNames: { STORE_MANAGER: "Quản lý nhà thuốc", EMPLOYEE: "Dược sĩ / Nhân viên" },
    stats: { totalEmployees: 4185, completionRate: 92, activeClasses: 38, upcomingClasses: 21, expiringClasses: 12, completedClasses: 246, certsThisMonth: 412, totalHours: "62,180h" },
    employees: [
      { name: "Phạm Quang Huy",   localpart: "huy.pq",   phone: "0901111222", role: "admin",   branch: "Hà Nội",  department: "Phòng Đào tạo Y khoa",     position: "Trưởng phòng Đào tạo Y khoa", status: "active", joinedAt: "2021-05-10" },
      { name: "Trần Thị Hương",   localpart: "huong.tt", phone: "0902222333", role: "admin",   branch: "TP.HCM",  department: "Phòng Vận hành Nhà thuốc", position: "Giám đốc Vùng",                status: "active", joinedAt: "2020-08-15" },
      { name: "Lê Quốc Bảo",      localpart: "bao.lq",   phone: "0903333444", role: "teacher", branch: "Đà Nẵng", department: "Phòng Quản lý Chất lượng", position: "Dược sĩ trưởng",               status: "active", joinedAt: "2022-02-20" },
      { name: "Đặng Thu Trang",   localpart: "trang.dt", phone: "0904444555", role: "teacher", branch: "TP.HCM",  department: "Phòng Marketing & CSKH",   position: "Dược sĩ trưởng",               status: "active", joinedAt: "2023-04-12" },
      { name: "Nguyễn Hồng Vân",  localpart: "van.nh",   phone: "0905555666", role: "student", branch: "Bình Dương",department: "Khu vực Miền Nam",       position: "Quản lý nhà thuốc",            status: "active", joinedAt: "2024-01-08" },
      { name: "Trần Văn Long",    localpart: "long.tv",  phone: "0906666777", role: "teacher", branch: "TP.HCM",  department: "Phòng Vận hành Nhà thuốc", position: "Giám sát vùng",                status: "active", joinedAt: "2023-07-21" },
      { name: "Hoàng Mỹ Linh",    localpart: "linh.hm",  phone: "0907777888", role: "student", branch: "Hà Nội",  department: "Khu vực Miền Bắc",         position: "Dược sĩ",                      status: "active", joinedAt: "2024-09-15" },
      { name: "Vũ Anh Tuấn",      localpart: "tuan.va",  phone: "0908888999", role: "student", branch: "TP.HCM",  department: "Khu vực Miền Nam",         position: "Dược sĩ",                      status: "active", joinedAt: "2024-11-02" },
      { name: "Lý Thanh Phong",   localpart: "phong.lt", phone: "0909999000", role: "student", branch: "Hà Nội",  department: "Khu vực Miền Bắc",         position: "Nhân viên bán thuốc",          status: "active", joinedAt: "2025-01-14" },
      { name: "Bùi Khánh Linh",   localpart: "linh.bk",  phone: "0900111222", role: "student", branch: "Đà Nẵng", department: "Phòng Vận hành Nhà thuốc", position: "Dược sĩ",                      status: "inactive", joinedAt: "2024-12-01" },
    ],
  },

  // ============================ DI ĐỘNG VIỆT ============================
  didongviet: {
    meta: ORGS[2],
    empPrefix: "DDV",
    classCodePrefix: "DDV-CLS",
    courseCodePrefix: "DDV-CRS",
    positions: ["Giám đốc Vùng", "Cửa hàng trưởng", "Trưởng nhóm bán hàng", "Tư vấn bán hàng", "Kỹ thuật viên", "Thu ngân", "Chuyên viên Đào tạo Sản phẩm"],
    branches: [
      { code: "HCM-Q1",  name: "Cửa hàng TP.HCM Quận 1",  address: "123 Nguyễn Trãi, Bến Thành, Q1",     phone: "028-3925-1234", mgr: "Trần Hoàng Nam",  emp: 32 },
      { code: "HCM-TB",  name: "Cửa hàng TP.HCM Tân Bình",address: "456 Trường Chinh, Tân Bình",         phone: "028-3826-5678", mgr: "Nguyễn Thanh Tùng",emp: 28 },
      { code: "HN-CG",   name: "Cửa hàng Hà Nội Cầu Giấy",address: "789 Cầu Giấy, Cầu Giấy, Hà Nội",     phone: "024-3756-9012", mgr: "Lê Minh Quang",   emp: 24 },
      { code: "DN-HC",   name: "Cửa hàng Đà Nẵng Hải Châu",address:"234 Lê Duẩn, Hải Châu, Đà Nẵng",     phone: "0236-3645-78",  mgr: "Phạm Thị Hồng",   emp: 18 },
      { code: "BH",      name: "Cửa hàng Biên Hoà",       address: "567 Phạm Văn Thuận, Tân Tiến",       phone: "0251-3856-90",  mgr: "Đỗ Văn Hùng",     emp: 16 },
    ],
    departments: [
      { code: "DT-SP", name: "Phòng Đào tạo Sản phẩm",       branch: "TP.HCM", head: "Nguyễn Thanh Tùng", emp: 14 },
      { code: "BH",    name: "Phòng Kinh doanh",             branch: "TP.HCM", head: "Trần Hoàng Nam",   emp: 412 },
      { code: "KT",    name: "Phòng Kỹ thuật & Bảo hành",    branch: "TP.HCM", head: "Đỗ Văn Hùng",      emp: 86  },
      { code: "MB",    name: "Khu vực Miền Bắc",             branch: "Hà Nội", head: "Lê Minh Quang",    emp: 124 },
      { code: "MN",    name: "Khu vực Miền Nam",             branch: "TP.HCM", head: "Trần Hoàng Nam",   emp: 412 },
      { code: "MKT",   name: "Phòng Marketing",              branch: "TP.HCM", head: "Vũ Thuỳ Linh",     emp: 12  },
    ],
    classrooms: [
      { name: "Onboarding Tư vấn bán hàng Q2/2025",                 type: "offline", status: "active",    students: 22, capacity: 25, teacher: "Nguyễn Thanh Tùng" },
      { name: "Sản phẩm mới: iPhone 17 Series - Bí kíp tư vấn",     type: "hybrid",  status: "active",    students: 86, capacity: 100,teacher: "Trần Hoàng Nam" },
      { name: "Kỹ năng chốt đơn & xử lý khách phân vân",            type: "online",  status: "active",    students: 124,capacity: 150,teacher: "Vũ Thuỳ Linh" },
      { name: "So sánh Samsung Galaxy S25 vs iPhone 17",            type: "online",  status: "active",    students: 156,capacity: 200,teacher: "Nguyễn Thanh Tùng" },
      { name: "Đào tạo Cửa hàng trưởng - Đợt 2/2025",               type: "offline", status: "completed", students: 12, capacity: 15, teacher: "Trần Hoàng Nam" },
      { name: "Tư vấn phụ kiện & gói bảo hành",                     type: "online",  status: "active",    students: 96, capacity: 120,teacher: "Vũ Thuỳ Linh" },
      { name: "Vận hành phần mềm bán hàng & quản lý IMEI",          type: "online",  status: "draft",     students: 8,  capacity: 20, teacher: "Đỗ Văn Hùng" },
      { name: "Bảo hành & xử lý khiếu nại sau bán",                 type: "offline", status: "active",    students: 28, capacity: 30, teacher: "Đỗ Văn Hùng" },
      { name: "Bán chéo: Apple Watch + iPhone + AirPods",           type: "online",  status: "active",    students: 64, capacity: 80, teacher: "Vũ Thuỳ Linh" },
    ],
    courses: [
      { title: "Kiến thức sản phẩm điện thoại 2025",        category: "Sản phẩm",  lessons: 24, duration: "10h 00m", level: "Cơ bản",    enrolled: 412, rating: 4.7 },
      { title: "Kỹ năng tư vấn & chốt đơn",                  category: "Sales",    lessons: 16, duration: "7h 30m",  level: "Trung cấp", enrolled: 386, rating: 4.8 },
      { title: "Sản phẩm Apple - iPhone, iPad, Mac, Watch",  category: "Sản phẩm",  lessons: 20, duration: "9h 00m",  level: "Trung cấp", enrolled: 348, rating: 4.9 },
      { title: "Sản phẩm Android - Samsung, Xiaomi, Oppo",   category: "Sản phẩm",  lessons: 18, duration: "8h 00m",  level: "Trung cấp", enrolled: 312, rating: 4.7 },
      { title: "Tư vấn phụ kiện & gói bảo hành VIP",         category: "Sales",    lessons: 10, duration: "4h 30m",  level: "Cơ bản",    enrolled: 287, rating: 4.6 },
      { title: "Quy trình bán hàng chuẩn Di Động Việt",      category: "Quy trình", lessons: 8,  duration: "3h 00m",  level: "Cơ bản",    enrolled: 412, rating: 4.5 },
      { title: "Bán chéo & up-sell trong cửa hàng",          category: "Sales",    lessons: 12, duration: "5h 00m",  level: "Nâng cao",  enrolled: 198, rating: 4.7 },
      { title: "Quản lý cửa hàng điện thoại di động",        category: "Quản lý",  lessons: 16, duration: "8h 30m",  level: "Nâng cao",  enrolled: 64,  rating: 4.8 },
    ],
    paths: [
      { id: "1", title: "Onboarding Tư vấn bán hàng mới", description: "Lộ trình 4 tuần cho NV bán hàng mới gia nhập Di Động Việt.", phases: [
        { title: "Tuần 1 - Văn hoá & quy trình", courses: 3, weeks: 1 },
        { title: "Tuần 2 - Kiến thức sản phẩm", courses: 5, weeks: 1 },
        { title: "Tuần 3 - Kỹ năng tư vấn & chốt đơn", courses: 4, weeks: 1 },
        { title: "Tuần 4 - Thực tập & sát hạch", courses: 2, weeks: 1 },
      ], enrolled: 248, status: "published" },
      { id: "2", title: "Lộ trình thăng tiến Trưởng nhóm bán hàng", description: "Phát triển NV bán hàng xuất sắc thành Trưởng nhóm.", phases: [
        { title: "Kỹ năng leadership cơ bản", courses: 4, weeks: 3 },
        { title: "Quản lý KPIs & doanh số", courses: 5, weeks: 4 },
        { title: "Coaching đội ngũ bán hàng", courses: 3, weeks: 3 },
      ], enrolled: 86, status: "published" },
      { id: "3", title: "Đào tạo Cửa hàng trưởng", description: "Lộ trình toàn diện cho Cửa hàng trưởng Di Động Việt.", phases: [
        { title: "Quản trị vận hành cửa hàng", courses: 5, weeks: 4 },
        { title: "Doanh thu, công nợ, tồn kho", courses: 4, weeks: 3 },
        { title: "Phát triển đội ngũ & dịch vụ KH", courses: 4, weeks: 3 },
      ], enrolled: 24, status: "published" },
    ],
    assignments: [
      { id: "1", title: "Sát hạch kiến thức iPhone 17 Series", type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 2, createdAt: "2025-03-15", status: "published" },
      { id: "2", title: "Bài test quy trình bán hàng Q1/2025",  type: "Trắc nghiệm", questions: 25, duration: 30, attempts: 1, createdAt: "2025-04-02", status: "published" },
      { id: "3", title: "Tình huống xử lý khách so sánh giá",   type: "Tự luận",     questions: 5,  duration: 45, attempts: 1, createdAt: "2025-04-10", status: "published" },
      { id: "4", title: "Kiểm tra phần mềm POS & quản lý IMEI", type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 3, createdAt: "2025-03-22", status: "published" },
      { id: "5", title: "Sát hạch Cửa hàng trưởng cuối khoá",   type: "Hỗn hợp",     questions: 50, duration: 90, attempts: 1, createdAt: "2025-02-28", status: "published" },
      { id: "6", title: "Bài test sản phẩm Samsung Galaxy S25", type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 2, createdAt: "2025-04-25", status: "draft" },
    ],
    questions: [
      { id: "1", content: "iPhone 17 Pro Max có bao nhiêu camera sau và độ phân giải?",          type: "single",   category: "Sản phẩm", difficulty: "Dễ" },
      { id: "2", content: "Trình bày 5 bước tư vấn bán hàng chuẩn Di Động Việt.",                type: "essay",    category: "Sales",   difficulty: "Trung bình" },
      { id: "3", content: "Khi khách so sánh giá với đối thủ, các kỹ thuật xử lý nào đúng?",     type: "multiple", category: "Sales",   difficulty: "Trung bình" },
      { id: "4", content: "Quy trình kiểm tra IMEI khi bán hàng máy mới?",                       type: "essay",    category: "Quy trình",difficulty: "Dễ" },
      { id: "5", content: "Liệt kê các phụ kiện bán kèm bắt buộc với iPhone.",                   type: "multiple", category: "Sales",   difficulty: "Dễ" },
      { id: "6", content: "Galaxy S25 Ultra có chip xử lý nào?",                                  type: "single",   category: "Sản phẩm", difficulty: "Trung bình" },
    ],
    certs: [
      { id: "1", name: "Chứng nhận Tư vấn bán hàng chuẩn DDV", template: "Mặc định", issued: 412, createdAt: "2025-02-12" },
      { id: "2", name: "Chứng nhận Top Seller Quý 1/2025",     template: "Vàng",     issued: 24,  createdAt: "2025-04-02" },
      { id: "3", name: "Chứng nhận Hoàn thành Onboarding NV",  template: "Mặc định", issued: 248, createdAt: "2025-02-20" },
      { id: "4", name: "Chứng nhận Cửa hàng trưởng DDV",        template: "Bạc",      issued: 24,  createdAt: "2025-03-15" },
    ],
    surveys: [
      { id: "1", title: "Khảo sát hài lòng nhân viên Q1/2025",      questions: 14, responses: 386, status: "closed",  createdAt: "2025-01-15" },
      { id: "2", title: "Đánh giá đào tạo sản phẩm iPhone 17",      questions: 10, responses: 248, status: "running", createdAt: "2025-04-10" },
      { id: "3", title: "Khảo sát nhu cầu đào tạo H2/2025",         questions: 18, responses: 0,   status: "draft",   createdAt: "2025-04-22" },
    ],
    flashcards: [
      { id: "1", title: "Thông số sản phẩm iPhone 2024-2025",   cards: 64, category: "Sản phẩm", createdAt: "2025-01-20" },
      { id: "2", title: "Bí kíp xử lý từ chối phổ biến",        cards: 35, category: "Sales",   createdAt: "2025-02-08" },
      { id: "3", title: "Phím tắt phần mềm POS DDV",            cards: 28, category: "Vận hành",createdAt: "2025-03-04" },
      { id: "4", title: "So sánh nhanh Apple vs Android flagship",cards:42, category: "Sản phẩm", createdAt: "2025-04-12" },
    ],
    roleNames: { STORE_MANAGER: "Cửa hàng trưởng", EMPLOYEE: "Tư vấn bán hàng" },
    stats: { totalEmployees: 412, completionRate: 89, activeClasses: 18, upcomingClasses: 9, expiringClasses: 4, completedClasses: 86, certsThisMonth: 64, totalHours: "9,820h" },
    employees: [
      { name: "Trần Hoàng Nam",     localpart: "nam.th",   phone: "0911222333", role: "admin",   branch: "TP.HCM Quận 1",  department: "Phòng Kinh doanh",            position: "Giám đốc Vùng",          status: "active",   joinedAt: "2021-04-12" },
      { name: "Nguyễn Thanh Tùng",  localpart: "tung.nt",  phone: "0912333444", role: "teacher", branch: "TP.HCM Tân Bình",department: "Phòng Đào tạo Sản phẩm",     position: "Chuyên viên Đào tạo Sản phẩm", status: "active", joinedAt: "2022-08-01" },
      { name: "Lê Minh Quang",      localpart: "quang.lm", phone: "0913444555", role: "admin",   branch: "Hà Nội Cầu Giấy",department: "Khu vực Miền Bắc",           position: "Cửa hàng trưởng",         status: "active",   joinedAt: "2022-11-20" },
      { name: "Phạm Thị Hồng",      localpart: "hong.pt",  phone: "0914555666", role: "student", branch: "Đà Nẵng Hải Châu",department:"Khu vực Miền Nam",           position: "Cửa hàng trưởng",         status: "active",   joinedAt: "2023-05-15" },
      { name: "Đỗ Văn Hùng",        localpart: "hung.dv",  phone: "0915666777", role: "teacher", branch: "Biên Hoà",        department:"Phòng Kỹ thuật & Bảo hành",   position: "Kỹ thuật viên",           status: "active",   joinedAt: "2022-02-10" },
      { name: "Vũ Thuỳ Linh",       localpart: "linh.vt",  phone: "0916777888", role: "teacher", branch: "TP.HCM Quận 1",   department:"Phòng Marketing",             position: "Chuyên viên Đào tạo Sản phẩm", status: "active", joinedAt: "2023-09-08" },
      { name: "Hoàng Anh Khoa",     localpart: "khoa.ha",  phone: "0917888999", role: "student", branch: "TP.HCM Tân Bình", department:"Phòng Kinh doanh",            position: "Tư vấn bán hàng",         status: "active",   joinedAt: "2024-06-20" },
      { name: "Bùi Quốc Việt",      localpart: "viet.bq",  phone: "0918999000", role: "student", branch: "Hà Nội Cầu Giấy", department:"Khu vực Miền Bắc",           position: "Trưởng nhóm bán hàng",    status: "active",   joinedAt: "2024-09-15" },
      { name: "Ngô Thanh Tâm",      localpart: "tam.nt",   phone: "0919000111", role: "student", branch: "TP.HCM Quận 1",   department:"Phòng Kinh doanh",            position: "Tư vấn bán hàng",         status: "active",   joinedAt: "2025-02-20" },
      { name: "Lý Phương Thảo",     localpart: "thao.lp",  phone: "0910111222", role: "student", branch: "Biên Hoà",        department:"Phòng Kinh doanh",            position: "Thu ngân",                 status: "inactive", joinedAt: "2024-12-01" },
    ],
  },

  // ============================ CIRCLE K ============================
  circlek: {
    meta: ORGS[3],
    empPrefix: "CKV",
    classCodePrefix: "CKV-CLS",
    courseCodePrefix: "CKV-CRS",
    positions: ["Giám đốc Vùng", "Quản lý cửa hàng", "Trưởng ca", "Nhân viên bán hàng", "Nhân viên thu ngân", "Giám sát vùng", "Chuyên viên Đào tạo"],
    branches: [
      { code: "HCM", name: "Khu vực TP.HCM",        address: "Tầng 7, Saigon Centre, Quận 1",       phone: "028-3520-1100",  mgr: "Nguyễn Quốc Anh", emp: 1240 },
      { code: "HN",  name: "Khu vực Hà Nội",        address: "Tầng 5, Lotte Centre, Ba Đình",       phone: "024-3333-1100",  mgr: "Trần Thuý Diễm", emp: 580 },
      { code: "BD",  name: "Khu vực Bình Dương",    address: "78 Đại lộ Bình Dương, Thuận An",      phone: "0274-3878-90",   mgr: "Lê Hữu Nghĩa",   emp: 245 },
      { code: "DN",  name: "Khu vực Đà Nẵng",       address: "12 Nguyễn Văn Linh, Hải Châu",        phone: "0236-3868-77",   mgr: "Phan Bích Trâm", emp: 145 },
    ],
    departments: [
      { code: "DT",   name: "Phòng Đào tạo & Vận hành", branch: "TP.HCM", head: "Nguyễn Quốc Anh", emp: 28 },
      { code: "VH",   name: "Phòng Vận hành Cửa hàng",  branch: "TP.HCM", head: "Trần Thuý Diễm",  emp: 215 },
      { code: "MB",   name: "Khu vực Miền Bắc",         branch: "Hà Nội", head: "Trần Thuý Diễm",  emp: 580 },
      { code: "MN",   name: "Khu vực Miền Nam",         branch: "TP.HCM", head: "Nguyễn Quốc Anh", emp: 1240 },
      { code: "MKT",  name: "Phòng Marketing",          branch: "TP.HCM", head: "Đặng Hoàng Yến",  emp: 16  },
      { code: "QC",   name: "Phòng Kiểm soát chất lượng",branch:"TP.HCM",  head: "Lê Hữu Nghĩa",   emp: 24  },
    ],
    classrooms: [
      { name: "Onboarding NV cửa hàng Q2/2025",                 type: "offline", status: "active",    students: 38, capacity: 40, teacher: "Đặng Hoàng Yến" },
      { name: "Quy trình mở/đóng ca cửa hàng 24/7",             type: "hybrid",  status: "active",    students: 96, capacity: 120,teacher: "Lê Hữu Nghĩa" },
      { name: "An toàn vệ sinh thực phẩm - Hot dish",           type: "online",  status: "active",    students: 246,capacity: 300,teacher: "Phan Bích Trâm" },
      { name: "Kỹ năng phục vụ KH 24/7",                        type: "online",  status: "active",    students: 312,capacity: 400,teacher: "Đặng Hoàng Yến" },
      { name: "Đào tạo Quản lý cửa hàng - Đợt 1/2025",          type: "offline", status: "completed", students: 22, capacity: 25, teacher: "Nguyễn Quốc Anh" },
      { name: "Vận hành POS Circle K & loyalty CK Club",        type: "online",  status: "active",    students: 412,capacity: 500,teacher: "Lê Hữu Nghĩa" },
      { name: "Phòng chống mất mát hàng hoá (Loss Prevention)", type: "online",  status: "draft",     students: 18, capacity: 30, teacher: "Phan Bích Trâm" },
      { name: "Pha chế đồ uống Circle K - Slurpee, Coffee",     type: "offline", status: "active",    students: 86, capacity: 100,teacher: "Đặng Hoàng Yến" },
      { name: "Xử lý sự cố ca đêm - An ninh & y tế",            type: "online",  status: "active",    students: 245,capacity: 300,teacher: "Lê Hữu Nghĩa" },
    ],
    courses: [
      { title: "Quy trình vận hành cửa hàng tiện lợi 24/7",    category: "Vận hành",   lessons: 16, duration: "7h 00m", level: "Cơ bản",    enrolled: 1245, rating: 4.7 },
      { title: "Kỹ năng phục vụ khách hàng nhanh & thân thiện", category: "Dịch vụ KH",lessons: 10, duration: "4h 30m", level: "Cơ bản",    enrolled: 1840, rating: 4.8 },
      { title: "An toàn vệ sinh thực phẩm cho hot dish",       category: "Tuân thủ",   lessons: 12, duration: "5h 30m", level: "Cơ bản",    enrolled: 2120, rating: 4.9 },
      { title: "Vận hành POS Circle K & CK Club loyalty",      category: "Vận hành",   lessons: 14, duration: "6h 00m", level: "Cơ bản",    enrolled: 2050, rating: 4.6 },
      { title: "Pha chế đồ uống & Slurpee chuẩn",              category: "Pha chế",    lessons: 10, duration: "4h 00m", level: "Cơ bản",    enrolled: 1456, rating: 4.7 },
      { title: "Phòng chống mất mát & an ninh ca đêm",         category: "An ninh",    lessons: 8,  duration: "3h 30m", level: "Trung cấp", enrolled: 1240, rating: 4.5 },
      { title: "Up-sell & combo sản phẩm tại quầy",            category: "Sales",      lessons: 9,  duration: "4h 00m", level: "Trung cấp", enrolled: 980,  rating: 4.6 },
      { title: "Quản lý cửa hàng tiện lợi 24/7",               category: "Quản lý",    lessons: 18, duration: "9h 00m", level: "Nâng cao",  enrolled: 245,  rating: 4.7 },
    ],
    paths: [
      { id: "1", title: "Onboarding NV cửa hàng tiện lợi", description: "Lộ trình 3 tuần cho NV mới gia nhập Circle K.", phases: [
        { title: "Tuần 1 - Văn hoá & nội quy", courses: 3, weeks: 1 },
        { title: "Tuần 2 - Vận hành & POS", courses: 5, weeks: 1 },
        { title: "Tuần 3 - Dịch vụ KH & sát hạch", courses: 3, weeks: 1 },
      ], enrolled: 412, status: "published" },
      { id: "2", title: "Lộ trình thăng tiến Trưởng ca", description: "Phát triển NV xuất sắc thành Trưởng ca Circle K.", phases: [
        { title: "Kỹ năng quản lý ca 24/7", courses: 4, weeks: 3 },
        { title: "Quản lý nhân sự ca làm", courses: 4, weeks: 3 },
        { title: "Báo cáo & vận hành cửa hàng", courses: 3, weeks: 2 },
      ], enrolled: 156, status: "published" },
      { id: "3", title: "Đào tạo Quản lý cửa hàng tiện lợi", description: "Lộ trình toàn diện cho QL cửa hàng Circle K.", phases: [
        { title: "Quản trị vận hành 24/7", courses: 5, weeks: 4 },
        { title: "Doanh thu, hao hụt, tồn kho", courses: 4, weeks: 3 },
        { title: "Lãnh đạo đội ngũ ca làm", courses: 4, weeks: 3 },
      ], enrolled: 86, status: "published" },
    ],
    assignments: [
      { id: "1", title: "Sát hạch quy trình vận hành Q1/2025",  type: "Trắc nghiệm", questions: 30, duration: 45, attempts: 2, createdAt: "2025-03-08", status: "published" },
      { id: "2", title: "Bài test VSATTP hot dish T5/2025",     type: "Trắc nghiệm", questions: 25, duration: 30, attempts: 1, createdAt: "2025-05-02", status: "published" },
      { id: "3", title: "Tình huống xử lý KH ca đêm",            type: "Tự luận",     questions: 5,  duration: 45, attempts: 1, createdAt: "2025-04-12", status: "published" },
      { id: "4", title: "Kiểm tra POS & CK Club loyalty",        type: "Trắc nghiệm", questions: 20, duration: 30, attempts: 3, createdAt: "2025-03-25", status: "published" },
      { id: "5", title: "Sát hạch Quản lý cửa hàng cuối khoá",   type: "Hỗn hợp",     questions: 50, duration: 90, attempts: 1, createdAt: "2025-02-28", status: "published" },
      { id: "6", title: "Bài test pha chế Slurpee chuẩn",        type: "Trắc nghiệm", questions: 15, duration: 20, attempts: 2, createdAt: "2025-04-22", status: "draft" },
    ],
    questions: [
      { id: "1", content: "Quy trình mở ca sáng cửa hàng Circle K gồm mấy bước bắt buộc?",      type: "single",   category: "Vận hành",  difficulty: "Dễ" },
      { id: "2", content: "Trình bày cách xử lý khi KH bị ngộ độc thức ăn tại cửa hàng.",       type: "essay",    category: "An toàn",   difficulty: "Khó" },
      { id: "3", content: "Tỷ lệ Slurpee Coca cần điều chỉnh ở nhiệt độ nào?",                  type: "single",   category: "Pha chế",   difficulty: "Trung bình" },
      { id: "4", content: "Các bước thanh toán & tích điểm CK Club đúng quy trình?",            type: "multiple", category: "Vận hành",  difficulty: "Dễ" },
      { id: "5", content: "Liệt kê các nhóm hàng có nguy cơ mất mát cao tại cửa hàng tiện lợi.",type: "multiple", category: "An ninh",   difficulty: "Trung bình" },
      { id: "6", content: "Mô tả quy trình kiểm kê hàng nhanh đầu/cuối ca.",                    type: "essay",    category: "Vận hành",  difficulty: "Trung bình" },
    ],
    certs: [
      { id: "1", name: "Chứng chỉ Vệ sinh An toàn Thực phẩm CK", template: "Mặc định", issued: 1840, createdAt: "2025-01-12" },
      { id: "2", name: "Chứng nhận NV Xuất sắc Quý 1/2025",       template: "Vàng",     issued: 64,   createdAt: "2025-04-02" },
      { id: "3", name: "Chứng nhận Hoàn thành Onboarding CK",     template: "Mặc định", issued: 412,  createdAt: "2025-02-20" },
      { id: "4", name: "Chứng nhận Quản lý cửa hàng CK",          template: "Bạc",      issued: 86,   createdAt: "2025-03-15" },
    ],
    surveys: [
      { id: "1", title: "Khảo sát hài lòng NV Q1/2025",         questions: 16, responses: 1245, status: "closed",  createdAt: "2025-01-15" },
      { id: "2", title: "Đánh giá chương trình đào tạo POS",    questions: 10, responses: 642,  status: "running", createdAt: "2025-04-10" },
      { id: "3", title: "Khảo sát nhu cầu đào tạo 2025",        questions: 18, responses: 0,    status: "draft",   createdAt: "2025-04-22" },
    ],
    flashcards: [
      { id: "1", title: "Mã sản phẩm hot bán chạy CK",          cards: 96, category: "Vận hành", createdAt: "2025-01-20" },
      { id: "2", title: "Thuật ngữ VSATTP hot dish",            cards: 48, category: "Tuân thủ", createdAt: "2024-11-08" },
      { id: "3", title: "Phím tắt POS Circle K",                cards: 36, category: "Vận hành", createdAt: "2025-03-04" },
      { id: "4", title: "Combo & khuyến mãi đang chạy",         cards: 32, category: "Sales",    createdAt: "2025-04-12" },
    ],
    roleNames: { STORE_MANAGER: "Quản lý cửa hàng tiện lợi", EMPLOYEE: "Nhân viên cửa hàng" },
    stats: { totalEmployees: 2210, completionRate: 84, activeClasses: 31, upcomingClasses: 18, expiringClasses: 9, completedClasses: 184, certsThisMonth: 248, totalHours: "32,640h" },
    employees: [
      { name: "Nguyễn Quốc Anh",   localpart: "anh.nq",   phone: "0921111222", role: "admin",   branch: "TP.HCM",       department:"Phòng Đào tạo & Vận hành", position:"Giám đốc Vùng",                status: "active", joinedAt: "2020-06-01" },
      { name: "Trần Thuý Diễm",    localpart: "diem.tt",  phone: "0922222333", role: "admin",   branch: "Hà Nội",       department:"Khu vực Miền Bắc",         position:"Giám đốc Vùng",                status: "active", joinedAt: "2021-03-15" },
      { name: "Lê Hữu Nghĩa",      localpart: "nghia.lh", phone: "0923333444", role: "teacher", branch: "Bình Dương",   department:"Phòng Kiểm soát chất lượng",position:"Giám sát vùng",                status: "active", joinedAt: "2022-04-12" },
      { name: "Phan Bích Trâm",    localpart: "tram.pb",  phone: "0924444555", role: "teacher", branch: "Đà Nẵng",      department:"Phòng Vận hành Cửa hàng",   position:"Chuyên viên Đào tạo",          status: "active", joinedAt: "2023-02-08" },
      { name: "Đặng Hoàng Yến",    localpart: "yen.dh",   phone: "0925555666", role: "teacher", branch: "TP.HCM",       department:"Phòng Marketing",           position:"Chuyên viên Đào tạo",          status: "active", joinedAt: "2023-08-21" },
      { name: "Trương Văn Khải",   localpart: "khai.tv",  phone: "0926666777", role: "student", branch: "TP.HCM",       department:"Khu vực Miền Nam",          position:"Quản lý cửa hàng",             status: "active", joinedAt: "2024-04-15" },
      { name: "Mai Thanh Hằng",    localpart: "hang.mt",  phone: "0927777888", role: "student", branch: "Hà Nội",       department:"Khu vực Miền Bắc",          position:"Trưởng ca",                    status: "active", joinedAt: "2024-09-12" },
      { name: "Vũ Quốc Trung",     localpart: "trung.vq", phone: "0928888999", role: "student", branch: "TP.HCM",       department:"Phòng Vận hành Cửa hàng",   position:"Nhân viên bán hàng",           status: "active", joinedAt: "2025-01-08" },
      { name: "Đinh Thuỳ Trang",   localpart: "trang.dt", phone: "0929999000", role: "student", branch: "Bình Dương",   department:"Khu vực Miền Nam",          position:"Nhân viên thu ngân",           status: "active", joinedAt: "2025-02-20" },
      { name: "Hà Khánh Linh",     localpart: "linh.hk",  phone: "0920111222", role: "student", branch: "Đà Nẵng",      department:"Phòng Vận hành Cửa hàng",   position:"Nhân viên bán hàng",           status: "inactive", joinedAt: "2024-12-01" },
    ],
  },
};

// ---------- Builder ----------
function buildDataset(orgId: OrgId): OrgDataset {
  const c = CONFIGS[orgId];
  const meta = c.meta;

  const employees: Employee[] = c.employees.map((e, i) => ({
    id: String(i + 1),
    code: `${c.empPrefix}${String(i + 1).padStart(4, "0")}`,
    name: e.name,
    email: `${e.localpart}@${meta.domain}`,
    phone: e.phone,
    role: e.role,
    branch: e.branch,
    department: e.department,
    position: e.position,
    status: e.status,
    joinedAt: e.joinedAt,
  }));

  const branches: Branch[] = c.branches.map((b, i) => ({
    id: String(i + 1),
    code: b.code,
    name: b.name,
    address: b.address,
    phone: b.phone,
    manager: b.mgr,
    employees: b.emp,
  }));

  const departments: Department[] = c.departments.map((d, i) => ({
    id: String(i + 1),
    code: d.code,
    name: d.name,
    branch: d.branch,
    head: d.head,
    employees: d.emp,
  }));

  const classrooms: Classroom[] = c.classrooms.map((cl, i) => {
    const startMonth = (i % 6) + 1;
    return {
      id: String(i + 1),
      name: cl.name,
      code: `${c.classCodePrefix}-${String(i + 101).padStart(4, "0")}`,
      type: cl.type,
      status: cl.status,
      students: cl.students,
      capacity: cl.capacity,
      startDate: `2025-0${startMonth}-01`,
      endDate: `2025-0${Math.min(startMonth + 2, 9)}-30`,
      teacher: cl.teacher,
      cover: COVERS[i % COVERS.length],
      progress: [72, 45, 91, 38, 100, 22, 5, 64, 50][i] ?? 50,
    };
  });

  const courses: Course[] = c.courses.map((cr, i) => ({
    id: String(i + 1),
    title: cr.title,
    code: `${c.courseCodePrefix}-${String(i + 1).padStart(3, "0")}`,
    category: cr.category,
    lessons: cr.lessons,
    duration: cr.duration,
    level: cr.level,
    enrolled: cr.enrolled,
    rating: cr.rating,
    cover: COVERS[i % COVERS.length],
    description: `Khoá đào tạo nội bộ áp dụng cho nhân viên ${meta.name} toàn quốc.`,
  }));

  const baseRoles: Role[] = [
    { id: "1", code: "SUPER_ADMIN",       name: "Quản trị hệ thống",         description: `Toàn quyền trên toàn bộ LMS ${meta.name}`, permissions: 64, users: 2 },
    { id: "2", code: "TRAINING_MANAGER",  name: "Trưởng phòng Đào tạo",      description: "Quản trị toàn bộ chương trình đào tạo nội bộ", permissions: 48, users: 4 },
    { id: "3", code: "TRAINER",           name: "Chuyên viên Đào tạo",       description: "Soạn bài, chấm bài, quản lý lớp được phân", permissions: 22, users: 18 },
    { id: "4", code: "AREA_SUPERVISOR",   name: "Giám sát vùng",             description: "Theo dõi tiến độ học tập khu vực phụ trách", permissions: 16, users: 12 },
    { id: "5", code: "STORE_MANAGER",     name: c.roleNames.STORE_MANAGER ?? "Quản lý cửa hàng",  description: "Theo dõi đào tạo nhân viên cửa hàng", permissions: 12, users: Math.round(c.stats.totalEmployees / 8) },
    { id: "6", code: "EMPLOYEE",          name: c.roleNames.EMPLOYEE ?? "Nhân viên",              description: "Tham gia học tập và làm bài kiểm tra", permissions: 6,  users: c.stats.totalEmployees },
  ];

  const plans: Plan[] = [
    { id: "1", name: `Kế hoạch đào tạo ${meta.short} Q2/2025`, year: 2025, quarter: 2, totalCourses: 18, totalLearners: Math.round(c.stats.totalEmployees * 0.5), budget: "520,000,000đ", status: "running" },
    { id: "2", name: `Kế hoạch đào tạo ${meta.short} Q1/2025`, year: 2025, quarter: 1, totalCourses: 12, totalLearners: c.stats.totalEmployees,                       budget: "310,000,000đ", status: "completed" },
    { id: "3", name: `Onboarding nhân viên mới Q3/2025`,        year: 2025, quarter: 3, totalCourses: 8,  totalLearners: Math.round(c.stats.totalEmployees * 0.3), budget: "240,000,000đ", status: "approved" },
    { id: "4", name: `Đào tạo Quản lý cửa hàng 2025`,           year: 2025, quarter: 4, totalCourses: 12, totalLearners: Math.round(c.stats.totalEmployees / 8),  budget: "180,000,000đ", status: "draft" },
  ];

  return {
    meta,
    employees,
    branches,
    departments,
    positions: c.positions,
    branchNames: branches.map(b => b.name.replace(/^(Chi nhánh|Khu vực|Cửa hàng) /, "")),
    departmentNames: departments.map(d => d.name),
    classrooms,
    courses,
    learningPaths: c.paths,
    assignments: c.assignments,
    questions: c.questions,
    plans,
    roles: baseRoles,
    certificates: c.certs,
    surveys: c.surveys,
    flashcards: c.flashcards,
    stats: c.stats,
  };
}

export const ORG_DATASETS: Record<OrgId, OrgDataset> = {
  highlands:  buildDataset("highlands"),
  pharmacity: buildDataset("pharmacity"),
  didongviet: buildDataset("didongviet"),
  circlek:    buildDataset("circlek"),
};

export function getOrgDataset(id: OrgId): OrgDataset {
  return ORG_DATASETS[id];
}
