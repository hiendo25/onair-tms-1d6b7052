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

export const CLASSROOM_DELIVERY = [
  { value: "live", label: "Lớp học trực tuyến (Live)", short: "Live" },
  { value: "online", label: "Lớp học E-learning (Online)", short: "Online" },
  { value: "offline", label: "Lớp học trực tiếp (Offline)", short: "Offline" },
];
export const CLASSROOM_MODE = [
  { value: "single", label: "Lớp đơn", short: "Đơn" },
  { value: "series", label: "Lớp chuỗi", short: "Chuỗi" },
];
export const MEETING_PROVIDER = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "ms_teams", label: "Microsoft Teams" },
];
export const QR_START_OFFSETS = [
  { value: 30, label: "Trước giờ bắt đầu lớp 30 phút" },
  { value: 15, label: "Trước giờ bắt đầu lớp 15 phút" },
  { value: 10, label: "Trước giờ bắt đầu lớp 10 phút" },
  { value: 0, label: "Đúng giờ bắt đầu lớp học" },
];
export const QR_END_OFFSETS = [
  { value: 10, label: "Sau khi lớp bắt đầu 10 phút" },
  { value: 15, label: "Sau khi lớp bắt đầu 15 phút" },
  { value: 30, label: "Sau khi lớp bắt đầu 30 phút" },
  { value: -1, label: "Đúng giờ kết thúc lớp học" },
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
  { value: "inactive", label: "Chưa kích hoạt" },
  { value: "active", label: "Đang hoạt động" },
  { value: "locked", label: "Đã khoá" },
];

export const LP_AUDIENCE_TYPE = [
  { value: "all", label: "Tất cả" },
  { value: "branch", label: "Chi nhánh" },
  { value: "department", label: "Phòng ban" },
  { value: "user", label: "Cá nhân" },
];

export const LP_UNLOCK_CONDITION = [
  { value: "after_all_courses", label: "Sau khi hoàn thành tất cả khoá" },
  { value: "always", label: "Luôn mở" },
];

export const LP_ENROLLMENT_STATUS = [
  { value: "not_started", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang học" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
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
  { value: "pending_survey", label: "Đang khảo sát" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

export const PLAN_TARGET_TYPE = [
  { value: "all", label: "Tất cả" },
  { value: "dept", label: "Phòng ban" },
  { value: "branch", label: "Chi nhánh" },
];

export const SURVEY_QUESTION_TYPE = [
  { value: "single", label: "Một đáp án" },
  { value: "multiple", label: "Nhiều đáp án" },
  { value: "yes_no", label: "Yes/No" },
  { value: "rating", label: "Thang điểm" },
  { value: "essay", label: "Tự luận" },
  { value: "dropdown", label: "Dropdown" },
  { value: "sorting", label: "Sắp xếp" },
  { value: "vote", label: "Bỏ phiếu" },
];

export const CODE_NOTE = "Mã chỉ từ 2 - 8 ký tự, không khoảng trắng, không ký tự đặc biệt (ngoại trừ -).";
