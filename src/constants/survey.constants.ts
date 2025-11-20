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
    name: "Khảo sát mức độ hài lòng về khóa học",
    description: "Khảo sát đánh giá mức độ hài lòng của học viên về chất lượng khóa học và giảng viên",
    questions: [
      {
        id: "q1",
        label: "Bạn đánh giá như thế nào về chất lượng khóa học?",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Giảng viên có truyền đạt kiến thức rõ ràng không?",
        type: "radio",
        is_required: true,
        options: ["Rất rõ ràng", "Rõ ràng", "Bình thường", "Chưa rõ ràng", "Không rõ ràng"],
      },
      {
        id: "q3",
        label: "Bạn có góp ý gì thêm không?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 45,
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    name: "Khảo sát nhu cầu đào tạo",
    description: "Thu thập thông tin về nhu cầu đào tạo và phát triển kỹ năng của nhân viên",
    questions: [
      {
        id: "q1",
        label: "Bạn muốn học thêm kỹ năng nào?",
        type: "checkbox",
        is_required: true,
        options: ["Lập trình", "Thiết kế", "Marketing", "Quản lý dự án", "Ngoại ngữ", "Kỹ năng mềm"],
      },
      {
        id: "q2",
        label: "Thời gian học phù hợp với bạn?",
        type: "select",
        is_required: true,
        options: ["Sáng (8h-12h)", "Chiều (13h-17h)", "Tối (18h-21h)", "Cuối tuần"],
      },
      {
        id: "q3",
        label: "Lý do bạn muốn tham gia khóa học?",
        type: "text",
        is_required: true,
      },
    ],
    total_submissions: 32,
    created_at: "2024-02-20T10:15:00Z",
  },
  {
    id: "3",
    name: "Đánh giá môi trường làm việc",
    description: "Khảo sát về môi trường làm việc và văn hóa công ty",
    questions: [
      {
        id: "q1",
        label: "Bạn có hài lòng với môi trường làm việc hiện tại?",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Điều gì bạn thích nhất ở công ty?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 28,
    created_at: "2024-03-10T14:20:00Z",
  },
  {
    id: "4",
    name: "Khảo sát về công nghệ và công cụ làm việc",
    description: "Thu thập ý kiến về các công nghệ và công cụ hỗ trợ công việc",
    questions: [
      {
        id: "q1",
        label: "Công cụ nào bạn sử dụng thường xuyên nhất?",
        type: "checkbox",
        is_required: true,
        options: ["Slack", "Microsoft Teams", "Zoom", "Jira", "Trello", "Google Workspace"],
      },
      {
        id: "q2",
        label: "Bạn có gặp khó khăn gì khi sử dụng công cụ không?",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 18,
    created_at: "2024-04-05T09:00:00Z",
  },
  {
    id: "5",
    name: "Khảo sát về chế độ phúc lợi",
    description: "Đánh giá mức độ hài lòng về các chính sách phúc lợi của công ty",
    questions: [
      {
        id: "q1",
        label: "Bạn đánh giá như thế nào về chế độ phúc lợi hiện tại?",
        type: "rating",
        is_required: true,
      },
      {
        id: "q2",
        label: "Phúc lợi nào bạn mong muốn được cải thiện?",
        type: "checkbox",
        is_required: true,
        options: ["Bảo hiểm y tế", "Nghỉ phép", "Thưởng", "Đào tạo", "Chế độ ăn trưa", "Hoạt động team building"],
      },
      {
        id: "q3",
        label: "Ý kiến khác",
        type: "text",
        is_required: false,
      },
    ],
    total_submissions: 52,
    created_at: "2024-05-12T11:30:00Z",
  },
];

