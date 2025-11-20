import { Survey, QuestionType } from "@/types/survey.types";

export const QUESTION_TYPE_OPTIONS: { id: QuestionType; label: string }[] = [
  { id: "text", label: "Văn bản" },
  { id: "radio", label: "Một lựa chọn" },
  { id: "checkbox", label: "Nhiều lựa chọn" },
  { id: "rating", label: "Đánh giá" },
  { id: "select", label: "Danh sách thả xuống" },
];

export const MOCK_SURVEYS: Survey[] = [
  {
    id: "1",
    name: "Đánh giá hiệu quả khóa học đã hoàn thành",
    description: "Khảo sát đánh giá mức độ hài lòng và hiệu quả của các khóa học đã tham gia trong quý vừa qua",
    questions: [
      {
        id: "q1",
        label: "Bạn đánh giá như thế nào về chất lượng nội dung khóa học?",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Yếu tố nào của khóa học bạn đánh giá cao nhất? (Chọn nhiều đáp án)",
        type: "checkbox",
        is_required: true,
        options: [
          "Nội dung bài giảng chất lượng",
          "Giảng viên nhiệt tình và chuyên nghiệp",
          "Bài tập thực hành phong phú",
          "Tài liệu học tập đầy đủ",
          "Hỗ trợ học viên tốt",
          "Nền tảng học trực tuyến dễ sử dụng"
        ],
      },
      {
        id: "q3",
        label: "Mức độ ứng dụng kiến thức từ khóa học vào công việc thực tế",
        type: "rating",
        is_required: true,
      },
      {
        id: "q4",
        label: "Bạn có đề xuất gì để cải thiện chất lượng khóa học?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 127,
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    name: "Khảo sát nhu cầu đào tạo năm 2025",
    description: "Thu thập thông tin về nhu cầu đào tạo và kế hoạch phát triển kỹ năng cho năm 2025",
    questions: [
      {
        id: "q1",
        label: "Bạn muốn phát triển kỹ năng nào trong năm 2025? (Chọn nhiều đáp án)",
        type: "checkbox",
        is_required: true,
        options: [
          "Lập trình và phát triển phần mềm",
          "Phân tích dữ liệu và AI",
          "Quản lý dự án Agile/Scrum",
          "Kỹ năng lãnh đạo và quản lý",
          "Thiết kế giảng dạy trực tuyến",
          "Công nghệ giáo dục (EdTech)",
          "Kỹ năng giao tiếp và thuyết trình",
          "Quản lý thời gian và năng suất"
        ],
      },
      {
        id: "q2",
        label: "Thời lượng khóa học phù hợp với bạn?",
        type: "select",
        is_required: true,
        options: ["1-2 tuần", "1 tháng", "2-3 tháng", "6 tháng", "Linh hoạt theo tiến độ cá nhân"],
      },
      {
        id: "q3",
        label: "Mục tiêu phát triển nghề nghiệp của bạn cần những khóa học nào?",
        type: "text",
        is_required: true,
      },
    ],
    total_submissions: 32,
    created_at: "2024-02-20T10:15:00Z",
  },
  {
    id: "3",
    name: "Phân tích khoảng trống kỹ năng theo vị trí",
    description: "Đánh giá khoảng cách giữa kỹ năng hiện tại và kỹ năng cần thiết cho từng vị trí công việc",
    questions: [
      {
        id: "q1",
        label: "Mức độ tự tin của bạn với các kỹ năng cần thiết cho vị trí hiện tại",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Kỹ năng nào bạn cần cải thiện để thực hiện tốt hơn công việc hiện tại?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 28,
    created_at: "2024-03-10T14:20:00Z",
  },
  {
    id: "4",
    name: "Đánh giá nền tảng LMS và công cụ học tập",
    description: "Thu thập phản hồi về trải nghiệm sử dụng nền tảng học trực tuyến và các công cụ hỗ trợ học tập",
    questions: [
      {
        id: "q1",
        label: "Tính năng nào của nền tảng LMS bạn sử dụng thường xuyên nhất? (Chọn nhiều đáp án)",
        type: "checkbox",
        is_required: true,
        options: [
          "Xem video bài giảng",
          "Làm bài tập và kiểm tra",
          "Tham gia diễn đàn thảo luận",
          "Tải tài liệu học tập",
          "Theo dõi tiến độ học tập",
          "Tương tác với giảng viên",
          "Học nhóm trực tuyến"
        ],
      },
      {
        id: "q2",
        label: "Bạn gặp khó khăn gì khi sử dụng nền tảng học trực tuyến?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 18,
    created_at: "2024-04-05T09:00:00Z",
  },
  {
    id: "5",
    name: "Lập kế hoạch chương trình đào tạo quý 1/2025",
    description: "Khảo sát để xây dựng kế hoạch đào tạo chi tiết cho quý 1 năm 2025",
    questions: [
      {
        id: "q1",
        label: "Mức độ ưu tiên của việc tham gia đào tạo trong quý tới",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Hình thức đào tạo bạn mong muốn? (Chọn nhiều đáp án)",
        type: "checkbox",
        is_required: true,
        options: [
          "Khóa học trực tuyến tự học",
          "Lớp học trực tuyến có giảng viên",
          "Hội thảo/Workshop trực tiếp",
          "Học kết hợp (Blended Learning)",
          "Coaching 1-1",
          "Dự án thực hành nhóm"
        ],
      },
      {
        id: "q3",
        label: "Đề xuất chủ đề khóa học cụ thể bạn muốn tham gia trong quý 1/2025",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 52,
    created_at: "2024-05-12T11:30:00Z",
  },
];

