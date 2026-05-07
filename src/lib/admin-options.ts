// Common option lists for entity forms (Vietnamese labels mirroring _lms_reference)
export const STATUS_ACTIVE_INACTIVE = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngưng hoạt động" },
];

export const EMPLOYEE_TYPE = [
  { value: "fulltime", label: "Toàn thời gian" },
  { value: "parttime", label: "Bán thời gian" },
  { value: "intern", label: "Thực tập sinh" },
  { value: "contract", label: "Hợp đồng" },
];

export const CLASSROOM_TYPE = [
  { value: "offline", label: "Trực tiếp (Offline)" },
  { value: "online", label: "Trực tuyến (eLearning)" },
  { value: "live", label: "Live online" },
];

export const CLASSROOM_STATUS = [
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã huỷ" },
];

export const COURSE_LEVEL = [
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

export const COURSE_STATUS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "unpublished", label: "Chưa xuất bản" },
];

export const PATH_STATUS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Đã lưu trữ" },
];

export const ASSIGNMENT_TYPE = [
  { value: "quiz", label: "Trắc nghiệm" },
  { value: "exam", label: "Bài thi" },
  { value: "homework", label: "Bài tập" },
  { value: "survey", label: "Khảo sát" },
];

export const ASSIGNMENT_STATUS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "closed", label: "Đã đóng" },
];

export const QUESTION_TYPE = [
  { value: "single", label: "Một đáp án (Radio)" },
  { value: "multiple", label: "Nhiều đáp án (Checkbox)" },
  { value: "true_false", label: "Đúng / Sai" },
  { value: "essay", label: "Tự luận" },
];

export const DIFFICULTY = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

export const SURVEY_TYPE = [
  { value: "general", label: "Tổng quát" },
  { value: "course", label: "Đánh giá khoá học" },
  { value: "instructor", label: "Đánh giá giảng viên" },
  { value: "satisfaction", label: "Mức độ hài lòng" },
];

export const SURVEY_STATUS = [
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

export const PLAN_TYPE = [
  { value: "training", label: "Đào tạo" },
  { value: "onboarding", label: "Hội nhập" },
  { value: "compliance", label: "Tuân thủ" },
  { value: "development", label: "Phát triển" },
];

export const PLAN_STATUS = [
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang triển khai" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
];

export const CODE_NOTE = "Mã chỉ từ 2 - 8 ký tự, không khoảng trắng, không ký tự đặc biệt (ngoại trừ -).";
