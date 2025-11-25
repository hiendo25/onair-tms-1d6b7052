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

export interface ClassInstance {
  id: string;
  classCode: string;
  deliveryMode: "Online" | "Offline" | "Live";
  instructor: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  classesCount: number;
  classes: ClassInstance[];
}

export interface Topic {
  id: string;
  name: string;
  title: string;
  coursesCount: number;
  courses: Course[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  topicsCount: number;
  topics?: Topic[];
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
        name: "Cách Sales B2b hiệu quả cho phòng MKT",
        description: "Chương trình đào tạo toàn diện cho khối B2B",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 1,
        topics: [
          {
            id: "1",
            name: "Chủ đề 1",
            title: "Cách Sales B2b hiệu quả cho phòng MKT",
            coursesCount: 3,
            courses: [
              {
                id: "1",
                title: "4 buổi làm sao quản lý kỹ năng giao tiếp",
                classesCount: 2,
                classes: [
                  {
                    id: "1",
                    classCode: "ONB-01A",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "2",
                    classCode: "ONB-01A",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                ],
              },
              {
                id: "2",
                title: "Môn học làm sao chuyển đổi số",
                classesCount: 1,
                classes: [
                  {
                    id: "3",
                    classCode: "ONB-01A",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                ],
              },
              {
                id: "3",
                title: "Môn học làm sao sử dụng AI doanh nghiệp B2B",
                classesCount: 3,
                classes: [
                  {
                    id: "4",
                    classCode: "ONB-01A",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "5",
                    classCode: "ONB-01A",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "6",
                    classCode: "ONB-01A",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Kỹ năng Làm việc với TMS",
        description: "Chương trình đào tạo chuyên sâu cho Marketing",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 1,
        topics: [
          {
            id: "2",
            name: "Chủ đề 2",
            title: "Kỹ năng Làm việc với TMS",
            coursesCount: 1,
            courses: [
              {
                id: "4",
                title: "4 buổi làm sao quản lý kỹ năng giao tiếp",
                classesCount: 2,
                classes: [
                  {
                    id: "7",
                    classCode: "ONB-01A",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "8",
                    classCode: "ONB-01A",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                ],
              },
            ],
          },
        ],
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
        topicsCount: 1,
        topics: [
          {
            id: "3",
            name: "AI Basics",
            title: "AI Fundamentals",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Introduction to AI",
                classesCount: 2,
                classes: [
                  {
                    id: "9",
                    classCode: "AI-101",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn An",
                    date: "15/10/2025",
                  },
                  {
                    id: "10",
                    classCode: "AI-101",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Văn An",
                    date: "16/10/2025",
                  },
                ],
              },
              {
                id: "6",
                title: "Machine Learning Basics",
                classesCount: 1,
                classes: [
                  {
                    id: "11",
                    classCode: "AI-102",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Bình",
                    date: "17/10/2025",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "AI Applications in Business",
        startDate: "18/10/2025",
        endDate: "20/10/2025",
        topicsCount: 1,
        topics: [
          {
            id: "4",
            name: "AI in Business",
            title: "AI Applications in Business",
            coursesCount: 2,
            courses: [
              {
                id: "7",
                title: "AI in Marketing",
                classesCount: 2,
                classes: [
                  {
                    id: "12",
                    classCode: "AI-201",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Văn Cường",
                    date: "18/10/2025",
                  },
                  {
                    id: "13",
                    classCode: "AI-201",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Văn Cường",
                    date: "19/10/2025",
                  },
                ],
              },
              {
                id: "8",
                title: "AI in Sales",
                classesCount: 1,
                classes: [
                  {
                    id: "14",
                    classCode: "AI-202",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Thị Dung",
                    date: "20/10/2025",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

