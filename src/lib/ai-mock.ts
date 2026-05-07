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
    {
      question: `Theo nội dung "${topic}...", bước đầu tiên trong quy trình là gì?`,
      options: ["Vệ sinh dụng cụ", "Chuẩn bị nguyên liệu", "Kiểm tra máy móc", "Chào khách hàng"],
      correct_index: 0,
      explanation: "Vệ sinh dụng cụ luôn là bước bắt buộc đầu tiên theo SOP của Highlands.",
    },
    {
      question: "Nhiệt độ nước lý tưởng để pha cà phê Phin là bao nhiêu?",
      options: ["80-85°C", "90-96°C", "100°C", "70-75°C"],
      correct_index: 1,
      explanation: "Khoảng 90-96°C giúp chiết xuất tối ưu hương vị mà không làm cháy cà phê.",
    },
    {
      question: "Khi gặp khách hàng phàn nàn, phản ứng ĐẦU TIÊN của nhân viên nên là?",
      options: ["Giải thích nguyên nhân", "Lắng nghe và xin lỗi", "Gọi quản lý ngay", "Đề nghị hoàn tiền"],
      correct_index: 1,
      explanation: "Lắng nghe và xin lỗi giúp khách hàng cảm thấy được tôn trọng trước khi xử lý.",
    },
    {
      question: "Định lượng cà phê chuẩn cho 1 ly Phin Sữa Đá là?",
      options: ["15g", "20g", "25g", "30g"],
      correct_index: 1,
      explanation: "20g cà phê là định lượng chuẩn theo công thức Highlands.",
    },
    {
      question: "Khi nào cần vệ sinh máy Espresso bằng chế độ backflush?",
      options: ["Mỗi giờ", "Cuối mỗi ca", "Mỗi tuần 1 lần", "Khi máy báo lỗi"],
      correct_index: 1,
      explanation: "Backflush vào cuối ca giúp loại bỏ dầu cà phê và giữ máy bền lâu.",
    },
    {
      question: "Quy tắc upsell hiệu quả nhất tại quầy là gì?",
      options: [
        "Hỏi khách có muốn upsize",
        "Gợi ý topping kèm theo món chính",
        "Giới thiệu món mới của ngày",
        "Tất cả các đáp án trên",
      ],
      correct_index: 3,
      explanation: "Cả 3 cách đều là kỹ thuật upsell chuẩn và nên được áp dụng linh hoạt.",
    },
    {
      question: "Hạn sử dụng của sữa tươi sau khi mở nắp tại quầy là?",
      options: ["12 giờ", "24 giờ", "48 giờ", "72 giờ"],
      correct_index: 1,
      explanation: "Sữa mở nắp chỉ dùng trong 24h và phải bảo quản ở 2-4°C.",
    },
    {
      question: "Khi ca trưởng vắng, ai chịu trách nhiệm điều phối quầy?",
      options: ["Nhân viên thâm niên cao nhất", "Nhân viên đứng máy POS", "Bất kỳ ai sẵn sàng", "Phải gọi quản lý"],
      correct_index: 0,
      explanation: "Nhân viên thâm niên cao nhất sẽ tạm thời thay thế ca trưởng theo quy định.",
    },
    {
      question: "Tỷ lệ đá : nước : syrup chuẩn cho Trà đào cam sả là?",
      options: ["1:1:1", "2:1:1", "1:2:1", "3:2:1"],
      correct_index: 1,
      explanation: "Tỷ lệ 2 đá : 1 nước : 1 syrup là công thức chuẩn.",
    },
    {
      question: "Khi hết một nguyên liệu giữa ca, hành động đúng là?",
      options: [
        "Báo ca trưởng và ghi vào sổ tồn kho",
        "Tự đi lấy ở kho",
        "Tạm ngưng bán món đó",
        "Thay thế bằng nguyên liệu khác",
      ],
      correct_index: 0,
      explanation: "Phải báo ca trưởng và ghi nhận để theo dõi tồn kho và đặt hàng kịp thời.",
    },
  ];
  return samples.slice(0, count);
}

export async function aiWriteCourseDescription(courseName: string): Promise<string> {
  await sleep(1000);
  return `Khóa học "${courseName}" được thiết kế dành cho nhân viên frontline tại Highlands Coffee, giúp học viên nắm vững quy trình chuẩn, kỹ năng phục vụ và tiêu chuẩn chất lượng đồng nhất giữa các chi nhánh. Sau khi hoàn thành, học viên có thể tự tin thao tác tại quầy, xử lý tình huống thực tế và đóng góp vào trải nghiệm khách hàng tuyệt vời. Khóa học bao gồm video minh họa, checklist thực hành và bài kiểm tra ngắn ở cuối mỗi phần.`;
}

export async function aiPersonalInsight(stats: {
  completed_courses?: number;
  quizzes_taken?: number;
  average_score?: number;
  hours_learned?: number;
  rank?: string;
}): Promise<string> {
  await sleep(1200);
  const { completed_courses = 0, quizzes_taken = 0, average_score = 0, hours_learned = 0, rank = "Tân binh" } = stats;
  const tone =
    average_score >= 8.5
      ? "Thành tích của bạn đang rất ấn tượng — tiếp tục giữ phong độ này nhé!"
      : average_score >= 7
        ? "Bạn đang tiến bộ ổn định, chỉ cần thêm một chút nỗ lực là sẽ bứt phá."
        : "Đừng nản lòng — mỗi bài học hoàn thành đều đưa bạn tiến gần hơn đến mục tiêu.";
  const next =
    completed_courses < 5
      ? "Hãy ưu tiên hoàn thành 2 khóa cơ bản trong tuần này để xây nền tảng vững chắc."
      : "Bạn đã có nền tảng tốt — thử thách mình với khóa nâng cao về kỹ năng quản lý quầy nhé.";
  return `${tone} Bạn đã hoàn thành ${completed_courses} khóa học, làm ${quizzes_taken} bài kiểm tra với điểm trung bình ${average_score}/10 và tích lũy ${hours_learned} giờ học. Với hạng ${rank} hiện tại, dự kiến chỉ cần thêm 2-3 tuần học đều đặn 30 phút/ngày là bạn có thể lên hạng tiếp theo. ${next}`;
}
