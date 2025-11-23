import { CalenderStatus } from "@/shared/ui/calendar";
import dayjs from "dayjs";

export type CourseRow = {
  id: string;
  label: string;
  name: string;
  tag: string;
  mode: "Trực tuyến (Online)" | "Trực tiếp (Offline)";
  students: string;
  lecturer: string;
  avatar: string;
  times: string[];
};

export type TimeRange = "year" | "month" | "week";

export const timeRangeOptions = [
  { label: "Năm", value: "year" },
  { label: "Tháng", value: "month" },
  { label: "Tuần", value: "week" },
] as const;

type PercentageItem = { label: string; value: number };

export const participationRateByRange: Record<TimeRange, PercentageItem[]> = {
  year: [
    { label: "Chuyển đổi số doanh nghiệp", value: 83 },
    { label: "Quản trị vận hành", value: 76 },
    { label: "Phát triển lãnh đạo", value: 72 },
    { label: "Data Analytics", value: 79 },
    { label: "Kỹ năng mềm", value: 68 },
  ],
  month: [
    { label: "Chuyển đổi số doanh nghiệp", value: 76 },
    { label: "Quản trị vận hành", value: 72 },
    { label: "Phát triển lãnh đạo", value: 69 },
    { label: "Data Analytics", value: 74 },
    { label: "Kỹ năng mềm", value: 65 },
  ],
  week: [
    { label: "Chuyển đổi số doanh nghiệp", value: 69 },
    { label: "Quản trị vận hành", value: 64 },
    { label: "Phát triển lãnh đạo", value: 61 },
    { label: "Data Analytics", value: 67 },
    { label: "Kỹ năng mềm", value: 59 },
  ],
};

export const channelParticipationByRange: Record<TimeRange, PercentageItem[]> = {
  year: [
    { label: "Online", value: 62 },
    { label: "Offline", value: 48 },
    { label: "eLearning", value: 78 },
  ],
  month: [
    { label: "Online", value: 58 },
    { label: "Offline", value: 46 },
    { label: "eLearning", value: 74 },
  ],
  week: [
    { label: "Online", value: 55 },
    { label: "Offline", value: 44 },
    { label: "eLearning", value: 70 },
  ],
};

type CompletionSnapshot = { completed: number; total: number };

export const completionRateByRange: Record<TimeRange, CompletionSnapshot> = {
  year: { completed: 360, total: 480 },
  month: { completed: 142, total: 190 },
  week: { completed: 58, total: 82 },
};

export type RankingCourse = {
  title: string;
  score: number;
};

export const courseRankingByRange: Record<TimeRange, { top: RankingCourse[]; low: RankingCourse[] }> = {
  year: {
    top: [
      { title: "Chuyển đổi số doanh nghiệp", score: 92 },
      { title: "Khai thác dữ liệu nâng cao", score: 88 },
      { title: "Xây dựng văn hóa học tập", score: 85 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 82 },
      { title: "Tối ưu vận hành số", score: 79 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 64 },
      { title: "Kỹ năng thuyết trình", score: 61 },
      { title: "Vận hành dự án", score: 59 },
      { title: "Quản trị rủi ro", score: 57 },
      { title: "Kỹ năng bán hàng", score: 54 },
    ],
  },
  month: {
    top: [
      { title: "Chuyển đổi số doanh nghiệp", score: 90 },
      { title: "Khai thác dữ liệu nâng cao", score: 86 },
      { title: "Xây dựng văn hóa học tập", score: 83 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 80 },
      { title: "Tối ưu vận hành số", score: 77 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 60 },
      { title: "Kỹ năng thuyết trình", score: 58 },
      { title: "Vận hành dự án", score: 56 },
      { title: "Quản trị rủi ro", score: 54 },
      { title: "Kỹ năng bán hàng", score: 51 },
    ],
  },
  week: {
    top: [
      { title: "Chuyển đổi số doanh nghiệp", score: 88 },
      { title: "Khai thác dữ liệu nâng cao", score: 84 },
      { title: "Xây dựng văn hóa học tập", score: 81 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 78 },
      { title: "Tối ưu vận hành số", score: 74 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 58 },
      { title: "Kỹ năng thuyết trình", score: 56 },
      { title: "Vận hành dự án", score: 54 },
      { title: "Quản trị rủi ro", score: 52 },
      { title: "Kỹ năng bán hàng", score: 49 },
    ],
  },
};

export const summaryCards = [
  {
    title: "Lớp học đang diễn ra",
    value: "12",
    icon: "in-progress",
    colors: { bg: "#FFB0E8", icon: "#f062c0" },
  },
  {
    title: "Lớp học sắp diễn ra",
    value: "9",
    icon: "upcoming",
    colors: { bg: "#CDDEFF", icon: "#648efc" },
  },
  {
    title: "Lớp học sắp hết hạn",
    value: "5",
    icon: "expiring",
    colors: { bg: "#9723F914", icon: "#648efc" },
  },
  {
    title: "Lớp học đã diễn ra",
    value: "34",
    icon: "completed",
    colors: { bg: "#FFD365", icon: "#f5a524" },
  },
];

const currentMonth = dayjs().startOf("month");

const buildDate = (dayOfMonth: number, hour: number, minute: number = 0) =>
  currentMonth
    .clone()
    .date(dayOfMonth)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);

const formatTimeSlot = (dayOfMonth: number, hour: number, minute = 0) =>
  buildDate(dayOfMonth, hour, minute).format("HH:mm DD/MM/YYYY");

export const courseRows: CourseRow[] = [
  {
    id: "1",
    label: "Đơn",
    name: "AI ứng dụng cho Doanh nghiệp: Cơ bản đến nâng cao",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "26",
    lecturer: "Nguyễn Thị Mai Linh",
    avatar: "https://i.pravatar.cc/100?img=32",
    times: [formatTimeSlot(5, 9), formatTimeSlot(6, 19)],
  },
  {
    id: "2",
    label: "Chuỗi",
    name: "Xây dựng năng lực lãnh đạo trong kỷ nguyên số",
    tag: "Chất lượng",
    mode: "Trực tiếp (Offline)",
    students: "32",
    lecturer: "Phạm Quang Huy",
    avatar: "https://i.pravatar.cc/100?img=54",
    times: [formatTimeSlot(8, 14)],
  },
  {
    id: "3",
    label: "Đơn",
    name: "Thiết kế chương trình đào tạo nội bộ hiệu quả",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "18",
    lecturer: "Vũ Thùy Dương",
    avatar: "https://i.pravatar.cc/100?img=16",
    times: [formatTimeSlot(10, 19)],
  },
  {
    id: "4",
    label: "Đơn",
    name: "Product-led Growth cho đội ngũ bán hàng B2B",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "24",
    lecturer: "Đỗ Minh Đức",
    avatar: "https://i.pravatar.cc/100?img=25",
    times: [formatTimeSlot(12, 9)],
  },
  {
    id: "5",
    label: "Đơn",
    name: "Kỹ năng trình bày dữ liệu với Power BI",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "21",
    lecturer: "Trần Hải An",
    avatar: "https://i.pravatar.cc/100?img=46",
    times: [formatTimeSlot(15, 13, 30)],
  },
  {
    id: "6",
    label: "Đơn",
    name: "Chuyển đổi số quy trình vận hành",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "27",
    lecturer: "Lê Hoài Nam",
    avatar: "https://i.pravatar.cc/100?img=63",
    times: [formatTimeSlot(18, 15)],
  },
  {
    id: "7",
    label: "Đơn",
    name: "Xây dựng văn hóa học tập trong doanh nghiệp",
    tag: "Chất lượng",
    mode: "Trực tuyến (Online)",
    students: "19",
    lecturer: "Nguyễn Mai Chi",
    avatar: "https://i.pravatar.cc/100?img=36",
    times: [formatTimeSlot(22, 19, 30)],
  },
];

export const mockEvents = [
  {
    id: "event-1",
    title: "Lớp Ứng dụng AI vào Doanh nghiệp",
    start: buildDate(3, 9, 0).toISOString(),
    frames: [{ id: "frame-1" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "09:00 - 11:00",
    avatarUrl: `https://i.pravatar.cc/100?img=9`,
  },
  {
    id: "event-2",
    title: "Tư Duy Phản Biện & Giải Quyết Vấn Đề",
    start: buildDate(8, 14, 0).toISOString(),
    frames: [{ id: "frame-2" }],
    status: CalenderStatus.APPROVED,
    mode: "Offline",
    time: "14:00 - 16:00",
    avatarUrl: `https://i.pravatar.cc/100?img=10`,
  },
  {
    id: "event-3",
    title: "Nghệ Thuật Giao Tiếp Trong Đội Nhóm",
    start: buildDate(12, 18, 30).toISOString(),
    frames: [{ id: "frame-3" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "18:30 - 20:00",
    avatarUrl: `https://i.pravatar.cc/100?img=11`,
  },
  {
    id: "event-4",
    title: "Chiến Lược Xây Dựng Văn Hóa Học Tập",
    start: buildDate(16, 10, 0).toISOString(),
    frames: [{ id: "frame-4" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "10:00 - 11:30",
    avatarUrl: `https://i.pravatar.cc/100?img=12`,
  },
  {
    id: "event-5",
    title: "Chiến Lược Xây Dựng Văn Hóa Học Tập",
    start: buildDate(18, 10, 0).toISOString(),
    frames: [{ id: "frame-5" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "10:00 - 11:30",
    avatarUrl: `https://i.pravatar.cc/100?img=12`,
  },
  {
    id: "event-6",
    title: "Workshop Thiết Kế Trải Nghiệm Học Tập",
    start: buildDate(20, 15, 0).toISOString(),
    frames: [{ id: "frame-6" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "15:00 - 16:30",
    avatarUrl: `https://i.pravatar.cc/100?img=21`,
  },
  {
    id: "event-7",
    title: "Chiến Lược Tái Đào Tạo Nhân Viên",
    start: buildDate(22, 8, 30).toISOString(),
    frames: [{ id: "frame-7" }],
    status: CalenderStatus.APPROVED,
    mode: "Offline",
    time: "08:30 - 10:00",
    avatarUrl: `https://i.pravatar.cc/100?img=18`,
  },
  {
    id: "event-8",
    title: "Huấn Luyện Kỹ Năng Dẫn Dắt",
    start: buildDate(25, 13, 0).toISOString(),
    frames: [{ id: "frame-8" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "13:00 - 15:00",
    avatarUrl: `https://i.pravatar.cc/100?img=47`,
  },
  {
    id: "event-9",
    title: "Đổi Mới Sáng Tạo Trong Doanh Nghiệp",
    start: buildDate(25, 16, 0).toISOString(),
    frames: [{ id: "frame-9" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "16:00 - 17:30",
    avatarUrl: `https://i.pravatar.cc/100?img=28`,
  },
  {
    id: "event-10",
    title: "Thiết Lập KPIs Cho Đội Ngũ Đào Tạo",
    start: buildDate(27, 9, 0).toISOString(),
    frames: [{ id: "frame-10" }],
    status: CalenderStatus.APPROVED,
    mode: "Offline",
    time: "09:00 - 10:30",
    avatarUrl: `https://i.pravatar.cc/100?img=32`,
  },

];
