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
    programsCount: 3,
    topicsCount: 7,
    coursesCount: 14,
    instructorsCount: 12,
    programs: [
      {
        id: "1",
        name: "Cách Sales B2b hiệu quả cho phòng MKT",
        description: "Chương trình đào tạo toàn diện cho khối B2B",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 2,
        topics: [
          {
            id: "1",
            title: "Kỹ năng bán hàng B2B cơ bản",
            coursesCount: 2,
            courses: [
              {
                id: "1",
                title: "Kỹ năng giao tiếp trong bán hàng",
                classesCount: 2,
                classes: [
                  {
                    id: "1",
                    classCode: "B2B-101",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "2",
                    classCode: "B2B-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "25/12/2025",
                  },
                ],
              },
              {
                id: "2",
                title: "Xây dựng mối quan hệ khách hàng",
                classesCount: 2,
                classes: [
                  {
                    id: "3",
                    classCode: "B2B-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Thị Lan",
                    date: "28/12/2025",
                  },
                  {
                    id: "4",
                    classCode: "B2B-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Thị Lan",
                    date: "30/12/2025",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            title: "Chiến lược Marketing B2B",
            coursesCount: 2,
            courses: [
              {
                id: "3",
                title: "Digital Marketing cho B2B",
                classesCount: 3,
                classes: [
                  {
                    id: "5",
                    classCode: "MKT-201",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "05/01/2026",
                  },
                  {
                    id: "6",
                    classCode: "MKT-201",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "08/01/2026",
                  },
                  {
                    id: "7",
                    classCode: "MKT-202",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Hương",
                    date: "10/01/2026",
                  },
                ],
              },
              {
                id: "4",
                title: "Content Marketing hiệu quả",
                classesCount: 2,
                classes: [
                  {
                    id: "8",
                    classCode: "MKT-203",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "12/01/2026",
                  },
                  {
                    id: "9",
                    classCode: "MKT-203",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "15/01/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Quản lý dự án và Agile",
        description: "Chương trình đào tạo kỹ năng quản lý dự án hiện đại",
        startDate: "15/01/2026",
        endDate: "15/04/2026",
        topicsCount: 3,
        topics: [
          {
            id: "3",
            title: "Agile và Scrum cơ bản",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Giới thiệu Agile Methodology",
                classesCount: 2,
                classes: [
                  {
                    id: "10",
                    classCode: "PM-101",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Lan",
                    date: "15/01/2026",
                  },
                  {
                    id: "11",
                    classCode: "PM-101",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Thị Lan",
                    date: "18/01/2026",
                  },
                ],
              },
              {
                id: "6",
                title: "Scrum Framework thực hành",
                classesCount: 3,
                classes: [
                  {
                    id: "12",
                    classCode: "PM-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Đặng Minh Quân",
                    date: "20/01/2026",
                  },
                  {
                    id: "13",
                    classCode: "PM-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Đặng Minh Quân",
                    date: "22/01/2026",
                  },
                  {
                    id: "14",
                    classCode: "PM-103",
                    deliveryMode: "Online",
                    instructor: "GV - Bùi Văn Thành",
                    date: "25/01/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "4",
            title: "Quản lý rủi ro và chất lượng",
            coursesCount: 1,
            courses: [
              {
                id: "7",
                title: "Quản lý rủi ro trong dự án",
                classesCount: 2,
                classes: [
                  {
                    id: "15",
                    classCode: "PM-201",
                    deliveryMode: "Live",
                    instructor: "GV - Lý Thị Nga",
                    date: "01/02/2026",
                  },
                  {
                    id: "16",
                    classCode: "PM-201",
                    deliveryMode: "Online",
                    instructor: "GV - Lý Thị Nga",
                    date: "05/02/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "5",
            title: "Công cụ quản lý dự án",
            coursesCount: 2,
            courses: [
              {
                id: "8",
                title: "Jira và Confluence",
                classesCount: 2,
                classes: [
                  {
                    id: "17",
                    classCode: "PM-301",
                    deliveryMode: "Online",
                    instructor: "GV - Trịnh Văn Hải",
                    date: "10/02/2026",
                  },
                  {
                    id: "18",
                    classCode: "PM-301",
                    deliveryMode: "Live",
                    instructor: "GV - Trịnh Văn Hải",
                    date: "12/02/2026",
                  },
                ],
              },
              {
                id: "9",
                title: "Microsoft Project và Planner",
                classesCount: 1,
                classes: [
                  {
                    id: "19",
                    classCode: "PM-302",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Thị Mai",
                    date: "15/02/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "Chuyển đổi số và AI trong doanh nghiệp",
        description: "Chương trình đào tạo về chuyển đổi số và ứng dụng AI",
        startDate: "01/03/2026",
        endDate: "31/05/2026",
        topicsCount: 2,
        topics: [
          {
            id: "6",
            title: "Chiến lược chuyển đổi số",
            coursesCount: 2,
            courses: [
              {
                id: "10",
                title: "Nền tảng chuyển đổi số",
                classesCount: 2,
                classes: [
                  {
                    id: "20",
                    classCode: "DT-101",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Văn Hùng",
                    date: "01/03/2026",
                  },
                  {
                    id: "21",
                    classCode: "DT-101",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn Hùng",
                    date: "05/03/2026",
                  },
                ],
              },
              {
                id: "11",
                title: "Công cụ và nền tảng số",
                classesCount: 2,
                classes: [
                  {
                    id: "22",
                    classCode: "DT-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "10/03/2026",
                  },
                  {
                    id: "23",
                    classCode: "DT-102",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "12/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "7",
            title: "AI và Machine Learning ứng dụng",
            coursesCount: 2,
            courses: [
              {
                id: "12",
                title: "Giới thiệu AI cho doanh nghiệp",
                classesCount: 3,
                classes: [
                  {
                    id: "24",
                    classCode: "AI-101",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Hương",
                    date: "15/03/2026",
                  },
                  {
                    id: "25",
                    classCode: "AI-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Thị Hương",
                    date: "18/03/2026",
                  },
                  {
                    id: "26",
                    classCode: "AI-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "20/03/2026",
                  },
                ],
              },
              {
                id: "13",
                title: "Ứng dụng AI trong Marketing và Sales",
                classesCount: 2,
                classes: [
                  {
                    id: "27",
                    classCode: "AI-201",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Thị Lan",
                    date: "25/03/2026",
                  },
                  {
                    id: "28",
                    classCode: "AI-201",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Lan",
                    date: "28/03/2026",
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

