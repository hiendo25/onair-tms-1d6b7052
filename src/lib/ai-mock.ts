// Mock AI helpers — simulate Lovable AI calls with realistic Vietnamese output.
// To swap in real Lovable AI later, replace these with createServerFn calls
// that hit https://ai.gateway.lovable.dev.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function aiSummarizeLesson(lessonTitle: string): Promise<string[]> {
  await sleep(1500);
  return [
    `Khái niệm cốt lõi: ${lessonTitle} là một thành phần nền tảng cần nắm vững trước khi học các phần nâng cao.`,
    "Mục tiêu của bài học là giúp học viên thực hiện được quy trình chuẩn ngay tại quầy mà không cần tra cứu lại tài liệu.",
    "Lưu ý quan trọng: luôn tuân thủ định lượng và thời gian được hướng dẫn để đảm bảo chất lượng đồng nhất giữa các ca.",
    "Sai lầm thường gặp: bỏ qua bước kiểm tra dụng cụ và nhiệt độ trước khi thao tác — hãy hình thành thói quen check trước mỗi lần.",
    "Hành động tiếp theo: thực hành 3 lần liên tục, sau đó tự kiểm tra bằng checklist ở cuối bài để củng cố kiến thức.",
  ];
}

export type AiQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export async function aiGenerateQuestions(sourceText: string, count = 10): Promise<AiQuestion[]> {
  await sleep(2000);
  const topic = sourceText.slice(0, 60).trim() || "nội dung đào tạo";
  const samples: AiQuestion[] = [
    { question: `Theo nội dung "${topic}...", bước đầu tiên trong quy trình là gì?`, options: ["Vệ sinh dụng cụ", "Chuẩn bị nguyên liệu", "Kiểm tra máy móc", "Chào khách hàng"], correct_index: 0, explanation: "Vệ sinh dụng cụ luôn là bước bắt buộc đầu tiên theo SOP của Highlands." },
    { question: "Nhiệt độ nước lý tưởng để pha cà phê Phin là bao nhiêu?", options: ["80-85°C", "90-96°C", "100°C", "70-75°C"], correct_index: 1, explanation: "Khoảng 90-96°C giúp chiết xuất tối ưu hương vị mà không làm cháy cà phê." },
    { question: "Khi gặp khách hàng phàn nàn, phản ứng ĐẦU TIÊN của nhân viên nên là?", options: ["Giải thích nguyên nhân", "Lắng nghe và xin lỗi", "Gọi quản lý ngay", "Đề nghị hoàn tiền"], correct_index: 1, explanation: "Lắng nghe và xin lỗi giúp khách hàng cảm thấy được tôn trọng trước khi xử lý." },
    { question: "Định lượng cà phê chuẩn cho 1 ly Phin Sữa Đá là?", options: ["15g", "20g", "25g", "30g"], correct_index: 1, explanation: "20g cà phê là định lượng chuẩn theo công thức Highlands." },
    { question: "Khi nào cần vệ sinh máy Espresso bằng chế độ backflush?", options: ["Mỗi giờ", "Cuối mỗi ca", "Mỗi tuần 1 lần", "Khi máy báo lỗi"], correct_index: 1, explanation: "Backflush vào cuối ca giúp loại bỏ dầu cà phê và giữ máy bền lâu." },
    { question: "Quy tắc upsell hiệu quả nhất tại quầy là gì?", options: ["Hỏi khách có muốn upsize", "Gợi ý topping kèm theo món chính", "Giới thiệu món mới của ngày", "Tất cả các đáp án trên"], correct_index: 3, explanation: "Cả 3 cách đều là kỹ thuật upsell chuẩn và nên được áp dụng linh hoạt." },
    { question: "Hạn sử dụng của sữa tươi sau khi mở nắp tại quầy là?", options: ["12 giờ", "24 giờ", "48 giờ", "72 giờ"], correct_index: 1, explanation: "Sữa mở nắp chỉ dùng trong 24h và phải bảo quản ở 2-4°C." },
    { question: "Khi ca trưởng vắng, ai chịu trách nhiệm điều phối quầy?", options: ["Nhân viên thâm niên cao nhất", "Nhân viên đứng máy POS", "Bất kỳ ai sẵn sàng", "Phải gọi quản lý"], correct_index: 0, explanation: "Nhân viên thâm niên cao nhất sẽ tạm thời thay thế ca trưởng theo quy định." },
    { question: "Tỷ lệ đá : nước : syrup chuẩn cho Trà đào cam sả là?", options: ["1:1:1", "2:1:1", "1:2:1", "3:2:1"], correct_index: 1, explanation: "Tỷ lệ 2 đá : 1 nước : 1 syrup là công thức chuẩn." },
    { question: "Khi hết một nguyên liệu giữa ca, hành động đúng là?", options: ["Báo ca trưởng và ghi vào sổ tồn kho", "Tự đi lấy ở kho", "Tạm ngưng bán món đó", "Thay thế bằng nguyên liệu khác"], correct_index: 0, explanation: "Phải báo ca trưởng và ghi nhận để theo dõi tồn kho và đặt hàng kịp thời." },
  ];
  return samples.slice(0, count);
}

export async function aiWriteCourseDescription(courseName: string): Promise<string> {
  await sleep(1000);
  return `Khóa học "${courseName}" được thiết kế dành cho nhân viên frontline tại Highlands Coffee, giúp học viên nắm vững quy trình chuẩn, kỹ năng phục vụ và tiêu chuẩn chất lượng đồng nhất giữa các chi nhánh. Sau khi hoàn thành, học viên có thể tự tin thao tác tại quầy, xử lý tình huống thực tế và đóng góp vào trải nghiệm khách hàng tuyệt vời. Khóa học bao gồm video minh họa, checklist thực hành và bài kiểm tra ngắn ở cuối mỗi phần.`;
}

export async function aiPersonalInsight(stats: {
  completed_courses?: number; quizzes_taken?: number; average_score?: number; hours_learned?: number; rank?: string;
}): Promise<string> {
  await sleep(1200);
  const { completed_courses = 0, quizzes_taken = 0, average_score = 0, hours_learned = 0, rank = "Tân binh" } = stats;
  const tone = average_score >= 8.5 ? "Thành tích của bạn đang rất ấn tượng — tiếp tục giữ phong độ này nhé!"
    : average_score >= 7 ? "Bạn đang tiến bộ ổn định, chỉ cần thêm một chút nỗ lực là sẽ bứt phá."
    : "Đừng nản lòng — mỗi bài học hoàn thành đều đưa bạn tiến gần hơn đến mục tiêu.";
  const next = completed_courses < 5
    ? "Hãy ưu tiên hoàn thành 2 khóa cơ bản trong tuần này để xây nền tảng vững chắc."
    : "Bạn đã có nền tảng tốt — thử thách mình với khóa nâng cao về kỹ năng quản lý quầy nhé.";
  return `${tone} Bạn đã hoàn thành ${completed_courses} khóa học, làm ${quizzes_taken} bài kiểm tra với điểm trung bình ${average_score}/10 và tích lũy ${hours_learned} giờ học. Với hạng ${rank} hiện tại, dự kiến chỉ cần thêm 2-3 tuần học đều đặn 30 phút/ngày là bạn có thể lên hạng tiếp theo. ${next}`;
}

// ===== #1 AI sinh khóa học từ chủ đề =====
export type AiCourseOutline = {
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  modules: Array<{
    title: string;
    description: string;
    lessons: string[];
    sample_questions: AiQuestion[];
  }>;
};

export async function aiGenerateCourseOutline(
  topic: string, lessonCount: 3 | 5 | 10, audience: string,
): Promise<AiCourseOutline> {
  await sleep(2000);
  const moduleCount = lessonCount === 3 ? 2 : lessonCount === 5 ? 3 : 4;
  const lessonsPerModule = Math.ceil(lessonCount / moduleCount);
  const baseLessons = [
    "Giới thiệu tổng quan", "Quy trình thao tác chuẩn", "Định lượng & nguyên liệu",
    "Kỹ năng phục vụ khách hàng", "Vệ sinh & an toàn thực phẩm", "Xử lý tình huống thực tế",
    "Kỹ năng làm việc nhóm", "Tiêu chuẩn chất lượng", "Đánh giá & cải tiến", "Bài thi tổng hợp",
  ];
  const sampleQs = await aiGenerateQuestions(topic, 3);
  const modules = Array.from({ length: moduleCount }).map((_, i) => ({
    title: `Phần ${i + 1}: ${i === 0 ? "Nền tảng" : i === moduleCount - 1 ? "Thực hành & Đánh giá" : `Chuyên sâu ${i}`} về ${topic}`,
    description: `Trang bị cho ${audience} kiến thức và kỹ năng cần thiết ở mức độ ${i === 0 ? "cơ bản" : "nâng cao"} trong chủ đề ${topic}.`,
    lessons: baseLessons.slice(i * lessonsPerModule, i * lessonsPerModule + lessonsPerModule).map((l) => `${l} - ${topic}`),
    sample_questions: sampleQs,
  }));
  return {
    title: `${topic} dành cho ${audience}`,
    description: `Khóa học "${topic}" được thiết kế riêng cho ${audience} tại Highlands Coffee. Học viên sẽ được hướng dẫn từ nền tảng đến nâng cao, kèm bài tập thực hành và đánh giá năng lực sau từng phần.`,
    category: "Đào tạo nội bộ",
    level: "beginner",
    duration_minutes: lessonCount * 25,
    modules,
  };
}

// ===== #8 AI gợi ý lộ trình =====
export type AiPathSuggestion = { title: string; reason: string; duration_weeks: number; courses_count: number };

export async function aiSuggestLearningPaths(): Promise<AiPathSuggestion[]> {
  await sleep(1400);
  return [
    { title: "Lộ trình Barista chuyên nghiệp", reason: "Phù hợp với điểm mạnh pha chế của bạn — sẽ giúp bạn nâng hạng nhanh hơn 30%.", duration_weeks: 6, courses_count: 8 },
    { title: "Lộ trình Ca trưởng tương lai", reason: "Bạn đã hoàn thành tốt các khóa cơ bản, đây là bước tiếp theo phù hợp để phát triển lên vị trí quản lý.", duration_weeks: 8, courses_count: 12 },
    { title: "Lộ trình Chăm sóc khách hàng VIP", reason: "Điểm khảo sát hài lòng khách của bạn rất cao — hãy tận dụng thế mạnh này để chuyên sâu hơn.", duration_weeks: 4, courses_count: 5 },
  ];
}

// ===== #5 AI chấm bài tự luận =====
export type AiGradingResult = { score: number; feedback: string };

export async function aiGradeEssay(question: string, answer: string): Promise<AiGradingResult> {
  await sleep(2000);
  const len = answer.trim().length;
  const score = len < 30 ? 4 : len < 100 ? 6.5 : len < 200 ? 8 : 9;
  const feedback = len < 30
    ? "Câu trả lời quá ngắn, chưa thể hiện đủ ý chính. Học viên cần bổ sung ví dụ cụ thể và liên hệ với quy trình SOP của Highlands."
    : len < 200
      ? "Trả lời đúng trọng tâm, có ý cơ bản. Có thể cải thiện bằng cách bổ sung ví dụ thực tế tại quầy và nêu rõ các bước thực hiện theo thứ tự."
      : "Trả lời đầy đủ, có cấu trúc rõ ràng và liên hệ thực tế tốt. Học viên thể hiện sự hiểu sâu về chủ đề và áp dụng được vào tình huống công việc.";
  // suppress unused
  void question;
  return { score, feedback };
}

// ===== #7 AI Insight đội ngũ =====
export type ActionableInsight = {
  severity: "warning" | "info" | "success";
  title: string;
  detail: string;
  ctaLabel: string;
  to: string;
  search?: Record<string, string>;
};
// Backwards-compat alias
export type TeamInsight = ActionableInsight;

export async function aiTeamInsights(): Promise<ActionableInsight[]> {
  await sleep(1500);
  return [
    { severity: "warning", title: "5 nhân viên chưa hoàn thành VSATTP", detail: "Khóa bắt buộc, hạn còn 3 ngày. Cần nhắc nhở để tránh ảnh hưởng đánh giá chi nhánh.", ctaLabel: "Xem danh sách", to: "/admin/employees", search: { status: "pending" } },
    { severity: "warning", title: "Chi nhánh HCM completion giảm 12%", detail: "Tỷ lệ hoàn thành tuần này thấp hơn trung bình hệ thống — cần can thiệp sớm.", ctaLabel: "Xem chi nhánh", to: "/analytic", search: { branch: "hcm" } },
    { severity: "info", title: "Khóa 'VSATTP nâng cao' completion 38%", detail: "Nội dung có thể quá dài — cân nhắc tách module hoặc bổ sung video.", ctaLabel: "Mở khóa học", to: "/admin/online-course" },
    { severity: "success", title: "Chi nhánh Hà Nội dẫn đầu", detail: "94% completion và điểm TB 8.7/10 — có thể nhân rộng cách làm.", ctaLabel: "Xem báo cáo", to: "/admin/report/overview" },
  ];
}

// ===== Student actionable insights =====
export async function aiStudentActionInsights(): Promise<ActionableInsight[]> {
  await sleep(1200);
  return [
    { severity: "warning", title: "Bạn còn 1 bài kiểm tra chưa nộp", detail: "Hạn nộp là hôm nay — nộp ngay để không mất điểm chuyên cần.", ctaLabel: "Làm bài ngay", to: "/my-assignments" },
    { severity: "info", title: "Lộ trình Onboarding còn 3 bài chưa học", detail: "Hoàn thành sớm để mở khóa lộ trình nâng cao tiếp theo.", ctaLabel: "Tiếp tục học", to: "/my-learning-paths" },
    { severity: "info", title: "Bạn sắp lên hạng Cao thủ — còn 150 XP nữa", detail: "Chỉ vài bài học nữa là bạn được nâng hạng và mở huy hiệu mới.", ctaLabel: "Xem lộ trình thăng hạng", to: "/my-gamification" },
    { severity: "warning", title: "Chứng nhận VSATTP sắp hết hạn sau 7 ngày", detail: "Cần gia hạn để tiếp tục đứng quầy theo quy định nội bộ.", ctaLabel: "Gia hạn ngay", to: "/my-certificates" },
  ];
}

// ===== Bonus: AI sinh flashcard =====
export type AiFlashcard = { front: string; back: string };

export async function aiGenerateFlashcards(lessonTitle: string): Promise<AiFlashcard[]> {
  await sleep(1500);
  const t = lessonTitle || "bài học";
  return [
    { front: `Khái niệm chính của "${t}" là gì?`, back: "Là quy trình chuẩn áp dụng thống nhất trên toàn hệ thống Highlands." },
    { front: "Nhiệt độ nước pha Phin chuẩn?", back: "90-96°C để chiết xuất tối ưu." },
    { front: "Định lượng cà phê 1 ly Phin Sữa Đá?", back: "20g cà phê." },
    { front: "Hạn dùng sữa tươi sau khi mở nắp?", back: "24 giờ, bảo quản 2-4°C." },
    { front: "Khi khách phàn nàn, bước đầu tiên?", back: "Lắng nghe và xin lỗi chân thành." },
    { front: "Tỷ lệ chuẩn Trà đào cam sả (đá:nước:syrup)?", back: "2 : 1 : 1" },
    { front: "Tần suất backflush máy Espresso?", back: "Cuối mỗi ca." },
    { front: "Khi hết nguyên liệu giữa ca, làm gì?", back: "Báo ca trưởng và ghi vào sổ tồn kho." },
    { front: "Đồng phục chuẩn của nhân viên gồm?", back: "Áo Highlands, tạp dề sạch, mũ, giày chống trượt, bảng tên." },
    { front: "Chu trình rửa tay đúng kéo dài bao lâu?", back: "Tối thiểu 20 giây với xà phòng." },
  ];
}

// ===== Bonus: AI Survey Insight =====
export type SurveyInsight = { sentiment: string; top_issues: string[]; suggestions: string[] };

export async function aiSurveyInsight(): Promise<SurveyInsight> {
  await sleep(2000);
  return {
    sentiment: "Tổng thể tích cực (78% phản hồi tốt/rất tốt). Học viên hài lòng với nội dung khóa học và giảng viên, nhưng còn một số ý kiến về thời lượng và bài tập thực hành.",
    top_issues: [
      "Thời lượng khóa học hơi dài — 22% học viên đề xuất rút gọn còn 30 phút/bài.",
      "Thiếu bài tập thực hành tại quầy — 18% phản hồi muốn có thêm tình huống thực tế.",
      "Bài kiểm tra cuối khóa khó hơn so với nội dung học — 12% học viên phàn nàn.",
    ],
    suggestions: [
      "Tách các bài học dài thành 2-3 phần ngắn để tăng tỷ lệ hoàn thành.",
      "Bổ sung video tình huống thực tế tại cửa hàng cho mỗi module.",
      "Rà soát lại độ khó câu hỏi cuối khóa, cân bằng dễ-trung-khó theo tỷ lệ 4-4-2.",
    ],
  };
}
