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

export const topRatedCourses = [
  {
    title: "Lớp học chuyển Đổi số Doanh nghiệp B2B",
    rating: "4,8/5",
    students: "120 học viên",
  },
  {
    title: "Lớp học chuyển Đổi số với AI",
    rating: "4,7/5",
    students: "104 học viên",
  },
  {
    title: "Lớp học tổ chức đội nhóm",
    rating: "4,6/5",
    students: "92 học viên",
  },
  {
    title: "Lớp học hình thành hệ sinh thái B2B",
    rating: "4,5/5",
    students: "86 học viên",
  },
  {
    title: "Lớp học chuyển minh cùng AI",
    rating: "4,4/5",
    students: "78 học viên",
  },
];

export const lowRatedCourses = [
  {
    title: "Lớp học chuyển Đổi số Doanh nghiệp B2B",
    rating: "1/5",
    students: "40 học viên",
  },
  {
    title: "Lớp học chuyển Đổi số với AI",
    rating: "2/5",
    students: "36 học viên",
  },
  {
    title: "Lớp học tổ chức đội nhóm",
    rating: "2,6/5",
    students: "28 học viên",
  },
  {
    title: "Lớp học hình thành hệ sinh thái B2B",
    rating: "1,7/5",
    students: "24 học viên",
  },
  {
    title: "Lớp học chuyển minh cùng AI",
    rating: "1,4/5",
    students: "18 học viên",
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

];
