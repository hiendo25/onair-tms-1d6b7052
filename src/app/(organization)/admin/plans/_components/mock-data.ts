// Mock data types
export interface PlanDetail {
  id: string;
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "pending" | "approved" | "rejected";
  approver: string;
  approverRole: string;
  programsCount: number;
  topicsCount: number;
  coursesCount: number;
  instructorsCount: number;
  programs: ProgramDetail[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  topicsCount: number;
}

// Mock data
export const MOCK_PLAN_DETAILS: Record<string, PlanDetail> = {
  "1": {
    id: "1",
    name: "Kế hoạch đào tạo 2026 cho khối B2B Edtech",
    objective: "Hội nhập – Chuẩn hoá – Phát triển năng lực",
    startDate: "22/12/2025",
    endDate: "22/12/2026",
    budget: 300000000,
    status: "pending",
    approver: "Nguyễn Văn Nam - CEO",
    approverRole: "CEO",
    programsCount: 2,
    topicsCount: 6,
    coursesCount: 12,
    instructorsCount: 12,
    programs: [
      {
        id: "1",
        name: "Kế hoạch đào tạo 2026 cho khối B2B Edtech",
        description: "Chương trình đào tạo toàn diện cho khối B2B",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 3,
      },
      {
        id: "2",
        name: "Kế hoạch đào tạo 2026 cho khối Marketing Edtech",
        description: "Chương trình đào tạo chuyên sâu cho Marketing",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 3,
      },
    ],
  },
  "2": {
    id: "2",
    name: "Khoá học cơ bản về AI dành cho Doanh nghiệp",
    objective: "Nâng cao kiến thức AI cho toàn bộ nhân viên",
    startDate: "15/10/2025",
    endDate: "20/10/2025",
    budget: 200000000,
    status: "approved",
    approver: "Trần Thị Lan - CTO",
    approverRole: "CTO",
    programsCount: 2,
    topicsCount: 8,
    coursesCount: 15,
    instructorsCount: 8,
    programs: [
      {
        id: "1",
        name: "AI Fundamentals",
        startDate: "15/10/2025",
        endDate: "17/10/2025",
        topicsCount: 4,
      },
      {
        id: "2",
        name: "AI Applications in Business",
        startDate: "18/10/2025",
        endDate: "20/10/2025",
        topicsCount: 4,
      },
    ],
  },
};

