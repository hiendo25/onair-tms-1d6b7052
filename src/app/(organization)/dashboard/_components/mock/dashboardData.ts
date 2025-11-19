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
    { label: "Chuyển đổi số doanh nghiệp", value: 86 },
    { label: "Quản trị vận hành", value: 74 },
    { label: "Phát triển lãnh đạo", value: 69 },
    { label: "Data Analytics", value: 82 },
    { label: "Kỹ năng mềm", value: 65 },
  ],
  month: [
    { label: "Chuyển đổi số doanh nghiệp", value: 78 },
    { label: "Quản trị vận hành", value: 72 },
    { label: "Phát triển lãnh đạo", value: 64 },
    { label: "Data Analytics", value: 76 },
    { label: "Kỹ năng mềm", value: 60 },
  ],
  week: [
    { label: "Chuyển đổi số doanh nghiệp", value: 95 },
    { label: "Quản trị vận hành", value: 80 },
    { label: "Phát triển lãnh đạo", value: 75 },
    { label: "Data Analytics", value: 90 },
    { label: "Kỹ năng mềm", value: 85 },
  ],
};

export const channelParticipationByRange: Record<TimeRange, PercentageItem[]> = {
  year: [
    { label: "Online", value: 68 },
    { label: "Offline", value: 52 },
    { label: "eLearning", value: 86 },
  ],
  month: [
    { label: "Online", value: 64 },
    { label: "Offline", value: 48 },
    { label: "eLearning", value: 82 },
  ],
  week: [
    { label: "Online", value: 60 },
    { label: "Offline", value: 55 },
    { label: "eLearning", value: 78 },
  ],
};

type CompletionSnapshot = { completed: number; total: number };

export const completionRateByRange: Record<TimeRange, CompletionSnapshot> = {
  year: { completed: 312, total: 420 },
  month: { completed: 96, total: 120 },
  week: { completed: 78, total: 100 },
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
      { title: "Xây dựng văn hóa học tập", score: 84 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 80 },
      { title: "Tối ưu vận hành số", score: 78 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 12 },
      { title: "Kỹ năng thuyết trình", score: 15 },
      { title: "Vận hành dự án", score: 18 },
      { title: "Quản trị rủi ro", score: 20 },
      { title: "Kỹ năng bán hàng", score: 22 },
    ],
  },
  month: {
    top: [
      { title: "Chuyển đổi số doanh nghiệp", score: 88 },
      { title: "Khai thác dữ liệu nâng cao", score: 85 },
      { title: "Xây dựng văn hóa học tập", score: 80 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 78 },
      { title: "Tối ưu vận hành số", score: 74 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 10 },
      { title: "Kỹ năng thuyết trình", score: 12 },
      { title: "Vận hành dự án", score: 14 },
      { title: "Quản trị rủi ro", score: 16 },
      { title: "Kỹ năng bán hàng", score: 18 },
    ],
  },
  week: {
    top: [
      { title: "Chuyển đổi số doanh nghiệp", score: 95 },
      { title: "Khai thác dữ liệu nâng cao", score: 90 },
      { title: "Xây dựng văn hóa học tập", score: 85 },
      { title: "Huấn luyện lãnh đạo trẻ", score: 80 },
      { title: "Tối ưu vận hành số", score: 75 },
    ],
    low: [
      { title: "Tư duy phản biện", score: 3 },
      { title: "Kỹ năng thuyết trình", score: 10 },
      { title: "Vận hành dự án", score: 9 },
      { title: "Quản trị rủi ro", score: 8 },
      { title: "Kỹ năng bán hàng", score: 8 },
    ],
  },
};

export const summaryCards = [
  {
    title: "Lớp học đang diễn ra",
    value: "24",
    icon: "in-progress",
    colors: { bg: "#FFB0E8", icon: "#f062c0" },
  },
  {
    title: "Lớp học sắp diễn ra",
    value: "8",
    icon: "upcoming",
    colors: { bg: "#CDDEFF", icon: "#648efc" },
  },
  {
    title: "Lớp học sắp hết hạn",
    value: "3",
    icon: "expiring",
    colors: { bg: "#CDDEFF", icon: "#648efc" },
  },
  {
    title: "Lớp học đã diễn ra",
    value: "112",
    icon: "completed",
    colors: { bg: "#FFD365", icon: "#f5a524" },
  },
];

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
    times: ["09:00 12/10/2025", "19:00 13/10/2025"],
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
    times: ["14:00 16/10/2025"],
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
    times: ["19:00 17/10/2025"],
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
    times: ["09:00 18/10/2025"],
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
    times: ["13:30 19/10/2025"],
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
    times: ["15:00 20/10/2025"],
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
    times: ["19:30 21/10/2025"],
  },
];

const currentMonth = dayjs().startOf("month");

const buildDate = (dayOfMonth: number, hour: number, minute: number) =>
  currentMonth
    .clone()
    .date(dayOfMonth)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);

export const mockEvents = [
  {
    id: "event-1",
    title: "Lớp Ứng dụng AI vào Doanh nghiệp",
    start: buildDate(4, 9, 0).toISOString(),
    frames: [{ id: "frame-1" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "09:00 - 11:00",
    avatarUrl: `https://i.pravatar.cc/100?img=9`,
  },
  {
    id: "event-2",
    title: "Tư Duy Phản Biện & Giải Quyết Vấn Đề",
    start: buildDate(12, 14, 0).toISOString(),
    frames: [{ id: "frame-2" }],
    status: CalenderStatus.APPROVED,
    mode: "Trực tiếp",
    time: "14:00 - 16:00",
    avatarUrl: `https://i.pravatar.cc/100?img=10`,
  },
  {
    id: "event-3",
    title: "Nghệ Thuật Giao Tiếp Trong Đội Nhóm",
    start: buildDate(20, 18, 30).toISOString(),
    frames: [{ id: "frame-3" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "18:30 - 20:00",
    avatarUrl: `https://i.pravatar.cc/100?img=11`,
  },
  {
    id: "event-4",
    title: "Chiến Lược Xây Dựng Văn Hóa Học Tập",
    start: buildDate(26, 10, 0).toISOString(),
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
    start: buildDate(20, 8, 30).toISOString(),
    frames: [{ id: "frame-7" }],
    status: CalenderStatus.APPROVED,
    mode: "Trực tiếp",
    time: "08:30 - 10:00",
    avatarUrl: `https://i.pravatar.cc/100?img=18`,
  },
  {
    id: "event-8",
    title: "Huấn Luyện Kỹ Năng Dẫn Dắt",
    start: buildDate(30, 13, 0).toISOString(),
    frames: [{ id: "frame-8" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "13:00 - 15:00",
    avatarUrl: `https://i.pravatar.cc/100?img=47`,
  },
  {
    id: "event-9",
    title: "Đổi Mới Sáng Tạo Trong Doanh Nghiệp",
    start: buildDate(30, 16, 0).toISOString(),
    frames: [{ id: "frame-9" }],
    status: CalenderStatus.APPROVED,
    mode: "Online",
    time: "16:00 - 17:30",
    avatarUrl: `https://i.pravatar.cc/100?img=28`,
  },
  {
    id: "event-10",
    title: "Thiết Lập KPIs Cho Đội Ngũ Đào Tạo",
    start: buildDate(30, 9, 0).toISOString(),
    frames: [{ id: "frame-10" }],
    status: CalenderStatus.APPROVED,
    mode: "Trực tiếp",
    time: "09:00 - 10:30",
    avatarUrl: `https://i.pravatar.cc/100?img=32`,
  },

];
